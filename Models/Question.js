const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionText: { type: String, trim: true, required:true },
    marks: { type: Number, default: 1 },
    options: [{
        option: { type: String, trim:true },
        isCorrect: { type: Boolean, default: false }
    }],
});

module.exports = mongoose.model("Question", questionSchema);