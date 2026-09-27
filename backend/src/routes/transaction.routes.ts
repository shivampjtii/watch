import { Router } from "express";

import {
  getTransactions,
} from "../controllers/transaction.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  getTransactions
);

export default router;