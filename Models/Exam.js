const mongoose = require("mongoose");
const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  duration:{
    type: Number,
  },
  maximumMarks: {
    type: Number,
    default: 0
  },
});

module.exports = mongoose.model("Exam", examSchema);
