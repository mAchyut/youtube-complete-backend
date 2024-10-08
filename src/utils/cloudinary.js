import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

//pre-verification
console.log(process.env.CLOUDINARY_API_KEY);
if (
  !process.env.CLOUDINARY_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("Cloudinary config values are missing.");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  console.log("The cloudinary file.....");
  if (!localFilePath) return null;
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(`File uploaded on cloudinary successfully ${response.url}`);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    if (localFilePath) {
      fs.unlinkSync(localFilePath);
    }
    console.log(`Error in file upload :: cloudinary :: ${error.message}`);
  }
};

const deleteFromcloudinary = async (url) => {
  if (!url) return null;
  try {
    let first = url.slice(url.indexOf("upload") + 7);
    let second = first.slice(first.indexOf("/") + 1, first.lastIndexOf("."));

    return await cloudinary.uploader.destroy(second);
  } catch (error) {
    console.log(
      `An error occurred in removing previous file(s): ${error.message}`
    );
  }
};

export { uploadOnCloudinary, deleteFromcloudinary };
