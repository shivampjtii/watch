import { Router } from "express";

import {
  requestWithdrawal,
  getWithdrawals,
} from "../controllers/withdrawal.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  requestWithdrawal
);

router.get(
  "/",
  getWithdrawals
);

export default router;