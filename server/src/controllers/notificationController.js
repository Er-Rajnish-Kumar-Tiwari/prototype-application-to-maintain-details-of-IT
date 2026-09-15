const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc Get notifications relevant to logged-in user (own + role broadcasts)
// @route GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const filter = {
    $or: [{ targetUser: req.user._id }, { targetRole: req.user.role, targetUser: null }],
  };

  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

  res.json({ success: true, count: notifications.length, unreadCount, notifications });
});

// @desc Mark one notification as read
// @route PUT /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  notification.isRead = true;
  await notification.save();
  res.json({ success: true, notification });
});

// @desc Mark all of the user's notifications as read
// @route PUT /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { $or: [{ targetUser: req.user._id }, { targetRole: req.user.role, targetUser: null }] },
    { $set: { isRead: true } }
  );
  res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
