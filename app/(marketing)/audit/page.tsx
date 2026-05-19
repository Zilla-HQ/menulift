import Link from "next/link";
import { FAQ } from "@/components/marketing/faq";
import { RestaurantStartForm } from "@/components/marketing/restaurant-start-form";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Free menu photo audit — MenuLift",
  description:
    "Free audit of your restaurant's menu photo coverage across Google, DoorDash, and Uber Eats. We list every item missing a photo plus a free sample shot — yours to keep.",
};

export default function AuditPage() {
  return (
    <>
      <section className="border-b bg-gradient-to-b from-background to-muted/30 py-20">
        <div className="container max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
            Free · No card · Yours to keep
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Every menu item without a photo is an order you didn't get.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Paste your Google, DoorDash, or Uber Eats listing. We'll list every dish missing a
            photo, flag the weak ones, and send you one free sample shot built from the actual
            recipe so you can see what the paid service delivers. Free. The audit + sample
            are yours regardless.
          </p>
          <div className="mt-8">
            <RestaurantStartForm audit />
            <p className="mt-3 text-xs text-muted-foreground">
              We scan public listings only · we don't sell your info · audit emailed within 1 hour
            </p>
          </div>
        </div>
      </section>

      <section id="how" className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">What you get.</h2>
          <p className="mt-3 text-muted-foreground">A complete picture of what's costing your restaurant orders today.</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
          {[
            {
              n: 1,
              title: "Coverage report",
              body: "We pull your Google, DoorDash, and Uber Eats listings and score every menu item: missing photo, weak photo, or good. Channel-by-channel.",
            },
            {
              n: 2,
              title: "Order-lift estimate",
              body: "We estimate how many orders you're leaving on the table today, based on how many items are text-only vs. photographed.",
            },
            {
              n: 3,
              title: "Free sample shot",
              body: "We pick one item from your menu that's missing a photo and generate a photo-realistic image from its actual recipe. Yours to use, even if you never buy.",
            },
          ].map((s) => (
            <Card key={s.n}>
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
      </section>

      <section className="border-t bg-muted/30 py-16">
        <div className="container max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Like what you see?</h2>
          <p className="mt-3 text-muted-foreground">
            One-time shoots run $29–$149 per menu. Every dish on your menu shot —
            generated for the ones you don't have, enhanced for the ones you do. No subscription.
          </p>
          <div className="mt-6">
            <Link
              href="/#pricing"
              className="inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              See plans →
            </Link>
          </div>
        </div>
      </section>

      <section id="faq" className="container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Audit FAQ.</h2>
        </div>
        <div className="mx-auto mt-10 max-w-4xl">
          <FAQ audience="audience-b" />
        </div>
      </section>
    </>
  );
}
