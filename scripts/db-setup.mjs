// db-setup.mjs - creates the two tables and puts the seed data in them.
//
// Run it with:  npm run db:setup
//
// It is deliberately dumb: read the .sql files, send them to Neon, print what
// came back. The .sql files remain the source of truth, not this script.

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

// --- read secrets from .env.local (Next.js does this automatically; a plain
// --- node script does not, so we do it by hand, 6 lines, no library)
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of env.split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (match) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is missing from .env.local");
  process.exit(1);
}

const sql = neon(databaseUrl);

// A .sql file can hold several statements separated by semicolons. The Neon
// driver sends one statement per call, so we split the file ourselves.
async function runSqlFile(file) {
  const path = new URL(`../db/${file}`, import.meta.url);
  const text = readFileSync(path, "utf8");
  const statements = text
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

  for (const statement of statements) {
    await sql.query(statement);
  }
}

console.log("Dropping old tables (so this script can be run again safely)...");
await sql.query("DROP TABLE IF EXISTS reviews");
await sql.query("DROP TABLE IF EXISTS restaurants");

console.log("Applying db/schema.sql ...");
await runSqlFile("schema.sql");

console.log("Applying db/seed.sql ...");
await runSqlFile("seed.sql");

const restaurants = await sql.query(
  "SELECT id, name, cuisine, area FROM restaurants ORDER BY id",
);
const reviews = await sql.query(
  "SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY id",
);

console.log("\nTABLE restaurants");
console.table(restaurants);

console.log("\nTABLE reviews");
console.table(
  reviews.map((row) => ({
    id: row.id,
    restaurant_id: row.restaurant_id,
    rating: row.rating,
    comment: row.comment,
    created_at: new Date(row.created_at).toLocaleString("en-IN"),
  })),
);

console.log("\nDone. Two tables, one restaurant, three reviews.");
