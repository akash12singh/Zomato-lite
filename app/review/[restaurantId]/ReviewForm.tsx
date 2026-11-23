"use client";

// The polite visitor. It collects a rating and a comment, hands them to
// POST /api/reviews, and does no judging of its own beyond disabling the
// button. If the backend says no, we show the backend's words.

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Kindness, not security: stops an honest user submitting an empty form.
  const canSubmit = rating >= 1 && comment.trim().length > 0 && !submitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: Number(restaurantId),
        rating,
        comment,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Print what the backend said. Do not invent our own wording.
      setError(data.error ?? "The server rejected the review.");
      setSubmitting(false);
      return;
    }

    router.push(`/restaurant/${restaurantId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10">
      <fieldset>
        <legend className="text-sm text-muted">Your rating</legend>
        <div
          className="mt-3 flex gap-1.5"
          role="radiogroup"
          aria-label="Your rating"
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              onClick={() => setRating(value)}
              className={`text-3xl leading-none transition-colors ${
                value <= rating ? "text-accent" : "text-line hover:text-muted"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-8">
        <label htmlFor="comment" className="text-sm text-muted">
          Your comment
        </label>
        <textarea
          id="comment"
          rows={5}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What did you eat? How was it?"
          className="mt-3 w-full resize-none rounded-xl border border-line bg-transparent p-4 text-base leading-relaxed outline-none focus:border-accent"
        />
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm text-accent">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-8 rounded-lg bg-accent px-5 py-2.5 text-sm text-background disabled:cursor-not-allowed disabled:opacity-35"
      >
        {submitting ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}
