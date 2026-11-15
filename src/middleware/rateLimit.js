const redis = require('../utils/redis');

// Fixed-window limiter. Uses Redis INCR + EXPIRE (works across many server
// instances); falls back to an in-memory Map if Redis is not available.
module.exports = function rateLimit({ windowSec = 60, max = 100, prefix = 'rl' } = {}) {
  const mem = new Map();

  return async (req, res, next) => {
    const key = `${prefix}:${req.ip}`;
    let count;

    try {
      if (!redis) throw new Error('redis disabled');
      count = await redis.incr(key);
      if (count === 1) await redis.expire(key, windowSec);
    } catch {
      const now = Date.now();
      const entry = mem.get(key);
      if (!entry || entry.reset < now) {
        mem.set(key, { count: 1, reset: now + windowSec * 1000 });
        count = 1;
      } else {
        count = ++entry.count;
      }
    }

    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(Math.max(0, max - count)));
    if (count > max) {
      res.set('Retry-After', String(windowSec));
      return res.status(429).json({ error: 'Too many requests, try again later' });
    }
    next();
  };
};
