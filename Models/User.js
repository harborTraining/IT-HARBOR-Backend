const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    batchNo: {
      type: Number,
    },
    password: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    courseProgress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseProgress",
    },
    token: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    verifyToken: {
      type: String,
    },
    resetVerifyTokenExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);
