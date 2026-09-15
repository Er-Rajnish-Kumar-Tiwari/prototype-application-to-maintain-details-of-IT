const express = require('express');
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getDepartments);
router.post('/', protect, adminOnly, createDepartment);
router.put('/:id', protect, adminOnly, updateDepartment);
router.delete('/:id', protect, adminOnly, deleteDepartment);

module.exports = router;
