// RBAC demo: only role "admin" can reach these routes
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, requireRole('admin'));

router.get('/users', async (req, res, next) => {
  try {
    res.json(await User.find().select('-password'));
  } catch (err) { next(err); }
});

router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body || {};
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'role must be user or admin' });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, $inc: { tokenVersion: 1 } },   // force re-login so the new role takes effect
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) { next(err); }
});

module.exports = router;
