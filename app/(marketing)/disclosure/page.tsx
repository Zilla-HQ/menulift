export const dynamic = "force-static";
export const metadata = {
  title: "Photo disclosure — MenuLift",
  description:
    "How MenuLift produces menu photography for restaurants — generation, enhancement, and our accuracy guarantee.",
};

export default function DisclosurePage() {
  return (
    <section className="container max-w-3xl py-16">
      <h1 className="text-4xl font-bold tracking-tight">Photo disclosure.</h1>
      <p className="mt-4 text-muted-foreground">
        How MenuLift produces the photos delivered to your restaurant — and the accuracy
        commitment we hold ourselves to.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold">How photos are produced</h2>
          <p className="mt-2 text-muted-foreground">
            MenuLift delivers two kinds of menu photography:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">Generated:</span> for menu items
              that do not have an existing photo, we use AI image generation to produce a
              photo-realistic image based on the recipe, ingredients, plating direction, and
              brand notes provided by the restaurant.
            </li>
            <li>
              <span className="font-semibold text-foreground">Enhanced:</span> for menu items
              the restaurant already has a photo of, we apply AI-assisted enhancement
              (lighting, contrast, color balance, sharpness) to the source image. The dish,
              plating, and composition remain those of the original photo.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold">Accuracy commitment</h2>
          <p className="mt-2 text-muted-foreground">
            Every photo MenuLift delivers must represent the actual dish the restaurant
            serves. Specifically:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>No ingredients are added to a generated photo that are not in the recipe.</li>
            <li>Portion sizes match what the kitchen plates.</li>
            <li>No decorative styling that the kitchen does not perform on the actual dish.</li>
            <li>No stock photography is used. No photos of dishes from other restaurants.</li>
            <li>
              Generated photos are produced from the restaurant's own recipe + plating brief.
              Enhanced photos preserve the dish in the source photo.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold">Restaurant review</h2>
          <p className="mt-2 text-muted-foreground">
            Every batch is sent to the restaurant for review before upload. The restaurant
            may request unlimited revisions within 7 days of delivery if a photo does not
            represent the dish accurately. MenuLift will not invoice for batches where the
            restaurant flags every photo as inaccurate.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold">Platform compliance</h2>
          <p className="mt-2 text-muted-foreground">
            MenuLift's accuracy commitment is designed to align with the content policies of
            Google Business Profile, DoorDash, Uber Eats, and similar marketplaces, all of
            which prohibit misleading food imagery. Restaurants are responsible for
            confirming that any uploaded photo accurately represents what is served to the
            ordering guest at the time of upload.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">Last updated: May 2026.</p>
      </div>
    </section>
  );
}
