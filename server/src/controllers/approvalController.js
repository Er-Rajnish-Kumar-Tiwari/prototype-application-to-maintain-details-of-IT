const asyncHandler = require('express-async-handler');
const ApprovalRequest = require('../models/ApprovalRequest');
const Asset = require('../models/Asset');
const { notifyUser } = require('../utils/notify');

// @desc Get approval requests (admin sees all, staff sees only their own)
// @route GET /api/approvals
const getApprovalRequests = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role !== 'admin') {
    filter.requestedBy = req.user._id;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const requests = await ApprovalRequest.find(filter)
    .populate('requestedBy', 'name email department')
    .populate('reviewedBy', 'name email')
    .populate('asset')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: requests.length, requests });
});

// @desc Approve a request (admin / Head of Organization only)
// @route PUT /api/approvals/:id/approve
const approveRequest = asyncHandler(async (req, res) => {
  const request = await ApprovalRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Approval request not found');
  }
  if (request.status !== 'Pending') {
    res.status(400);
    throw new Error(`Request already ${request.status.toLowerCase()}`);
  }

  let resultAsset = null;

  if (request.requestType === 'CREATE') {
    resultAsset = await Asset.create({
      ...request.proposedChanges,
      createdBy: request.requestedBy,
      updatedBy: req.user._id,
    });
    request.asset = resultAsset._id;
  } else if (request.requestType === 'UPDATE') {
    const asset = await Asset.findById(request.asset);
    if (!asset) {
      res.status(404);
      throw new Error('Asset no longer exists');
    }
    Object.assign(asset, request.proposedChanges, { updatedBy: req.user._id });
    await asset.save();
    resultAsset = asset;
  } else if (request.requestType === 'DELETE') {
    await Asset.findByIdAndDelete(request.asset);
  }

  request.status = 'Approved';
  request.reviewedBy = req.user._id;
  request.reviewComment = req.body.comment || '';
  request.reviewedAt = new Date();
  await request.save();

  const assetLabel = request.assetSnapshot?.equipmentName || request.proposedChanges?.equipmentName || 'asset';
  await notifyUser({
    type: 'APPROVAL_DECISION',
    message: `Your ${request.requestType.toLowerCase()} request for "${assetLabel}" was approved by the Head of Organization.`,
    targetUser: request.requestedBy,
    relatedAsset: request.asset,
    relatedRequest: request._id,
  });

  res.json({ success: true, message: 'Request approved and applied', request, asset: resultAsset });
});

// @desc Reject a request (admin / Head of Organization only)
// @route PUT /api/approvals/:id/reject
const rejectRequest = asyncHandler(async (req, res) => {
  const request = await ApprovalRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Approval request not found');
  }
  if (request.status !== 'Pending') {
    res.status(400);
    throw new Error(`Request already ${request.status.toLowerCase()}`);
  }

  request.status = 'Rejected';
  request.reviewedBy = req.user._id;
  request.reviewComment = req.body.comment || '';
  request.reviewedAt = new Date();
  await request.save();

  const assetLabel = request.assetSnapshot?.equipmentName || request.proposedChanges?.equipmentName || 'asset';
  await notifyUser({
    type: 'APPROVAL_DECISION',
    message: `Your ${request.requestType.toLowerCase()} request for "${assetLabel}" was rejected by the Head of Organization.${
      request.reviewComment ? ` Reason: ${request.reviewComment}` : ''
    }`,
    targetUser: request.requestedBy,
    relatedAsset: request.asset,
    relatedRequest: request._id,
  });

  res.json({ success: true, message: 'Request rejected', request });
});

module.exports = { getApprovalRequests, approveRequest, rejectRequest };
