const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../Models/User");
// auth middle ware  
exports.auth = async (req, res, next) => {
     try {
          // extract token 

          const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");
          // if token is missing 
        //   console.log("the comg token", token);
          if (!token) {
               res.status(401).json({
                    success: "False",
                    message: "Token is missing"
               })
          }
          // token verify to auntheticate
          try {
               require("dotenv").config();
               const decode = jwt.verify(token, process.env.JWT_SECRET);
               console.log("data decoded is ", decode);
               req.user = decode;
          }
          catch (err) {
               console.log(err);
               res.status(400).json({
                    success: false,
                    message: "Something went wrong"
               })
          }
          next();
     }
     catch (err) {
          console.log(err);
          res.status(400).json({
               success: false,
               message: "Something went wrong"
          })
     }
}