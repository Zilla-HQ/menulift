"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  className?: string;
  /** Pre-select a service ID for the submit. Defaults to the full-menu shoot. */
  serviceId?: string;
  /** CTA label override. */
  ctaLabel?: string;
  /** Tells the API this submission is the free audit, not a paid order. */
  audit?: boolean;
}

const DEFAULT_PLACEHOLDER =
  "Your Google Business Profile, DoorDash, or restaurant website URL";

export function RestaurantStartForm({
  className,
  serviceId = "menu-shoot-full",
  ctaLabel,
  audit = false,
}: Props) {
  const router = useRouter();
  const [url, setUrl] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const eventId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const res = await fetch("/api/self-serve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          serviceId: audit ? "menu-audit-free" : serviceId,
          eventId,
        }),
      });
      const body = (await res.json()) as {
        listingId?: string;
        slug?: string;
        existed?: boolean;
        error?: string;
      };
      if (!res.ok || !body.listingId) {
        throw new Error(body.error ?? "Something went wrong");
      }
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
      if (typeof fbq === "function") {
        fbq(
          "track",
          "Lead",
          { content_name: audit ? "audit_submitted" : "self_serve_submitted" },
          { eventID: eventId },
        );
      }
      if (body.existed && body.slug) {
        router.push(`/l/${body.slug}?service=${serviceId}`);
      } else {
        router.push(`/generating/${body.listingId}?service=${serviceId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setPending(false);
    }
  }

  const label = ctaLabel ?? (audit ? "Run my free audit" : "Shoot my whole menu");

  return (
    <form
      onSubmit={onSubmit}
      className={`mx-auto flex w-full max-w-2xl flex-col gap-3 ${className ?? ""}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="text"
          inputMode="url"
          placeholder={DEFAULT_PLACEHOLDER}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="flex-1"
          disabled={pending}
        />
        <Button type="submit" disabled={pending || url.trim().length < 3}>
          {pending ? "Working…" : label}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
