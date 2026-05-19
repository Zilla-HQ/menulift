import { fal } from "@fal-ai/client";
import { env } from "@/lib/env";

const apiKey = env("FAL_API_KEY");
if (apiKey) {
  fal.config({ credentials: apiKey });
}

// FLUX.1 Kontext — purpose-built for "edit while preserving source structure".
// Stricter on dish geometry than nano-banana, which kept generating different
// dishes when asked to restyle. Model can be overridden per-deployment via
// FAL_PREVIEW_MODEL.
const model = env("FAL_PREVIEW_MODEL", "fal-ai/flux-pro/kontext")!;

export interface FalPreviewResult {
  url: string;
  costCents: number;
}

/**
 * Generate an AI-enhanced menu photo preview from a source photo. Costs
 * ~$0.04-0.08/image on Nano Banana Pro. Throws if FAL_API_KEY is missing
 * (caller should catch and log rather than silent-fail).
 */
export type PreviewMode = "styling" | "enhancement";

export async function generateStagedPreview(args: {
  sourceImageUrl: string;
  styleFragment: string;
  /** Hint for the menu item / dish category — used to phrase the prompt. */
  roomHint?: string;
  /**
   * "styling"     — for amateur phone-shot dishes. Plates the dish on a
   *                 styled surface with garnish, props, soft natural light.
   * "enhancement" — for existing food photos. Pure retouch (lighting,
   *                 color, sharpness, white balance).
   * Defaults to "enhancement" — the safer default.
   */
  mode?: PreviewMode;
  /** Optional override of the service-specific prompt clause. */
  servicePrompt?: string;
}): Promise<FalPreviewResult> {
  if (!apiKey) {
    throw new Error("FAL_API_KEY is not set");
  }

  const mode: PreviewMode = args.mode ?? "enhancement";
  const subject = args.roomHint ?? "menu dish";

  let serviceClause: string;
  let outerWrap: string[];

  if (args.servicePrompt) {
    serviceClause = args.servicePrompt;
    outerWrap = [
      `Edit this exact photograph.`,
      serviceClause,
      "STRICT: keep the dish's ingredients, plating layout, portion size, and camera angle identical to the source. Photo-realistic. No text, no watermarks.",
    ];
  } else if (mode === "styling") {
    // Style the dish for a premium menu shot. ALLOWED: surface, lighting,
    // garnish, props (napkin, cutlery, glassware), background blur, color
    // tone. FORBIDDEN: changing the food itself — recipe, portion, plating
    // structure, ingredients.
    serviceClause = `Re-style this dish photograph as a premium restaurant menu hero. You MAY: replace the surface (warm wood, marble, slate), add subtle props (linen napkin, brushed cutlery, small glass of garnish), refine the natural lighting (soft window-light feel), introduce shallow depth-of-field background blur, and color-grade in the style of: ${args.styleFragment}.`;
    outerWrap = [
      `Re-style this exact ${subject} photograph for a high-end restaurant menu.`,
      serviceClause,
      "ABSOLUTELY DO NOT modify, remove, add, or rearrange any ingredient, garnish on the food itself, sauce, drizzle, portion size, plating layout, or the dish's identity. Every food element must remain in the EXACT same position with the EXACT same shape and color as the source. Same camera angle, same crop.",
      "Photo-realistic restaurant food photography. No text, no watermarks, no logos.",
    ];
  } else {
    // Existing food photo → enhancement. Goal: make the dish look BRIGHTER,
    // SHARPER, and MORE APPETIZING without altering the dish itself.
    serviceClause =
      "Make this dish look bright, sharp, and appetizing for a premium menu. " +
      "DO: warm the lighting toward soft natural daylight, lift shadows, brighten highlights. " +
      "DO: increase color saturation tastefully (greens look greener, sauces glossier, meats more golden). " +
      "DO: sharpen detail on the food surface, balance white balance to neutral-warm. " +
      "DO: clean any visible smudges, fingerprints, or dust on the plate / surface. " +
      "DO: declutter the background — soften or blur distracting items (phone, wallet, takeout container). " +
      "DO NOT: alter the dish itself — ingredients, sauce, garnish, portion, plating layout, color of the food. " +
      "DO NOT: change the camera angle, crop tightly differently, or swap the surface for an obviously different material.";
    outerWrap = [
      `Edit this exact ${subject} photograph as a professional food retoucher would for a premium restaurant menu.`,
      serviceClause,
      "Photo-realistic restaurant food photography. No text, no watermarks, no logos.",
    ];
  }
  const prompt = outerWrap.join(" ");

  const guidanceScale = mode === "styling" ? 2.8 : 3.5;
  const result = (await fal.subscribe(model, {
    input: {
      prompt,
      image_url: args.sourceImageUrl,
      image_urls: [args.sourceImageUrl],
      guidance_scale: guidanceScale,
      num_images: 1,
      output_format: "jpeg",
    },
    logs: false,
  })) as { data?: { images?: { url: string }[] } };

  const url = result.data?.images?.[0]?.url;
  if (!url) {
    throw new Error("fal.ai returned no image");
  }

  return { url, costCents: 6 };
}
