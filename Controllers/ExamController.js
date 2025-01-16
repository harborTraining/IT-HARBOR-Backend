const mongoose = require("mongoose");
const Exam = require("../Models/Exam");
const Question = require("../Models/Question");
const Subcourse = require("../Models/SubCourse");
const Progress = require("../Models/CourseProgress");
const Course = require("../Models/Course");
const Result = require("../Models/ExamResult");
const createExam = async (req, res) => {
  try {
    const { title, description, duration } = req.body;
    const exam = new Exam({
      title,
      description,
      duration,
      maximumMarks: 0,
    });

    const savedExam = await exam.save();
    const populatedExam = await Exam.findById(savedExam._id).populate(
      "questions"
    );

    res.status(201).json({ success: true, exam: populatedExam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addQuestionToExam = async (req, res) => {
  try {
    const { examId, questionText, marks, options } = req.body;
    console.log("req.body", req.body);
    console.log(options);
    const question = new Question({
      questionText,
      marks,
      options,
    });

    const savedQuestion = await question.save();

    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      {
        $push: { questions: savedQuestion._id },
        $inc: { maximumMarks: marks },
      },
      { new: true }
    ).populate("questions");

    const examToReturn = await Exam.findById(examId).populate("questions");
    res.status(200).json({ success: true, exam: examToReturn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeQuestionFromExam = async (req, res) => {
  try {
    const { examId, questionId } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      {
        $pull: { questions: questionId },
        $inc: { maximumMarks: -question.marks },
      },
      { new: true }
    ).populate("questions");

    await Question.findByIdAndDelete(questionId);

    res.status(200).json({ success: true, exam: updatedExam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const linkExamToSubcourse = async (req, res) => {
  try {
    const { subcourseId, examId, courseId } = req.body;

    const subcourse = await Subcourse.findById(subcourseId);
    if (!subcourse) {
      return res
        .status(404)
        .json({ success: false, message: "Subcourse not found" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Exam not found" });
    }

    if (subcourse.examination && subcourse.examination.toString() === examId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Exam is already linked to this subcourse",
        });
    }

    subcourse.examination = examId;
    await subcourse.save();
    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: [
          {
            path: "chapters",
            populate: {
              path: "videos", // Ensure videos are populated
            },
          },
        ],
      })
      .exec();
    const updatedSubcourse = await Subcourse.findById(subcourseId).populate(
      "examination"
    );

    res.status(200).json({ success: true, subcourse: updatedSubcourse , course: updatedCourse});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getAnExam = async (req, res) => {
  try {
    const { examId } = req.body;
    if (!examId) {
      return res.status(400).json({
        success: false,
        message: "Exam ID is required.",
      });
    }
    const examRecord = await Exam.findById(examId).populate("questions");
    if (!examRecord) {
      return res.status(404).json({
        success: false,
        message: "No record Found , Invalid exam id",
      });
    }
    res.status(200).json({ success: true, exam: examRecord });
  } catch (err) {
    console.log("error while fetching exam", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const saveAResult = async (req, res) => {
  const {
    courseId,
    subcourseId,
    examId,
    userId,
    marksObtained,
    percentage,
    maximumMarks,
  } = req.body;

  try {
    // Find the user's progress for the specific course
    const userProgress = await Progress.findOne({ courseId, userId });

    console.log(
      "data coming is",
      courseId,
      subcourseId,
      examId,
      userId,
      marksObtained,
      percentage,
      maximumMarks
    );
    if (!userProgress) {
      return res
        .status(404)
        .json({ success: false, message: "No Progress Found" });
    }

    // Save the exam result
    const newResult = new Result({
      examId,
      userId,
      subcourseId,
      marksObtained,
      percentage,
      maximumMarks,
    });

    await newResult.save();

    // Check if the exam is already marked as completed
    if (!userProgress.completedExams.includes(subcourseId)) {
      userProgress.completedExams.push(subcourseId);
    }

    // Find the course with its full structure
    const currentCourse = await Course.findById(courseId).populate({
      path: "courseContent", // Subcourses
      populate: {
        path: "chapters", // Chapters
        populate: {
          path: "videos", // Videos
        },
      },
    });

    if (!currentCourse) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Locate the current subcourse
    const currentSubcourse = currentCourse.courseContent.find(
      (subcourse) => subcourse._id.toString() === subcourseId
    );

    if (!currentSubcourse) {
      return res
        .status(404)
        .json({ success: false, message: "Subcourse not found" });
    }

    // Unlock the next subcourse if the current one is completed
    const currentSubcourseIndex = currentCourse.courseContent.findIndex(
      (subcourse) => subcourse._id.toString() === subcourseId
    );

    if (
      currentSubcourseIndex !== -1 &&
      currentSubcourseIndex < currentCourse.courseContent.length - 1
    ) {
      const nextSubcourse =
        currentCourse.courseContent[currentSubcourseIndex + 1];

      if (
        !userProgress.unlockedSubcourses.includes(nextSubcourse._id.toString())
      ) {
        userProgress.unlockedSubcourses.push(nextSubcourse._id.toString());
      }

      if (
        !userProgress.unlockedChapters.includes(
          nextSubcourse.chapters[0]._id.toString()
        )
      ) {
        userProgress.unlockedChapters.push(
          nextSubcourse.chapters[0]._id.toString()
        );
      }

      if (
        !userProgress.unlockedVideos.includes(
          nextSubcourse.chapters[0].videos[0]._id.toString()
        )
      ) {
        userProgress.unlockedVideos.push(
          nextSubcourse.chapters[0].videos[0]._id.toString()
        );
      }
    }

    // Save the updated progress
    userProgress.lastUpdated = Date.now();
    await userProgress.save();

    res.status(200).json({
      success: true,
      message: "Result saved and progress updated successfully",
      result: newResult,
      progress: userProgress,
    });
  } catch (err) {
    console.error("Error while saving result and updating progress:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while saving result",
    });
  }
};
const getCourseProgressAndResults = async (req, res) => {
  try {
    // Fetch the user's progress for the specified course
    const { courseId, userId } = req.body;
    console.log("data", courseId, userId);
    const userProgress = await Progress.findOne({ courseId, userId });

    if (!userProgress) {
      return res
        .status(404)
        .json({ success: false, message: "Progress not found for the user" });
    }

    // Fetch the course with its content structure (to calculate total videos)
    const course = await Course.findById(courseId).populate({
      path: "courseContent", // Subcourses
      populate: {
        path: "chapters", // Chapters
        populate: {
          path: "videos", // Videos
        },
      },
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Calculate total videos in the course
    const totalVideos = course.courseContent.reduce((total, subcourse) => {
      return (
        total +
        subcourse.chapters.reduce((chapterTotal, chapter) => {
          return chapterTotal + chapter.videos.length;
        }, 0)
      );
    }, 0);

    // Calculate progress percentage
    const completedVideos = userProgress.completedVideos.length;
    const progressPercentage =
      totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

    // Fetch the results of completed exams
    const completedExamResults = await Result.find({
      userId,
      subcourseId: { $in: userProgress.completedSubcourses },
    }).populate("examId");

    // Map results to include exam details
    const examResultsWithDetails = completedExamResults.map((result) => ({
      examTitle: result.examId.title,
      examDescription: result.examId.description,
      maximumMarks: result.examId.maximumMarks,
      obtainedMarks: result.marksObtained,
      percentage: result.percentage,
    }));

    // Response
    res.status(200).json({
      success: true,
      message: "Course progress and exam results fetched successfully",
      data: {
        progressPercentage: progressPercentage.toFixed(2),
        totalVideos,
        completedVideos,
        examResults: examResultsWithDetails,
        lastUpdated: userProgress.lastUpdated,
      },
    });
  } catch (err) {
    console.error("Error fetching course progress and exam results:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching progress and results",
    });
  }
};
module.exports = {
  createExam,
  addQuestionToExam,
  removeQuestionFromExam,
  linkExamToSubcourse,
  getAnExam,
  saveAResult,
  getCourseProgressAndResults,
};
