import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "副業クリッカー | クリックして月収¥100万を目指せ！";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        {/* Gold top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "#f59e0b" }} />

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 96, lineHeight: 1 }}>$</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: "#fbbf24", letterSpacing: "-2px" }}>
            副業クリッカー
          </div>
          <div style={{ fontSize: 28, color: "#94a3b8", fontWeight: 700 }}>
            クリックして月収 ¥100万 を目指せ！
          </div>
          <div
            style={{
              marginTop: 24,
              background: "linear-gradient(135deg, #f59e0b, #f97316)",
              borderRadius: 16,
              padding: "12px 40px",
              fontSize: 24,
              fontWeight: 900,
              color: "#fff",
            }}
          >
            今すぐ無料プレイ
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 20,
            color: "rgba(148,163,184,0.6)",
          }}
        >
          fukugyo-clicker.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
