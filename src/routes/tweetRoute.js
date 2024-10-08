import { Router } from "express";
import {
  createTweet,
  updateTweet,
  deleteTweet,
  getUserTweets,
} from "../controllers/tweetController.js";

const tweetRoute = Router();

tweetRoute.route("/add-tweet").post(createTweet);
tweetRoute.route("/:tweetId/update").patch(updateTweet);
tweetRoute.route("/:tweetId").post(deleteTweet);
tweetRoute.route("/my-tweets").get(getUserTweets);

export default tweetRoute;
