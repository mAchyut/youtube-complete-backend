import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscriptionController.js";

const subscriptionRouter = Router();

subscriptionRouter.route("/subscribe/:channelId").post(toggleSubscription);
subscriptionRouter
  .route("/:subscriberId/subscribed-to")
  .post(getSubscribedChannels);
subscriptionRouter
  .route("/:channelId/subscribers")
  .post(getUserChannelSubscribers);

export default subscriptionRouter;
