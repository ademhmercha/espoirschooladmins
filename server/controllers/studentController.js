const Student = require('../models/Student');
const Group = require('../models/Group');

exports.getAll = async (req, res, next) => {
  try {
    let students;
    if (req.user.role === 'admin') {
      students = await Student.find().populate('groups', 'name subject');
    } else {
      const groups = await Group.find({ teacher: req.user._id });
      const ids = [...new Set(groups.flatMap((g) => g.students.map((s) => s.toString())))];
      students = await Student.find({ _id: { $in: ids } }).populate('groups', 'name subject');
    }
    res.json(students);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('groups', 'name subject monthlyPrice');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      'groups',
      'name subject'
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    await Group.updateMany({}, { $pull: { students: req.params.id } });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    next(err);
  }
};
