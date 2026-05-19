import { ImageResponse } from "next/og";

/**
 * Site-wide default Open Graph + Twitter card image. Generated on
 * the edge — no static asset to manage.
 */
export const runtime = "edge";
export const alt = "MenuLift — A photo for every dish on your menu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "70px 80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            M
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em" }}>
            MenuLift
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 1000,
            }}
          >
            Don't leave money on the table.<br />
            <span style={{ color: "#f59e0b" }}>A photo for every dish</span> on your menu.
          </div>
          <div style={{ fontSize: 26, color: "#94a3b8", maxWidth: 1000 }}>
            Created for the items you don't have shot · enhanced for the ones you do · delivered in under 48 hours.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            color: "#cbd5e1",
          }}
        >
          <div
            style={{
              padding: "8px 16px",
              background: "#f59e0b",
              color: "#0f172a",
              borderRadius: 8,
              fontWeight: 800,
            }}
          >
            $29
          </div>
          <div>One-time per shoot · no subscription · menulift.app</div>
        </div>
      </div>
    ),
    size,
  );
}
