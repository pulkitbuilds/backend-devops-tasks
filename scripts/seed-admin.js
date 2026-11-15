// Usage: ADMIN_EMAIL=a@b.com ADMIN_PASSWORD=secret npm run seed:admin
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');

(async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/backend_tasks');
  const hash = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name: 'Admin', email: email.toLowerCase(), password: hash, role: 'admin' },
    { upsert: true, new: true }
  );
  console.log('Admin ready:', email);
  await mongoose.disconnect();
})();
