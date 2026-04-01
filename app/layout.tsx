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

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "このゲームは無料ですか？",
      "acceptedAnswer": { "@type": "Answer", "text": "はい、基本プレイは完全無料です。クリックして副業を積み上げ、月収¥100万を目指すコアゲームプレイはすべて無料でお楽しみいただけます。プレミアムプランに登録すると、AIコンサルタント・暗号資産運用・海外IPライセンスの上位副業3種と、オフライン収益機能がアンロックされます（¥500/月）。" }
    },
    {
      "@type": "Question",
      "name": "月収100万円は本当に達成できますか？",
      "acceptedAnswer": { "@type": "Answer", "text": "副業クリッカーはブラウザゲームです。ゲーム内の「月収¥100万」はゲーム内の仮想通貨による達成目標であり、現実の収入を保証するものではありません。ゲームを通じて副業への興味を高め、本サイトのAI副業診断ツールで現実の副業選択にお役立てください。" }
    },
    {
      "@type": "Question",
      "name": "スコアはどうやってシェアしますか？",
      "acceptedAnswer": { "@type": "Answer", "text": "画面右側の「X（Twitter）でスコアをシェア」ボタンを押すと、現在の月収・副業種類数などをXに投稿できます。また、月収¥100万を達成すると目標達成モーダルが表示され、そこからもシェア可能です。" }
    },
    {
      "@type": "Question",
      "name": "副業の種類は何種類ありますか？",
      "acceptedAnswer": { "@type": "Answer", "text": "無料プランでコンビニバイト・フリーランス案件・YouTubeチャンネル・アフィリエイトブログ・電子書籍出版・SaaSプロダクト・不動産投資・スタートアップ創業の8種類が利用できます。プレミアムプランではさらにAIコンサルタント・暗号資産運用・海外IPライセンスの3種類が追加され、合計11種類になります。" }
    },
    {
      "@type": "Question",
      "name": "セーブデータはどこに保存されますか？",
      "acceptedAnswer": { "@type": "Answer", "text": "セーブデータはお使いのブラウザのローカルストレージに保存されます。サーバーには送信されないため、ブラウザのデータを削除したり別のブラウザ・端末でアクセスしたりすると引き継ぎはできません。" }
    },
    {
      "@type": "Question",
      "name": "ゲームを閉じている間も収益は増えますか？",
      "acceptedAnswer": { "@type": "Answer", "text": "プレミアムプランに登録すると、ゲームを閉じているオフライン中も最大12時間分の収益が自動的にたまります。翌朝ゲームを開くと、オフライン中に積み上がった収益をまとめて受け取れます。無料プランではオフライン収益は加算されません。" }
    },
    {
      "@type": "Question",
      "name": "BGMはオフにできますか？",
      "acceptedAnswer": { "@type": "Answer", "text": "はい、画面右上のスピーカーアイコンをクリックするとBGMのオン/オフを切り替えられます。音が出せない環境でも安心してプレイできます。" }
    },
    {
      "@type": "Question",
      "name": "連続プレイのボーナスはありますか？",
      "acceptedAnswer": { "@type": "Answer", "text": "毎日プレイするとストリーク（連続プレイ日数）が記録されます。一定日数を達成するとヘッダーにストリーク日数が表示され、マイルストーンメッセージが表示されます。" }
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
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
