const mongoose = require("mongoose");
const subcourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  img: { type: String },
  description: { type: String },
  lectures: { type: Number},
  chapters: [{
        type: mongoose.Schema.Types.ObjectId, 
          ref :"Chapter"
  }], 
  examination:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam"
  }
});

module.exports = mongoose.model("Subcourse", subcourseSchema); // Exporting as a model if needed independently