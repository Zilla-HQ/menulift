import { Card, CardContent } from "@/components/ui/card";
import type { Audience } from "@/lib/services";

const AUDIENCE_A_ITEMS = [
  { q: "Can you create photos for menu items I don't have shot yet?", a: "Yes — that's the headline service. You send the item name, a short recipe / ingredient list, and a note on how the kitchen plates it. We generate a photo-realistic image that represents the actual dish. The photo doesn't replace what the kitchen serves — it reflects it." },
  { q: "Will my photos accurately represent what's on the plate?", a: "Yes. We build every generated photo from your recipe + plating notes — no embellishments the kitchen doesn't put on the plate, no ingredients that aren't in the dish, no portion-size exaggeration. If a guest orders what they see in the photo, they get what they see." },
  { q: "What if I already have photos for some items?", a: "We enhance those (lighting, color, sharpness, channel-correct aspect ratios) and only generate from scratch for the items missing a photo. One subscription covers both." },
  { q: "How fast is turnaround?", a: "Missing-Photo Sprints (up to 15 items) ship in under 24 hours. Full Menu Shoots ship in under 48. Rush is same-day before 5pm local." },
  { q: "What channels do you export for?", a: "Google Business Profile (square), DoorDash (1400×800), and Uber Eats (2000×1333). One generation pass, three upload-ready files per dish." },
  { q: "Can I send revisions?", a: "Yes — unlimited revisions within 7 days of delivery. Tell us what to adjust (more sear marks, different plate color, less garnish) and we re-run." },
];

const AUDIENCE_B_ITEMS = [
  { q: "What does the free audit include?", a: "We pull your restaurants' public listings on Google, DoorDash, and Uber Eats, identify every menu item without a photo (the biggest order-conversion gap), flag weak existing photos, and email you a coverage report with the exact items costing your locations orders. Plus one free sample shot — generated from a real recipe — to show what the paid service delivers." },
  { q: "How is the audit free?", a: "We monetize by shooting the items we flag. The audit (coverage report + sample) is yours regardless — even if you never become a customer." },
  { q: "Do you sell my restaurant data?", a: "No. We only scan public listings on Google, DoorDash, and Uber Eats. We don't resell or share contact info." },
  { q: "I manage 10+ locations — do you do bulk?", a: "Yes. Multi-location pricing starts at $90/mo per location with quarterly menu audits, dedicated brand profile, and priority generation queue. Email us with your portfolio size." },
  { q: "Can my marketplace partner with you?", a: "Aggregators and POS platforms can resell MenuLift to their restaurant customers — we have a partner program with revenue share. Reach out via the form." },
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
