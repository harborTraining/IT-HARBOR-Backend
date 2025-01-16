const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true, // Ensures every progress record is tied to a course
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Ensures every progress record is tied to a user
  },
  unlockedSubcourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcourse",
      default: [],
    },
  ],
  completedSubcourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcourse",
      default: [],
    },
  ],
  unlockedVideos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      default: [],
    },
  ],
  completedVideos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      default: [],
    },
  ],
  unlockedChapters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      default: [],
    },
  ],
  completedChapters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      default: [],
    },
  ],
  completedExams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      default: [],
    },
  ],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  enrolled: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Progress", courseProgressSchema);
