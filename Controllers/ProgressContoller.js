const Course = require("../Models/Course");
const Subcourse = require("../Models/SubCourse");
const Chapter = require("../Models/Chapter");
const Video = require("../Models/Video");
const Progress = require("../Models/CourseProgress");
const mongoose = require("mongoose");

exports.FetchProgress = async (req, res) => {
    try {
        console.log("here")
        const {courseId}= req.body ; 
        const userId = req.user.id;
        const userProgress = await Progress.findOne({courseId:courseId, userId:userId});
        if(!userProgress){
            return res.status(404).json({message:"No Progress Found"});
        }
        return res.status(200).json({
            success:true,
            Progress:userProgress
        })
    }

    catch(err){
        console.log("Something went wrong while fetching progress", err);
        return res.status(500).json({
            success:false , 
            message:"Something went wrong while fetching progress"
        });
    }
};
exports.updateProgress = async (req, res) => {
  try {
    const { courseId, chapterId, videoId, userId } = req.body;

    // Find the user's progress for the specific course
    const userProgress = await Progress.findOne({ courseId, userId });

    if (!userProgress) {
      return res.status(404).json({ message: "No Progress Found" });
    }

    // Check if the video is already completed
    if (!userProgress.completedVideos.includes(videoId)) {
      userProgress.completedVideos.push(videoId);
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
      return res.status(404).json({ message: "Course not found" });
    }

    // Locate the current subcourse
    const currentSubcourse = currentCourse.courseContent.find((subcourse) =>
      subcourse.chapters.some((chapter) => chapter._id.toString() === chapterId)
    );

    if (!currentSubcourse) {
      return res.status(404).json({ message: "Subcourse not found" });
    }

    // Locate the current chapter
    const currentChapter = currentSubcourse.chapters.find(
      (chapter) => chapter._id.toString() === chapterId
    );

    if (!currentChapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // Mark chapter as completed if all its videos are completed
    const allVideosCompleted = currentChapter.videos.every((video) =>
      userProgress.completedVideos.includes(video._id.toString())
    );

    if (allVideosCompleted && !userProgress.completedChapters.includes(chapterId)) {
      userProgress.completedChapters.push(chapterId);
    }

    // Mark subcourse as completed if all its chapters are completed
    const allChaptersCompleted = currentSubcourse.chapters.every((chapter) =>
      userProgress.completedChapters.includes(chapter._id.toString())
    );

    if (allChaptersCompleted && !userProgress.completedSubcourses.includes(currentSubcourse._id.toString())) {
      userProgress.completedSubcourses.push(currentSubcourse._id.toString());
    }

    // Check if the current subcourse examination is completed
    const currentExamCompleted = userProgress.completedExams.includes(currentSubcourse._id.toString());

    // Unlock the next video
    const currentVideoIndex = currentChapter.videos.findIndex(
      (video) => video._id.toString() === videoId
    );

    if (currentVideoIndex !== -1 && currentVideoIndex < currentChapter.videos.length - 1) {
      const nextVideoId = currentChapter.videos[currentVideoIndex + 1]._id.toString();
      if (!userProgress.unlockedVideos.includes(nextVideoId)) {
        userProgress.unlockedVideos.push(nextVideoId);
      }
    } else {
      // Unlock the next chapter if it exists
      const currentChapterIndex = currentSubcourse.chapters.findIndex(
        (chapter) => chapter._id.toString() === chapterId
      );

      if (
        currentChapterIndex !== -1 &&
        currentChapterIndex < currentSubcourse.chapters.length - 1
      ) {
        const nextChapter = currentSubcourse.chapters[currentChapterIndex + 1];
        if (!userProgress.unlockedChapters.includes(nextChapter._id.toString())) {
          userProgress.unlockedChapters.push(nextChapter._id.toString());
        }
        if (!userProgress.unlockedVideos.includes(nextChapter.videos[0]._id.toString())) {
          userProgress.unlockedVideos.push(nextChapter.videos[0]._id.toString());
        }
      } else if (currentExamCompleted) {
        // Unlock the next subcourse if all conditions are met
        const currentSubcourseIndex = currentCourse.courseContent.findIndex(
          (subcourse) => subcourse._id.toString() === currentSubcourse._id.toString()
        );

        if (
          currentSubcourseIndex !== -1 &&
          currentSubcourseIndex < currentCourse.courseContent.length - 1
        ) {
          const nextSubcourse = currentCourse.courseContent[currentSubcourseIndex + 1];
          if (!userProgress.unlockedSubcourses.includes(nextSubcourse._id.toString())) {
            userProgress.unlockedSubcourses.push(nextSubcourse._id.toString());
          }
          if (!userProgress.unlockedChapters.includes(nextSubcourse.chapters[0]._id.toString())) {
            userProgress.unlockedChapters.push(nextSubcourse.chapters[0]._id.toString());
          }
          if (
            !userProgress.unlockedVideos.includes(
              nextSubcourse.chapters[0].videos[0]._id.toString()
            )
          ) {
            userProgress.unlockedVideos.push(nextSubcourse.chapters[0].videos[0]._id.toString());
          }
        }
      }
    }

    // Save the updated progress
    userProgress.lastUpdated = Date.now();
    await userProgress.save();

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      progress: userProgress,
    });
  } catch (err) {
    console.error("Something went wrong while updating progress", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating progress",
    });
  }
};

exports.findProgress = async (req, res) => {
    try {
        const userProgress = await Progress.find({}).populate("courseId").populate("userId");
        // if (!userProgress) {
        //     return res.status(404).json({ message: "No Progress Found" });
        // } 
        return res.status(200).json({
            success: true,
            Progress: userProgress
        })
    }  
    catch (err) {  
        console.error("Something went wrong while finding progress", err);
        res.status(500).json({ success: false, message: "Something went wrong while finding progress" });

    }
};


