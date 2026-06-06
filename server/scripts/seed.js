require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const password = await bcrypt.hash('admin123', 10);
  await User.findOneAndUpdate(
    { email: 'admin@espoir.tn' },
    { name: 'Administrateur', email: 'admin@espoir.tn', password, role: 'admin', phone: '', subject: '' },
    { upsert: true, new: true }
  );
  console.log('✅  Admin created: admin@espoir.tn / admin123');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
