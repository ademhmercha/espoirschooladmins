const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// One-time setup — safe: does nothing if an admin already exists
router.post('/', async (req, res) => {
  try {
    const exists = await User.findOne({ role: 'admin' });
    if (exists) {
      return res.json({ ok: false, message: 'Admin already exists', email: exists.email });
    }
    const password = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Administrateur',
      email: 'admin@espoir.tn',
      password,
      role: 'admin',
      phone: '',
      subject: '',
    });
    res.json({ ok: true, message: 'Admin created', email: 'admin@espoir.tn', password: 'admin123' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
