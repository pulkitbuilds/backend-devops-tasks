// Signup & Signin with MongoDB, bcrypt hashing, JWT, profile, token versioning
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const rateLimit = require('../middleware/rateLimit');
const { signToken, authenticate } = require('../middleware/auth');

const router = express.Router();

// stricter limit on credential endpoints (10 / minute / IP)
const authLimiter = rateLimit({ windowSec: 60, max: 10, prefix: 'rl:auth' });

router.post('/signup', authLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);            // password hashing (bcrypt)
    const user = await User.create({ name, email, password: hash }); // role is always "user"
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Token versioning => single session login: bump version, old tokens die.
    user.tokenVersion += 1;
    await user.save();

    res.json({ token: signToken(user), role: user.role });   // JWT generation
  } catch (err) {
    next(err);
  }
});

// Middleware -> get profile
router.get('/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Logout = bump the token version
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    req.user.tokenVersion += 1;
    await req.user.save();
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
