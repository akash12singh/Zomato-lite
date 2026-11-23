// lib/db.ts - the one place the app talks to Postgres.
//
// `sql` is a tagged-template function: write SQL inside backticks and values
// get passed separately, which is what stops SQL injection.
//   const rows = await sql`SELECT * FROM reviews WHERE rating = ${5}`;

import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Put it in .env.local (local) or in Vercel project settings (production).",
  );
}

export const sql = neon(databaseUrl);
