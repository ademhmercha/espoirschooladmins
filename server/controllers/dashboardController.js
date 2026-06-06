const User = require('../models/User');
const Group = require('../models/Group');
const Student = require('../models/Student');
const Payment = require('../models/Payment');

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

exports.getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const month = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

    const [totalStudents, totalTeachers, totalGroups, paidPayments, unpaidPayments] = await Promise.all([
      Student.countDocuments(),
      User.countDocuments({ role: 'teacher' }),
      Group.countDocuments(),
      Payment.find({ month, status: 'paid' }).populate('group', 'monthlyPrice'),
      Payment.find({ month, status: 'unpaid' })
        .populate('student', 'firstName lastName')
        .populate('group', 'name monthlyPrice'),
    ]);

    const revenueThisMonth = paidPayments.reduce((sum, p) => sum + (p.group?.monthlyPrice || 0), 0);

    res.json({ totalStudents, totalTeachers, totalGroups, revenueThisMonth, unpaidThisMonth: unpaidPayments });
  } catch (err) {
    next(err);
  }
};
