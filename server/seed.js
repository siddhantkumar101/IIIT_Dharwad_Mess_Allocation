const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Load environment variables from root .env or server .env
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const seedUsers = async () => {
  const seedAccounts = [
    {
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@iiitdwd.ac.in',
      password: process.env.ADMIN_PASS || 'Admin@1234',
      role: 'admin'
    },
    {
      name: 'Mess 1 Manager',
      email: process.env.MESS1_EMAIL || 'mess1@iiitdwd.ac.in',
      password: process.env.MESS1_PASS || 'Mess1@1234',
      role: 'mess1',
      registeredMess: 'mess1'
    },
    {
      name: 'Mess 2 Manager',
      email: process.env.MESS2_EMAIL || 'mess2@iiitdwd.ac.in',
      password: process.env.MESS2_PASS || 'Mess2@1234',
      role: 'mess2',
      registeredMess: 'mess2'
    }
  ];

  for (const account of seedAccounts) {
    try {
      const existing = await User.findOne({ email: account.email.toLowerCase() });
      if (existing) {
        console.log(`Already exists: ${account.email}`);
      } else {
        const hashedPassword = await bcrypt.hash(account.password, 10);
        await User.create({
          name: account.name,
          email: account.email.toLowerCase(),
          password: hashedPassword,
          role: account.role,
          registeredMess: account.registeredMess
        });
        console.log(`Seeded: ${account.email}`);
      }
    } catch (err) {
      console.error(`Error seeding ${account.email}:`, err.message);
    }
  }
};

// If run directly from terminal: node server/seed.js
if (require.main === module) {
  const connectDB = require('./config/db');
  (async () => {
    try {
      await connectDB();
      await seedUsers();
      console.log('Seeding completed.');
      process.exit(0);
    } catch (err) {
      console.error('Seeding failed:', err);
      process.exit(1);
    }
  })();
}

module.exports = seedUsers;

