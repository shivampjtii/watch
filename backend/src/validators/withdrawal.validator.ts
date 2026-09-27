import { z } from "zod";

export const withdrawalSchema = z.object({
  coins: z
    .number()
    .int("Coins must be a whole number")
    .positive("Coins must be greater than 0"),
});

export type WithdrawalInput = z.infer<
  typeof withdrawalSchema
>;