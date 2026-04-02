import Link from "next/link";

const ITEMS = [
  { label: "販売業者", value: "ポッコリラボ" },
  { label: "運営責任者", value: "ポッコリラボ 代表 新美諭" },
  { label: "所在地", value: "非公開（請求があれば遅滞なく開示します）" },
  { label: "電話番号", value: "非公開（請求があれば遅滞なく開示します）" },
  { label: "お問い合わせ", value: "X(Twitter) @levona_design へのDM" },
  { label: "販売価格", value: "プレミアムプラン ¥500/月（税込）" },
  { label: "支払方法", value: "クレジットカード（Visa・Mastercard・American Express・JCB）" },
  { label: "支払時期", value: "お申込み時に即時決済。以降、毎月同日に自動更新" },
  { label: "サービス提供時期", value: "決済完了後、即時ご利用いただけます" },
  { label: "返品・キャンセル", value: "デジタルコンテンツの性質上、決済完了後の返金は承っておりません。解約はいつでもマイページより行えます。解約後は次回更新日まで引き続きご利用いただけます" },
  { label: "動作環境", value: "インターネット接続環境および最新版ブラウザが必要です" },
];

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-200">← トップに戻る</Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-white mb-2">特定商取引法に基づく表記</h1>
        <p className="text-gray-500 text-sm mb-8">Act on Specified Commercial Transactions</p>
        <dl className="space-y-4">
          {ITEMS.map((item) => (
            <div key={item.label} className="border-b border-gray-800 pb-4">
              <dt className="text-sm font-semibold text-gray-400 mb-1">{item.label}</dt>
              <dd className="text-gray-200 text-sm leading-relaxed">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
