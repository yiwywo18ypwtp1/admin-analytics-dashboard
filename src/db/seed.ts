/**
 * Fills the database with fake but realistic data.
 *
 *   npm run db:seed                    → 200 users (enough for development)
 *   npm run db:seed -- --users=100000  → stress test for the users table
 *
 * Uses a seeded random generator, so every run produces the same users.
 * Dates are relative to "now", so the dashboard always has recent data.
 */
import { sql } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { db } from "./index";
import { activity, transactions, users } from "./schema";

const DAY_MS = 24 * 60 * 60 * 1000;
const USERS_PER_CHUNK = 1_000;
// SQLite limits the number of bound parameters per statement, so big inserts are split.
const ROWS_PER_INSERT = 1_000;

const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William",
  "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah",
  "Charles", "Karen", "Daniel", "Nancy", "Matthew", "Lisa", "Anthony", "Betty", "Mark", "Sandra",
  "Olena", "Taras", "Andrii", "Iryna", "Dmytro", "Kateryna",
];
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez",
  "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson",
  "Martin", "Lee", "Thompson", "White", "Harris", "Clark", "Lewis", "Walker", "Shevchenko",
  "Kovalenko", "Bondarenko", "Tkachenko",
];

type NewUser = typeof users.$inferInsert;
type NewTransaction = typeof transactions.$inferInsert;
type NewActivity = typeof activity.$inferInsert;

// mulberry32: tiny deterministic PRNG. Math.random() would give different data every run.
function createRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(42);
const randomInt = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)];
const randomDate = (fromMs: number, toMs: number) => new Date(fromMs + random() * (toMs - fromMs));

function weighted<T extends string>(weights: Record<T, number>): T {
  let roll = random();
  for (const [value, weight] of Object.entries(weights) as [T, number][]) {
    roll -= weight;
    if (roll < 0) return value;
  }
  return Object.keys(weights)[0] as T;
}

function generateUser(id: number, now: number) {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const createdAt = randomDate(now - 365 * DAY_MS, now);
  const status = weighted({ active: 0.75, inactive: 0.17, banned: 0.08 });

  const userTransactions: NewTransaction[] = [];
  const userActivity: NewActivity[] = [
    { userId: id, type: "account_created", message: "Account created", createdAt: createdAt.toISOString() },
  ];

  const transactionsCount = status === "active" ? randomInt(0, 12) : randomInt(0, 3);
  let revenueCents = 0;

  for (let i = 0; i < transactionsCount; i++) {
    const date = randomDate(createdAt.getTime(), now).toISOString();
    const amountCents = randomInt(999, 49_999);
    const txStatus = weighted({ succeeded: 0.85, failed: 0.1, pending: 0.05 });

    userTransactions.push({ userId: id, amountCents, status: txStatus, createdAt: date });
    if (txStatus === "succeeded") {
      revenueCents += amountCents;
      userActivity.push({
        userId: id,
        type: "payment",
        message: `Paid $${(amountCents / 100).toFixed(2)}`,
        createdAt: date,
      });
    }
  }

  const loginsCount = status === "active" ? randomInt(1, 10) : randomInt(0, 2);
  for (let i = 0; i < loginsCount; i++) {
    userActivity.push({
      userId: id,
      type: "login",
      message: "Logged in",
      createdAt: randomDate(createdAt.getTime(), now).toISOString(),
    });
  }

  const user: NewUser = {
    id,
    name: `${firstName} ${lastName}`,
    // The id suffix keeps emails unique even when names repeat.
    email: `${firstName}.${lastName}.${id}@example.com`.toLowerCase(),
    role: weighted({ viewer: 0.7, editor: 0.25, admin: 0.05 }),
    status,
    // ~20% of users have no avatar, to exercise the initials fallback.
    avatarUrl: random() < 0.8 ? `https://i.pravatar.cc/150?img=${randomInt(1, 70)}` : null,
    revenueCents,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
  };

  return { user, userTransactions, userActivity };
}

function insertInBatches<T extends SQLiteTable>(table: T, rows: T["$inferInsert"][]) {
  for (let i = 0; i < rows.length; i += ROWS_PER_INSERT) {
    db.insert(table).values(rows.slice(i, i + ROWS_PER_INSERT)).run();
  }
}

function seed(usersCount: number) {
  const now = Date.now();

  // One transaction for the whole seed: much faster, and a failed seed leaves no half-filled DB.
  db.transaction(() => {
    db.delete(activity).run();
    db.delete(transactions).run();
    db.delete(users).run();
    db.run(sql`DELETE FROM sqlite_sequence`); // restart ids from 1

    for (let start = 1; start <= usersCount; start += USERS_PER_CHUNK) {
      const end = Math.min(start + USERS_PER_CHUNK - 1, usersCount);
      const chunk = { users: [] as NewUser[], transactions: [] as NewTransaction[], activity: [] as NewActivity[] };

      for (let id = start; id <= end; id++) {
        const generated = generateUser(id, now);
        chunk.users.push(generated.user);
        chunk.transactions.push(...generated.userTransactions);
        chunk.activity.push(...generated.userActivity);
      }

      insertInBatches(users, chunk.users);
      insertInBatches(transactions, chunk.transactions);
      insertInBatches(activity, chunk.activity);

      if (usersCount > USERS_PER_CHUNK) console.log(`  ${end} / ${usersCount} users`);
    }
  });
}

const usersArg = process.argv.find((arg) => arg.startsWith("--users="));
const usersCount = usersArg ? Number(usersArg.split("=")[1]) : 200;

if (!Number.isInteger(usersCount) || usersCount < 1) {
  console.error(`Invalid --users value: ${usersArg}`);
  process.exit(1);
}

console.log(`Seeding ${usersCount} users…`);
console.time("Seed finished in");
seed(usersCount);
console.timeEnd("Seed finished in");
