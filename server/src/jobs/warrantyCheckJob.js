const cron = require('node-cron');
const Asset = require('../models/Asset');
const Notification = require('../models/Notification');

// Scans all assets once a day and raises an admin notification for any
// asset whose warranty has just expired or is expiring within 30 days.
// Avoids duplicate spam by checking if a similar unread notification
// already exists for that asset within the last 24 hours.
const runWarrantyCheck = async () => {
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);

  const expiringAssets = await Asset.find({ warrantyExpiryDate: { $lte: in30Days } });

  for (const asset of expiringAssets) {
    const isExpired = new Date(asset.warrantyExpiryDate) < today;
    const type = isExpired ? 'WARRANTY_EXPIRED' : 'WARRANTY_EXPIRING';

    const since = new Date();
    since.setDate(since.getDate() - 1);

    const alreadyNotified = await Notification.findOne({
      type,
      relatedAsset: asset._id,
      createdAt: { $gte: since },
    });

    if (!alreadyNotified) {
      await Notification.create({
        type,
        message: isExpired
          ? `Warranty has EXPIRED for asset "${asset.equipmentName}" (${asset.assetNumber}).`
          : `Warranty for asset "${asset.equipmentName}" (${asset.assetNumber}) expires on ${new Date(
              asset.warrantyExpiryDate
            ).toDateString()}.`,
        relatedAsset: asset._id,
        targetRole: 'admin',
      });
    }
  }
};

// Runs every day at 07:00 server time, and once immediately on startup
const scheduleWarrantyCheck = () => {
  runWarrantyCheck().catch((err) => console.error('Warranty check failed:', err.message));
  cron.schedule('0 7 * * *', () => {
    runWarrantyCheck().catch((err) => console.error('Warranty check failed:', err.message));
  });
};

module.exports = { scheduleWarrantyCheck, runWarrantyCheck };
