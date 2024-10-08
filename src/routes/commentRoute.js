import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/commentController.js";

const commentRouter = Router();

commentRouter.route("/:videoId/comments").get(getVideoComments);
commentRouter.route("/:videoId/add-comment").post(addComment); //passing videoId from url and comment content from body
commentRouter.route("/:commentId/update-comment").patch(updateComment);
commentRouter.route("/:commentId/delete").post(deleteComment);

export default commentRouter;
