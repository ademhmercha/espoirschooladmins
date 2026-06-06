const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Group = require('../models/Group');

exports.getAll = async (req, res, next) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    const result = await Promise.all(
      teachers.map(async (t) => {
        const groupCount = await Group.countDocuments({ teacher: t._id });
        return { ...t.toObject(), groupCount };
      })
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, password, phone, subject } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password required' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: 'teacher', phone, subject });
    const { password: _p, ...userData } = user.toObject();
    res.status(201).json(userData);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, email, phone, subject, password } = req.body;
    const updates = { name, email, phone, subject };
    if (password) updates.password = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    next(err);
  }
};
