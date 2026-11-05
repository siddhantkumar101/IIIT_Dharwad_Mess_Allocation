const mongoose = require('mongoose');

const surplusReportSchema = new mongoose.Schema(
  {
    mess: {
      type: String,
      enum: ['mess1', 'mess2'],
      required: true
    },
    date: {
      type: String,
      required: true
    }, // 'YYYY-MM-DD'
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
      required: true
    },
    headcountExpected: {
      type: Number,
      required: true,
      min: 0
    },
    headcountServed: {
      type: Number,
      required: true,
      min: 0
    },
    surplusQuantityKg: {
      type: Number,
      required: true,
      min: 0
    },
    ngoName: {
      type: String,
      trim: true,
      default: ''
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SurplusReport', surplusReportSchema);

