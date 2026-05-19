import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  url: z.string().min(3).max(500),
  email: z.string().email().max(254),
  serviceId: z.string().max(50).optional(),
  eventId: z.string().max(100).optional(),
});

const SERVICE_LABELS: Record<string, string> = {
  "menu-shoot-full": "Full Menu Shoot",
  "menu-shoot-starter": "Starter Menu Shoot",
  "menu-enhance-only": "Photo Enhance Pass",
  "hero-shot-refresh": "Hero Shot Refresh",
  "menu-audit-free": "Free Menu Audit",
};

/**
 * MenuLift submission endpoint.
 *
 * Captures the restaurant URL (Google Business Profile, DoorDash, Uber Eats,
 * or the restaurant's own website) + the operator's email, returns an opaque
 * submission id, and triggers a best-effort confirmation email + PostHog
 * lead event. The downstream pipeline (menu scrape → recipe interpretation →
 * fal.ai generation → R2 storage → Stripe checkout) is wired separately.
 */
export async function POST(req: NextRequest) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      {
        error:
          "Need both a restaurant URL (or name) and a valid email so we can send you your photos.",
      },
      { status: 400 },
    );
  }

  const submissionId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

  const isAudit = body.serviceId === "menu-audit-free";
  const serviceLabel = SERVICE_LABELS[body.serviceId ?? ""] ?? "Menu Shoot";

  // Best-effort confirmation email via Resend. Falls back silently if
  // RESEND_API_KEY isn't wired yet — the submission still succeeds and we
  // still hand the visitor an in-app confirmation via /thanks.
  void sendConfirmationEmail({
    to: body.email,
    submissionId,
    url: body.url,
    isAudit,
    serviceLabel,
  });

  // Best-effort PostHog lead event. Same posture: never block the response.
  void trackLeadEvent({
    submissionId,
    email: body.email,
    url: body.url,
    serviceId: body.serviceId,
    eventId: body.eventId,
  });

  return NextResponse.json({
    listingId: submissionId,
    slug: submissionId,
    existed: false,
  });
}

interface ConfirmationArgs {
  to: string;
  submissionId: string;
  url: string;
  isAudit: boolean;
  serviceLabel: string;
}

async function sendConfirmationEmail(args: ConfirmationArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const fromDomain = (process.env.SENDER_DOMAINS ?? "menulift.app").split(",")[0]!.trim();
  const fromName = process.env.SENDER_FROM_NAME ?? "MenuLift";
  const from = `${fromName} <hello@${fromDomain}>`;

  const subject = args.isAudit
    ? "Your MenuLift audit is queued"
    : `Your ${args.serviceLabel} is queued`;

  const slaLine = args.isAudit
    ? "Your free menu audit + sample shot will land in this inbox within 1 hour."
    : "We'll reply within 1 hour with a short intake form (recipe + plating notes) so the kitchen can confirm exactly how each generated photo should look. Final photos delivered in under 48 hours.";

  const text = [
    `Thanks — we got your ${args.serviceLabel} submission.`,
    "",
    `Restaurant: ${args.url}`,
    `Submission ID: ${args.submissionId}`,
    "",
    slaLine,
    "",
    "Questions? Just reply to this email.",
    "",
    "— MenuLift",
  ].join("\n");

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: args.to,
        subject,
        text,
      }),
    });
  } catch {
    // best-effort — never break the user response
  }
}

interface TrackArgs {
  submissionId: string;
  email: string;
  url: string;
  serviceId?: string;
  eventId?: string;
}

async function trackLeadEvent(args: TrackArgs) {
  const ph = process.env.POSTHOG_PROJECT_API_KEY;
  if (!ph) return;
  try {
    await fetch("https://us.i.posthog.com/capture/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: ph,
        event: "self_serve_submitted",
        distinct_id: args.email,
        properties: {
          submission_id: args.submissionId,
          url: args.url,
          service_id: args.serviceId ?? null,
          event_id: args.eventId ?? null,
        },
      }),
    });
  } catch {
    // best-effort
  }
}
