const Session = require("../Models/Session");
const User = require("../Models/User");
const mongoose = require("mongoose");
exports.createSession = async (req, res) => {
  try {
    const { title, description, link,studentIds } = req.body;

    if (!title || !description || !studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({
        message: "Invalid input. Please provide all required fields.",
      });
    }

    const students = await User.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      return res
        .status(400)
        .json({ message: "One or more student IDs are invalid." });
    }

    const session = new Session({
      title,
      description,
      students: studentIds,
      link
    });
    await session.save();
    const sessions = await Session.find().populate("students", "name email");

    res
      .status(200)
      .json({ 
        success:true ,
        message: "Session created successfully.", sessions: sessions });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getSessionsForStudent = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const sessions = await Session.find({ students: studentId }).populate(
      "students",
      "name email"
    );

    if (!sessions.length) {
      return res
        .status(404)
        .json({ message: "No sessions found for this student." });
    }

    res.status(200).json({success:true ,  sessions: sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().populate("students", "name email");
    res.status(200).json({  success: true ,sessions: sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
