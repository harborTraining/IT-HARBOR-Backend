const express = require("express");
const app = express();
const CourseRoutes = require("./Routes/courseRoutes");
const authRoutes = require("./Routes/authRoutes");
const ProgressRoutes = require("./Routes/ProgressRoutes");
const userRoutes = require("./Routes/UserRoutes");
const examRoutes = require("./Routes/ExamRoutes");
const sessionRoutes = require("./Routes/SessionRoutes")
const fileUpload = require("express-fileupload");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dbConnect = require("./Config/database");
const clouldinaryConnect = require("./Config/cloudinary");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/course", CourseRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/progress", ProgressRoutes);
app.use("/api/v1/exam",examRoutes);
app.use("/api/v1/session",sessionRoutes);
dbConnect();
clouldinaryConnect();
// app.use("/api/v1/auth", UserRoutes);
// app.use("/api/v1/profile", ProfileRoutes);
// app.use("/api/v1/payment", PaymentRoutes);
// app.use("/api/v1/course", CourseRoutes);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: " server is up",
  });
});

app.listen(PORT, () => {
  console.log("App is running live");
});
