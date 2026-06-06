const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    date: { type: Date, required: true },
    attendances: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        present: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
