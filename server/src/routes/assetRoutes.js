const express = require('express');
const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetFilterOptions,
} = require('../controllers/assetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/meta/filters', getAssetFilterOptions);
router.route('/').get(getAssets).post(createAsset);
router.route('/:id').get(getAssetById).put(updateAsset).delete(deleteAsset);

module.exports = router;
