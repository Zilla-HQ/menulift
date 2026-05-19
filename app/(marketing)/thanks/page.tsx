import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getService } from "@/lib/services";

export const dynamic = "force-dynamic";
export const metadata = { title: "Thanks — MenuLift" };

interface Props {
  searchParams: Promise<{ id?: string; url?: string; service?: string }>;
}

export default async function ThanksPage({ searchParams }: Props) {
  const { id, url, service } = await searchParams;
  const svc = service ? getService(service) : undefined;
  const isAudit = service === "menu-audit-free";

  return (
    <section className="container max-w-2xl py-20">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {isAudit ? "We're on it." : "Got it. Your menu shoot is queued."}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {isAudit
            ? "Your free menu audit is in our queue. Expect a coverage report and your free sample shot in your inbox within the next hour."
            : `Your ${svc?.name ?? "menu shoot"} is queued. We'll email you a recipe-and-plating intake form so the kitchen can confirm what each generated photo should look like — then deliver every dish in under 48 hours.`}
        </p>
      </div>

      <Card className="mt-10">
        <CardContent className="space-y-3 p-6 text-sm">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-muted-foreground">Submission ID</span>
            <span className="col-span-2 font-mono text-xs">{id ?? "—"}</span>
          </div>
          {url && (
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Restaurant</span>
              <span className="col-span-2 break-all">{url}</span>
            </div>
          )}
          {svc && (
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Service</span>
              <span className="col-span-2">{svc.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Questions? Reply to any MenuLift email or write to{" "}
        <a
          href="mailto:hello@menulift.app"
          className="font-medium text-foreground hover:underline"
        >
          hello@menulift.app
        </a>
        .
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="text-sm font-semibold text-amber-700 underline-offset-4 hover:underline"
        >
          ← Back to MenuLift
        </Link>
      </div>
    </section>
  );
}
