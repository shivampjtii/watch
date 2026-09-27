import mongoose, { Document, Schema } from "mongoose";

export type WithdrawalStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  coins: number;
  amount: number;
  email: string;
  provider: string;
  status: WithdrawalStatus;
  referenceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalSchema = new Schema<IWithdrawal>(
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
      min: 1,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    provider: {
      type: String,
      default: "amazon",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
      ],
      default: "pending",
      required: true,
    },

    referenceId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Withdrawal = mongoose.model<IWithdrawal>(
  "Withdrawal",
  withdrawalSchema
);

export default Withdrawal;