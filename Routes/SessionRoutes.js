const express = require("express");
const router = express.Router();
const {
  createSession,
  getSessionsForStudent,
  getAllSessions
} = require("../Controllers/SessionController");

router.post("/create-session", createSession);
router.post("/fetchSessions", getSessionsForStudent);
router.post("/allSessions", getAllSessions);
module.exports = router;
