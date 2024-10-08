import { Router } from "express";
import {
  logout,
  login,
  register as registerUser,
  refreshTheAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateImageFiles,
  updateAccountDetails,
  getUserChannelProfile,
  getWatchHistory,
  addWatchHistory,
  removeWatchHistory,
} from "../controllers/userController.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

userRouter.route("/login").post(login);

userRouter.route("/logout").post(verifyJWT, logout);
userRouter.route("/refresh-token").post(verifyJWT, refreshTheAccessToken);
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);
userRouter.route("/current-user").post(verifyJWT, getCurrentUser);
userRouter.route("/account").patch(verifyJWT, updateAccountDetails);
userRouter.route("/files").patch(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  verifyJWT,
  updateImageFiles
);
userRouter.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
userRouter.route("/watch-history").get(verifyJWT, getWatchHistory);
userRouter.route("/:videoId/watch").get(verifyJWT, addWatchHistory);
userRouter.route("/:videoId/history/clear").get(verifyJWT, removeWatchHistory); //Removes single video from history
userRouter.route("/history/clear").get(verifyJWT, removeWatchHistory); //Removes all the videos from history

export default userRouter;
