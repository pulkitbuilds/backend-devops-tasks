const Redis = require('ioredis');

let client = null;
if (process.env.REDIS_DISABLED !== 'true') {
  client = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });
  client.on('error', () => {}); // avoid crashing when Redis is down
}

module.exports = client; // null when disabled
