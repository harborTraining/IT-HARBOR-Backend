// instance of cloudinary 
const cloudinary = require("cloudinary"); 

require("dotenv").config(); 
const clouldinaryConnect  = async () =>{
    console.log("cloudinary configurred")
 try{
     cloudinary.config({
      api_key: process.env.CLOUD_API_KEY, 
      api_secret:process.env.CLOUD_API_SECRET, 
      cloud_name:process.env.CLOUD_NAME,
      timeout: 300000
     })
 }
 catch(err)
 {
  console.log("error while connceting to cloudinary",err);
 }
}
module.exports = clouldinaryConnect;