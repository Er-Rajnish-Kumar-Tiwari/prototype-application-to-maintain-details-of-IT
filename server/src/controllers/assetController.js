const asyncHandler = require('express-async-handler');
const Asset = require('../models/Asset');
const ApprovalRequest = require('../models/ApprovalRequest');
const buildAssetQuery = require('../utils/buildAssetQuery');
const { notifyAdmins } = require('../utils/notify');

const ASSET_FIELDS = [
  'assetNumber',
  'equipmentName',
  'type',
  'makeModel',
  'serialNumber',
  'location',
  'department',
  'assignedUser',
  'vendor',
  'purchaseDate',
  'purchaseCost',
  'warrantyExpiryDate',
  'status',
  'notes',
];

const pickAssetFields = (body) => {
  const data = {};
  ASSET_FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });
  return data;
};

// @desc Get all assets with search / filter / pagination
// @route GET /api/assets
const getAssets = asyncHandler(async (req, res) => {
  const filter = buildAssetQuery(req.query);

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const sortField = req.query.sortBy || 'createdAt';
  const sortDir = req.query.sortDir === 'asc' ? 1 : -1;

  const [assets, total] = await Promise.all([
    Asset.find(filter)
      .populate('department', 'name code')
      .populate('createdBy', 'name email')
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit),
    Asset.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: assets.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    assets,
  });
});

// @desc Get single asset
// @route GET /api/assets/:id
const getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate('department', 'name code')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  // Include any pending approval request tied to this asset for transparency
  const pendingRequest = await ApprovalRequest.findOne({ asset: asset._id, status: 'Pending' });

  res.json({ success: true, asset, pendingRequest });
});

// @desc Create asset. Admin -> applied immediately. Staff -> goes for approval.
// @route POST /api/assets
const createAsset = asyncHandler(async (req, res) => {
  const data = pickAssetFields(req.body);

  const requiredFields = ['assetNumber', 'equipmentName', 'makeModel', 'serialNumber', 'location', 'department', 'purchaseDate', 'warrantyExpiryDate'];
  const missing = requiredFields.filter((f) => !data[f]);
  if (missing.length) {
    res.status(400);
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const existing = await Asset.findOne({ assetNumber: data.assetNumber });
  if (existing) {
    res.status(400);
    throw new Error('Asset number already exists');
  }

  if (req.user.role === 'admin') {
    const asset = await Asset.create({
      ...data,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    return res.status(201).json({ success: true, applied: true, asset });
  }

  // Staff: raise an approval request instead of writing directly
  const request = await ApprovalRequest.create({
    requestType: 'CREATE',
    asset: null,
    proposedChanges: data,
    requestedBy: req.user._id,
  });

  await notifyAdmins({
    type: 'APPROVAL_REQUEST',
    message: `${req.user.name} requested to add a new asset: ${data.equipmentName} (${data.assetNumber})`,
    relatedRequest: request._id,
  });

  res.status(202).json({
    success: true,
    applied: false,
    message: 'Asset submitted for Head of Organization approval',
    request,
  });
});

// @desc Update asset. Admin -> applied immediately. Staff -> goes for approval.
// @route PUT /api/assets/:id
const updateAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  const data = pickAssetFields(req.body);

  if (data.assetNumber && data.assetNumber !== asset.assetNumber) {
    const dup = await Asset.findOne({ assetNumber: data.assetNumber, _id: { $ne: asset._id } });
    if (dup) {
      res.status(400);
      throw new Error('Asset number already exists');
    }
  }

  if (req.user.role === 'admin') {
    Object.assign(asset, data, { updatedBy: req.user._id });
    await asset.save();
    return res.json({ success: true, applied: true, asset });
  }

  const existingPending = await ApprovalRequest.findOne({ asset: asset._id, status: 'Pending' });
  if (existingPending) {
    res.status(400);
    throw new Error('This asset already has a pending approval request');
  }

  const request = await ApprovalRequest.create({
    requestType: 'UPDATE',
    asset: asset._id,
    assetSnapshot: asset.toObject(),
    proposedChanges: data,
    requestedBy: req.user._id,
  });

  await notifyAdmins({
    type: 'APPROVAL_REQUEST',
    message: `${req.user.name} requested to edit asset: ${asset.equipmentName} (${asset.assetNumber})`,
    relatedAsset: asset._id,
    relatedRequest: request._id,
  });

  res.status(202).json({
    success: true,
    applied: false,
    message: 'Asset changes submitted for Head of Organization approval',
    request,
  });
});

// @desc Delete asset. Admin -> applied immediately. Staff -> goes for approval.
// @route DELETE /api/assets/:id
const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  if (req.user.role === 'admin') {
    await asset.deleteOne();
    return res.json({ success: true, applied: true, message: 'Asset deleted' });
  }

  const existingPending = await ApprovalRequest.findOne({ asset: asset._id, status: 'Pending' });
  if (existingPending) {
    res.status(400);
    throw new Error('This asset already has a pending approval request');
  }

  const request = await ApprovalRequest.create({
    requestType: 'DELETE',
    asset: asset._id,
    assetSnapshot: asset.toObject(),
    requestedBy: req.user._id,
  });

  await notifyAdmins({
    type: 'APPROVAL_REQUEST',
    message: `${req.user.name} requested to delete asset: ${asset.equipmentName} (${asset.assetNumber})`,
    relatedAsset: asset._id,
    relatedRequest: request._id,
  });

  res.status(202).json({
    success: true,
    applied: false,
    message: 'Delete request submitted for Head of Organization approval',
    request,
  });
});

// @desc Distinct filter values (locations, statuses, types) for filter dropdowns
// @route GET /api/assets/meta/filters
const getAssetFilterOptions = asyncHandler(async (req, res) => {
  const [locations, types] = await Promise.all([
    Asset.distinct('location'),
    Asset.distinct('type'),
  ]);
  res.json({
    success: true,
    locations: locations.filter(Boolean).sort(),
    types: types.filter(Boolean).sort(),
    statuses: Asset.schema.path('status').enumValues,
  });
});

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetFilterOptions,
};
