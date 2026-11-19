import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrate connects here (session-capable connection, not the
    // transaction-mode pooler — schema-engine hangs on :6543).
    // The runtime client uses DATABASE_URL via the pg adapter instead.
    url: env("DIRECT_URL"),
  },
});
