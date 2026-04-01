import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

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
  other: { "theme-color": "#0f172a" },
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
      <body className={`${notoSansJP.className} text-slate-100 antialiased`}>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? 'ca-pub-XXXXXXXX'}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {children}
        <footer className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
          <nav className="flex gap-6 justify-center" aria-label="フッターナビゲーション">
            <a href="/legal" aria-label="特定商取引法に基づく表記" className="hover:text-gray-300 transition-colors">特商法</a>
            <a href="/privacy" aria-label="プライバシーポリシー" className="hover:text-gray-300 transition-colors">プライバシー</a>
            <a href="/terms" aria-label="利用規約" className="hover:text-gray-300 transition-colors">利用規約</a>
          </nav>
          <p className="mt-3">&copy; 2026 ポッコリラボ</p>
        </footer>
      </body>
    </html>
  );
}
