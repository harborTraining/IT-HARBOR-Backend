const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema({
  thumbnail: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  rating: { type: Number, default: 4 },
  students: { type: Number, default: 0 },
  lectures: { type: Number, default: 0 },
  subcourses: { type: Number, default: 0 },
  courseContent: [{
     type: mongoose.Schema.Types.ObjectId, 
      ref :"Subcourse"
  }]
});

module.exports = mongoose.model("Course", courseSchema);