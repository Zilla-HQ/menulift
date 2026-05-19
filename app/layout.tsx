import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "MenuLift — AI menu photo enhancement for restaurants",
  description:
    "A photo for every dish on your menu — created for the items you don't have shot, enhanced for the ones you do. Upload-ready for Google, DoorDash, Uber Eats. From $149 one-time, no subscription.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Only wrap in ClerkProvider when a key is configured. This lets the build
  // succeed in environments without Clerk credentials — the admin routes will
  // fail-open at request time in that case (middleware still gates them).
  const clerkPk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const body = <body>{children}</body>;

  if (!clerkPk) {
    return (
      <html lang="en">
        {body}
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en">{body}</html>
    </ClerkProvider>
  );
}
