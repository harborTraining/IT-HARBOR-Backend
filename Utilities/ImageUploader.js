const cloudinary = require('cloudinary').v2;
require("dotenv").config();

exports.uploadImagetoCloudinary = async (file, folder, height, quality) => {
  const folderof = process.env.CLOUD_FOLDER;
  
  // Set the options for uploading
  let options = {
    folder: folder || folderof,  // Ensure folder is set correctly
    resource_type: "auto",       // Handle different file types (image, video, etc.)
  };

  if (height) options.height = height;
  if (quality) options.quality = quality;

  // Optional: Increase timeout for long-running uploads
  options.timeout = 300000;  // 5 minutes (adjust as necessary)

  // Check if the file exists and has a valid path
  if (!file || !file.tempFilePath) {
    throw new Error('File path is missing or invalid.');
  }

  console.log('Uploading file:', file.tempFilePath);

  try {
    // Use async upload if the file size is large or if you're expecting longer processing time
    const result = await cloudinary.uploader.upload(file.tempFilePath, options);

    // Return the result of the upload
    return result;
  } catch (error) {
    console.log(error)
    // Handle error appropriately, such as logging it and returning a friendly message
    console.error('Error uploading to Cloudinary:', error.message);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
};