import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database(process.env.DATABASE_PATH ?? "data/app.db");

// WAL lets reads run while a write is in progress (API requests + seed/dev tools).
sqlite.pragma("journal_mode = WAL");
// SQLite ignores foreign keys unless this is enabled per connection.
// Without it, ON DELETE CASCADE would silently do nothing.
sqlite.pragma("foreign_keys = ON");

export const db = drizzle({ client: sqlite, schema });
