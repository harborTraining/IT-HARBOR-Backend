const express = require("express");
const router = express.Router();

const {createExam,addQuestionToExam,removeQuestionFromExam,linkExamToSubcourse,getAnExam,saveAResult,getCourseProgressAndResults}= require("../Controllers/ExamController");
router.post("/create-exam", createExam);
router.post("/add-question", addQuestionToExam);
router.post("/remove-question", removeQuestionFromExam);
router.post("/link-exam", linkExamToSubcourse);
router.post("/get-an-exam",getAnExam); 
router.post("/save-result",saveAResult)
router.post("/get-Progress-PageData",getCourseProgressAndResults);
module.exports = router;
