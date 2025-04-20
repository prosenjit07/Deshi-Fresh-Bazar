const express = require('express');
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/users/
router.post('/', registerUser);

// @route   POST /api/users/login
router.post('/login', authUser);

// @route   GET /api/users/profile
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;
