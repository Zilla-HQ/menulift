import Link from "next/link";
import { BeforeAfterComparator } from "@/components/marketing/before-after-comparator";
import { FAQ } from "@/components/marketing/faq";
import { RestaurantStartForm } from "@/components/marketing/restaurant-start-form";
import { Card, CardContent } from "@/components/ui/card";
import { getSampleBeforeAfters } from "@/lib/samples";

export const dynamic = "force-dynamic";

const STATS = [
  { figure: "+30%", label: "more orders per item shot", detail: "Menu items with a photo convert up to 30% higher than text-only items on delivery marketplaces.", source: "DoorDash Merchant Suite, 2024" },
  { figure: "70%", label: "of guests check first", detail: "Seven in ten diners check Google or a delivery app before deciding where to order from or visit.", source: "Google / Ipsos restaurant study" },
  { figure: "<24h", label: "menu to upload-ready", detail: "Send your menu by 5pm. Photos for every item — newly created and enhanced — back the next morning.", source: "MenuLift SLA" },
  { figure: "$29–$149", label: "one-time per shoot", detail: "One-time price per menu shoot — no subscription. Unlimited revisions for 7 days. Google, DoorDash, and Uber Eats exports included.", source: "Pricing" },
];

export default async function HomePage() {
  const samples = await getSampleBeforeAfters("audience-a");
  return (
    <>
      <section className="border-b bg-gradient-to-b from-background to-muted/30 py-20">
        <div className="container max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
            For restaurants · A photo for every dish on your menu
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Don't leave money on the table. Photograph every item on your menu.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Listings with a photo on every menu item get up to{" "}
            <span className="font-semibold text-foreground">30% more orders</span>.
            We create photos for the dishes you don't have shot yet, and polish the ones you do —
            delivered upload-ready for Google, DoorDash, and Uber Eats in under 48 hours. From $29.
          </p>
          <div className="mt-8">
            <RestaurantStartForm />
            <p className="mt-3 text-xs text-muted-foreground">
              Free sample shot · no card required · cancel anytime
            </p>
            <p className="mt-2 text-sm">
              Not ready to commit?{" "}
              <Link href="/audit" className="font-semibold text-amber-700 underline-offset-4 hover:underline">
                Run a free menu audit first →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section id="why" className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Why menu photos matter.</h2>
          <p className="mt-3 text-muted-foreground">
            Photos are the single biggest conversion lever on Google and the delivery apps.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <Card key={s.figure} className="overflow-hidden">
              <CardContent className="space-y-2 p-6">
                <div className="text-4xl font-bold tracking-tight text-primary">{s.figure}</div>
                <div className="text-sm font-semibold">{s.label}</div>
                <p className="text-sm text-muted-foreground">{s.detail}</p>
                <div className="pt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Source: {s.source}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="how" className="border-y bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works.</h2>
            <p className="mt-3 text-muted-foreground">Three steps. Under 24 hours.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              {
                n: 1,
                title: "Send your menu",
                body: "Drop your Google Business Profile link, your DoorDash URL, or paste your menu items. We figure out which dishes are missing photos.",
              },
              {
                n: 2,
                title: "We shoot every dish",
                body: "For items without photos: we generate from your real recipe, ingredients, and plating. For items with photos: we enhance them. No stock, no embellishments.",
              },
              {
                n: 3,
                title: "Upload-ready files",
                body: "Channel-formatted exports for Google, DoorDash, and Uber Eats land in your inbox. You upload. Order volume lifts within the week.",
              },
            ].map((s) => (
              <Card key={s.n} className="border-amber-500/30">
                <CardContent className="space-y-2 p-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                    Step {s.n}
                  </div>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="samples" className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">See it in action.</h2>
          <p className="mt-3 text-muted-foreground">
            Drag the slider — every "after" was produced by the exact pipeline that runs on your menu.
          </p>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {samples.map((s) => (
            <div key={s.id} className="space-y-2">
              <BeforeAfterComparator beforeUrl={s.before} afterUrl={s.after} />
              <p className="text-sm text-muted-foreground">{s.caption}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-t bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Pricing.</h2>
            <p className="mt-3 text-muted-foreground">
              One-time price per menu shoot. Unlimited revisions for 7 days. No subscription.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="space-y-2 p-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Starter</div>
                <div className="text-3xl font-bold">
                  $29<span className="text-base font-normal text-muted-foreground"> one-time</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Up to 20 menu items — new photos generated for missing items, existing photos enhanced.
                  Google + DoorDash + Uber Eats exports.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardContent className="space-y-2 p-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">Full Menu · popular</div>
                <div className="text-3xl font-bold">
                  $79<span className="text-base font-normal text-muted-foreground"> one-time</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Up to 50 items shot. Storefront hero refresh included. Most restaurants pick this one — covers
                  a typical full menu in a single pass.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 p-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unlimited</div>
                <div className="text-3xl font-bold">
                  $149<span className="text-base font-normal text-muted-foreground"> one-time</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Unlimited menu items. Storefront hero. 90 days of free additions as you add new dishes.
                  Priority queue.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="faq" className="container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Common questions.</h2>
        </div>
        <div className="mx-auto mt-10 max-w-4xl">
          <FAQ audience="audience-a" />
        </div>
      </section>

      <section id="cta-foot" className="border-t bg-gradient-to-b from-background to-muted/30 py-16">
        <div className="container max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready when you are.</h2>
          <p className="mt-3 text-muted-foreground">
            Send us your menu. We'll have shoot-ready photos for every item in your inbox tomorrow.
          </p>
          <div className="mt-8">
            <RestaurantStartForm />
            <p className="mt-3 text-sm">
              Or{" "}
              <Link href="/audit" className="font-semibold text-amber-700 underline-offset-4 hover:underline">
                run a free audit
              </Link>{" "}
              to see what you're missing.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
