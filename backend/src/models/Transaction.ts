import mongoose, { Document, Schema } from "mongoose";

export type TransactionType =
  | "earning"
  | "withdrawal";

export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  coins: number;
  status: TransactionStatus;
  description: string;
  referenceId?: string;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["earning", "withdrawal"],
      required: true,
    },

    coins: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    referenceId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);

export default Transaction;