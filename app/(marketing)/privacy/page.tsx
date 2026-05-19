export const metadata = { title: "Privacy Policy — MenuLift" };

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: May 2026</p>

      <div className="prose prose-slate mt-8 max-w-none space-y-4 text-[15px] leading-7">
        <h2 className="mt-6 text-xl font-semibold">What we collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <b>Restaurant data</b> — your restaurant name, public listing URLs (Google
            Business Profile, DoorDash, Uber Eats, your website), menu items, recipes, and
            plating notes you share with us so we can produce your photos.
          </li>
          <li>
            <b>Customer data</b> — email, restaurant address, and payment metadata when you
            subscribe through Stripe.
          </li>
          <li>
            <b>Email engagement</b> — opens, clicks, replies, bounces, and unsubscribe
            actions tied to messages we send you.
          </li>
          <li>
            <b>Usage analytics</b> — aggregated, non-identifying page views collected via
            PostHog.
          </li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">How we use it</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Generate and enhance menu photography and deliver paid orders.</li>
          <li>Send transactional and marketing emails about MenuLift.</li>
          <li>Improve our pipeline and detect fraud or abuse.</li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">Subprocessors</h2>
        <p>We share data with the following subprocessors strictly to operate the service:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Vercel — hosting</li>
          <li>Supabase — database</li>
          <li>Stripe — payments</li>
          <li>Resend — email delivery</li>
          <li>Cloudflare R2 — image storage</li>
          <li>Anthropic, fal.ai, OpenAI — AI inference (image generation, recipe interpretation, copy)</li>
          <li>PostHog — analytics</li>
          <li>Inngest — workflow orchestration</li>
          <li>Clerk — admin auth (MenuLift operators only)</li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">Retention</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Source photos and recipe briefs: retained for the life of your subscription so we can re-shoot or revise on request.</li>
          <li>Generated and enhanced photos: retained for the life of your account so you can re-download.</li>
          <li>Email engagement records: retained for 24 months for deliverability analysis.</li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">Your choices</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <b>Unsubscribe</b> — every email we send includes a one-click unsubscribe
            link. Once you unsubscribe we won't email you again.
          </li>
          <li>
            <b>Deletion</b> — email{" "}
            <a href="mailto:hello@menulift.app" className="text-primary hover:underline">
              hello@menulift.app
            </a>{" "}
            from the address on file to request deletion of all data associated with your
            restaurant. We delete within 30 days.
          </li>
          <li>
            <b>California / GDPR rights</b> — California residents and EU residents have
            the right to access, correct, or delete personal data we hold about them. Use
            the contact email above and we will respond within 30 days.
          </li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">Contact</h2>
        <p>
          <a href="mailto:hello@menulift.app" className="text-primary hover:underline">
            hello@menulift.app
          </a>
        </p>
      </div>
    </div>
  );
}
