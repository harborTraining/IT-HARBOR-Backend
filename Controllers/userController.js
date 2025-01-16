const User = require("../Models/User");
const Course = require("../Models/Course");
const Progress = require("../Models/CourseProgress");
exports.assignCourseToUser = async (req, res) => {
  const { userId, courseId } = req.body; // Extract user ID and course ID from the request body

  console.log("my-user-is",userId,courseId); 
  // Validate required fields
  if (!userId || !courseId) {
    return res.status(400).json({
      success: false,
      message: "User ID and Course ID are required.",
    });
  }

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    if (user.courses && user.courses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course is already assigned to the user.",
      });
    }
    // Check if the course exists
    const course = await Course.findById(courseId).populate({
        path: "courseContent", // Populate the subcourses within the courses
        populate: {
          path: "chapters", // Populate the chapters within the subcourses
          populate: {
            path: "videos", // Populate the videos within the chapters
          },
        },
    });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }
    // console.log("here is the found course",course)
    const firstSubcourse = course?.courseContent[0];  // First subcourse
    const firstChapter = firstSubcourse?.chapters[0];  // First chapter
    const firstVideo = firstChapter?.videos[0];  // First video of the first subcourse
    // console.log("the ids of all the  subcourse ",firstSubcourse._id,firstChapter._id,firstVideo._id)
    // return ;
    // Step 3: Create the progress document for the user
    const newProgress = new Progress({
      courseId: courseId,
      userId: userId,
      unlockedSubcourses: [firstSubcourse?._id],  // Unlock the first subcourse
      unlockedVideos: [firstVideo?._id],  // Unlock the first video
      unlockedChapters: [firstChapter?._id],  // Unlock the first chapter
      completedVideos: [],
      completedChapters: [],
      completedSubcourses: [],
    });

    // Save the new progress record to the database
    await newProgress.save();
    // console.log("User progress created successfully and first content unlocked.");
   

    // Check if the course is already assigned to the user
 

    // Assign the course to the user
    user.courses = user.courses || [];
    user.courses.push(courseId);

    // Save the updated user document
    await user.save();
    const userDetails = await User.findById(user._id).populate("courses");
    res.status(200).json({
      success: true,
      message: "Course assigned to the user successfully.",
      user:userDetails,
    });
  } catch (error) {
    console.error("Error assigning course to user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

exports.getUserCourses = async (req, res) => {
  // Extract the user ID from the request body
  const userId = req.user.id;

  // Validate required fields
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required.",
    });
  }

  try {
    // Check if the user exists
    const user = await User.findById(userId).populate({
      path: "courses", // Populate the courses field in the user
      populate: {
        path: "courseContent", // Populate the course content within the courses
        populate: [
          {
            path: "chapters", // Populate the chapters within the course content
            populate: {
              path: "videos", // Populate the videos within the chapters
            },
          }
        ],
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.courses || user.courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for this user.",
      });
    }

    // Fetch progress for each course that the user is enrolled in
    const progressPromises = user.courses.map(async (course) => {
      // Fetch the progress for the current course
      const progress = await Progress.findOne({ userId: userId, courseId: course._id });

      // If progress is found, add it to the course object
      if (progress) {
        return {
          course: course, // The course data
          progress: progress, // The progress data for the course
        };
      } else {
        // If no progress, return the course with progress as null
        return {
          course: course,
          progress: null,
        };
      }
    });

    // Wait for all promises to resolve and then return the response
    const coursesWithProgress = await Promise.all(progressPromises);

    res.status(200).json({
      success: true,
      message: "User courses and progress retrieved successfully.",
      courses: coursesWithProgress,
    });
  } catch (error) {
    console.error("Error fetching user courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
exports.fetchAllUsers = async (req, res) => {
  try{
    const allUsers = await User.find().populate("courses");

     // Fetch all users from the database  
     const filteredUsers = allUsers.filter(user => user.email !== "admin@gmail.com");
     
    return res.status(200).json({
      success: true,
      message: "All users fetched successfully.",
      users: filteredUsers,
    });
  }
  catch(err){
    console.log(err);
    return res.status(400).json({
      success: false,   
      message: "Error fetching all users.",
    });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const {userId} = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    // Delete the user from the database
    await User.findByIdAndDelete(userId);
    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};