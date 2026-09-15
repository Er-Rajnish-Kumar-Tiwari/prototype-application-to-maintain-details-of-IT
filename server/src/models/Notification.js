const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['WARRANTY_EXPIRING', 'WARRANTY_EXPIRED', 'APPROVAL_REQUEST', 'APPROVAL_DECISION'],
      required: true,
    },
    message: { type: String, required: true },
    relatedAsset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', default: null },
    relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalRequest', default: null },
    // If targetUser is null, notification is meant for all admins (broadcast)
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    targetRole: { type: String, enum: ['admin', 'staff', null], default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
