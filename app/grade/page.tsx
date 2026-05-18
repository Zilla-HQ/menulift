"use client";

/**
 * Free public listing grader — the lead-magnet companion to `/api/grade`.
 *
 * Pattern (lifted from Restay):
 *   No signup, no paywall. Paste a URL, get a 0–100 grade across N
 *   sub-scores plus the top-3 highest-impact fixes in <5s. The grader
 *   itself is the sales pitch — anyone who hands us a URL is
 *   self-selecting as a high-intent lead, and we re-target them via
 *   the CAPI Lead event the API fires on success.
 *
 *   This page assumes `app/api/grade/route.ts` is the back-end. The
 *   API is currently Airbnb-flavored (it scrapes Airbnb listing URLs);
 *   swap the parser + scraper for a different vertical and this UI
 *   keeps working — the response contract is generic.
 *
 *   Pair with `app/grade/[city]/page.tsx` (already shipped) for the
 *   25-city programmatic-SEO surface that drives organic traffic into
 *   this page.
 */

import { useState } from "react";

type GradeResponse = {
  sourceId: string;
  canonicalUrl: string;
  listing: {
    title?: string;
    city?: string;
    state?: string;
    photoCount?: number;
    thumbnail?: string | null;
    reviewCount?: number;
    avgRating?: number;
    isSuperhost?: boolean;
  };
  grade: {
    overall: number;
    letter: "A" | "B" | "C" | "D" | "F";
    copy: { score: number; issues: string[] };
    photos: { score: number; issues: string[]; sampledCount: number };
    signals: { score: number; issues: string[] };
    topFixes: string[];
  };
  eventId: string;
};

export default function GradePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GradeResponse | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("/api/grade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error ?? "Something went wrong. Try again in a minute.");
        return;
      }
      setResult(data as GradeResponse);
    } catch (err) {
      setError(`Network error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">Free listing grade</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Paste any listing URL. We grade copy + photos + signals in under 5 seconds,
        zero signup, and tell you the top 3 things to fix first.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          required
          placeholder="https://www.airbnb.com/rooms/12345"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-md border bg-background px-4 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Grading…" : "Grade my listing"}
        </button>
      </form>

      {error ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      {result ? <GradeResult result={result} /> : null}

      {!result && !loading ? (
        <p className="mt-12 text-sm text-muted-foreground">
          No signup. We don't email you unless you ask. The grader costs us pennies
          to run — it's a sample of what the paid product does end-to-end.
        </p>
      ) : null}
    </main>
  );
}

function GradeResult({ result }: { result: GradeResponse }) {
  const { grade, listing } = result;
  const letterColor =
    grade.letter === "A"
      ? "text-emerald-600"
      : grade.letter === "B"
        ? "text-lime-600"
        : grade.letter === "C"
          ? "text-amber-600"
          : grade.letter === "D"
            ? "text-orange-600"
            : "text-red-600";

  return (
    <div className="mt-10 rounded-lg border bg-card p-6 shadow-sm">
      {listing.title ? (
        <div className="mb-6 flex items-start gap-4">
          {listing.thumbnail ? (
            <img
              src={listing.thumbnail}
              alt=""
              className="h-20 w-28 rounded-md object-cover"
            />
          ) : null}
          <div>
            <h2 className="font-medium leading-snug">{listing.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {listing.city ?? ""}
              {listing.city && listing.state ? ", " : ""}
              {listing.state ?? ""}
              {listing.photoCount ? ` · ${listing.photoCount} photos` : ""}
              {listing.avgRating ? ` · ${listing.avgRating}★` : ""}
              {listing.reviewCount ? ` (${listing.reviewCount} reviews)` : ""}
              {listing.isSuperhost ? " · Superhost" : ""}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex items-baseline gap-4">
        <span className={`text-7xl font-bold leading-none ${letterColor}`}>
          {grade.letter}
        </span>
        <span className="text-2xl font-medium text-muted-foreground">
          {grade.overall}/100
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <SubScore label="Copy" score={grade.copy.score} issues={grade.copy.issues} />
        <SubScore
          label="Photos"
          score={grade.photos.score}
          issues={grade.photos.issues}
        />
        <SubScore
          label="Signals"
          score={grade.signals.score}
          issues={grade.signals.issues}
        />
      </div>

      {grade.topFixes.length > 0 ? (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Top 3 fixes
          </h3>
          <ol className="mt-3 space-y-2 text-sm">
            {grade.topFixes.map((fix, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-medium text-primary">{i + 1}.</span>
                <span>{fix}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

function SubScore({
  label,
  score,
  issues,
}: {
  label: string;
  score: number;
  issues: string[];
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm tabular-nums text-muted-foreground">{score}/100</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
      {issues.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {issues.slice(0, 3).map((issue, i) => (
            <li key={i}>• {issue}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
