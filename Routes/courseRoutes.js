const express = require("express");
const router = express.Router();
const { createCourse, getAllCourses,addSubcourseToCourse , deleteVideo, addChapterToSubcourse, deleteChapter,addVideoToChapter, deleteCourse, deleteSubcourse,updateCourse} = require("../Controllers/courseController");
// Route to create a new course
const {courseActivationMail}= require("../Controllers/ResetPasswordContorller")
router.post("/create-a-course", createCourse);
router.get("/get-all-courses", getAllCourses);
router.post("/add-subcourse", addSubcourseToCourse);
router.post("/add-chapter", addChapterToSubcourse);
router.post('/add-video',addVideoToChapter);
router.post("/delete-subcourse",deleteSubcourse);
router.post("/delete-course",deleteCourse);
router.post("/delete-chapter",deleteChapter);
router.post("/delete-video",deleteVideo); 
router.post("/update-course",updateCourse);
router.post("/activate-mail",courseActivationMail);
module.exports = router;
