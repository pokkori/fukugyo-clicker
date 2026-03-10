"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import PayjpModal from "@/components/PayjpModal";

const FREE_LIMIT = 3;
const KEY = "fukugyo_count";

type Section = { title: string; icon: string; content: string };
type ParsedResult = { sections: Section[]; raw: string };

function parseResult(text: string): ParsedResult {
  const sectionDefs = [
    { key: "おすすめ副業", icon: "🎯" },
    { key: "30日ロードマップ", icon: "📅" },
    { key: "収益化戦略", icon: "💰" },
    { key: "SNS集客戦略", icon: "📣" },
  ];
  const sections: Section[] = [];
  const parts = text.split(/^---$/m);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const matched = sectionDefs.find(s => trimmed.includes(s.key));
    if (matched) {
      const content = trimmed.replace(/^##\s.*$/m, "").trim();
      sections.push({ title: matched.key, icon: matched.icon, content });
    }
  }
  if (sections.length === 0) sections.push({ title: "診断結果", icon: "📄", content: text });
  return { sections, raw: text };
}

function Paywall({ onClose, onOpenPayjp }: { onClose: () => void; onOpenPayjp: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center">
        <div className="text-3xl mb-3">🎯</div>
        <h2 className="text-lg font-bold mb-2">無料診断回数を使い切りました</h2>
        <p className="text-sm text-gray-500 mb-4">プレミアムプランで副業診断が無制限に</p>
        <ul className="text-xs text-gray-400 text-left mb-5 space-y-1">
          <li>✓ おすすめ副業診断（月収見込み付き）</li>
          <li>✓ 30日間アクションロードマップ</li>
          <li>✓ 収益化戦略・単価設定ガイド</li>
          <li>✓ SNS集客戦略・バズネタ提案</li>
          <li>✓ いつでもキャンセル可能</li>
        </ul>
        <button onClick={onOpenPayjp} className="block w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 mb-3">
          ¥980/月で始める
        </button>
        <button onClick={onClose} className="text-xs text-gray-400">閉じる</button>
      </div>
    </div>
  );
}

function CopyButton({ text, label = "コピー" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors">
      {copied ? "✓ コピー済み" : label}
    </button>
  );
}

function ResultTabs({ parsed }: { parsed: ParsedResult }) {
  const [activeTab, setActiveTab] = useState(0);
  const section = parsed.sections[activeTab];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 flex-wrap">
        {parsed.sections.map((s, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === i ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            <span>{s.icon}</span><span>{s.title}</span>
          </button>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4 min-h-[360px]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">{section.icon} {section.title}</span>
          <CopyButton text={section.content} />
        </div>
        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{section.content}</pre>
      </div>
      <div className="flex gap-2 justify-end">
        <CopyButton text={parsed.raw} label="全文コピー" />
      </div>
    </div>
  );
}

export default function FukugyoTool() {
  const [skills, setSkills] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("5時間程度");
  const [targetIncome, setTargetIncome] = useState("¥3万〜5万");
  const [hasExperience, setHasExperience] = useState("全くない");
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPayjp, setShowPayjp] = useState(false);
  const [error, setError] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setCount(parseInt(localStorage.getItem(KEY) || "0"));
    fetch("/api/auth/status").then(r => r.json()).then(d => setIsPremium(d.premium));
  }, []);

  const isLimit = !isPremium && count >= FREE_LIMIT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimit) { setShowPaywall(true); return; }
    setLoading(true); setParsed(null); setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, hoursPerWeek, targetIncome, hasExperience }),
      });
      if (res.status === 429) { setShowPaywall(true); setLoading(false); return; }
      const data = await res.json();
      if (!res.ok) { setError(data.error || "エラーが発生しました"); setLoading(false); return; }
      const newCount = count + 1;
      localStorage.setItem(KEY, String(newCount));
      setCount(newCount);
      setParsed(parseResult(data.result || ""));
      if (!isPremium && newCount >= FREE_LIMIT) setTimeout(() => setShowPaywall(true), 1500);
    } catch { setError("通信エラーが発生しました。"); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {showPayjp && (
        <PayjpModal
          publicKey={process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY!}
          planLabel="副業アドバイザーAI プレミアム ¥980/月（いつでもキャンセル可）"
          onSuccess={() => { setShowPayjp(false); setShowPaywall(false); setIsPremium(true); }}
          onClose={() => setShowPayjp(false)}
        />
      )}
      {showPaywall && <Paywall onClose={() => setShowPaywall(false)} onOpenPayjp={() => { setShowPaywall(false); setShowPayjp(true); }} />}
      <nav className="bg-white border-b px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">🎯 AI副業アドバイザー</Link>
          <span className={`text-xs px-3 py-1 rounded-full ${isPremium ? "bg-amber-100 text-amber-600" : isLimit ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
            {isPremium ? "プレミアム" : isLimit ? "無料枠終了" : `無料あと${FREE_LIMIT - count}回`}
          </span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">あなたの情報を入力</h1>
            <p className="text-sm text-gray-500 mt-1">スキルと時間から、最適な副業とロードマップを生成します。</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              あなたのスキル・経験 <span className="text-red-500">*</span>
            </label>
            <textarea value={skills} onChange={e => setSkills(e.target.value)} rows={5} required
              placeholder={"例:\n・Excel・Wordは使える\n・料理が得意\n・英語は日常会話レベル\n・文章を書くのが好き\n・Webデザインを少し勉強したことがある"}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
            <p className="text-xs text-gray-400 mt-1">詳しく書くほど精度が上がります（{skills.length}文字）</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">週に使える時間</label>
            <select value={hoursPerWeek} onChange={e => setHoursPerWeek(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              {["3時間以内", "5時間程度", "10時間程度", "20時間以上"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">月の目標収入</label>
            <select value={targetIncome} onChange={e => setTargetIncome(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              {["¥1万〜3万", "¥3万〜5万", "¥5万〜10万", "¥10万以上"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">副業経験</label>
            <div className="flex gap-2">
              {["全くない", "少しある", "経験あり"].map(opt => (
                <button key={opt} type="button" onClick={() => setHasExperience(opt)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${hasExperience === opt ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-700 border-gray-300 hover:border-amber-400"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading || !skills.trim()}
            className={`w-full font-bold py-3 rounded-lg text-white transition-colors ${isLimit ? "bg-orange-500 hover:bg-orange-600" : "bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300"}`}>
            {loading ? "診断中..." : isLimit ? "プレミアムで無制限に診断" : "副業を診断する（無料）"}
          </button>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </form>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">診断結果</label>
          {loading ? (
            <div className="flex-1 bg-white border border-gray-200 rounded-xl flex items-center justify-center min-h-[420px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">AIが副業を診断しています...</p>
                <p className="text-xs text-gray-400 mt-2">🎯 副業診断 → 📅 ロードマップ → 💰 収益化戦略</p>
              </div>
            </div>
          ) : parsed ? (
            <ResultTabs parsed={parsed} />
          ) : (
            <div className="flex-1 bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center min-h-[420px] gap-3">
              <div className="text-4xl">🎯</div>
              <p className="text-sm text-center font-medium text-gray-500">情報を入力して<br />「副業を診断する」を押してください</p>
              <div className="bg-gray-50 rounded-lg p-4 text-xs space-y-2 w-full max-w-[260px]">
                <p className="font-semibold text-gray-600">生成される内容：</p>
                <p className="text-gray-500">🎯 おすすめ副業3選（月収見込み付き）</p>
                <p className="text-gray-500">📅 30日間アクションロードマップ</p>
                <p className="text-gray-500">💰 収益化戦略・単価設定ガイド</p>
                <p className="text-gray-500">📣 SNS集客戦略・バズネタ提案</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center py-6 text-xs text-gray-400 border-t mt-4 space-x-4">
        <a href="/legal" className="hover:text-gray-600">特定商取引法に基づく表記</a>
        <span>·</span>
        <a href="/privacy" className="hover:text-gray-600">プライバシーポリシー</a>
      </footer>
    </main>
  );
}
