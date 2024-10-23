import { Router } from "express";
import {
  getMyLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getVideoLikes,
  getCommentLikes,
  getTweetLikes,
} from "../controllers/likeController.js";

const likeRouter = Router();

likeRouter.route("/video/liked-videos").post(getMyLikedVideos);
likeRouter.route("/video/:videoId/get-likes").post(getVideoLikes);
likeRouter.route("/video/:videoId/like").get(toggleVideoLike);
likeRouter.route("/comment/:commentId/like").get(toggleCommentLike);
likeRouter.route("/comment/:commentId/get-likes").get(getCommentLikes);

likeRouter.route("/tweet/:tweetId/like").get(toggleTweetLike);
likeRouter.route("/tweet/:tweetId/get-likes").get(getTweetLikes);

export default likeRouter;
