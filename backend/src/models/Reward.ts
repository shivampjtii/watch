import mongoose, { Document, Schema } from "mongoose";

export type RewardStatus =
  | "pending"
  | "completed"
  | "failed";

export interface IReward extends Document {
  userId: mongoose.Types.ObjectId;
  coins: number;
  status: RewardStatus;
  adId?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const rewardSchema = new Schema<IReward>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    coins: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      required: true,
    },

    adId: {
      type: String,
      trim: true,
    },

   transactionId: {
  type: String,
  required: true,
  unique: true,
  index: true,
},
  },
  {
    timestamps: true,
  }
);

const Reward = mongoose.model<IReward>(
  "Reward",
  rewardSchema
);

export default Reward;