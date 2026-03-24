import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約｜副業クリッカー",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" aria-label="トップページに戻る" className="text-sm text-gray-400 hover:text-gray-200">
            ← トップに戻る
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-white mb-8">利用規約</h1>

        <p className="text-sm text-gray-500 mb-8">最終更新日：2026年3月</p>

        <section className="space-y-8 text-sm text-gray-300 leading-relaxed">
          <div>
            <h2 className="font-bold text-white mb-2">第1条（適用）</h2>
            <p>本規約は、ポッコリラボ（以下「当社」）が提供するWebサービス「副業クリッカー」（以下「本サービス」）の利用条件を定めるものです。ユーザーは本規約に同意の上、本サービスをご利用ください。</p>
          </div>

          <div>
            <h2 className="font-bold text-white mb-2">第2条（利用登録）</h2>
            <p>本サービスは登録不要で無料プレイが可能です。プレミアムプランへの加入には決済情報の入力が必要です。</p>
          </div>

          <div>
            <h2 className="font-bold text-white mb-2">第3条（料金・決済）</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>プレミアムプラン：¥500/月（税込）</li>
              <li>決済はクレジットカードにて行います（PAY.JP経由）</li>
              <li>毎月同日に自動更新されます</li>
              <li>デジタルコンテンツの性質上、決済完了後の返金は原則承っておりません</li>
              <li>解約はいつでも可能です。解約後は次回更新日まで引き続きご利用いただけます</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-white mb-2">第4条（禁止事項）</h2>
            <p>ユーザーは以下の行為を行ってはなりません。</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>本サービスの不正利用・改ざん・リバースエンジニアリング</li>
              <li>他のユーザーまたは第三者への迷惑行為</li>
              <li>法令または公序良俗に反する行為</li>
              <li>当社の著作権・知的財産権を侵害する行為</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-white mb-2">第5条（サービスの変更・停止）</h2>
            <p>当社は、ユーザーへの事前通知なしに本サービスの内容変更、一時停止、または終了を行うことができます。これによりユーザーに生じた損害について、当社は一切の責任を負いません。</p>
          </div>

          <div>
            <h2 className="font-bold text-white mb-2">第6条（免責事項）</h2>
            <p>本サービスは現状有姿で提供されます。当社は本サービスの完全性・正確性・有用性を保証せず、利用に起因する損害について責任を負いません。</p>
          </div>

          <div>
            <h2 className="font-bold text-white mb-2">第7条（著作権）</h2>
            <p>本サービスに含まれるコンテンツ（テキスト・画像・プログラム等）の著作権は当社に帰属します。無断転載・複製を禁じます。</p>
          </div>

          <div>
            <h2 className="font-bold text-white mb-2">第8条（準拠法・管轄裁判所）</h2>
            <p>本規約は日本法に準拠します。本サービスに関する紛争は、当社所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。</p>
          </div>

          <div>
            <h2 className="font-bold text-white mb-2">お問い合わせ</h2>
            <p>屋号：ポッコリラボ／運営責任者：ポッコリラボ 代表 新美／お問い合わせ：X(Twitter) @levona_design へのDM</p>
          </div>
        </section>
      </article>
    </main>
  );
}
