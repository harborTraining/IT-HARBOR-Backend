const Course = require("../Models/Course");
const Subcourse = require("../Models/SubCourse");
const Chapter = require("../Models/Chapter");
const Video = require("../Models/Video");
const mongoose = require("mongoose");
const { uploadImagetoCloudinary } = require("../Utilities/ImageUploader");
// Controller to create a new course with empty subcourses
exports.createCourse = async (req, res) => {
  try {
    const { title, description, subcourses, rating, students } = req.body;
    const thumbnail = req.files?.thumbnail; // File upload
    // Upload the thumbnail image
    const thumbnailImage = await uploadImagetoCloudinary(
      thumbnail,
      "StudyNoti"
    );

    // Create the course object
    const newCourse = new Course({
      thumbnail: thumbnailImage?.secure_url, // Store the cloud URL of the thumbnail
      title,
      description,
      rating: rating || 0, // Default rating if not provided
      students: students || 0, // Default students count if not provided
      subcourses: 0, // Initialize subcourses count to 0
      courseContent: [], // Empty array to store subcourses' references
    });

    // Save the document to the database
    await newCourse.save();

    // Log the new course with the _id

    // Respond with the saved course details
    res.status(201).json({
      success: true,
      course: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(400).json({ error: error.message });
  }
};
exports.deleteCourse = async (req, res) => {
  const { courseId } = req.body;
  // Validate the required field
  console.log(courseId, "course id");
  if (!courseId) {
    return res.status(400).json({
      success: false,
      message: "Course ID is required.",
    });
  }

  // Validate if the provided courseId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Course ID format.",
    });
  }

  try {
    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
exports.getAllCourses = async (req, res) => {
  try {
    console.log("here");
    // Fetch all courses and populate their subcourses, chapters, and videos
    const courses = await Course.find().populate({
      path: "courseContent", // Populating subcourses
      populate: [
        {
          path: "chapters", // Populating chapters inside subcourses
          populate: {
            path: "videos", // Populating videos inside chapters
          },
        },
      ],
    });

    // Respond with the populated courses
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.addSubcourseToCourse = async (req, res) => {
  const { courseId, name, description, lectures } = req.body; // Extract subcourse details from the request body
  const { img } = req?.files;
  try {
    console.log("here", courseId);

    const thumbnailImage = await uploadImagetoCloudinary(img, "StudyNotion");
    // Create a new subcourse
    console.log(thumbnailImage);
    const newSubcourse = new Subcourse({
      name,
      img: thumbnailImage?.secure_url,
      description,
      lectures,
    });
    // Save the subcourse to the database
    const savedSubcourse = await newSubcourse.save();
    // Find the course and update its subcourses array
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $push: { courseContent: savedSubcourse._id } },
      { new: true }
    ).populate({
      path: "courseContent", // Populate courseContent
      populate: {
        path: "chapters", // Populate chapters within courseContent
      },
    });
    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }
    console.log("the updated course  is", updatedCourse);
    res.status(201).json({
      success: true,
      message: "Subcourse added successfully",
      subcourse: savedSubcourse,
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error adding subcourse to course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.addChapterToSubcourse = async (req, res) => {
  const { courseId, subcourseId, title, description } = req.body; // Extract details from the request body
  if (!courseId || !subcourseId || !title) {
    return res.status(400).json({
      error: "Course ID, Subcourse ID, and Chapter title are required.",
    });
  }
  try {
    // Validate course existence
    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({ error: "Course not found." });
    }

    // Validate subcourse existence and association with the course
    const subcourseExists = await Subcourse.findById(subcourseId);
    if (!subcourseExists || !courseExists.courseContent.includes(subcourseId)) {
      return res.status(404).json({
        error:
          "Subcourse not found or not associated with the specified course.",
      });
    }

    // Create a new chapter
    const newChapter = new Chapter({
      title,
      description,
    });

    // Save the chapter to the database
    const savedChapter = await newChapter.save();

    // Update the subcourse's chapters array
    const updatedSubcourse = await Subcourse.findByIdAndUpdate(
      subcourseId,
      { $push: { chapters: savedChapter._id } },
      { new: true }
    );

    const updatedCourse = await Course.findById(courseId).populate({
      path: "courseContent", // Populating subcourses
      populate: [
        {
          path: "chapters", // Populating chapters inside subcourses
          populate: {
            path: "videos", // Populating videos inside chapters
          },
        },
      ],
    });
    let chaptersToreturn = [];
    updatedCourse.courseContent.forEach((subcourse) => {
      if (subcourse._id == subcourseId) {
        console.log("here");
        chaptersToreturn = subcourse.chapters;
      }
    });
    // console.log("the cpurse", );
    res.status(201).json({
      message: "Chapter added successfully to the subcourse.",
      success: true,
      chapters: chaptersToreturn,
      course: updatedCourse,
      subcourses: updatedCourse.courseContent,
    });
  } catch (error) {
    console.error("Error adding chapter to subcourse:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
exports.addVideoToChapter = async (req, res) => {
  const { chapterId, title, url, courseId } = req.body;

  if (!chapterId || !title || !url) {
    return res.status(400).json({
      error: "Chapter ID, Video title, and Video URL are required.",
    });
  }

  try {
    const chapterExists = await Chapter.findById(chapterId);
    console.log(chapterExists, "chapter exists");
    if (!chapterExists) {
      return res.status(404).json({ error: "Chapter not found." });
    }
    console.log(chapterId, "id of the chapter");
    const newVideo = new Video({ title, url });

    const savedVideo = await newVideo.save();

    // Use findOneAndUpdate or findByIdAndUpdate to update the videos array
    const updatedChapter = await Chapter.findByIdAndUpdate(
      chapterId,
      { $push: { videos: savedVideo._id } }, // Ensure this operation pushes the video to the videos array
      { new: true } // Option to return the updated document
    );

    if (!updatedChapter) {
      return res
        .status(400)
        .json({ error: "Failed to update chapter with video." });
    }
    const changeNoLectures = await Course.findByIdAndUpdate(courseId, {
      $inc: { lectures: 1 },
    });

    // Populate course with the chapter and video details
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

    console.log(
      "Updated course with populated chapters and videos",
      updatedCourse
    );

    res.status(201).json({
      success: true,
      message: "Video added successfully to the chapter.",
      video: savedVideo,
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error adding video to chapter:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
exports.deleteSubcourse = async (req, res) => {
  const { subcourseId, courseId } = req.body; // Extract subcourse ID and course ID from the request body

  // Validate the required fields
  console.log("here", subcourseId, courseId);
  if (!subcourseId || !courseId) {
    return res.status(400).json({
      success: false,
      message: "Subcourse ID and Course ID are required.",
    });
  }

  // Validate if the provided subcourseId and courseId are valid MongoDB ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(subcourseId) ||
    !mongoose.Types.ObjectId.isValid(courseId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid Subcourse ID or Course ID format.",
    });
  }

  try {
    // Check if the subcourse exists
    const subcourse = await Subcourse.findById(subcourseId);
    if (!subcourse) {
      return res.status(404).json({
        success: false,
        message: "Subcourse not found.",
      });
    }

    // Check if the course exists and if the subcourse is associated with the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // Check if the subcourse is associated with the course
    if (!course.courseContent.includes(subcourseId)) {
      return res.status(404).json({
        success: false,
        message: "Subcourse is not associated with the specified course.",
      });
    }

    // Delete the subcourse
    await Subcourse.findByIdAndDelete(subcourseId);

    // Optionally, remove the subcourse from the course's courseContent array
    course.courseContent.pull(subcourseId);
    await course.save();
    const updatedCourse = await Course.findById(courseId).populate({
      path: "courseContent", // Populate courseContent
      populate: {
        path: "chapters", // Populate chapters within courseContent
      },
    });
console.log("course updated",updatedCourse, "updated course");
    res.status(200).json({
      success: true,
      message: "Subcourse deleted successfully.",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error deleting subcourse:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

exports.deleteChapter = async (req, res) => {
  const { subcourseId, chapterId,courseId } = req.body; // Extract subcourse ID and chapter ID from request body
  // Validate the required fields
  if (!subcourseId || !chapterId) {
    return res.status(400).json({
      success: false,
      message: "Subcourse ID and Chapter ID are required.",
    });
  }

  // Validate if the provided subcourseId and chapterId are valid MongoDB ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(subcourseId) ||
    !mongoose.Types.ObjectId.isValid(chapterId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid Subcourse ID or Chapter ID format.",
    });
  }

  try {
    // Check if the subcourse exists
    const subcourse = await Subcourse.findById(subcourseId);
    if (!subcourse) {
      return res.status(404).json({
        success: false,
        message: "Subcourse not found.",
      });
    }

    // Check if the chapter exists within the subcourse
    const chapterIndex = subcourse.chapters.indexOf(chapterId);
    if (chapterIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found in the subcourse.",
      });
    }

    // Delete the chapter
    await Chapter.findByIdAndDelete(chapterId);

    // Optionally, remove the chapter from the subcourse's chapters array
    subcourse.chapters.pull(chapterId);
    await subcourse.save();
    const course = await Course.findById(courseId).populate({
      path: "courseContent", // Populating subcourses
      populate: [
        {
          path: "chapters", // Populating chapters inside subcourses
          populate: {
            path: "videos", // Populating videos inside chapters
          },
        },
      ],
    });
    res.status(200).json({
      success: true,
      message: "Chapter deleted successfully.",
      course:course
    });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
exports.deleteVideo = async (req, res) => {
  console.log("here ins the video section")
  const { videoId, chapterId,courseId } = req.body; // Extract video ID and chapter ID from request body

  // Validate the required fields
  if (!videoId || !chapterId) {
    return res.status(400).json({
      success: false,
      message: "Video ID and Chapter ID are required.",
    });
  }

  // Validate if the provided videoId and chapterId are valid MongoDB ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(videoId) ||
    !mongoose.Types.ObjectId.isValid(chapterId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid Video ID or Chapter ID format.",
    });
  }

  try {
    // Check if the chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found.",
      });
    }

    // Check if the video exists within the chapter
    const videoIndex = chapter.videos.indexOf(videoId);
    if (videoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Video not found in the chapter.",
      });
    }

    // Delete the video
    await Video.findByIdAndDelete(videoId);

    // Optionally, remove the video from the chapter's videos array
    chapter.videos.pull(videoId);
    await chapter.save();
    const course = await Course.findById(courseId).populate({
      path: "courseContent", // Populating subcourses
      populate: [
        {
          path: "chapters", // Populating chapters inside subcourses
          populate: {
            path: "videos", // Populating videos inside chapters
          },
        },
      ],
    });
    res.status(200).json({
      success: true,
      message: "Video deleted successfully.",
      course:course
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { courseId, title, description, isImageUpdated } = req.body;

    if (!courseId || !title || !description) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    // Update the course details
    course.title = title;
    course.description = description;

    if (isImageUpdated === "true") {
      // If the image is updated, fetch the file from `req.files` and upload it to Cloudinary
      if (!req.files || !req.files.thumbnail) {
        return res
          .status(400)
          .json({ error: "Thumbnail is required when updating the image." });
      }

      const thumbnailFile = req.files.thumbnail;
      // Upload the image to Cloudinary
      const uploadResult = await uploadImagetoCloudinary(
        thumbnailFile,
        "StudyNoti"
      );

      // Update the thumbnail URL in the course
      course.thumbnail = uploadResult.secure_url;
    }

    // Save the updated course
    let updatedCourse = await course.save();
    updatedCourse = await Course.findById(courseId).populate({
      path: "courseContent", // Populate courseContent
      populate: {
        path: "chapters", // Populate chapters within courseContent
      },
    });
    return res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      course: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
