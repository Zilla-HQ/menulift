export const metadata = { title: "Terms of Service — MenuLift" };

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: May 2026</p>

      <div className="prose prose-slate mt-8 max-w-none space-y-4 text-[15px] leading-7">
        <h2 className="mt-6 text-xl font-semibold">1. Who we are</h2>
        <p>
          MenuLift ("MenuLift", "we", "us") produces AI-generated and AI-enhanced menu
          photography for restaurants. By using our service, requesting an audit, or paying
          for a subscription, you agree to these Terms.
        </p>

        <h2 className="mt-6 text-xl font-semibold">2. Eligibility</h2>
        <p>
          You may use MenuLift if you are an owner, operator, or authorized representative
          of a restaurant — and have the right to direct production of photography for the
          dishes on your menu and to upload that photography to your public listings.
        </p>

        <h2 className="mt-6 text-xl font-semibold">3. Service description</h2>
        <p>
          MenuLift produces two kinds of photo output: (a) AI-generated photos for menu
          items that do not have an existing photo, built from the recipe + plating brief
          you provide; and (b) AI-enhanced versions of photos you supply. See our{" "}
          <a href="/disclosure" className="text-primary hover:underline">
            Photo Disclosure
          </a>{" "}
          for the accuracy commitment we hold ourselves to.
        </p>
        <p>
          <b>Every delivered photo is digitally produced.</b> You are responsible for
          confirming each photo accurately represents what your kitchen serves before
          uploading to Google, DoorDash, Uber Eats, or any other platform.
        </p>

        <h2 className="mt-6 text-xl font-semibold">4. Subscriptions and payment</h2>
        <p>
          MenuLift is sold as a monthly subscription via Stripe. Pricing tiers are shown on
          our pricing page. You authorize us to charge the payment method you provide on a
          recurring basis until you cancel. You may cancel at any time, effective at the
          end of the current billing period.
        </p>
        <p>
          Each billing period includes a defined number of items per the tier you selected
          (generated + enhanced combined). Unused items do not roll over.
        </p>

        <h2 className="mt-6 text-xl font-semibold">5. Revisions and refunds</h2>
        <p>
          Unlimited revisions are included within 7 days of delivery. If a delivered photo
          does not accurately represent the dish your kitchen serves, we will re-shoot at
          no charge. If we cannot deliver an accurate photo after two revision rounds, we
          will refund that item.
        </p>
        <p>
          Full refunds are available within 14 days of your first payment if no photos have
          been delivered. After delivery begins, refunds are pro-rated for unused items.
        </p>

        <h2 className="mt-6 text-xl font-semibold">6. Ownership and license</h2>
        <p>
          You retain all rights in the recipes, plating notes, and source photos you
          submit. The photos MenuLift delivers are yours to use in connection with the
          restaurant — on Google Business Profile, delivery marketplaces, your website,
          social media, and print marketing — for the life of the restaurant. You may not
          re-sell or sub-license the photos to a third party who is not operating the
          restaurant.
        </p>
        <p>
          You agree we may use anonymized examples of our work (no recognizable restaurant
          name or location) for marketing the MenuLift service.
        </p>

        <h2 className="mt-6 text-xl font-semibold">7. Acceptable use</h2>
        <p>You will not:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Submit recipes, photos, or plating notes you do not have the right to use.</li>
          <li>
            Upload a MenuLift photo that does not accurately represent the dish your
            kitchen actually serves at the time of upload.
          </li>
          <li>Use the service to misrepresent ingredients, portion sizes, or sourcing.</li>
          <li>Reverse-engineer or scrape MenuLift's pipeline.</li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">8. Disclaimers</h2>
        <p>
          The service is provided "as is". AI-generated photos are produced from the brief
          you provide. We make no warranty that the service will be uninterrupted or
          error-free, or that any specific photo will be approved by any third-party
          marketplace (Google, DoorDash, Uber Eats, etc.).
        </p>

        <h2 className="mt-6 text-xl font-semibold">9. Limitation of liability</h2>
        <p>
          Our aggregate liability under these Terms is limited to the amount you paid in
          the trailing 6 months. We are not liable for indirect, incidental, or
          consequential damages — including lost orders, lost revenue, or marketplace
          listing suspensions.
        </p>

        <h2 className="mt-6 text-xl font-semibold">10. Governing law</h2>
        <p>
          These Terms are governed by the laws of the State of Delaware. Any dispute will
          be brought exclusively in the state or federal courts located in Delaware.
        </p>

        <h2 className="mt-6 text-xl font-semibold">11. Contact</h2>
        <p>
          Questions:{" "}
          <a href="mailto:hello@menulift.app" className="text-primary hover:underline">
            hello@menulift.app
          </a>
        </p>
      </div>
    </div>
  );
}
