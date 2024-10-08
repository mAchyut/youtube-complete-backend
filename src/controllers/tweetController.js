import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Tweet } from "../models/tweetModel.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  // create tweet
  console.log("tweet route");
  const { tweet } = req.body;
  if (!tweet?.length) {
    throw new ApiError(400, "Tweet content cannot be empty");
  }
  const tweetMessage = await Tweet.create({
    content: tweet,
    owner: req.user?._id,
  });
  if (!tweetMessage) {
    throw new ApiError(400, "Failed to create the tweet");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Tweet added successfully", tweetMessage));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // get user tweets
  const getTweets = await Tweet.aggregate([
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
    { $unwind: "$owner" },
    {
      $project: {
        content: 1,
        owner: { avatar: 1, username: 1 },
      },
    },
  ]);
  if (!getTweets) {
    throw new ApiError(400, "No Tweets");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, "User's tweets fetched successfully", getTweets)
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  // update tweet
  const { tweet } = req.body;
  const { tweetId } = req.params;
  if (!tweet?.length) {
    throw new ApiError(400, "Tweet cannot be empty");
  } else if (!tweetId) {
    throw new ApiError(400, "Comment ID not found");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: tweet,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedTweet) {
    throw new ApiError(400, "Failed to update the tweet");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, "Tweet updated succesfully", updatedTweet.content)
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
  // delete tweet
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(401, "Tweet ID not found");
  }
  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
  if (!deletedTweet) {
    throw new ApiError(400, "Failed to delete the tweet");
  }
  res.status(200).json(new ApiResponse(200, "Tweet deleted succesfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
