const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    level: { type: String, enum: ['Primaire', 'Collège', 'Lycée', 'Bac'], required: true },
    schedule: { type: String, required: true },
    monthlyPrice: { type: Number, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
