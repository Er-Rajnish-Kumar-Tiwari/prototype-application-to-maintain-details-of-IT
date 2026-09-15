const express = require('express');
const { getDashboardStats, getWarrantyAlerts } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/stats', getDashboardStats);
router.get('/warranty-alerts', getWarrantyAlerts);

module.exports = router;
