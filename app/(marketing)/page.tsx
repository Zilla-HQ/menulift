import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, Camera } from "lucide-react";

export const dynamic = "force-static";

export default function ChooserPage() {
  return (
    <section className="bg-gradient-to-b from-background to-muted/40 py-24">
      <div className="container max-w-4xl text-center">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
          MenuLift
        </div>
        <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-6xl">
          Make every menu photo crave-worthy.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
          We enhance your existing menu photos with AI — sharper, brighter, more appetizing —
          across Google, DoorDash, and Uber Eats. No reshoot. No food stylist. Under 24 hours.
        </p>

        <div className="mx-auto mt-12 grid max-w-3xl gap-5 md:grid-cols-2">
          <Link href="/audience-a" className="group">
            <Card className="h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="space-y-4 p-8 text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UtensilsCrossed className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold">I run a restaurant.</h2>
                <p className="text-muted-foreground">
                  Send us your menu — we'll enhance every item photo and deliver back a
                  full upload-ready set for Google, DoorDash, Uber Eats. $40-$90/month.
                </p>
                <div className="pt-2 font-semibold text-primary group-hover:underline">
                  Enhance my menu photos →
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/audience-b" className="group">
            <Card className="h-full overflow-hidden border-amber-500/40 transition-all hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="space-y-4 p-8 text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700">
                  <Camera className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold">I'm a marketplace operator.</h2>
                <p className="text-muted-foreground">
                  Free menu audit for your restaurants. We'll identify missing or low-quality
                  photos across your listings — partner rates available.
                </p>
                <div className="pt-2 font-semibold text-amber-700 group-hover:underline">
                  Run a free menu audit →
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          We enhance — we don't fabricate. Every photo is your real dish, made to look like it should.
        </p>
      </div>
    </section>
  );
}
