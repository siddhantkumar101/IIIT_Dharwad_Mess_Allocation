const mongoose = require('mongoose');

const selectionSubSchema = new mongoose.Schema(
  {
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
      required: true
    },
    choice: {
      type: String,
      enum: ['mess1', 'mess2', 'skip'],
      required: true
    }
  },
  { _id: false }
);

const mealSelectionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: String,
      required: true
    }, // 'YYYY-MM-DD'
    selections: [selectionSubSchema],
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Unique compound index on { student, date } — use upsert on resubmit
mealSelectionSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MealSelection', mealSelectionSchema);

