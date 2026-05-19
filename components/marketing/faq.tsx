import { Card, CardContent } from "@/components/ui/card";
import type { Audience } from "@/lib/services";

const AUDIENCE_A_ITEMS = [
  { q: "Can you create photos for menu items I don't have shot yet?", a: "Yes — that's the headline service. You send the item name, a short recipe / ingredient list, and a note on how the kitchen plates it. We generate a photo-realistic image that represents the actual dish. The photo doesn't replace what the kitchen serves — it reflects it." },
  { q: "Will my photos accurately represent what's on the plate?", a: "Yes. We build every generated photo from your recipe + plating notes — no embellishments the kitchen doesn't put on the plate, no ingredients that aren't in the dish, no portion-size exaggeration. If a guest orders what they see in the photo, they get what they see." },
  { q: "What if I already have photos for some items?", a: "We enhance those (lighting, color, sharpness, channel-correct aspect ratios) and only generate from scratch for the items missing a photo. One shoot covers both." },
  { q: "How fast is turnaround?", a: "Missing-Photo Sprints (up to 15 items) ship in under 24 hours. Full Menu Shoots ship in under 48. Rush is same-day before 5pm local." },
  { q: "What channels do you export for?", a: "Google Business Profile (square), DoorDash (1400×800), and Uber Eats (2000×1333). One generation pass, three upload-ready files per dish." },
  { q: "Can I send revisions?", a: "Yes — unlimited revisions within 7 days of delivery. Tell us what to adjust (more sear marks, different plate color, less garnish) and we re-run." },
];

const AUDIENCE_B_ITEMS = [
  { q: "What's in the audit?", a: "Three things: (1) a coverage report that lists every menu item across your Google, DoorDash, and Uber Eats listings — flagged as missing photo, weak photo, or good; (2) an estimate of how many orders you're leaving on the table today; (3) one free sample shot — generated from a real recipe on your menu — so you see what the paid service delivers." },
  { q: "How is it free?", a: "We monetize when restaurants upgrade to a paid plan to shoot the rest of the menu. The audit + sample shot are yours regardless — even if you never become a customer." },
  { q: "How long does it take?", a: "Audits land in your inbox within 1 hour of submission. The free sample shot follows within 24 hours." },
  { q: "Do you need access to my Google or delivery-app accounts?", a: "No — we scan your public listings only. You don't share credentials. We pull what any customer would see." },
  { q: "What if I have multiple locations?", a: "Submit each location separately (one URL per location). The Unlimited shoot ($499) is per location and covers each menu fully — most multi-location operators bundle several Unlimited shoots up front. Email us with portfolio size for volume pricing." },
];

const PREVIEW_ITEMS = [...AUDIENCE_A_ITEMS.slice(0, 3), ...AUDIENCE_B_ITEMS.slice(0, 3)];

const ITEMS_BY_AUDIENCE: Record<Audience | "preview", typeof AUDIENCE_A_ITEMS> = {
  "audience-a": AUDIENCE_A_ITEMS,
  "audience-b": AUDIENCE_B_ITEMS,
  both: AUDIENCE_A_ITEMS,
  preview: PREVIEW_ITEMS,
  // Vertical-specific audiences kept for backward-compat with the merchant template.
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
