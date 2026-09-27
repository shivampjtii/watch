import { Router } from "express";

import {
  handleAdMobSsv,
} from "../controllers/reward.controller.js";

import {
  rewardRateLimiter,
} from "../middleware/rateLimit.middleware.js";

const router = Router();

/*
 * AdMob calls this endpoint directly.
 *
 * Do NOT put authMiddleware here.
 * AdMob will not have our application's JWT.
 */

router.get(
  "/ssv",
  rewardRateLimiter,
  handleAdMobSsv
);

export default router;