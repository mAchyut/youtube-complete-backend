import { Video } from "../models/videoModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  deleteFromcloudinary,
  uploadOnCloudinary,
  deleteVideoFromcloudinary,
} from "../utils/cloudinary.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = -1,
    userId,
  } = req.query;
  // get all videos based on query, sort, pagination
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const matchQuery = {
    ...(userId && { owner: new mongoose.Types.ObjectId(userId) }),
    ...(query && { title: { $regex: query, $options: "i" } }),
  };

  const videos = await Video.aggregate([
    { $match: matchQuery },
    { $sort: { [sortBy]: parseInt(sortType) } },
    { $skip: (pageNumber - 1) * limitNumber },
    { $limit: limitNumber },
  ]).exec();

  // Populate the owner details from the User collection
  await Video.populate(videos, {
    path: "owner",
    select: "username avatar email",
  });

  const totalVideos = await Video.countDocuments(matchQuery);

  res.status(200).json(
    new ApiResponse(200, "All videos fetched successfully", {
      videos,
      totalPages: Math.ceil(totalVideos / limitNumber),
      currentPage: pageNumber,
    })
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // get video, upload to cloudinary, create video
  const { video, thumbnail } = req.files;
  if (!title || !description || !video || !thumbnail) {
    throw new ApiError(
      401,
      "All fields are required (video file, thumbnail, title and description)"
    );
  }
  const thumbnailUpload = await uploadOnCloudinary(thumbnail[0]?.path);
  const videoUpload = await uploadOnCloudinary(video[0]?.path);
  // console.log(videoUpload.duration);

  if (!videoUpload || !thumbnailUpload) {
    await deleteFromcloudinary(thumbnailUpload?.url);
    await deleteVideoFromcloudinary(videoUpload?.url);
    throw new ApiError(
      500,
      "An error occurred while uploading the video & thumbnail,[ max-video:100MB & thumbnail:10MB]"
    );
  }

  const createdVideo = await Video.create({
    videoFile: videoUpload.url,
    thumbnail: thumbnailUpload.url,
    title,
    description,
    duration: videoUpload?.duration,
    owner: req.user?._id,
  });
  // console.log(createdVideo);
  if (!createdVideo) {
    throw new ApiError(500, "An error occurred while publishing, retry");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Video and thumbnail published successfully",
        createdVideo
      )
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // get video by id
  if (!videoId) {
    throw new ApiError(400, "Video ID not found");
  }
  const video = await Video.findById(videoId).populate("owner", "username");
  if (!video) {
    throw new ApiError(500, "Video file no longer exist");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Video file fetched successfully", video));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video ID not found");
  }
  const existingVideo = await Video.findById(videoId);
  if (!existingVideo) {
    throw new ApiError(420, "Incorrect video ID");
  }
  // update video details like title, description, thumbnail
  const { title, description } = req.body;
  const thumbnail = req.file;

  if (!title && !description && !thumbnail) {
    throw new ApiError(401, "No fields to update");
  }
  // console.log(req.file);
  const updateThumbnail =
    thumbnail && (await uploadOnCloudinary(thumbnail?.path));
  //delete previous thumbnail from cloudinary once newone is uploaded

  // console.log("TRYING NOT TO SEND THUMBNAIL");
  updateThumbnail && (await deleteFromcloudinary(existingVideo?.thumbnail));

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        ...(thumbnail && { thumbnail: updateThumbnail.url }),
        ...(title && { title }),
        ...(description && { description }),
      },
    },
    {
      new: true,
    }
  );
  if (!video) {
    throw new ApiError(500, "Failed to update");
  }

  // console.log(video);

  res
    .status(200)
    .json(new ApiResponse(200, "Details updated successfully", video));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video ID not found");
  }

  // delete video
  const deleteVideoFile = await Video.findByIdAndDelete(videoId);
  if (!deleteVideoFile) {
    throw new ApiError(500, "An error occurred in deletion");
  }

  //Removing files from cloudinary once deleted from database
  await deleteVideoFromcloudinary(deleteVideoFile?.videoFile);
  await deleteFromcloudinary(deleteVideoFile?.thumbnail);
  res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully", null));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video ID not found");
  }

  const existingVideo = await Video.findById(videoId);
  if (!existingVideo) {
    throw new ApiError(401, "Video file does not exist");
  }
  const toggle = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !existingVideo.isPublished,
      },
    },
    { new: true }
  );
  // console.log(toggle);
  if (!toggle) {
    throw new ApiError(420, "Failed to toggle Publish");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "publish field successfully updated",
        toggle.isPublished
      )
    );
});

const addViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "Invalid video ID");
  }
  const updateViews =
    req.user?._id &&
    (await Video.findByIdAndUpdate(
      videoId,
      {
        $inc: {
          views: 1,
        },
      },
      {
        new: true,
      }
    ));

  if (!updateViews) {
    throw new ApiError(401, "Failed to add views, Video may no longer exist");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, "View added to the video successfully", updateViews)
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  addViews,
};
