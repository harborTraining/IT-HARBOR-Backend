const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  videos: [{
          type: mongoose.Schema.Types.ObjectId, 
          ref :"Video"
    }], // Embedded videos
});

module.exports = mongoose.model("Chapter", chapterSchema); // Exporting as a model if needed independently