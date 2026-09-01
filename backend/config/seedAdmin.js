// Creates the Initial Admin Account (run: npm run seed:admin)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const User = require('../models/User');

(async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const name = process.env.ADMIN_NAME || 'System Admin';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'admin',
    status: 'active',
  });

  console.log('Initial admin account created:');
  console.log('  email:', email);
  console.log('  password:', password);
  process.exit(0);
})();
