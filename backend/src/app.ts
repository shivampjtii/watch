import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";

import { errorMiddleware } from "./middleware/error.middleware.js";



import authRoutes from "./routes/auth.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import rewardRoutes from "./routes/reward.routes.js";
import withdrawalRoutes from "./routes/withdrawal.routes.js";






const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.corsOrigin,
  })
);

app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "WatchEarn API is running",
  });
});






app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/rewards", rewardRoutes);
app.use("/api/v1/withdrawals", withdrawalRoutes);





app.use(errorMiddleware);

export default app;