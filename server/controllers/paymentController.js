const Payment = require('../models/Payment');
const Group = require('../models/Group');

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const getCurrentMonth = () => {
  const now = new Date();
  return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
};

exports.getAll = async (req, res, next) => {
  try {
    const month = req.query.month || getCurrentMonth();
    const filter = { month };
    if (req.query.groupId) filter.group = req.query.groupId;

    const payments = await Payment.find(filter)
      .populate('student', 'firstName lastName')
      .populate('group', 'name monthlyPrice')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ student: req.params.studentId })
      .populate('group', 'name')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

exports.generate = async (req, res, next) => {
  try {
    const month = req.body.month || getCurrentMonth();
    const groups = await Group.find().populate('students', '_id');

    const docs = [];
    for (const group of groups) {
      for (const student of group.students) {
        docs.push({ student: student._id, group: group._id, month, status: 'unpaid' });
      }
    }

    if (docs.length > 0) {
      await Payment.insertMany(docs, { ordered: false }).catch(() => {});
    }

    const payments = await Payment.find({ month })
      .populate('student', 'firstName lastName')
      .populate('group', 'name monthlyPrice')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const updates = { status };
    if (status === 'paid') updates.paidAt = new Date();
    else updates.paidAt = null;
    if (note !== undefined) updates.note = note;

    const payment = await Payment.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('student', 'firstName lastName')
      .populate('group', 'name monthlyPrice');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    next(err);
  }
};
