import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscriptionModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId || !req.user?._id) {
    throw new ApiError(400, "Channel ID or User ID not found");
  } else if (!isValidObjectId(channelId)) {
    throw new ApiError(404, "Invalid channel ID");
  }
  // toggle subscription
  const alreadySubscribed = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId,
  });
  if (!alreadySubscribed) {
    await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });
    res.status(200).json(new ApiResponse(200, "Channel subscribed", true));
  } else {
    await Subscription.deleteOne({
      subscriber: req.user._id,
      channel: channelId,
    });
    res.status(200).json(new ApiResponse(200, "Channel unsubscribed", false));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "Channel ID not available");
  } else if (!isValidObjectId(channelId)) {
    throw new ApiError(404, "Invalid channel ID");
  }
  const getSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
      },
    },
    {
      $unwind: "$subscriber",
    },
    {
      $project: {
        subscriber: { username: 1, avatar: 1 },
      },
    },
  ]);

  if (!getSubscribers.length) {
    throw new ApiError(400, "No subscribers found");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, "Subscribers fetched successfully", getSubscribers)
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "subscriber ID not found");
  } else if (!isValidObjectId(subscriberId)) {
    throw new ApiError(404, "Invalid subscriber ID");
  }
  const getSubscribedTo = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
      },
    },
    {
      $unwind: "$channel",
    },
    {
      $project: {
        channel: { username: 1, avatar: 1, createdAt: 1 },
      },
    },
  ]);
  if (!getSubscribedTo?.length) {
    throw new ApiError(404, "No channels found");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Subscribed channels fetched successfully",
        getSubscribedTo
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
