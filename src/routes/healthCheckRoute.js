import { Router } from "express";
import { healthCheck } from "../controllers/healthCheckController.js";

const healthRoute = Router();

healthRoute.route("/health-check").get(healthCheck);

export default healthRoute;
