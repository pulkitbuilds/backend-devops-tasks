// Redis server timestamp: stores the time of the last call in Redis
// and returns both the previous and current server timestamps.
const express = require('express');
const redis = require('../utils/redis');

const router = express.Router();

router.get('/', async (req, res) => {
  const now = Date.now();
  if (!redis) return res.status(503).json({ error: 'Redis disabled', current: now });
  try {
    const previous = await redis.get('server:last_timestamp');
    await redis.set('server:last_timestamp', now);
    res.json({
      current: now,
      currentISO: new Date(now).toISOString(),
      previous: previous ? Number(previous) : null,
      previousISO: previous ? new Date(Number(previous)).toISOString() : null,
    });
  } catch {
    res.status(503).json({ error: 'Redis not reachable', current: now });
  }
});

module.exports = router;
