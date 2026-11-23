// POST /api/reviews - save one review.
//
// The kitchen. Nothing here trusts the caller: every rule is enforced again,
// even though the future form will also try to be helpful.

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  // 0. The body has to be readable JSON at all.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const { restaurantId, rating, comment } = (body ?? {}) as {
    restaurantId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  // 1. rating must be a whole number from 1 to 5.
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be a whole number between 1 and 5." },
      { status: 400 },
    );
  }

  // 2. comment must be a non-empty string once surrounding spaces are removed.
  if (typeof comment !== "string" || comment.trim().length === 0) {
    return NextResponse.json(
      { error: "Comment cannot be empty." },
      { status: 400 },
    );
  }

  // 3. the restaurant must actually exist - this one needs the database.
  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId)) {
    return NextResponse.json(
      { error: "That restaurant does not exist." },
      { status: 400 },
    );
  }

  const restaurant = await sql`
    SELECT id FROM restaurants WHERE id = ${restaurantId}
  `;

  if (restaurant.length === 0) {
    return NextResponse.json(
      { error: "That restaurant does not exist." },
      { status: 400 },
    );
  }

  // All checks passed. Insert exactly one row. Nothing else in the database
  // changes - there is no average to update, because we do not store one.
  const inserted = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId}, ${rating}, ${comment.trim()})
    RETURNING id
  `;

  return NextResponse.json(
    { success: true, reviewId: inserted[0].id },
    { status: 201 },
  );
}
