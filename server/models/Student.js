const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    level: { type: String, enum: ['Primaire', 'Collège', 'Lycée', 'Bac'], required: true },
    parentPhone: { type: String, required: true },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
