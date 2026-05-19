import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { SERVICES } from "@/lib/services";

const BASE = env("NEXT_PUBLIC_APP_URL", "https://menulift.app")!;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1.0, lastModified: now },
    { url: `${BASE}/audit`, changeFrequency: "weekly", priority: 0.95, lastModified: now },
    { url: `${BASE}/services`, changeFrequency: "monthly", priority: 0.7, lastModified: now },
    { url: `${BASE}/disclosure`, changeFrequency: "yearly", priority: 0.3, lastModified: now },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2, lastModified: now },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2, lastModified: now },
  ];

  const serviceDetails: MetadataRoute.Sitemap = SERVICES.map((s) => ({
    url: `${BASE}/services/${s.id}`,
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: now,
  }));

  return [...staticPages, ...serviceDetails];
}
