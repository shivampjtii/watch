import {
  NextFunction,
  Request,
  Response,
} from "express";

import { getWallet } from "../services/wallet.service.js";

export const getWalletController = async (
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

    const wallet = await getWallet(req.userId);

    return res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    next(error);
  }
};