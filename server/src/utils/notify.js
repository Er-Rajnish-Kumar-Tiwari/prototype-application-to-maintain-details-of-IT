const Notification = require('../models/Notification');

// Broadcast a notification to every admin (Head of Organization)
const notifyAdmins = async ({ type, message, relatedAsset = null, relatedRequest = null }) => {
  return Notification.create({
    type,
    message,
    relatedAsset,
    relatedRequest,
    targetRole: 'admin',
    targetUser: null,
  });
};

// Notify a single specific user (e.g. the staff member whose request was reviewed)
const notifyUser = async ({ type, message, targetUser, relatedAsset = null, relatedRequest = null }) => {
  return Notification.create({
    type,
    message,
    relatedAsset,
    relatedRequest,
    targetUser,
    targetRole: null,
  });
};

module.exports = { notifyAdmins, notifyUser };
