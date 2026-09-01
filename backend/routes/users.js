const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

// All routes below: ADMIN ONLY -> Manage Users
router.use(protect, requireRole('admin'));

// @route  GET /api/users/pending
// @desc   View Pending Users
router.get('/pending', async (req, res) => {
  const users = await User.find({ status: 'pending' }).select('-password').sort('-createdAt');
  res.json(users);
});

// @route  GET /api/users
// @desc   View all users (with optional search/status filter)
router.get('/', async (req, res) => {
  const { search, status } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const users = await User.find(query).select('-password').sort('-createdAt');
  res.json(users);
});

// @route  PUT /api/users/:id/approve
// @desc   Approve User -> status = ACTIVE
router.put('/:id/approve', async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: 'active' },
    { new: true }
  ).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User approved', user });
});

// @route  PUT /api/users/:id/reject
// @desc   Reject User
router.put('/:id/reject', async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    { new: true }
  ).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User rejected', user });
});

// @route  PUT /api/users/:id/status
// @desc   Activate/Deactivate User
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['active', 'deactivated'].includes(status)) {
    return res.status(400).json({ message: 'status must be active or deactivated' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select(
    '-password'
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: `User ${status}`, user });
});

// @route  PUT /api/users/:id/role
// @desc   Manage User Roles
router.put('/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'role must be user or admin' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
    '-password'
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'Role updated', user });
});

module.exports = router;
