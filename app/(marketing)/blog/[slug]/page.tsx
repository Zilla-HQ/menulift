import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS, findPost } from "@/lib/blog";
import { PostShell } from "@/components/marketing/blog-layout";
import { POST_BODIES } from "@/components/marketing/blog-bodies";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return { title: "Not found — Restay Journal" };
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://restay.agency";
  const ogParams = new URLSearchParams({
    title: post.title,
    category: post.category,
    minutes: String(post.readingMinutes),
  });
  const ogUrl = `${base}/blog-og?${ogParams.toString()}`;
  return {
    title: `${post.title} — Restay Journal`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogUrl],
    },
  };
}

export const dynamic = "force-static";

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();
  const Body = POST_BODIES[slug];
  if (!Body) notFound();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://restay.agency";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "Restay",
      url: base,
    },
    publisher: {
      "@type": "Organization",
      name: "Restay",
      url: base,
    },
    mainEntityOfPage: `${base}/blog/${post.slug}`,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <PostShell post={post}>
        <Body />
      </PostShell>
    </>
  );
}
