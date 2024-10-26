import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/userModel.js";
import fs from "fs";
import {
  deleteFromcloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      400,
      "something went wrong while generating the Access/Refresh Tokens"
    );
  }
};

const register = asyncHandler(async (req, res) => {
  const { email, password, username, fullName } = req.body;

  if ([email, password, username].some((value) => value.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    if (
      Array.isArray(req.files?.coverImage) &&
      req.files.coverImage.length !== 0 &&
      req.files?.coverImage[0]?.path !== req.files?.avatar[0]?.path
    ) {
      fs.unlinkSync(req.files?.coverImage[0]?.path);
    }
    fs.unlinkSync(req.files?.avatar[0]?.path);
    throw new ApiError(400, "user with provided username/email already exists");
  } else if (
    Array.isArray(req.files?.coverImage) &&
    req.files.coverImage.length !== 0 &&
    req.files?.coverImage[0]?.path === req.files?.avatar[0]?.path
  ) {
    fs.unlinkSync(req.files?.coverImage[0]?.path);
    throw new ApiError(401, "Please use different file names");
  }

  const avatar = req.files?.avatar[0]?.path;

  const coverImage =
    Array.isArray(req.files?.coverImage) &&
    req.files.coverImage.length !== 0 &&
    req.files?.coverImage[0]?.path;

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatarResponse = await uploadOnCloudinary(avatar);
  if (!avatarResponse) {
    throw new ApiError(400, "Failed to upload avatar :: server error");
  }

  const coverImageResponse = await uploadOnCloudinary(coverImage);

  const user = await User.create({
    email,
    password,
    username,
    fullName,
    avatar: avatarResponse?.url,
    coverImage: coverImageResponse?.url || "",
  });

  const createdUser = await User.findById(user?._id).select(
    "-refreshToken -password"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to register user :: server error");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User registration successful", createdUser));
});

const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "Email or username and password is required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existingUser) {
    throw new ApiError(
      400,
      "User with provided email/username does not exist, register first"
    );
  }

  const passwordVerification = await existingUser.isPasswordCorrect(password);

  if (!passwordVerification) {
    throw new ApiError(400, "Incorrect password");
  }

  const { accessToken, refreshToken } = await generateAccessRefreshTokens(
    existingUser._id
  );

  // console.log("ARRRR::", accessToken, refreshToken);
  const userData = await User.findById(existingUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "User fetched successfully", userData));
});

const logout = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "unauthorized request");
  }

  await User.findByIdAndUpdate(
    user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully"));
});

const refreshTheAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Invalid Refresh Token");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    // console.log(decodedToken);
    // console.log(req.user);
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "User not found to refresh the sessrion");
    }
    if (incomingRefreshToken !== req.user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or mismatched");
    }

    const { refreshToken, accessToken } = await generateAccessRefreshTokens(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(200, "Session restored successfully", {
          refreshToken,
          accessToken,
        })
      );
  } catch (error) {
    throw new ApiError(
      400,
      error?.message || "An error occurred while refreshing session"
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(401, "Current and New password is required");
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const verifiedPassowrd = await user.isPasswordCorrect(currentPassword);
  if (!verifiedPassowrd) {
    throw new ApiError(400, "Incorrect password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "user not found");
  }

  res.status(200).json(new ApiResponse(200, "Current user fetched", user));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!email && !fullName) {
    throw new ApiError(400, "Fields cannot be empty");
  }

  const user = await User.findById(req.user?._id);

  if (user.fullName === fullName && user.email === email) {
    throw new ApiError(400, "No changes found in fields");
  }

  const updateDetails = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        ...(fullName && { fullName }),
        ...(email && { email }),
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, "Details updated successfully", updateDetails));
});

const updateImageFiles = asyncHandler(async (req, res) => {
  let avatarLocalPath;
  let coverImageLocalPath;
  if (Array.isArray(req.files?.avatar) && req.files.avatar?.length !== 0) {
    avatarLocalPath = req.files?.avatar[0]?.path;
  }
  if (
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length !== 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath && !coverImageLocalPath) {
    throw new ApiError(401, "File(s) is required");
  }

  let avatar;
  if (avatarLocalPath) {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  }
  let coverImage;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

  const updateFiles = {};
  if (avatar) {
    updateFiles.avatar = avatar.url;
    await deleteFromcloudinary(req.user?.avatar);
  }
  if (coverImage) {
    updateFiles.coverImage = coverImage.url;
    await deleteFromcloudinary(req.user?.coverImage);
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updateFiles,
    },
    { new: true }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, "Image(s) updated successfully", user));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new ApiError(401, "username missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.trim(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedTo: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        isSubscribed: 1,
        subscribersCount: 1,
        channelsSubscribedTo: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(400, "Channel does not exist");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Channel details fetched successfully", channel[0])
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
          {
            $sort: {
              createdAt: -1, // Sort by watchedAt descending (most recent first)
            },
          },
        ],
      },
    },
    {
      $project: {
        watchHistory: 1,
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      "User's watch history fetched successfully",
      user[0]?.watchHistory || [] // Return an empty array if no history exists
    )
  );
});

//add Watch History(videoId(s)) in user
import { Video } from "../models/videoModel.js";
const addWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video id not found");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(401, "Video does not exist");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $addToSet: {
        //addToSet adds only unique values, where as push will push any
        watchHistory: videoId,
      },
    },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(400, "Failed to update watch history");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Watch history updated successfully",
        user.watchHistory
      )
    );
});

//remove watch history/single or all
const removeWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (videoId) {
    const clearOne = await User.findByIdAndUpdate(req.user?._id, {
      $pull: { watchHistory: videoId },
    });
    if (!clearOne) {
      throw new ApiError(400, "Failed to clear history");
    }
    res
      .status(200)
      .json(new ApiResponse(200, "Video cleared from history successfully"));
  } else {
    const clearHistory = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $unset: {
          watchHistory: 1,
        },
      },
      {
        new: true,
      }
    );
    if (!clearHistory) {
      throw new ApiError(400, "Failed to clear history list");
    }
    res
      .status(200)
      .json(new ApiResponse(200, "All history cleared successfully"));
  }
});

export {
  register,
  login,
  logout,
  refreshTheAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateImageFiles,
  getUserChannelProfile,
  getWatchHistory,
  addWatchHistory,
  removeWatchHistory,
};
