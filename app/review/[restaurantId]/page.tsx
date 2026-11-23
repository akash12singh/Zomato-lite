// /review/[restaurantId] - the review form's page.
//
// Server side: find out which restaurant we are reviewing, so the form can say
// its name. The interactive part lives in ReviewForm.tsx.

import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ReviewForm from "./ReviewForm";

async function loadRestaurantName(id: string): Promise<string | null> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  const response = await fetch(`${protocol}://${host}/api/restaurants/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load the restaurant.");

  const data = await response.json();
  return data.name;
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const name = await loadRestaurantName(restaurantId);

  if (!name) notFound();

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-16 sm:py-24">
      <Link href={`/restaurant/${restaurantId}`} className="text-sm text-muted">
        ← Back
      </Link>

      <header className="mt-10">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
          Reviewing
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">{name}</h1>
      </header>

      <ReviewForm restaurantId={restaurantId} />
    </main>
  );
}
