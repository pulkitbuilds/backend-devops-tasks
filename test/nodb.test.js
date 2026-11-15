process.env.REDIS_DISABLED = 'true';
const { test, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

const server = app.listen(0);
const base = () => `http://127.0.0.1:${server.address().port}`;
const post = (url, body) =>
  fetch(base() + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

after(() => server.close());

test('health check', async () => {
  const r = await fetch(base() + '/health');
  assert.strictEqual(r.status, 200);
});

test('in-memory signup then login', async () => {
  const u = { name: 'Test', email: 't@example.com', password: 'secret123' };
  assert.strictEqual((await post('/api/nodb/signup', u)).status, 201);
  assert.strictEqual((await post('/api/nodb/signup', u)).status, 409);
  assert.strictEqual((await post('/api/nodb/login', { email: u.email, password: u.password })).status, 200);
  assert.strictEqual((await post('/api/nodb/login', { email: u.email, password: 'wrong' })).status, 401);
});

test('protected route needs a token', async () => {
  const r = await fetch(base() + '/api/auth/profile');
  assert.strictEqual(r.status, 401);
});
