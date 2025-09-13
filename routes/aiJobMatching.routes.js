import express from "express";
import { matchJobs } from "../controllers/aiJobMatching.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
const router = express.Router();

router.get("/match-jobs", isAuthenticated, matchJobs);

export default router;