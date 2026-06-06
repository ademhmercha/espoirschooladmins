const Session = require('../models/Session');
const Group = require('../models/Group');

exports.getByGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    if (req.user.role === 'teacher') {
      const group = await Group.findById(groupId);
      if (!group || group.teacher.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'Forbidden' });
    }

    const { month, year } = req.query;
    const now = new Date();
    const m = month ? parseInt(month) - 1 : now.getMonth();
    const y = year ? parseInt(year) : now.getFullYear();

    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59);

    const sessions = await Session.find({
      group: groupId,
      date: { $gte: start, $lte: end },
    })
      .populate('attendances.student', 'firstName lastName')
      .sort({ date: -1 });

    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { group: groupId, date, attendances } = req.body;

    if (req.user.role === 'teacher') {
      const group = await Group.findById(groupId);
      if (!group || group.teacher.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'Forbidden' });
    }

    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const count = await Session.countDocuments({ group: groupId, date: { $gte: start, $lte: end } });
    if (count >= 4) return res.status(400).json({ message: 'Maximum 4 sessions per month reached' });

    const session = await Session.create({ group: groupId, date, attendances });
    await session.populate('attendances.student', 'firstName lastName');
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
};
