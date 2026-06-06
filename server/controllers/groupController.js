const Group = require('../models/Group');
const Student = require('../models/Student');

exports.getAll = async (req, res, next) => {
  try {
    const filter = req.user.role === 'teacher' ? { teacher: req.user._id } : {};
    const groups = await Group.find(filter)
      .populate('teacher', 'name subject')
      .populate('students', 'firstName lastName');
    res.json(groups);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('teacher', 'name subject')
      .populate('students', 'firstName lastName parentPhone');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (req.user.role === 'teacher' && group.teacher._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });

    res.json(group);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const group = await Group.create(req.body);
    await group.populate('teacher', 'name subject');
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('teacher', 'name subject')
      .populate('students', 'firstName lastName parentPhone');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    await Student.updateMany({}, { $pull: { groups: req.params.id } });
    res.json({ message: 'Group deleted' });
  } catch (err) {
    next(err);
  }
};

exports.addStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.students.map((s) => s.toString()).includes(studentId)) {
      group.students.push(studentId);
      await group.save();
      await Student.findByIdAndUpdate(studentId, { $addToSet: { groups: group._id } });
    }

    const updated = await Group.findById(group._id)
      .populate('teacher', 'name subject')
      .populate('students', 'firstName lastName parentPhone');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.removeStudent = async (req, res, next) => {
  try {
    const { id: groupId, studentId } = req.params;
    await Group.findByIdAndUpdate(groupId, { $pull: { students: studentId } });
    await Student.findByIdAndUpdate(studentId, { $pull: { groups: groupId } });
    const updated = await Group.findById(groupId)
      .populate('teacher', 'name subject')
      .populate('students', 'firstName lastName parentPhone');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
