import { Card, CardContent } from "@/components/ui/card";
import type { Audience } from "@/lib/services";

const AUDIENCE_A_ITEMS = [
  { q: "Do you take new photos of my food?", a: "No — we enhance your existing photos with AI. We don't fabricate dishes or replace your photos wholesale. That keeps you compliant with Google Business Profile, DoorDash, and Uber Eats content policies." },
  { q: "How fast is turnaround?", a: "Starter batches (up to 15 items) ship in under 24 hours. Full menus in under 48. Rush is same-day before 5pm local." },
  { q: "What channels do you export for?", a: "Google Business Profile (square), DoorDash (1400×800), and Uber Eats (2000×1333). One enhancement, three upload-ready files per dish." },
  { q: "Can I send revisions?", a: "Yes — unlimited revisions on every batch within 7 days of delivery. Tell us what to adjust (more warmth, less saturation, etc.) and we re-run." },
  { q: "What if my photos are really bad?", a: "We'll tell you on the audit. AI enhancement has limits — extreme blur or very dark photos won't enhance well. We flag those and recommend a quick phone reshoot before subscribing." },
];

const AUDIENCE_B_ITEMS = [
  { q: "How is the audit free?", a: "We monetize by enhancing the photos we flag. The audit (coverage report + one free sample enhancement) is yours regardless — even if you never become a customer." },
  { q: "Do you sell my restaurant data?", a: "No. We only scan public listings on Google, DoorDash, and Uber Eats. We don't resell or share contact info." },
  { q: "I manage 10+ locations — do you do bulk?", a: "Yes. Multi-location pricing starts at $90/mo per location with quarterly menu audits and a dedicated brand profile. Email us with your portfolio size." },
  { q: "Can my marketplace partner with you?", a: "Aggregators and POS platforms can resell MenuLift to their restaurant customers — we have a partner program with revenue share. Reach out via the form." },
  { q: "Does the audit include my website's menu page?", a: "Yes — we scan Google Business Profile, DoorDash, Uber Eats, and your public website menu page if you provide the URL." },
];

const PREVIEW_ITEMS = [...AUDIENCE_A_ITEMS.slice(0, 3), ...AUDIENCE_B_ITEMS.slice(0, 3)];

const ITEMS_BY_AUDIENCE: Record<Audience | "preview", typeof AUDIENCE_A_ITEMS> = {
  "audience-a": AUDIENCE_A_ITEMS,
  "audience-b": AUDIENCE_B_ITEMS,
  both: AUDIENCE_A_ITEMS,
  preview: PREVIEW_ITEMS,
  // Vertical-specific audiences mirrored from Relist (see lib/services.ts).
  // No template-level copy lives here — each forked merchant should swap in
  // their own questions. Falls back to AUDIENCE_A copy until then.
  agents: AUDIENCE_A_ITEMS,
  renovate: AUDIENCE_B_ITEMS,
};

interface Props {
  audience?: Audience | "preview";
}

export function FAQ({ audience = "audience-a" }: Props) {
  const items = ITEMS_BY_AUDIENCE[audience] ?? AUDIENCE_A_ITEMS;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <Card key={item.q}>
          <CardContent className="space-y-2 p-6">
            <h3 className="font-semibold">{item.q}</h3>
            <p className="text-sm text-muted-foreground">{item.a}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
