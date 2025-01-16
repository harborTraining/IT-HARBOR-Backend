const OTP = require("../Models/OTP");
const User = require("../Models/User");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { mailSender } = require("../Utilities/MailSender");
require("dotenv").config();
exports.sendOtp = async (request, response) => {
  try {
    // fetched email
    const { email } = request.body;
    console.log(email);
    // check if user exist or not
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return response.status(401).json({
        success: false,
        message: "User Already Exists",
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    console.log(otp);
    // verify that otp is unique
    let checkOtp = OTP.findOne({ otp: otp });
    // while (checkOtp) {
    //     otp = otpGenerator.generate(6, {
    //         upperCaseAlphabets: false,
    //         specialChars: false,
    //         lowerCaseAlphabets: false,
    //     });
    //     console.log("inside")
    // }
    // mail chli gyi
    const saved = OTP.create({
      email,
      otp,
    });
    const otpPayload = { email, otp };
    console.log("OTP Body", otpPayload);
    return response.status(200).json({
      success: true,
      message: "Otp Sent Successfully",
    });
  } catch (err) {
    console.log(err);
    return response.status(500).json({
      success: false,
      message: "Failed to Send Otp",
    });
  }
};

exports.signUp = async (request, response) => {
  try {
    const { fullName, email, contact, batchNo } = request.body;
    // validate the data
    console.log(fullName, email, contact, batchNo);
    if (!email || !fullName || !contact || !batchNo) {
      return response.status(400).json({
        success: false,
        message: "ALL fields are required",
      });
    }
    // check if user exist or not
    const checkUser = await User.findOne({ email:email });
    console.log(checkUser);
    if (checkUser) {
      return response.status(400).json({
        success: false,
        message: "User Already exists with this email",
      });
    }
    const signedUp = await User.create({
      name: fullName,
      email,
      batchNo,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${fullName}`,
      contact,
    });
    // return response
    return response.status(200).json({
      success: true,
      message: " User is Registered Successfully",
      user: signedUp,
    });
  } catch (err) {
    console.log("error in sing", err);
    return response.status(400).json({
      success: false,
      message: "Cant create the user ",
    });
  }
};

exports.logIn = async (request, response) => {
  // fetch
  try {
    const { email, password } = request.body;
    // validate
    if (!email || !password) {
      return response.status(403).json({
        success: false,
        message: "All fields required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(401).json({
        success: false,
        message: "User is not Registered please sign up",
      });
    }
    // Generate JWT token and Compare Password
    if (await bcrypt.compare(password, user?.password)) {
      require("dotenv").config();
      const payload = {
        email: user.email,
        id: user._id,
        role: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      console.log(token);
      user.token = token;
      user.password = undefined;
      // create a cookie
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      let returnedUser = {};
      returnedUser = user;
      if (email === "admin@gmail.com") {
        console.log("first");
        returnedUser.isAdmin = true;
      }
      return response.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user: returnedUser,
        message: " login succed",
        isAdmin: returnedUser.isAdmin,
      });
    } else {
      response.status(400).json({
        success: false,
        message: "Password Incorrect",
      });
    }
  } catch (err) {
    console.log(err);
    response.status(500).json({
      success: false,
      message: "Eroor Ocurred",
    });
  }
};
//get data
// email oldPsw , newPsw confirmNewPassword
// update in db psw mail {}
