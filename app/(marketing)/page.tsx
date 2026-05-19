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
          Sell more food. Every item on your menu, photographed.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
          Items with photos get up to <span className="font-semibold text-foreground">30% more orders</span> on Google,
          DoorDash, and Uber Eats. We create a photo for every dish that's missing one,
          and enhance the ones you already have — delivered in under 24 hours.
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
                  Get a photo for every menu item — created from scratch for the ones you don't have,
                  enhanced for the ones you do. Upload-ready for Google, DoorDash, Uber Eats. From $40/mo.
                </p>
                <div className="pt-2 font-semibold text-primary group-hover:underline">
                  Shoot my whole menu →
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
                  See which of your restaurants are leaving orders on the table. Free coverage
                  audit across Google, DoorDash, Uber Eats — with bulk pricing for portfolios.
                </p>
                <div className="pt-2 font-semibold text-amber-700 group-hover:underline">
                  Run a free menu audit →
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Every photo represents your actual dish — built from your recipe, your ingredients, your plating.
          No stock photography. No misleading imagery.
        </p>
      </div>
    </section>
  );
}
