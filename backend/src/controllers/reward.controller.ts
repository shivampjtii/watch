import { NextFunction, Request, Response } from "express";

import {
  verifyAdMobSsvSignature,
  AdMobSsvPayload,
} from "../services/admobSsv.service.js";

import {
  verifyAndCreditReward,
} from "../services/reward.service.js";

export const handleAdMobSsv = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /**
     * AdMob sends the callback as a GET request.
     *
     * We need the original query-string order because
     * that exact content is what AdMob signs.
     */
    const questionMarkIndex = req.originalUrl.indexOf("?");

    if (questionMarkIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Missing SSV query parameters",
      });
    }

    const fullQueryString = req.originalUrl.substring(
      questionMarkIndex + 1
    );

    /**
     * AdMob signs everything BEFORE:
     *
     * &signature=...
     * &key_id=...
     *
     * Do not rebuild or modify this string.
     */
    const signatureIndex = fullQueryString.indexOf("&signature=");

    if (signatureIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Missing AdMob signature",
      });
    }

    const signedQueryString = fullQueryString.substring(
      0,
      signatureIndex
    );

    const payload =
      req.query as unknown as AdMobSsvPayload;

    /**
     * Verify AdMob's cryptographic signature first.
     */
    const isValid = await verifyAdMobSsvSignature(
      signedQueryString,
      payload
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid AdMob SSV signature",
      });
    }

    /**
     * Get our application's user ID.
     *
     * custom_data is preferred because our application
     * will provide it when showing the rewarded ad.
     */
    const userId =
      typeof payload.custom_data === "string"
        ? payload.custom_data
        : typeof payload.user_id === "string"
          ? payload.user_id
          : undefined;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User identifier is missing",
      });
    }

    /**
     * Convert AdMob reward amount to a number.
     */
    const rewardAmount = Number(
      payload.reward_amount
    );

    if (
      !Number.isFinite(rewardAmount) ||
      rewardAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid reward amount",
      });
    }

    /**
     * MVP configuration:
     *
     * 1 rewarded ad = 10 coins
     */
    if (rewardAmount !== 10) {
      return res.status(400).json({
        success: false,
        message: "Unexpected reward amount",
      });
    }

    /**
     * Make sure this is our expected reward type.
     */
    if (payload.reward_item !== "coins") {
      return res.status(400).json({
        success: false,
        message: "Unexpected reward item",
      });
    }

    /**
     * Atomically:
     *
     * 1. Check duplicate transaction
     * 2. Create Reward
     * 3. Create Transaction
     * 4. Increase user's coins
     */
    const result = await verifyAndCreditReward({
      userId,
      transactionId: payload.transaction_id,
      coins: rewardAmount,
      adId: payload.ad_unit,
    });

    return res.status(200).json({
      success: true,
      message: "Reward processed successfully",
      data: {
        rewardId: result.reward._id,
        transactionId: result.transaction._id,
        coins: result.coins,
      },
    });
  } catch (error) {
    /**
     * AdMob may retry an SSV callback.
     *
     * We must NOT credit the same reward twice.
     */
    if (
      error instanceof Error &&
      error.message ===
        "Reward has already been processed"
    ) {
      return res.status(200).json({
        success: true,
        message: "Reward already processed",
      });
    }

    next(error);
  }
};