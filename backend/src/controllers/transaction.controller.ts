import {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  getUserTransactions,
} from "../services/transaction.service.js";

export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const transactions =
      await getUserTransactions(req.userId);

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};