import {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  withdrawalSchema,
} from "../validators/withdrawal.validator.js";

import {
  createWithdrawal,
  getUserWithdrawals,
} from "../services/withdrawal.service.js";

export const requestWithdrawal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result =
      withdrawalSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal request",
        errors: result.error.flatten(),
      });
    }

    const withdrawal =
      await createWithdrawal(
        req.userId,
        result.data.coins
      );

    return res.status(201).json({
      success: true,
      message:
        "Withdrawal request created successfully",
      data: {
        withdrawal: withdrawal.withdrawal,
        transaction: withdrawal.transaction,
        remainingCoins:
          withdrawal.remainingCoins,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (
        error.message ===
          "Invalid withdrawal amount" ||
        error.message ===
          "Insufficient coin balance" ||
        error.message ===
          "User not found"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export const getWithdrawals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const withdrawals =
      await getUserWithdrawals(
        req.userId
      );

    return res.status(200).json({
      success: true,
      data: withdrawals,
    });
  } catch (error) {
    next(error);
  }
};