import Transaction from "../models/Transaction.js";

export const getUserTransactions = async (
  userId: string
) => {
  const transactions = await Transaction.find({
    userId,
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return transactions;
};