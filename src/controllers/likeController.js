import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/likeModel.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video ID not found");
  } else if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "Invalid video ID");
  }
  // toggle like on video
  const likedVideo = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });
  if (!likedVideo) {
    const like = await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });
    if (!like) {
      throw new ApiError(404, "Failed to like the video/ video does not exist");
    }
    res.status(200).json(new ApiResponse(200, "Video liked", true));
  } else {
    const unlike = await Like.deleteOne({
      video: videoId,
      likedBy: req.user?._id,
    });
    if (!unlike) {
      throw new ApiError(401, "Failed to unlike the video");
    }
    res
      .status(200)
      .json(new ApiResponse(200, "Video unliked successfully", false));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  // toggle like on comment
  if (!commentId) {
    throw new ApiError(404, "Comment ID does not exist");
  } else if (!isValidObjectId(commentId)) {
    throw new ApiError(404, "Invalid comment ID");
  }

  const liked = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });
  if (!liked) {
    const like = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });
    if (!like) {
      throw new ApiError(500, "failed to like the comment");
    }
    res
      .status(200)
      .json(new ApiResponse(200, "Comment liked successfully", true));
  } else {
    const unlike = await Like.deleteOne({
      comment: commentId,
      likedBy: req.user?._id,
    });
    if (!unlike) {
      throw new ApiError(500, "failed to unlike the video");
    }
    res
      .status(200)
      .json(new ApiResponse(200, "Comment unliked successfully", false));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  // toggle like on tweet
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(404, "Invalid tweet ID");
  }
  const likedTweet = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });
  if (!likedTweet) {
    const like = await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });
    if (!like) {
      throw new ApiError(500, "Failed to like the tweet");
    }
    res
      .status(200)
      .json(new ApiResponse(200, "Tweet liked successfully", true));
  } else {
    const unlike = await Like.deleteOne({
      tweet: tweetId,
      likedBy: req.user?._id,
    });
    if (!unlike) {
      throw new ApiError(500, "Failed to unlike the tweet");
    }
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Tweet unliked successfully", false));
});

const getMyLikedVideos = asyncHandler(async (req, res) => {
  // get all liked videos
  if (!req.user?._id) {
    throw new ApiError("User does not exist or must be logged out");
  }
  const getUserLikedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "likedBy",
      },
    },
    {
      $unwind: "$likedBy",
    },
    {
      $project: {
        video: 1,
        likedBy: { username: 1, avatar: 1, fullName: 1, coverImage: 1 },
      },
    },
  ]);
  if (!getUserLikedVideos) {
    throw new ApiError(401, "You have not liked any video");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Liked videos fetched successfully",
        getUserLikedVideos
      )
    );
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getMyLikedVideos,
};
