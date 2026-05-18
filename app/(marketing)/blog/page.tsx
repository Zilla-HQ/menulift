import type { Metadata } from "next";
import { BlogIndex } from "@/components/marketing/blog-layout";

export const metadata: Metadata = {
  title: "Restay Journal — Airbnb listing optimization writing",
  description:
    "Specific, falsifiable advice on what's working for Airbnb hosts in 2026. Photos, copy, ranking factors, and policy.",
};

export const dynamic = "force-static";

export default function BlogPage() {
  return <BlogIndex />;
}
