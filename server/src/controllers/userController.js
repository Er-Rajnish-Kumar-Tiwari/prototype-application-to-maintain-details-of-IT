const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc Get all users (admin only)
// @route GET /api/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().populate('department', 'name code').sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// @desc Create a new user (admin only) - e.g. department staff account
// @route POST /api/users
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, designation } = req.body;

  const exists = await User.findOne({ email: email?.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'staff',
    department: department || null,
    designation,
  });

  res.status(201).json({ success: true, user: user.toSafeObject() });
});

// @desc Update a user (admin only)
// @route PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, role, department, designation, isActive, password } = req.body;
  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (department !== undefined) user.department = department || null;
  if (designation !== undefined) user.designation = designation;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) user.password = password;

  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc Delete a user (admin only)
// @route DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (String(user._id) === String(req.user._id)) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

module.exports = { getUsers, createUser, updateUser, deleteUser };
