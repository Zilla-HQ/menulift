/**
 * Seed a single restaurant menu for the happy-path test. Use:
 *   npx tsx --env-file=.env.local scripts/seed-listing.ts --email you+test@yourdomain.com
 * Requires DATABASE_URL. Does NOT emit the Inngest event — trigger
 * listings/ingested manually from the Inngest dev UI.
 */
import { db, listings } from "@/db";
import { slugify } from "@/lib/utils";

async function main() {
  const args = process.argv.slice(2);
  const email = getArg(args, "--email") ?? "seed@example.com";

  const address = "1234 Congress Ave";
  const zip = "78701";
  const sourceId = `seed-${Date.now()}`;

  const [row] = await db
    .insert(listings)
    .values({
      source: "google_places",
      sourceId,
      address,
      city: "Austin",
      state: "TX",
      zip,
      price: 4500, // ~$45 avg entree cents
      dom: 4,
      listingType: "fast_casual",
      photos: [
        "https://placehold.co/1200x800/e2e8f0/475569?text=Burger",
        "https://placehold.co/1200x800/e2e8f0/475569?text=Tacos",
        "https://placehold.co/1200x800/e2e8f0/475569?text=Salad",
        "https://placehold.co/1200x800/e2e8f0/475569?text=Pasta",
        "https://placehold.co/1200x800/e2e8f0/475569?text=Dessert",
      ],
      // Legacy DB columns reused for restaurant contact + name.
      agentName: "Test Operator",
      agentEmail: email,
      agentPhone: "+15125550123",
      brokerage: "Seed Bistro",
      slug: `${slugify(`${address} ${zip}`)}-${sourceId.slice(-6)}`,
    })
    .returning();

  console.log(`Seeded menu listing ${row.id}`);
  console.log(`Slug: /l/${row.slug}`);
  console.log(`Operator email: ${email}`);
  console.log(`\nTrigger qualification in Inngest dev UI with:`);
  console.log(`  event: listings/ingested`);
  console.log(`  data: { "listingId": "${row.id}", "source": "google_places" }`);
}

function getArg(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
