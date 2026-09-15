const express = require('express');
const { getApprovalRequests, approveRequest, rejectRequest } = require('../controllers/approvalController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getApprovalRequests); // admin: all requests, staff: own requests
router.put('/:id/approve', adminOnly, approveRequest);
router.put('/:id/reject', adminOnly, rejectRequest);

module.exports = router;
