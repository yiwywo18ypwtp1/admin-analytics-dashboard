import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
// Relative imports (not "@/…") because drizzle-kit loads this file outside Next.js.
import { TRANSACTION_STATUSES } from "../features/transactions/types";
import { ACTIVITY_TYPES, USER_ROLES, USER_STATUSES } from "../features/users/types";

// Conventions:
// - Money is stored as integer cents: floats can't represent 0.1 exactly.
// - Dates are ISO 8601 strings (UTC). They sort correctly as text and
//   serialize to JSON / Client Components without conversion.

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    // UNIQUE is the single source of truth for "email must be unique".
    email: text("email").notNull().unique(),
    role: text("role", { enum: USER_ROLES }).notNull(),
    status: text("status", { enum: USER_STATUSES }).notNull(),
    avatarUrl: text("avatar_url"),
    // Denormalized sum of succeeded transactions. Sorting the users table by
    // SUM(...) over transactions would be slow on large data sets.
    revenueCents: integer("revenue_cents").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  // Indexes for every column the users table can filter or sort by.
  (t) => [
    index("users_name_idx").on(t.name),
    index("users_status_idx").on(t.status),
    index("users_revenue_idx").on(t.revenueCents),
    index("users_created_at_idx").on(t.createdAt),
  ],
);

export const transactions = sqliteTable(
  "transactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    status: text("status", { enum: TRANSACTION_STATUSES }).notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("transactions_user_id_idx").on(t.userId),
    index("transactions_created_at_idx").on(t.createdAt),
    // "Covering" index for dashboard analytics: every column those queries read is
    // in the index, so SQLite never touches the table rows (~6x faster on 500k rows).
    index("transactions_analytics_idx").on(t.status, t.createdAt, t.amountCents, t.userId),
  ],
);

export const activity = sqliteTable(
  "activity",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", { enum: ACTIVITY_TYPES }).notNull(),
    message: text("message").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("activity_user_id_created_at_idx").on(t.userId, t.createdAt),
    // Covering index for the "active users" query (range on created_at, reads type + user_id).
    index("activity_analytics_idx").on(t.createdAt, t.type, t.userId),
  ],
);
