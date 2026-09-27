import {
  NextFunction,
  Request,
  Response,
} from "express";

import { env } from "../config/env.js";

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(error);

  if (env.nodeEnv === "development") {
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};