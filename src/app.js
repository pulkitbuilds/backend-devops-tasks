const express = require('express');
const path = require('path');

const rateLimit = require('./middleware/rateLimit');
const nodbRoutes = require('./routes/nodbAuth');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const fileRoutes = require('./routes/files');
const adminRoutes = require('./routes/admin');
const timestampRoutes = require('./routes/timestamp');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// API rate limiting: 100 requests / minute / IP for the whole API
app.use('/api', rateLimit({ windowSec: 60, max: 100, prefix: 'rl:api' }));

app.use('/api/nodb', nodbRoutes);                       // signup & login without database
app.use('/api/auth', authRoutes);                       // signup/login (MongoDB), JWT, profile, logout
app.use('/api/items', itemRoutes);                      // MongoDB CRUD
app.use('/api/files', fileRoutes);                      // file-sharing server
app.use('/api/admin', adminRoutes);                     // RBAC
app.use('/api/timestamp', timestampRoutes);             // Redis server timestamp

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;
