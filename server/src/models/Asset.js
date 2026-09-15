const mongoose = require('mongoose');

const ASSET_TYPES = [
  'Laptop',
  'Desktop',
  'Monitor',
  'Printer',
  'Server',
  'Networking Device',
  'Mobile Phone',
  'Tablet',
  'UPS',
  'Projector',
  'Scanner',
  'Other',
];

const ASSET_STATUSES = ['Available', 'In Use', 'In Repair', 'Retired', 'Disposed'];

const assetSchema = new mongoose.Schema(
  {
    assetNumber: { type: String, required: true, unique: true, trim: true },
    equipmentName: { type: String, required: true, trim: true },
    type: { type: String, enum: ASSET_TYPES, default: 'Other' },
    makeModel: { type: String, required: true, trim: true },
    serialNumber: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    assignedUser: { type: String, default: '' }, // free text name of person using the asset
    vendor: { type: String, default: '' },
    purchaseDate: { type: Date, required: true },
    purchaseCost: { type: Number, default: 0 },
    warrantyExpiryDate: { type: Date, required: true },
    status: { type: String, enum: ASSET_STATUSES, default: 'Available' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

assetSchema.index({
  assetNumber: 'text',
  equipmentName: 'text',
  serialNumber: 'text',
  makeModel: 'text',
  assignedUser: 'text',
});

assetSchema.virtual('warrantyStatus').get(function () {
  if (!this.warrantyExpiryDate) return 'Unknown';
  const today = new Date();
  const expiry = new Date(this.warrantyExpiryDate);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Expired';
  if (diffDays <= 30) return 'Expiring Soon';
  return 'Active';
});

assetSchema.set('toJSON', { virtuals: true });
assetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Asset', assetSchema);
module.exports.ASSET_TYPES = ASSET_TYPES;
module.exports.ASSET_STATUSES = ASSET_STATUSES;
