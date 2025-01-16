const express = require("express");
const router = express.Router();
const {auth}= require("../Middlewares/auth");
const { sendOtp,signUp, logIn}= require("../Controllers/authController");
// Route to send OTP
router.post("/send-otp", sendOtp);
router.post("/sign-up", signUp);
router.post("/sign-in",logIn);

module.exports = router;