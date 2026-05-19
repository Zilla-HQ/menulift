import type { RoomKind } from "@/lib/room-classify";

/**
 * A "service" is one transform MenuLift can offer on a restaurant's
 * menu. Adding a service is just adding an entry here — the preview
 * pipeline reads `promptTemplate` and `imageSource` to know what to do.
 *
 * MenuLift positioning (customer-outcome led):
 *   - LEAD: a photo for every menu item — including the ones that have
 *     no photo today. We GENERATE photos from your recipe + ingredients
 *     + plating notes for the dishes missing a shot, and ENHANCE the
 *     photos you already have. Restaurants get more orders because
 *     items with photos convert at up to 30% higher than text-only.
 *   - Every generated photo represents the actual dish: same recipe,
 *     same ingredients, same plating direction the kitchen serves. No
 *     stock photography, no misleading imagery.
 */

export type ImageSource =
  | "listing_photo" // a menu-item photo the restaurant already has (we re-use the field name)
  | "satellite_tile" // unused for MenuLift — kept so platform code compiles
  | "exterior_facade"; // the storefront / cover photo

// Audience is the union of the template's two generic placeholders
// (audience-a / audience-b — kept so the stubbed FAQ + services-grid in
// components/marketing/* still typecheck for new merchants) and the
// vertical-specific audiences mirrored from the MenuLift reference build
// (agents / renovate).
export type Audience =
  | "audience-a"
  | "audience-b"
  | "agents"
  | "renovate"
  | "both";

export interface ServiceDefinition {
  id: string; // slug — also the value stored in DB
  name: string;
  shortDescription: string; // for cards
  longDescription: string; // for service-detail pages
  basePriceCents: number;
  rushPriceCents: number;
  category: "interior" | "exterior" | "marketing";
  /** Which funnel(s) this service appears in. */
  audience: Audience;
  imageSource: ImageSource;
  // For listing_photo source: which room types this service applies to.
  applicableRooms?: RoomKind[];
  // The actual fal.ai edit prompt (we append the source-aware preamble).
  promptTemplate: string;
  // CTA copy for the landing page button + email subject template
  ctaPrimary: string;
  emailSubjectTemplate: string; // {{shortAddress}} replaced
  // Visual category icon (lucide-react name)
  icon: "Sofa" | "Trees" | "SunMedium" | "Sparkles" | "Building2" | "Waves";
}

export const SERVICES: ServiceDefinition[] = [
  // ─── LEAD service: create photos for missing items ──────────────────────
  // The biggest revenue lever for a restaurant: every dish with no photo
  // today is leaving orders on the table. We generate from recipe +
  // ingredients + plating notes, representing the dish the kitchen actually
  // serves. Lead with this — it's the headline outcome.
  {
    id: "menu-shoot-full",
    name: "Full Menu Shoot",
    shortDescription:
      "A photo for every dish on your menu — created for the ones you don't have, enhanced for the ones you do. Up to 50 items.",
    longDescription:
      "Send your menu (text, PDF, or your existing Google / DoorDash / Uber Eats listing). We generate a photo-realistic image for every item that's missing one — built from your actual recipe, ingredients, and plating direction — and enhance every photo you already have. Delivered back as channel-ready files for Google Business Profile, DoorDash, and Uber Eats. Under 48 hours. One-time price covers up to 50 menu items plus storefront hero refresh. The single biggest order-conversion lever you can pull this week.",
    basePriceCents: 7900,
    rushPriceCents: 11900,
    category: "marketing",
    audience: "audience-a",
    imageSource: "listing_photo",
    promptTemplate:
      "Generate a photo-realistic overhead photograph of the restaurant dish described in the menu item: {{itemName}} — {{itemDescription}}. Plating should match the restaurant's style ({{platingNotes}}). Natural daylight, soft shadows, real ceramic or restaurant-grade tableware, fresh ingredients visible. The food must look like what the kitchen actually serves: no stylized garnishes the recipe doesn't include, no decorative elements that aren't on the plate, no misleading portion sizes. Photo-realistic. No text, no watermarks.",
    ctaPrimary: "Shoot my whole menu",
    emailSubjectTemplate: "{{shortAddress}} — every item on your menu, photographed",
    icon: "Sparkles",
  },
  {
    id: "menu-shoot-starter",
    name: "Starter Menu Shoot",
    shortDescription:
      "Up to 20 menu items — generated for the ones missing photos, enhanced for the ones you have.",
    longDescription:
      "Best for restaurants with a focused menu (under ~20 items) or those who just want to cover the items most often ordered. We generate photo-realistic images for items without photos and enhance the ones you do have — each built from the recipe and plating notes you send us. Delivered in under 24 hours, channel-formatted for Google, DoorDash, and Uber Eats. One-time price.",
    basePriceCents: 2900,
    rushPriceCents: 4900,
    category: "marketing",
    audience: "audience-a",
    imageSource: "listing_photo",
    promptTemplate:
      "Generate a photo-realistic overhead photograph of: {{itemName}} — {{itemDescription}}. Plating: {{platingNotes}}. Natural daylight, restaurant-grade tableware, fresh ingredients visible. Must match the dish the kitchen serves — no embellishments not in the recipe. Photo-realistic. No text, no watermarks.",
    ctaPrimary: "Shoot my missing items",
    emailSubjectTemplate: "{{shortAddress}} — photos for the menu items you're missing",
    icon: "Sparkles",
  },
  {
    id: "menu-enhance-only",
    name: "Photo Enhance Pass",
    shortDescription:
      "Already have photos for every item? Polish all of them for delivery-app conversion. One-time.",
    longDescription:
      "If you already have a photo for every menu item, this is the cheaper option: we enhance the lighting, contrast, sharpness, and color balance on every photo, and re-export each one in the right aspect ratios for Google, DoorDash, and Uber Eats. No new generation. One-time price covers up to 50 items.",
    basePriceCents: 1900,
    rushPriceCents: 3900,
    category: "marketing",
    audience: "audience-a",
    imageSource: "listing_photo",
    promptTemplate:
      "Enhance this exact photograph of a restaurant menu item. Even out the lighting, increase color saturation in the food without making it look artificial, sharpen textures (sear marks, crumb structure, sauce glisten), warm up the overall color temperature slightly. STRICT: do not change the dish itself, the plate, the garnishes, or the composition. Photo-realistic. No text, no watermarks, no added ingredients that weren't in the source.",
    ctaPrimary: "Enhance my existing photos",
    emailSubjectTemplate: "{{shortAddress}} — your enhanced menu photos inside",
    icon: "Sparkles",
  },
  {
    id: "hero-shot-refresh",
    name: "Hero Shot Refresh",
    shortDescription:
      "Your storefront / cover photo, re-lit and color-graded for Google + delivery apps. One-time.",
    longDescription:
      "The cover photo on your Google Business Profile and DoorDash listing is the single biggest first-impression lever. We take your existing storefront shot and re-light it for warmth, contrast, and crispness — without changing the building, signage, or surroundings. Already included in the Full Menu Shoot; available standalone if you only need the hero refreshed.",
    basePriceCents: 900,
    rushPriceCents: 1900,
    category: "marketing",
    audience: "audience-a",
    imageSource: "exterior_facade",
    promptTemplate:
      "Enhance this exact storefront photograph. Warm golden-hour color grade, increase contrast subtly, sharpen signage legibility, even out shadow areas. STRICT: keep the building, signage text, awnings, windows, and surrounding context identical. Photo-realistic. No text, no watermarks.",
    ctaPrimary: "Refresh my storefront shot",
    emailSubjectTemplate: "{{shortAddress}} — your storefront, refreshed",
    icon: "Building2",
  },
  // ─── Free audit (audience-b: marketplace operators + multi-location ops) ─
  {
    id: "menu-audit-free",
    name: "Free Menu Audit",
    shortDescription:
      "We scan your Google + DoorDash + Uber Eats listings and report every menu item that's missing a photo today.",
    longDescription:
      "Paste your restaurant's name or your aggregator portfolio. We pull your public listings on Google, DoorDash, and Uber Eats, identify every menu item without a photo (the biggest order-conversion gap) plus the ones with weak photos, and email you a coverage report with the exact items costing you orders. Free, no card. The upsell is the Full Menu Shoot — but the audit itself is yours to keep.",
    basePriceCents: 0,
    rushPriceCents: 0,
    category: "marketing",
    audience: "audience-b",
    imageSource: "listing_photo",
    promptTemplate:
      "Generate one photo-realistic teaser image for a single menu item from this restaurant's listing, to demonstrate what the full shoot would deliver. Use the item name + any available description as the recipe brief. Overhead, natural daylight, restaurant-grade tableware. Photo-realistic. No text, no watermarks.",
    ctaPrimary: "Run my free audit",
    emailSubjectTemplate: "{{shortAddress}} — your free menu-photo audit",
    icon: "Sparkles",
  },
];

export const DEFAULT_SERVICE_ID = "menu-shoot-full";

export function getService(id: string): ServiceDefinition | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function requireService(id: string): ServiceDefinition {
  const s = getService(id);
  if (!s) throw new Error(`Unknown service id: ${id}`);
  return s;
}

export function listServices(category?: ServiceDefinition["category"]): ServiceDefinition[] {
  return category ? SERVICES.filter((s) => s.category === category) : SERVICES;
}

/** Services visible to a given audience funnel. "both" services appear in everyone's view. */
export function servicesForAudience(audience: Audience): ServiceDefinition[] {
  if (audience === "both") return SERVICES;
  return SERVICES.filter((s) => s.audience === audience || s.audience === "both");
}

/**
 * Pick the best service for a given restaurant based on photo coverage.
 * Used by the outreach agent to decide what hook to lead the email with.
 *
 * The merchant-template ships this with a real-estate-flavored signature
 * (RoomKind classifications). We keep the signature for platform-code
 * compatibility, but the heuristic is restaurant-specific:
 *
 * - If the restaurant has many menu items with missing/weak photos → full-menu
 * - If only a few items need help → starter
 * - If the storefront cover photo is weak → hero-shot
 *
 * Without classification input we just return the default starter service.
 */
export function pickPrimaryService(
  classifications: { kind: RoomKind; empty: boolean; stagingValue: number }[],
): ServiceDefinition {
  const weakOrMissing = classifications.filter((c) => c.empty || c.stagingValue >= 3).length;
  if (weakOrMissing >= 10) return requireService("menu-shoot-full");
  if (weakOrMissing >= 1) return requireService("menu-shoot-starter");
  return requireService(DEFAULT_SERVICE_ID);
}
