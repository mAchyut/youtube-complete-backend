import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));

app.use(express.static("public"));

app.use(express.urlencoded({ limit: "16kb", extended: true }));

app.use(cookieParser());

//import routes
import userRouter from "./routes/userRoutes.js";
import healthRoute from "./routes/healthCheckRoute.js";
import videoRouter from "./routes/videoRoute.js";
import { verifyJWT } from "./middlewares/authMiddleware.js";
import commentRouter from "./routes/commentRoute.js";
import tweetRoute from "./routes/tweetRoute.js";
import subscriptionRouter from "./routes/subscriptionRoute.js";
import likeRouter from "./routes/likeRoute.js";
import playlistRouter from "./routes/playlistRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";

//routes declaraton
app.use("/api/v1/users", userRouter);
app.use("/api/v1", healthRoute);

//injecting verification for every route after this/ user must login to access these
// app.use(verifyJWT);

//video
app.use("/api/v1/video", videoRouter);

//comment
app.use("/api/v1/video/comment", commentRouter);

//tweet
app.use("/api/v1/tweet", tweetRoute);

//subscription
app.use("/api/v1/channel", subscriptionRouter);

//like : video, comment, tweet
app.use("/api/v1", likeRouter);

//playlist
app.use("/api/v1/playlist", playlistRouter);

//dashboard
app.use("/api/v1/dashboard", dashboardRouter);

//Error middleware after all the routes and middlewares so that it converts the error format to JSON
// After all your route declarations

// Error handling middleware
app.use((err, req, res, next) => {
  // Set a default status code (500 if not explicitly provided)
  const statusCode = err.statusCode || 500;

  // Respond with JSON error object
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: err.message || "Internal Server Error",
  });
});

export { app };
