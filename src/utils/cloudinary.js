import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";
import { exec } from "child_process";

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

// const uploadOnCloudinary = async (localFilePath) => {

//   console.log("The cloudinary file.....");
//   if (!localFilePath) return null;
//   try {
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });
//     console.log(`File uploaded on cloudinary successfully ${response.url}`);
//     fs.unlinkSync(localFilePath);
//     return response;
//   } catch (error) {
//     if (localFilePath) {
//       fs.unlinkSync(localFilePath);
//     }
//     console.log(`Error in file upload :: cloudinary :: ${error.message}`);
//   }
// };

// fs was failing to delete properly so using exec
//Using the child_process module to run a system command should bypass any locks caused by the Node.js process, as it executes in a separate shell.
const uploadOnCloudinary = async (localFilePath) => {
  console.log("The cloudinary file.....");
  if (!localFilePath) return null;

  const deleteFileUsingCommand = (filePath) => {
    const command =
      process.platform === "win32"
        ? `del /f "${filePath}"`
        : `rm -f "${filePath}"`;
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error deleting file with command:`, stderr);
      } else {
        console.log("File deleted successfully with command.");
      }
    });
  };

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(`File uploaded on cloudinary successfully ${response.url}`);
    deleteFileUsingCommand(localFilePath); // Delete after successful upload
    return response;
  } catch (error) {
    deleteFileUsingCommand(localFilePath); // Attempt to delete on upload failure as well
    console.log(`Error in file upload :: cloudinary :: ${error.message}`);
    // if (error?.http_code === 413)
    //   throw Error("Maximum file size is 100MB for video");
    // throw error;
  }
};

const deleteFromcloudinary = async (url) => {
  if (!url) return null;
  try {
    let first = url.slice(url.indexOf("upload") + 7);
    let second = first.slice(first.indexOf("/") + 1, first.lastIndexOf("."));
    return await cloudinary.uploader.destroy(second, {
      resource_type: "image",
    });
  } catch (error) {
    console.log(
      `An error occurred in removing previous file(s): ${error.message}`
    );
  }
};
const deleteVideoFromcloudinary = async (url) => {
  if (!url) return null;
  try {
    let first = url.slice(url.indexOf("upload") + 7);
    let second = first.slice(first.indexOf("/") + 1, first.lastIndexOf("."));
    return await cloudinary.uploader.destroy(second, {
      resource_type: "video",
    });
  } catch (error) {
    console.log(
      `An error occurred in removing previous file(s): ${error.message}`
    );
  }
};

export { uploadOnCloudinary, deleteFromcloudinary, deleteVideoFromcloudinary };
