import User from "../models/User.js";

export const getWallet = async (userId: string) => {
  const user = await User.findById(userId).select(
    "coins"
  );

  if (!user) {
    throw new Error("User not found");
  }

  return {
    coins: user.coins,
  };
};