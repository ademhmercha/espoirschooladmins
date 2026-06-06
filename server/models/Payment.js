const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    month: { type: String, required: true },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    paidAt: { type: Date, default: null },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

paymentSchema.index({ student: 1, group: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
