const express = require("express");
const router = express.Router();
const {auth}= require("../Middlewares/auth");

const {FetchProgress,updateProgress,findProgress}= require("../Controllers/ProgressContoller")
router.post("/get-progress",auth, FetchProgress);
router.post("/update-progress",updateProgress);
router.get("/get-all-user-progress",findProgress);
module.exports = router;