import { Router } from "express";

import { getWalletController } from "../controllers/wallet.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  getWalletController
);

export default router;