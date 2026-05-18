import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { PartnerApplication } from "@/components/marketing/partner-application";

export const metadata: Metadata = {
  title: "Partner program — Restay",
  description:
    "Earn 30% of every $79 Tune-Up you refer to Restay. Paid every Friday via Stripe. No claw-backs, no MRR waits — one-time conversion, fast cash.",
  openGraph: {
    title: "Partner with Restay",
    description:
      "30% of every Tune-Up. Paid every Friday. The fastest-paying affiliate program in the Airbnb host SaaS space.",
  },
};

export const dynamic = "force-static";

const FAQ = [
  {
    q: "What's the actual payout math?",
    a: "30% of the order value. The Listing Tune-Up is $79, so you make $23.70 per converted referral. Premium ($149) pays $44.70. Rush ($129) pays $38.70. We pay every Friday via Stripe, no minimum threshold.",
  },
  {
    q: "Why one-time payouts instead of MRR?",
    a: "Because Restay is a one-time fee, not a subscription. You see your commission within a week of the host paying — no 12-month claw-back clock, no \"refund risk\" pause. Most subscription affiliate programs in this space wait 30–90 days before they pay anything.",
  },
  {
    q: "How do I track my referrals?",
    a: "Once approved, you get a unique referral link (utm_content=<your-handle>). We email you the moment any referral pastes their URL into Restay, and again when they pay. You'll also get a partner dashboard at /admin once we hit ~10 active partners.",
  },
  {
    q: "What's the approval bar?",
    a: "We're looking for partners with active host audiences — YouTube creators, podcasters, course operators, newsletter writers, Facebook/Slack group admins. We'll happily approve smaller audiences (a tight 200-host coaching community converts better than a generic 50k channel) — what we don't approve is coupon/deal sites or generic affiliate spam.",
  },
  {
    q: "Can I review the product before promoting?",
    a: "Yes. Once approved, we send you a free $79 Tune-Up on a listing of your choice (yours or one of your audience members') so you have a real before/after to talk about.",
  },
  {
    q: "What if my audience is mostly outside the US?",
    a: "Restay v1 is US-only. We'll still approve you — the link works globally, but conversion will be lower since US-listings are most of our target. We'll expand to Canada and the EU later in 2026.",
  },
];

export default function PartnersPage() {
  return (
    <>
      <section className="border-b bg-gradient-to-b from-background to-muted/30 py-20">
        <div className="container max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Restay Partner Program
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            $24 per referral.<br />Paid every Friday.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Restay's $79 Tune-Up converts faster than any subscription tool in the
            Airbnb host space. We pay 30% of every order to partners, and we settle
            commissions weekly — no 90-day refund-risk holding pattern.
          </p>
        </div>
      </section>

      {/* The economics */}
      <section className="container py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            How the economics actually compare.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Most subscription tools in this space pay slowly because their LTV is
            slow. Ours pays now because the customer pays now.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-primary">
              <CardContent className="space-y-2 p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Restay (this program)
                </div>
                <div className="text-3xl font-bold">$23.70</div>
                <p className="text-sm text-muted-foreground">
                  30% of $79 Tune-Up. Paid within 7 days. No claw-back after refund window (14 days).
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  PriceLabs
                </div>
                <div className="text-3xl font-bold">10%</div>
                <p className="text-sm text-muted-foreground">
                  Of first 12 invoices. Roughly $24 over 12 months on a $20/mo plan, paid monthly.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hospitable
                </div>
                <div className="text-3xl font-bold">25%</div>
                <p className="text-sm text-muted-foreground">
                  Of first 3 months. Capped, then drops to nothing. Paid monthly.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Wheelhouse
                </div>
                <div className="text-3xl font-bold">50%</div>
                <p className="text-sm text-muted-foreground">
                  Of first 3 months. High % but slow conversion (subscription friction).
                </p>
              </CardContent>
            </Card>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
            Comparison sourced from each company's public help/affiliate docs as of May 2026.
          </p>
        </div>
      </section>

      {/* Who this is for */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container max-w-4xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Who we partner with.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="space-y-2 p-5">
                <div className="text-2xl">🎙</div>
                <div className="font-semibold">Podcasters & YouTubers</div>
                <p className="text-sm text-muted-foreground">
                  Audiences who already trust your product picks. We'll send you
                  a free Tune-Up on a real listing for your demo.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 p-5">
                <div className="text-2xl">📚</div>
                <div className="font-semibold">Course operators & coaches</div>
                <p className="text-sm text-muted-foreground">
                  Bundle Restay as a "module homework" tool — your students get a
                  graded listing and you get $24/each. Custom rates available.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 p-5">
                <div className="text-2xl">📨</div>
                <div className="font-semibold">Newsletter & community admins</div>
                <p className="text-sm text-muted-foreground">
                  Facebook groups, Slack/Discord communities, paid newsletters.
                  Direct-link partners average 4× the per-impression conversion of
                  passive social.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application */}
      <section className="container py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Apply to partner.
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            Reviewed within 48 hours. Custom rates available for partners over 10k
            audience.
          </p>
          <div className="mt-10">
            <PartnerApplication />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Common questions.
          </h2>
          <div className="mt-10 space-y-6">
            {FAQ.map((item) => (
              <div key={item.q}>
                <h3 className="font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
