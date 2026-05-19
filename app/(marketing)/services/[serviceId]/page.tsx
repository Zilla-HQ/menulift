import { notFound } from "next/navigation";
import { Sofa, Trees, SunMedium, Sparkles, Building2, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RestaurantStartForm } from "@/components/marketing/restaurant-start-form";
import { BeforeAfterComparator } from "@/components/marketing/before-after-comparator";
import { FAQ } from "@/components/marketing/faq";
import { getService } from "@/lib/services";
import { getSampleForService } from "@/lib/samples";
import { formatCents } from "@/lib/utils";

const ICONS = { Sofa, Trees, SunMedium, Sparkles, Building2, Waves } as const;

interface PageProps {
  params: Promise<{ serviceId: string }>;
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { serviceId } = await params;
  const service = getService(serviceId);
  if (!service) notFound();

  const Icon = ICONS[service.icon];
  const free = service.basePriceCents === 0;
  const sample = await getSampleForService(service.id);
  const isAudit = service.id === "menu-audit-free";

  return (
    <div className="container max-w-5xl py-16">
      <div className="flex items-start gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
            {free ? (
              <Badge variant="success">Free</Badge>
            ) : (
              <Badge variant="secondary">{formatCents(service.basePriceCents)}</Badge>
            )}
          </div>
          <p className="mt-2 text-lg text-muted-foreground">{service.shortDescription}</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{service.longDescription}</p>
      </div>

      {sample && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold">See it in action</h2>
          <p className="mt-2 text-sm text-muted-foreground">{sample.caption}</p>
          <div className="mt-6 max-w-3xl">
            <BeforeAfterComparator beforeUrl={sample.before} afterUrl={sample.after} />
          </div>
        </div>
      )}

      <Card className="mt-10">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">
            {isAudit ? "Get your free audit" : "Get started"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Paste your Google Business Profile, DoorDash, or restaurant website URL — we'll
            pull your menu and{" "}
            {isAudit
              ? "deliver a free coverage report plus one sample shot built from a real recipe on your menu."
              : `produce ${service.name.toLowerCase()} and email you the upload-ready files.`}
          </p>
          <RestaurantStartForm
            serviceId={service.id}
            audit={isAudit}
            ctaLabel={service.ctaPrimary}
          />
        </CardContent>
      </Card>

      <div className="mt-12">
        <h2 className="text-xl font-semibold">Common questions</h2>
        <div className="mt-6">
          <FAQ audience={isAudit ? "audience-b" : "audience-a"} />
        </div>
      </div>
    </div>
  );
}
