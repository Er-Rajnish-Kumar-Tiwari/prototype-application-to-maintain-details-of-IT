const express = require('express');
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.route('/').get(getUsers).post(createUser);
router.route('/:id').put(updateUser).delete(deleteUser);

module.exports = router;
