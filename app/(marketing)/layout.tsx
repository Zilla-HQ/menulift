import { Footer } from "@/components/marketing/footer";
import { MetaPixel } from "@/components/marketing/meta-pixel";
import { PostHogProvider } from "@/components/marketing/posthog-provider";
import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PostHogProvider />
      <MetaPixel />
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            MenuLift
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/#how" className="text-muted-foreground hover:text-foreground">
              How it works
            </Link>
            <Link href="/#pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/services" className="text-muted-foreground hover:text-foreground">
              Services
            </Link>
            <Link href="/audit" className="font-semibold text-amber-700 hover:underline">
              Free audit
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
