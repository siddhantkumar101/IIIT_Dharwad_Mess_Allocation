const mongoose = require("mongoose");

const mealSubSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["breakfast", "lunch", "snacks", "dinner"],
      required: true,
    },
    items: [{ type: String, trim: true }],
  },
  { _id: false },
);

const menuSchema = new mongoose.Schema(
  {
    mess: {
      type: String,
      enum: ["mess1", "mess2"],
      required: true,
    },
    date: {
      type: String,
      required: true,
    }, // 'YYYY-MM-DD'
    meals: [mealSubSchema],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

menuSchema.index({ mess: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Menu", menuSchema);
