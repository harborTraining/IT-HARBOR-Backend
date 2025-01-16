const User = require("../Models/User");
const MailSender = require("../Utilities/MailSender");
const bcrypt = require('bcryptjs');
const crypto= require("crypto");
exports.resetPasswordToken = async (req, res) => {
 try { // step
  // ftech email  
  const { email } = req.body;
  // check user for email 
  const checkUser = await User.findOne({ email });
  if (!checkUser) {
   return res.status(400).json({
    success: false,
    message: "Not registered user"
   })
  }

  // genrate token 
  const token = crypto.randomUUID();
  const result = await User.findOneAndUpdate({ email: email }, { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 })
  // update user by adding token and expiration time 
  // create url andsend mail to user and return response 
  const url = `http:localhost:3000/update-password/${token}`;

  await MailSender(email, "password reset link", `Password reset link is ${url}`);
  return res.status(200).json({
   success: true,
   message: "Email sent succesfully reset the password"
  })
 } catch (err) {
  console.log(err)
  res.status(500).json({
   success: false,
   message: "Something went wrong while reseting psw"
  })
 }
}
exports.resetPassword = async (req, res) => {
 // fetch data 
 try {
  const { token, password, confirmPassword } = req.body;
  // validate data 
  if (!token || !password || !confirmPassword) {
   return res.status(400).json({
    success: false,
    message: "All fields are mandatoy "
   })
  }
  // check both password
  if(password !== confirmPassword)
  {
   res.status(400).json({
    success: false,
    message: "Password not matching"
   })
  }

  // find user using token  and check that the entry exits and token is in time 
  const userdet = User.findOne({token:token}); 
  if(!userdet)
  {
   res.status(400).json({
    success: false,
    message: "No enty is present"
   })
  }
  if(userdet.resetPasswordExpires > Date.now())
  {
   res.status(400).json({
    success: false,
    message: "Link Expired"
   })
  }
  const hashedPsw = await bcrypt.hash(password, 10); 
  // hash and update password 
  await User.findOneAndUpdate({token:token},{password:hashedPsw}, {new:true})
  res.status(200).json({
   success: true ,
   message: "Password reseted succesfuly"
  })
 }
 catch (err) {
  console.log(err);
  res.status(500).json({
   success: false,
   message: "Something went wrong"
  })
 }
}


exports.courseActivationMail = async (req, res) => {
    try { // step
        // ftech email  
        console.log("eh")
        const { email } = req.body;
        // check user for email 
        const checkUser = await User.findOne({ email });
        if (!checkUser) {

         return res.status(400).json({
          success: false,
          message: "Not registered user"
         })
        }
        const token = crypto.randomUUID();
        const result = await User.findOneAndUpdate({ email: email }, { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 })
        // update user by adding token and expiration time 
        // create url andsend mail to user and return response 
        const url = `http:localhost:3000/update-password/${token}`;
      
        await MailSender(email, `Account ACTIVATION LINK`, `Admin Assignes you a Course , Please do check it & Make Sure You Reset Your Password & activate your account by following this link: ${url}`);
        return res.status(200).json({
         success: true,
         message: "Email sent succesfully reset the password"
        })
       } catch (err) {
        console.log(err)
        res.status(500).json({
         success: false,
         message: "Something went wrong while reseting psw"
        })
       }
}