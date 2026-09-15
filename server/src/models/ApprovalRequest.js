const mongoose = require('mongoose');

const approvalRequestSchema = new mongoose.Schema(
  {
    requestType: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE'], required: true },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', default: null }, // null for CREATE until approved
    assetSnapshot: { type: mongoose.Schema.Types.Mixed, default: null }, // state before change (UPDATE/DELETE)
    proposedChanges: { type: mongoose.Schema.Types.Mixed, default: null }, // new data (CREATE/UPDATE)
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewComment: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);
