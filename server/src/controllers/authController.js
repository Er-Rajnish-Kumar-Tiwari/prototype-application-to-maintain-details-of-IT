const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc Login user
// @route POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('department', 'name code');

  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: user.toSafeObject(),
  });
});

// @desc Get logged in user profile
// @route GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('department', 'name code');
  res.json({ success: true, user });
});

// @desc Update own profile (name / password)
// @route PUT /api/auth/me
// @access Private
const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (req.body.name) user.name = req.body.name;
  if (req.body.password) user.password = req.body.password;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

module.exports = { login, getMe, updateMe };
