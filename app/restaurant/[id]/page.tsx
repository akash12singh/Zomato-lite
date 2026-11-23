// /restaurant/[id] - the restaurant page.
//
// This is a display layer. It calls GET /api/restaurants/[id] and prints what
// it gets back. There is no addition, no division and no sorting in this file.

import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantPayload = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

// Presentation only: turn the timestamp the backend sent into readable text.
// No arithmetic on the numbers themselves.
function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

async function loadRestaurant(id: string): Promise<RestaurantPayload | null> {
  // A server component needs an absolute URL to call our own API.
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  const response = await fetch(`${protocol}://${host}/api/restaurants/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load the restaurant.");

  return response.json();
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurant = await loadRestaurant(id);

  if (!restaurant) notFound();

  const hasReviews = restaurant.totalReviews > 0;

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-16 sm:py-24">
      <header>
        <h1 className="text-3xl font-medium tracking-tight">
          {restaurant.name}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {restaurant.cuisine} · {restaurant.area}
        </p>
      </header>

      {/* The average: printed exactly as the backend handed it over. */}
      <section className="mt-12 flex items-end gap-3">
        <span className="text-7xl font-light leading-none tracking-tight tabular-nums">
          {hasReviews ? restaurant.averageRating : "—"}
        </span>
        <span className="pb-2 text-sm leading-tight text-muted">
          out of 5
          <br />
          {restaurant.totalReviews}{" "}
          {restaurant.totalReviews === 1 ? "review" : "reviews"}
        </span>
      </section>

      {!hasReviews && (
        <section className="mt-12 rounded-xl border border-line p-8 text-center">
          <p className="text-base">No reviews yet.</p>
          <p className="mt-1 text-sm text-muted">
            Nobody has eaten here, or nobody has said so.
          </p>
          <Link
            href={`/review/${id}`}
            className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm text-background"
          >
            Be the first to write one
          </Link>
        </section>
      )}

      {hasReviews && restaurant.latestReview && (
        <section className="mt-12">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
            Latest review
          </p>
          <div className="mt-3 rounded-xl bg-card p-6">
            <p className="text-sm text-muted">{restaurant.latestReview.rating} / 5</p>
            <p className="mt-2 text-lg leading-relaxed">
              {restaurant.latestReview.comment}
            </p>
            <p className="mt-4 text-xs text-muted">
              {formatDate(restaurant.latestReview.createdAt)}
            </p>
          </div>
        </section>
      )}

      {hasReviews && restaurant.reviews.length > 0 && (
        <section className="mt-12">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
            Earlier
          </p>
          <ul className="mt-2 divide-y divide-line">
            {restaurant.reviews.map((review) => (
              <li key={review.id} className="py-6">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm text-muted">{review.rating} / 5</p>
                  <p className="text-xs text-muted">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                <p className="mt-1.5 leading-relaxed">{review.comment}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasReviews && (
        <Link
          href={`/review/${id}`}
          className="mt-10 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm text-background"
        >
          Write a review
        </Link>
      )}
    </main>
  );
}
