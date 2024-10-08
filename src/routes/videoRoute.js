import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/videoController.js";
// import { verifyJWT } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.js";

const videoRouter = Router();

videoRouter.route("/all-videos").post(getAllVideos);
videoRouter.route("/video-upload").post(
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);
videoRouter.route("/:videoId").get(getVideoById);
videoRouter
  .route("/update-details/:videoId")
  .patch(upload.single("thumbnail"), updateVideo);

videoRouter.route("/delete-video/:videoId").get(deleteVideo);
videoRouter.route("/is-published/:videoId").patch(togglePublishStatus);

export default videoRouter;
