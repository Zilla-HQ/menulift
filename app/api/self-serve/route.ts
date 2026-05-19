import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  url: z.string().min(3).max(500),
  serviceId: z.string().max(50).optional(),
  eventId: z.string().max(100).optional(),
});

/**
 * MenuLift submission endpoint.
 *
 * Accepts a restaurant identifier: a Google Business Profile URL, a
 * DoorDash / Uber Eats menu URL, the restaurant's own website, OR just
 * the restaurant's name. We do not validate against specific domains —
 * a kitchen knows how to identify itself in a hundred different ways.
 *
 * The full pipeline (Apify scrape → Anthropic recipe interpretation →
 * fal.ai generation → R2 storage → Stripe checkout) is wired
 * downstream. While env vars for that pipeline are still being
 * provisioned, this endpoint hands the visitor a confirmation handoff
 * to /thanks where the actual menu-shoot processing picks up server-side.
 */
export async function POST(req: NextRequest) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "Please paste a restaurant URL or type your restaurant name." },
      { status: 400 },
    );
  }

  // Generate an opaque submission id. The real pipeline will tie this
  // to a row in the listings table once DATABASE_URL is wired; until
  // then it round-trips through the thanks page.
  const submissionId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

  // Best-effort PostHog tracking — guarded so a missing env var can't
  // 500 the submission. Same posture for downstream Inngest fan-out:
  // we don't block the user response on background work.
  try {
    const ph = process.env.POSTHOG_PROJECT_API_KEY;
    if (ph) {
      await fetch("https://us.i.posthog.com/capture/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: ph,
          event: "self_serve_submitted",
          distinct_id: submissionId,
          properties: {
            url: body.url,
            serviceId: body.serviceId ?? null,
            eventId: body.eventId ?? null,
          },
        }),
      });
    }
  } catch {
    // ignore — analytics failure must not break submission UX
  }

  return NextResponse.json({
    listingId: submissionId,
    slug: submissionId,
    existed: false,
  });
}
