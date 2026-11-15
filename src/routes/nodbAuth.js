// Signup & Login WITHOUT a database: users live in a JS array (lost on restart).
const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const users = []; // { email, name, passwordHash }

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });
  if (users.find((u) => u.email === email.toLowerCase())) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ name, email: email.toLowerCase(), passwordHash });
  res.status(201).json({ message: 'Signup successful (in-memory)' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === (email || '').toLowerCase());
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ message: `Welcome back, ${user.name}` });
});

module.exports = router;
