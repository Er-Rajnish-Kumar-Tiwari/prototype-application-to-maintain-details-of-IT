// Builds a Mongo filter object for Asset queries from request query params.
// Shared between the list endpoint and the CSV/Excel export endpoints so
// "export what you see" always matches the on-screen filtered table.
const buildAssetQuery = (query) => {
  const filter = {};

  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.location) {
    filter.location = { $regex: query.location, $options: 'i' };
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.type) {
    filter.type = query.type;
  }
  if (query.department) {
    filter.department = query.department;
  }
  if (query.warrantyStatus) {
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);

    if (query.warrantyStatus === 'Expired') {
      filter.warrantyExpiryDate = { $lt: today };
    } else if (query.warrantyStatus === 'Expiring Soon') {
      filter.warrantyExpiryDate = { $gte: today, $lte: in30Days };
    } else if (query.warrantyStatus === 'Active') {
      filter.warrantyExpiryDate = { $gt: in30Days };
    }
  }

  return filter;
};

module.exports = buildAssetQuery;
