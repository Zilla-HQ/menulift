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
 * MenuLift submission endpoint. Captures restaurant URL + operator email,
 * fires a real confirmation email via Resend, returns a submission id.
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

  // Fire confirmation email synchronously (max ~1s on Resend's hot path).
  // The visitor sees a faster perceived response if we still 200 quickly,
  // so we cap the wait at 2 seconds and don't block on failures.
  await Promise.race([
    sendConfirmationEmail({
      to: body.email,
      submissionId,
      url: body.url,
      isAudit,
      serviceLabel,
    }),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);

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

async function sendConfirmationEmail(args: ConfirmationArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const fromName = process.env.SENDER_FROM_NAME ?? "MenuLift";
  const primaryDomain = (process.env.SENDER_DOMAINS ?? "menulift.app")
    .split(",")[0]!
    .trim();
  const businessName = process.env.BUSINESS_NAME ?? "MenuLift";
  const businessAddress =
    process.env.BUSINESS_ADDRESS ?? "MenuLift HQ — address pending";
  const replyTo = process.env.REPLIES_EMAIL ?? `hello@${primaryDomain}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://menulift.vercel.app";

  const subject = args.isAudit
    ? "We're on it — your MenuLift audit is queued."
    : `Got it — your ${args.serviceLabel} is queued.`;

  const greeting = args.isAudit
    ? "Thanks for trying MenuLift. We're on it."
    : "Welcome to MenuLift. Thanks for trusting us with your menu.";

  const slaLine = args.isAudit
    ? "Your free menu audit and one recipe-built sample shot will land in this inbox within the next hour."
    : `Your ${args.serviceLabel} is queued. We'll email a short recipe + plating intake form within the hour so the kitchen can confirm exactly how each generated photo should look — then deliver every dish in under 48 hours.`;

  const text = [
    `${greeting}`,
    "",
    slaLine,
    "",
    `Restaurant: ${args.url}`,
    `Submission ID: ${args.submissionId}`,
    "",
    "Questions? Just reply to this email — it lands with a real person.",
    "",
    "— MenuLift",
    `${appUrl}`,
    "",
    "---",
    `${businessName} · ${businessAddress}`,
  ].join("\n");

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="font-size:18px;font-weight:800;letter-spacing:-0.01em;color:#0f172a;">MenuLift</div>
    <div style="height:1px;background:#e2e8f0;margin:20px 0 28px;"></div>
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:800;color:#0f172a;">${greeting}</h1>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155;">${slaLine}</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:24px 0;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;">
      <tr>
        <td style="padding:14px 18px;font-size:13px;color:#64748b;width:120px;border-bottom:1px solid #e2e8f0;">Restaurant</td>
        <td style="padding:14px 18px;font-size:13px;color:#0f172a;border-bottom:1px solid #e2e8f0;word-break:break-all;">${escapeHtml(
          args.url,
        )}</td>
      </tr>
      <tr>
        <td style="padding:14px 18px;font-size:13px;color:#64748b;width:120px;">Submission ID</td>
        <td style="padding:14px 18px;font-size:13px;color:#0f172a;font-family:ui-monospace,'SF Mono',Menlo,monospace;">${escapeHtml(
          args.submissionId,
        )}</td>
      </tr>
    </table>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#334155;">
      Questions? Just reply to this email — it lands with a real person.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#0f172a;font-weight:600;">— MenuLift</p>
    <div style="height:1px;background:#e2e8f0;margin:32px 0 16px;"></div>
    <p style="margin:0;font-size:11px;line-height:1.5;color:#94a3b8;">
      ${escapeHtml(businessName)} · ${escapeHtml(businessAddress)}<br />
      You're receiving this because you submitted a menu to MenuLift at <a href="${appUrl}" style="color:#94a3b8;">${appUrl.replace(/^https?:\/\//, "")}</a>.
    </p>
  </div>
</body>
</html>`;

  const payload = (fromDomain: string) => ({
    from: `${fromName} <${fromDomain === "resend.dev" ? "onboarding" : "hello"}@${fromDomain}>`,
    to: args.to,
    subject,
    text,
    html,
    reply_to: replyTo,
  });

  const send = async (fromDomain: string) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload(fromDomain)),
    });

  try {
    let res = await send(primaryDomain);
    if (res.status === 403 || res.status === 422) {
      // Domain not verified yet — fall back to Resend's shared sandbox sender.
      // Recipients will see "MenuLift <onboarding@resend.dev>" until DNS for
      // SENDER_DOMAINS is verified in Resend.
      res = await send("resend.dev");
    }
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn(
        `[self-serve confirmation] resend failed status=${res.status} body=${await res.text()}`,
      );
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[self-serve confirmation] resend threw:", err);
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
