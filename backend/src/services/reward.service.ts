import mongoose from "mongoose";

import Reward from "../models/Reward.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

interface VerifyRewardInput {
  userId: string;
  transactionId: string;
  coins: number;
  adId?: string;
}

export const verifyAndCreditReward = async (
  data: VerifyRewardInput
) => {
  const session = await mongoose.startSession();

    try {
      
        if (!data.transactionId) {
  throw new Error("Transaction ID is required");
}

if (!Number.isInteger(data.coins) || data.coins !== 10) {
  throw new Error("Invalid reward coins");
}

if (!mongoose.isValidObjectId(data.userId)) {
  throw new Error("Invalid user ID");
}
    session.startTransaction();

    const existingReward = await Reward.findOne({
      transactionId: data.transactionId,
    }).session(session);

    if (existingReward) {
      throw new Error("Reward has already been processed");
    }

    const user = await User.findById(data.userId).session(
      session
    );

    if (!user) {
      throw new Error("User not found");
    }

    const reward = await Reward.create(
      [
        {
          userId: user._id,
          coins: data.coins,
          status: "completed",
          adId: data.adId,
          transactionId: data.transactionId,
        },
      ],
      { session }
    );

    const transaction = await Transaction.create(
      [
        {
          userId: user._id,
          type: "earning",
          coins: data.coins,
          status: "completed",
          description: "Rewarded ad completed",
          referenceId: data.transactionId,
        },
      ],
      { session }
    );

    user.coins += data.coins;

    await user.save({ session });

    await session.commitTransaction();

    return {
      reward: reward[0],
      transaction: transaction[0],
      coins: user.coins,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};