import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboardController.js";

const dashboardRouter = Router();

dashboardRouter.route("/stats").post(getChannelStats);
dashboardRouter.route("/channel/all-videos").post(getChannelVideos);

export default dashboardRouter;
