const asyncHandler = require('express-async-handler');
const Department = require('../models/Department');
const Asset = require('../models/Asset');

// @desc Get all departments
// @route GET /api/departments
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  res.json({ success: true, count: departments.length, departments });
});

// @desc Create department (admin only)
// @route POST /api/departments
const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description } = req.body;
  const department = await Department.create({ name, code, description });
  res.status(201).json({ success: true, department });
});

// @desc Update department (admin only)
// @route PUT /api/departments/:id
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  const { name, code, description } = req.body;
  if (name !== undefined) department.name = name;
  if (code !== undefined) department.code = code;
  if (description !== undefined) department.description = description;
  await department.save();
  res.json({ success: true, department });
});

// @desc Delete department (admin only)
// @route DELETE /api/departments/:id
const deleteDepartment = asyncHandler(async (req, res) => {
  const inUse = await Asset.countDocuments({ department: req.params.id });
  if (inUse > 0) {
    res.status(400);
    throw new Error('Cannot delete department - assets are assigned to it');
  }
  const department = await Department.findById(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  await department.deleteOne();
  res.json({ success: true, message: 'Department deleted' });
});

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
