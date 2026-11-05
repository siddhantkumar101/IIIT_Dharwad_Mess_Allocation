const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'student', 'mess1', 'mess2'],
      required: true
    },
    rollNumber: { type: String, trim: true },
    hostel: { type: String, enum: ['boys', 'girls'] },
    registeredMess: { type: String, enum: ['mess1', 'mess2'] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

