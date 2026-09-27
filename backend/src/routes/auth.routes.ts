import { Router } from "express";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";

import {
  login,
  me,
  register,
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", authRateLimiter, register);

router.post("/login", login);

router.get("/me", authMiddleware, me);

export default router;