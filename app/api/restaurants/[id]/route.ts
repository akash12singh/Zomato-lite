// GET /api/restaurants/[id] - everything the restaurant page needs, in the
// shape the page needs it. The frontend will print this and compute nothing.

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Always freshly computed. Without this, a cached response could show an
// average that no longer matches the rows.
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId)) {
    return NextResponse.json(
      { error: "Restaurant not found." },
      { status: 404 },
    );
  }

  const rows = await sql`
    SELECT id, name, cuisine, area
    FROM restaurants
    WHERE id = ${restaurantId}
  `;

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Restaurant not found." },
      { status: 404 },
    );
  }

  const restaurant = rows[0];

  // The three computed answers. AVG and COUNT are SQL doing the arithmetic -
  // not JavaScript, and definitely not the browser.
  const stats = await sql`
    SELECT AVG(rating) AS average_rating, COUNT(*) AS total_reviews
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
  `;

  // Newest first. The backend sorts; the frontend only reads top to bottom.
  const reviews = await sql`
    SELECT id, rating, comment, created_at
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC, id DESC
  `;

  const rawAverage = stats[0].average_rating;
  const averageRating =
    rawAverage === null ? null : Math.round(Number(rawAverage) * 10) / 10;

  const formatted = reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: new Date(review.created_at).toISOString(),
  }));

  return NextResponse.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating,
    totalReviews: Number(stats[0].total_reviews),
    latestReview: formatted[0] ?? null,
    reviews: formatted.slice(1),
  });
}
