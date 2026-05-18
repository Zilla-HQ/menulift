import type { RoomKind } from "@/lib/room-classify";

/**
 * A "service" is one transform MenuLift can offer on a restaurant's
 * existing menu photography. Adding a service is just adding an entry
 * here — the preview pipeline reads `promptTemplate` and `imageSource`
 * to know what to do.
 *
 * MenuLift positioning: we ENHANCE existing photos with AI (sharper,
 * brighter, more appetizing). We do not fabricate dishes that don't
 * exist or replace photos wholesale. That distinction matters for
 * platform-policy compliance on Google Business Profile, DoorDash, and
 * Uber Eats — and it's the marketing wedge against generic AI image
 * tools.
 */

export type ImageSource =
  | "listing_photo" // a menu-item photo the restaurant already has (we re-use the field name)
  | "satellite_tile" // unused for MenuLift — kept so platform code compiles
  | "exterior_facade"; // the storefront / cover photo

// Audience is the union of the template's two generic placeholders
// (audience-a / audience-b — kept so the stubbed FAQ + services-grid in
// components/marketing/* still typecheck for new merchants) and the
// vertical-specific audiences mirrored from the Relist reference build
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
  // ─── Menu photo enhancement (paid — restaurant-side) ────────────────────
  // Pricing anchor: $40-90/mo SaaS. We charge per-batch through Stripe
  // Checkout (template architecture) at $59 / $89 / $139 price points; the
  // recurring framing is handled in the marketing copy + Stripe metadata.
  {
    id: "menu-enhance-starter",
    name: "Menu Enhance — Starter",
    shortDescription:
      "Up to 15 dish photos enhanced — brighter, sharper, more appetizing. Under 24 hours.",
    longDescription:
      "Send us your existing menu photos (Google Business Profile, your website, or phone-shot). We enhance every one with AI: even lighting, color balance, sharper texture, contextual props. Delivered back as upload-ready files for Google, DoorDash, and Uber Eats. No reshoot, no food stylist, no AI fabrication — your real dishes, made to look like they should.",
    basePriceCents: 5900,
    rushPriceCents: 9900,
    category: "marketing",
    audience: "audience-a",
    imageSource: "listing_photo",
    promptTemplate:
      "Enhance this exact photograph of a restaurant menu item. Even out the lighting, increase color saturation in the food without making it look artificial, sharpen textures (sear marks, crumb structure, sauce glisten), warm up the overall color temperature slightly, add subtle depth-of-field if missing. STRICT: do not change the dish itself, the plate, the garnishes, or the composition. Photo-realistic. No text, no watermarks, no added ingredients that weren't in the source.",
    ctaPrimary: "Enhance my menu",
    emailSubjectTemplate: "{{shortAddress}} — your enhanced menu photos inside",
    icon: "Sparkles",
  },
  {
    id: "menu-enhance-full",
    name: "Menu Enhance — Full Menu",
    shortDescription:
      "Every dish on your menu, enhanced and channel-formatted for Google + DoorDash + Uber Eats.",
    longDescription:
      "Full-menu pass: we pull every dish photo you have, enhance each one, and deliver per-channel exports (Google Business Profile square, DoorDash 1400×800, Uber Eats 2000×1333). Includes one revision round. Under 48 hours.",
    basePriceCents: 8900,
    rushPriceCents: 13900,
    category: "marketing",
    audience: "audience-a",
    imageSource: "listing_photo",
    promptTemplate:
      "Enhance this exact photograph of a restaurant menu item. Even lighting, color-balanced for food appeal (warmer tones), sharpen surface texture, glisten on sauces and oils, subtle background softening. STRICT: do not alter the dish, plating, or garnish. Photo-realistic. No text, no watermarks.",
    ctaPrimary: "Enhance my full menu",
    emailSubjectTemplate: "{{shortAddress}} — full-menu enhancement inside",
    icon: "Sparkles",
  },
  {
    id: "hero-shot-refresh",
    name: "Hero Shot Refresh",
    shortDescription:
      "Your storefront / cover photo, re-lit and color-graded for Google + delivery apps.",
    longDescription:
      "The cover photo on your Google Business Profile and DoorDash listing is the single biggest conversion lever. We take your existing storefront shot and re-light it for warmth, contrast, and crispness — without changing the building, signage, or surroundings.",
    basePriceCents: 3900,
    rushPriceCents: 6900,
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
  // Free menu audit → upgrade to paid enhancement. Audience-b = aggregators
  // or multi-location managers who want a coverage report across many
  // restaurants. Monetized via per-location enhancement upsell.
  {
    id: "menu-audit-free",
    name: "Free Menu Audit",
    shortDescription:
      "We scan your Google + DoorDash + Uber Eats listings and report missing or low-quality menu photos.",
    longDescription:
      "Paste your restaurant's name or your aggregator portfolio. We pull your public listings on Google, DoorDash, and Uber Eats, score every menu item's photo (missing / low-quality / good), and email you a coverage report with the specific items that are costing you orders. Free, no card. The upsell is our paid enhancement service — but the audit itself is yours to keep.",
    basePriceCents: 0,
    rushPriceCents: 0,
    category: "marketing",
    audience: "audience-b",
    imageSource: "listing_photo",
    promptTemplate:
      "Enhance this exact menu-item photograph as a teaser preview. Brighten, sharpen, color-correct for food appeal. STRICT: do not alter the dish itself. Photo-realistic.",
    ctaPrimary: "Run my free audit",
    emailSubjectTemplate: "{{shortAddress}} — your free menu-photo audit",
    icon: "Sparkles",
  },
];

export const DEFAULT_SERVICE_ID = "menu-enhance-starter";

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
  const weakItemCount = classifications.filter((c) => c.empty || c.stagingValue >= 3).length;
  if (weakItemCount >= 10) return requireService("menu-enhance-full");
  if (weakItemCount >= 1) return requireService("menu-enhance-starter");
  return requireService(DEFAULT_SERVICE_ID);
}
