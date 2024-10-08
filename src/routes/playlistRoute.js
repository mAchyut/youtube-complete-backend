import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlistController.js";

const playlistRouter = Router();

playlistRouter.route("/create-playlist").post(createPlaylist);
playlistRouter.route("/:userId/playlists").get(getUserPlaylists);
playlistRouter.route("/:playlistId").get(getPlaylistById);
playlistRouter.route("/:playlistId/add-video/:videoId").get(addVideoToPlaylist);
playlistRouter
  .route("/:playlistId/remove-video/:videoId")
  .get(removeVideoFromPlaylist);
playlistRouter.route("/:playlistId/delete").get(deletePlaylist);
playlistRouter.route("/:playlistId/update").get(updatePlaylist);

export default playlistRouter;
