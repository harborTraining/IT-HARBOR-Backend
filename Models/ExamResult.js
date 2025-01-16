const mongoose = require("mongoose");
const examSchema = new mongoose.Schema({
  examId:{
    type: mongoose.Schema.Types.ObjectId,
    ref :"Exam"
  },
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref :"User"
  },
  subcourseId:{
type: mongoose.Schema.Types.ObjectId,
    ref :"Subcourse"
  },
  marksObtained: {
    type: Number,
    required:true,

  },
  percentage:{
    type: Number,
    required:true
  },
  maximumMarks: {
    type: Number,
    default: 0
  },
});
module.exports = mongoose.model("Result", examSchema);
