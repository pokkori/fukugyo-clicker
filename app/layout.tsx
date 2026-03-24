import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://fukugyo-advisor-ai.vercel.app";
const TITLE = "副業クリッカー | クリックして月収¥100万を目指せ！";
const DESC = "サラリーマンから起業家へ。クリックして副業を積み上げ、月収¥100万を目指すクリッカーゲーム。無料プレイ・Xでスコアシェア可能。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  openGraph: {
    title: TITLE,
    description: DESC,
    url: SITE_URL,
    siteName: "副業クリッカー",
    locale: "ja_JP",
    type: "website",
    images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: "副業クリッカー" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: [`${SITE_URL}/og.png`],
  },
  metadataBase: new URL(SITE_URL),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "副業クリッカー",
  "description": "サラリーマンから起業家へ。クリックして副業を積み上げ、月収¥100万を目指すクリッカーゲーム。",
  "url": "https://fukugyo-advisor-ai.vercel.app",
  "genre": ["Clicker", "Idle"],
  "applicationCategory": "Game",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
