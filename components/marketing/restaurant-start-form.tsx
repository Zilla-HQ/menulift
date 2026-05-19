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

const URL_PLACEHOLDER =
  "Your Google Business Profile, DoorDash, or restaurant website URL";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RestaurantStartForm({
  className,
  serviceId = "menu-shoot-full",
  ctaLabel,
  audit = false,
}: Props) {
  const router = useRouter();
  const [url, setUrl] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmedUrl = url.trim();
    const trimmedEmail = email.trim();

    if (trimmedUrl.length < 3) {
      setError("Please paste your restaurant URL or type your restaurant name.");
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError("Enter a valid email so we can send you your photos.");
      return;
    }

    setPending(true);
    const eventId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const res = await fetch("/api/self-serve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmedUrl,
          email: trimmedEmail,
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
      const id = body.listingId ?? body.slug ?? "";
      router.push(
        `/thanks?id=${encodeURIComponent(id)}&url=${encodeURIComponent(trimmedUrl)}&email=${encodeURIComponent(trimmedEmail)}&service=${encodeURIComponent(
          audit ? "menu-audit-free" : serviceId,
        )}`,
      );
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
      <Input
        type="text"
        inputMode="url"
        placeholder={URL_PLACEHOLDER}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        disabled={pending}
        autoComplete="url"
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          inputMode="email"
          placeholder="Email — where we'll send your photos"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
          disabled={pending}
          autoComplete="email"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Working…" : label}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
