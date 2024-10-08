import asyncHandler from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlistModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(404, "Name and Description is required");
  }
  //TODO: create playlist
  const playList = await Playlist.findOne({
    name,
    description,
    owner: req.user?._id,
  });
  if (playList) {
    throw new ApiError(401, "playlist with given details already exist");
  } else {
    const newPlaylist = await Playlist.create({
      name,
      description,
      owner: req.user?._id,
    });
    if (!newPlaylist) {
      throw new ApiError(401, "failed to create a new playlist");
    }
    res
      .status(200)
      .json(new ApiResponse(200, "Playlist created successfully", newPlaylist));
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(404, "Invalid user ID");
  }
  const getPlaylist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
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
        video: 1,
        owner: { username: 1, fullName: 1, avatar: 1, coverImage: 1 },
        name: 1,
        description: 1,
      },
    },
  ]);
  if (!getPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }
  // console.log(getPlaylist);
  res
    .status(200)
    .json(new ApiResponse(200, "Playlists fetched successfully", getPlaylist));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(404, "Invalid playlist ID");
  }
  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist) {
    throw new ApiError(400, "Playlist not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Playlist found successfully", findPlaylist));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(401, "Invalid provided ID(s)");
  }

  const addVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        video: videoId,
      },
    },
    {
      new: true,
    }
  );
  if (!addVideo) {
    throw new ApiError(401, "Failed to add the video to the playlist");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, "Video added to the playlist successfully", addVideo)
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(401, "Invalid provided ID(s)");
  }
  //remove video from playlist
  const removeVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        video: videoId,
      },
    },
    {
      new: true,
    }
  );
  if (!removeVideo) {
    throw new ApiError(401, "Failed to remove video from playlist");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Video removed from playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(404, "Invalid playlist ID");
  }
  const playlistDelete = await Playlist.findByIdAndDelete(playlistId);
  if (!playlistDelete) {
    throw new ApiError(400, "Failed to delete the playlist");
  }
  res.status(200).json(new ApiResponse(200, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(404, "Invalid playlist ID");
  }

  const { name, description } = req.body;
  if (!name?.length && !description?.length) {
    throw new ApiError(401, "Cannot update with blank fields");
  }
  //update playlist
  const playlistUpdate = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        ...(name && { name }),
        ...(description && { description }),
      },
    },
    {
      new: true,
    }
  );
  if (!playlistUpdate) {
    throw new ApiError(500, "Failed to update the playlist");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, "Playlist updated successfully", playlistUpdate)
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
