import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe, publicAppUrl } from "@/lib/stripe";

/**
 * Subscription Checkout — annual vs. monthly with differentiated trial.
 *
 * Pattern (lifted from Sitebeat):
 *   Subscription merchants on the platform should default to:
 *     - **Monthly plan:** 14-day free trial via `trial_period_days: 14`.
 *       This captures card up-front while removing the barrier to first
 *       use. Measured in production at Sitebeat to outperform a
 *       FIRST50 50%-off promo at the cold-ask step.
 *     - **Annual plan:** NO trial. Annual already signals commitment;
 *       a trial on annual would let users get free product without
 *       paying. Plus, annual offers a price discount (Sitebeat: 17%)
 *       that already removes friction.
 *
 *   The companion route `/api/checkout/route.ts` is the one-time-payment
 *   flow used by RealScale + MenuLift. Subscription merchants (like
 *   Sitebeat) use THIS route. A merchant can have both flows in the
 *   same codebase if they sell one-time + subscription products
 *   (e.g. SiteGrid's $199 build + $99/yr hosting renewal).
 *
 * Env vars expected:
 *   STRIPE_PRICE_ID_MONTHLY — Stripe Price ID for the monthly plan
 *   STRIPE_PRICE_ID_ANNUAL  — Stripe Price ID for the annual plan
 *   SUBSCRIPTION_TRIAL_DAYS — defaults to 14; override per merchant
 */

export const runtime = "nodejs";

const bodySchema = z.object({
  plan: z.enum(["monthly", "annual"]),
  customerEmail: z.string().email().optional(),
  /** Optional Stripe promotion_code id. Same lookup pattern as the one-time route. */
  promoCode: z.string().optional(),
  /**
   * Optional metadata to thread through the Stripe webhook. Use this
   * to attach a `siteId`, `auditId`, or whatever the merchant needs
   * to attribute the subscription to the right object on conversion.
   */
  metadata: z.record(z.string(), z.string()).optional(),
});

const TRIAL_DAYS = Number(process.env.SUBSCRIPTION_TRIAL_DAYS ?? "14");

export async function POST(req: NextRequest) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "Invalid body", detail: String(err) }, { status: 400 });
  }

  const priceId =
    body.plan === "monthly"
      ? process.env.STRIPE_PRICE_ID_MONTHLY
      : process.env.STRIPE_PRICE_ID_ANNUAL;

  if (!priceId) {
    return NextResponse.json(
      {
        error: `Stripe price not configured for plan="${body.plan}". Set STRIPE_PRICE_ID_MONTHLY / STRIPE_PRICE_ID_ANNUAL.`,
      },
      { status: 500 },
    );
  }

  // First-touch affiliate cookie (same `rs_ref` cookie the one-time
  // checkout route uses). Thread it through Stripe metadata so the
  // webhook can attribute the subscription on `customer.subscription.created`.
  const referralCode = req.cookies.get("rs_ref")?.value ?? null;

  // Promo code lookup — same pattern as the one-time route.
  let discountId: string | null = null;
  if (body.promoCode) {
    try {
      const promos = await stripe.promotionCodes.list({
        code: body.promoCode,
        active: true,
        limit: 1,
      });
      if (promos.data.length > 0) discountId = promos.data[0].id;
    } catch {
      // Silent fail — full price beats a 500.
    }
  }

  const appUrl = publicAppUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: body.customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      // The whole point of this route: trial on monthly, no trial on annual.
      // Annual is already a commitment signal; a trial on annual would let
      // people get free product without paying. Documented in
      // Sitebeat's free-trial-vs-promo experiment (see
      // template's COLD_FOLLOWUP.md).
      ...(body.plan === "monthly" && TRIAL_DAYS > 0
        ? { trial_period_days: TRIAL_DAYS }
        : {}),
      metadata: {
        plan: body.plan,
        ...(body.promoCode ? { promoCode: body.promoCode } : {}),
        ...(referralCode ? { referralCode } : {}),
        ...(body.metadata ?? {}),
      },
    },
    ...(discountId
      ? { discounts: [{ promotion_code: discountId }] }
      : { allow_promotion_codes: true }),
    metadata: {
      plan: body.plan,
      ...(body.promoCode ? { promoCode: body.promoCode } : {}),
      ...(referralCode ? { referralCode } : {}),
      ...(body.metadata ?? {}),
    },
    success_url: `${appUrl}/pricing?subscribed=1&plan=${body.plan}`,
    cancel_url: `${appUrl}/pricing?canceled=1`,
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
