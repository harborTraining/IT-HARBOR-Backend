const express = require("express");
const router = express.Router();
const {auth} = require("../Middlewares/auth");
// Route for generating a reset password token
const {
  resetPasswordToken,
  resetPassword,

} = require("../Controllers/ResetPasswordContorller");
const {assignCourseToUser, getUserCourses, fetchAllUsers, deleteUser} = require("../Controllers/userController");
router.post("/reset-password-token", resetPasswordToken);
// Route for resetting user's password after verification
router.post("/reset-password", resetPassword);
// assign course to user
router.post("/assign-course", assignCourseToUser);
router.post("/get-user-courses", auth , getUserCourses)
router.get("/get-all-users",fetchAllUsers)
router.post("/delete-user",deleteUser)
module.exports = router;
