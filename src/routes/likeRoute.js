import { Router } from "express";
import {
  getMyLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/likeController.js";

const likeRouter = Router();

likeRouter.route("/video/liked-videos").post(getMyLikedVideos);
likeRouter.route("/video/:videoId/like").get(toggleVideoLike);
likeRouter.route("/comment/:commentId/like").get(toggleCommentLike);
likeRouter.route("/tweet/:tweetId/like").get(toggleTweetLike);

export default likeRouter;
