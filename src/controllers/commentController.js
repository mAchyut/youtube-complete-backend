import mongoose from "mongoose";
import { Comment } from "../models/commentModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  // get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(400, "video ID not found");
  }
  const comment = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
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
        content: 1,
        owner: { fullName: 1, username: 1, avatar: 1 },
        createdAt: 1,
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  if (!comment.length) {
    throw new ApiError(400, "No comments yet");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Comments fetched successfully", comment));
});

const addComment = asyncHandler(async (req, res) => {
  // add a comment to a video
  const { comment } = req.body;
  const { videoId } = req.params;
  if (!comment?.length) {
    throw new ApiError(400, "Comment cannot be empty");
  } else if (!videoId) {
    throw new ApiError(401, "Video ID not found");
  }

  const commentVideo = await Comment.create({
    content: comment,
    owner: req.user?._id,
    video: videoId,
  });

  if (!commentVideo) {
    throw new ApiError(400, "Failed to add the comment");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, "Comment added successfully", commentVideo.content)
    );
});

const updateComment = asyncHandler(async (req, res) => {
  // update a comment
  const { comment } = req.body;
  const { commentId } = req.params;
  if (!comment.length) {
    throw new ApiError(401, "Comment cannot be empty");
  } else if (!commentId) {
    throw new ApiError(400, "Comment ID not found");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: comment,
      },
    },
    { new: true }
  );

  if (!updatedComment) {
    throw new ApiError(401, "Failed to update the comment");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Comment updated successfully",
        updatedComment.content
      )
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  //delete a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment ID not found");
  }
  const response = await Comment.findByIdAndDelete(commentId);
  if (!response) {
    throw new ApiError(400, "Failed to delete the comment");
  }
  res.status(200).json(new ApiResponse(200, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
