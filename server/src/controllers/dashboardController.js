const asyncHandler = require('express-async-handler');
const Asset = require('../models/Asset');
const ApprovalRequest = require('../models/ApprovalRequest');

// @desc Aggregated stats for the dashboard
// @route GET /api/dashboard/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);

  const [
    totalAssets,
    statusBreakdown,
    typeBreakdown,
    departmentBreakdown,
    expiredWarranty,
    expiringSoon,
    pendingApprovals,
    recentAssets,
  ] = await Promise.all([
    Asset.countDocuments(),
    Asset.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Asset.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    Asset.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, department: { $ifNull: ['$dept.name', 'Unassigned'] }, count: 1 } },
      { $sort: { count: -1 } },
    ]),
    Asset.countDocuments({ warrantyExpiryDate: { $lt: today } }),
    Asset.countDocuments({ warrantyExpiryDate: { $gte: today, $lte: in30Days } }),
    ApprovalRequest.countDocuments({ status: 'Pending' }),
    Asset.find().sort({ createdAt: -1 }).limit(5).populate('department', 'name'),
  ]);

  res.json({
    success: true,
    totalAssets,
    statusBreakdown: statusBreakdown.map((s) => ({ status: s._id, count: s.count })),
    typeBreakdown: typeBreakdown.map((t) => ({ type: t._id, count: t.count })),
    departmentBreakdown,
    warranty: {
      expired: expiredWarranty,
      expiringSoon,
    },
    pendingApprovals,
    recentAssets,
  });
});

// @desc List assets whose warranty is expired or expiring within 30 days
// @route GET /api/dashboard/warranty-alerts
const getWarrantyAlerts = asyncHandler(async (req, res) => {
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);

  const assets = await Asset.find({ warrantyExpiryDate: { $lte: in30Days } })
    .populate('department', 'name code')
    .sort({ warrantyExpiryDate: 1 });

  res.json({ success: true, count: assets.length, assets });
});

module.exports = { getDashboardStats, getWarrantyAlerts };
