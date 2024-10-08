import mongoose, { mongo } from "mongoose";
import { Video } from "../models/videoModel.js";
import { Subscription } from "../models/subscriptionModel.js";
import { Like } from "../models/likeModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
const getChannelStats = asyncHandler(async (req, res) => {
  // Count total subscribers
  const subscribersCount = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscribers",
        foreignField: "_id",
        as: "subscribers",
      },
    },
    {
      $group: {
        _id: "$channel",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const viewsCount = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $group: {
        _id: "$owner", // Group by owner
        totalViews: { $sum: "$views" }, // Sum views across all videos
      },
    },
  ]);

  const likesCount = await Like.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $group: {
        _id: "$owner",
        totalLikes: {
          $sum: 1,
        },
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(200, "channel stats fetched successfully", {
      subscribersCount: subscribersCount[0]?.count || 0,
      viewsCount: viewsCount[0]?.totalViews || 0,
      likesCount: likesCount[0]?.totalLikes || 0,
    })
  );
});
const getChannelVideos = asyncHandler(async (req, res) => {
  const totalVideos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        "owner._id": 1,
      },
    },
  ]);

  if (!totalVideos) {
    throw new ApiError(401, "No videos found for the user");
  }

  res.status(200).json(
    new ApiResponse(200, "All videos fetched successfully", {
      totalVideos,
    })
  );
});

export { getChannelStats, getChannelVideos };
