import type { transactions } from "@/db/schema";
import type { User } from "@/features/users/types";

export const TRANSACTION_STATUSES = ["succeeded", "pending", "failed"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export type Transaction = typeof transactions.$inferSelect;

export type TransactionWithUser = Transaction & {
  user: Pick<User, "id" | "name" | "email" | "avatarUrl">;
};
