import mongoose from "mongoose";
import User from "../models/User.js";
import Withdrawal from "../models/Withdrawal.js";
import Transaction from "../models/Transaction.js";

const WITHDRAWAL_OPTIONS: Record<number, number> = {
  1000: 10,
  5000: 50,
  10000: 100,
};

export const createWithdrawal = async (
  userId: string,
  coins: number
) => {
  const amount = WITHDRAWAL_OPTIONS[coins];

  if (!amount) {
    throw new Error(
      "Invalid withdrawal amount"
    );
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    /**
     * Get the user.
     */
    const user = await User.findById(userId)
      .session(session);

    if (!user) {
      throw new Error("User not found");
    }

    /**
     * Atomically deduct coins only if the
     * user has enough balance.
     */
    const updatedUser =
      await User.findOneAndUpdate(
        {
          _id: userId,
          coins: { $gte: coins },
        },
        {
          $inc: {
            coins: -coins,
          },
        },
        {
          new: true,
          session,
        }
      );

    if (!updatedUser) {
      throw new Error(
        "Insufficient coin balance"
      );
    }

    /**
     * Create withdrawal request.
     *
     * It remains pending until an actual
     * Amazon gift-card fulfillment system
     * processes it.
     */
    const withdrawal =
      await Withdrawal.create(
        [
          {
            userId: user._id,
            coins,
            amount,
            email: user.email,
            provider: "amazon",
            status: "pending",
          },
        ],
        { session }
      );

    /**
     * Create transaction history entry.
     */
    const transaction =
      await Transaction.create(
        [
          {
            userId: user._id,
            type: "withdrawal",
            coins,
            status: "pending",
            description:
              `Amazon gift card withdrawal - ₹${amount}`,
            referenceId:
              withdrawal[0]._id.toString(),
          },
        ],
        { session }
      );

    await session.commitTransaction();

    return {
      withdrawal: withdrawal[0],
      transaction: transaction[0],
      remainingCoins: updatedUser.coins,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const getUserWithdrawals = async (
  userId: string
) => {
  return Withdrawal.find({
    userId,
  })
    .sort({ createdAt: -1 })
    .limit(100);
};