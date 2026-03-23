"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// ===== GAME DATA =====
const FREE_JOBS = [
  { id: "part_time", name: "コンビニバイト", icon: "🏪", baseCost: 10, baseIncome: 0.1, desc: "¥0.1/秒", premium: false },
  { id: "freelance", name: "フリーランス案件", icon: "💻", baseCost: 100, baseIncome: 1, desc: "¥1/秒", premium: false },
  { id: "youtube", name: "YouTubeチャンネル", icon: "🎬", baseCost: 1_000, baseIncome: 8, desc: "¥8/秒", premium: false },
  { id: "blog", name: "アフィリエイトブログ", icon: "📝", baseCost: 8_000, baseIncome: 50, desc: "¥50/秒", premium: false },
  { id: "ebook", name: "電子書籍出版", icon: "📚", baseCost: 50_000, baseIncome: 300, desc: "¥300/秒", premium: false },
  { id: "saas", name: "SaaSプロダクト", icon: "⚙️", baseCost: 300_000, baseIncome: 2_000, desc: "¥2,000/秒", premium: false },
  { id: "investment", name: "不動産投資", icon: "🏢", baseCost: 2_000_000, baseIncome: 15_000, desc: "¥15,000/秒", premium: false },
  { id: "startup", name: "スタートアップ創業", icon: "🚀", baseCost: 15_000_000, baseIncome: 120_000, desc: "¥120,000/秒", premium: false },
] as const;

const PREMIUM_JOBS = [
  { id: "ai_consulting", name: "AIコンサルタント", icon: "🤖", baseCost: 100_000_000, baseIncome: 800_000, desc: "¥800,000/秒", premium: true },
  { id: "crypto", name: "暗号資産運用", icon: "₿", baseCost: 500_000_000, baseIncome: 5_000_000, desc: "¥5,000,000/秒", premium: true },
  { id: "global_ip", name: "海外IPライセンス", icon: "🌍", baseCost: 2_000_000_000, baseIncome: 30_000_000, desc: "¥30,000,000/秒", premium: true },
] as const;

const JOBS = [...FREE_JOBS, ...PREMIUM_JOBS] as const;

type JobId = typeof JOBS[number]["id"];

const CLICK_VALUE_UPGRADES = [
  { id: "mouse1", name: "やる気UP", icon: "💪", cost: 50, mult: 2, desc: "クリック値×2" },
  { id: "mouse2", name: "集中力MAX", icon: "🧠", cost: 500, mult: 5, desc: "クリック値×5" },
  { id: "mouse3", name: "副業スキル習得", icon: "🎯", cost: 5_000, mult: 10, desc: "クリック値×10" },
  { id: "mouse4", name: "経営センス覚醒", icon: "👑", cost: 100_000, mult: 50, desc: "クリック値×50" },
] as const;

const GOAL = 1_000_000;
const PREMIUM_SAVE_KEY = "fukugyo_premium";

function isPremiumUser(): boolean {
  try { return localStorage.getItem(PREMIUM_SAVE_KEY) === "1"; } catch { return false; }
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `¥${(n / 1_000_000_000).toFixed(1)}億`;
  if (n >= 1_000_000) return `¥${(n / 1_000_000).toFixed(2)}万`;
  if (n >= 10_000) return `¥${Math.floor(n / 10_000)}万${Math.floor((n % 10_000) / 1000)}千`;
  if (n >= 1000) return `¥${(n / 1000).toFixed(1)}千`;
  return `¥${Math.floor(n)}`;
}

const SAVE_KEY = "fukugyo_save_v2";

interface Save {
  money: number;
  totalEarned: number;
  clickMult: number;
  jobs: Record<string, number>;
  boughtUpgrades: string[];
}

function loadSave(): Save {
  try {
    const s = localStorage.getItem(SAVE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return { money: 0, totalEarned: 0, clickMult: 1, jobs: {}, boughtUpgrades: [] };
}

export default function FukugyoClicker() {
  const [money, setMoney] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [clickMult, setClickMult] = useState(1);
  const [jobs, setJobs] = useState<Record<string, number>>({});
  const [boughtUpgrades, setBoughtUpgrades] = useState<string[]>([]);
  const [clicks, setClicks] = useState(0);
  const [floats, setFloats] = useState<{ id: number; x: number; y: number; val: number }[]>([]);
  const [showGoal, setShowGoal] = useState(false);
  const [goalShown, setGoalShown] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const floatId = useRef(0);
  const prevTotalRef = useRef(0);

  // Load save
  useEffect(() => {
    const s = loadSave();
    setMoney(s.money);
    setTotalEarned(s.totalEarned);
    setClickMult(s.clickMult);
    setJobs(s.jobs);
    setBoughtUpgrades(s.boughtUpgrades);
    prevTotalRef.current = s.totalEarned;
    if (s.totalEarned >= GOAL) setGoalShown(true);
    setIsPremium(isPremiumUser());
  }, []);

  // Auto-save every 5s
  useEffect(() => {
    const t = setInterval(() => {
      setMoney(m => {
        setTotalEarned(te => {
          localStorage.setItem(SAVE_KEY, JSON.stringify({
            money: m, totalEarned: te, clickMult, jobs, boughtUpgrades
          }));
          return te;
        });
        return m;
      });
    }, 5000);
    return () => clearInterval(t);
  }, [clickMult, jobs, boughtUpgrades]);

  // Income per second
  const incomePerSec = JOBS.reduce((sum, job) => {
    const cnt = jobs[job.id] || 0;
    return sum + job.baseIncome * cnt;
  }, 0);

  // Tick
  useEffect(() => {
    if (incomePerSec === 0) return;
    const t = setInterval(() => {
      const gain = incomePerSec / 20;
      setMoney(m => m + gain);
      setTotalEarned(te => te + gain);
    }, 50);
    return () => clearInterval(t);
  }, [incomePerSec]);

  // Goal check
  useEffect(() => {
    if (!goalShown && totalEarned >= GOAL) {
      setShowGoal(true);
      setGoalShown(true);
    }
  }, [totalEarned, goalShown]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const val = clickMult;
    setMoney(m => m + val);
    setTotalEarned(te => te + val);
    setClicks(c => c + 1);
    const rect = e.currentTarget.getBoundingClientRect();
    const id = floatId.current++;
    setFloats(f => [...f, {
      id, x: e.clientX - rect.left, y: e.clientY - rect.top, val
    }]);
    setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 800);
  }, [clickMult]);

  const jobCost = (jobId: string, base: number) => {
    const cnt = jobs[jobId] || 0;
    return Math.floor(base * Math.pow(1.15, cnt));
  };

  const buyJob = (job: typeof JOBS[number]) => {
    const cost = jobCost(job.id, job.baseCost);
    if (money < cost) return;
    setMoney(m => m - cost);
    setJobs(j => ({ ...j, [job.id]: (j[job.id] || 0) + 1 }));
  };

  const buyUpgrade = (u: typeof CLICK_VALUE_UPGRADES[number]) => {
    if (money < u.cost || boughtUpgrades.includes(u.id)) return;
    setMoney(m => m - u.cost);
    setClickMult(c => c * u.mult);
    setBoughtUpgrades(b => [...b, u.id]);
  };

  const resetGame = () => {
    localStorage.removeItem(SAVE_KEY);
    setMoney(0); setTotalEarned(0); setClickMult(1);
    setJobs({}); setBoughtUpgrades([]); setGoalShown(false); setShowGoal(false);
  };

  // PAY.JP登録後にここを実決済フローに差し替える
  const handlePremiumPurchase = () => {
    localStorage.setItem(PREMIUM_SAVE_KEY, "1");
    setIsPremium(true);
    setShowPremiumModal(false);
  };

  const shareToX = () => {
    const totalJobs = Object.values(jobs).reduce((a, b) => a + b, 0);
    const text = `副業クリッカーで月収${fmt(incomePerSec * 86400 * 30)}達成！\n副業${totalJobs}種類を掛け持ち中💰\n#副業クリッカー #副業 #月収100万\nhttps://fukugyo-clicker.vercel.app`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const progress = Math.min(100, (totalEarned / GOAL) * 100);
  const monthlyIncome = incomePerSec * 86400 * 30;

  return (
    <div className="min-h-screen bg-slate-900 text-white select-none">
      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-3">👑</div>
            <h2 className="text-xl font-black text-white mb-1">プレミアム解放</h2>
            <p className="text-purple-300 text-xs mb-4">超高収益の3つの副業をアンロック</p>
            <ul className="text-left text-sm space-y-2 mb-6">
              {PREMIUM_JOBS.map(j => (
                <li key={j.id} className="flex items-center gap-2 text-purple-100">
                  <span>{j.icon}</span>
                  <span className="font-medium">{j.name}</span>
                  <span className="text-purple-400 text-xs ml-auto">{j.desc}</span>
                </li>
              ))}
            </ul>
            <div className="bg-purple-800/50 rounded-xl p-3 mb-5">
              <div className="text-yellow-400 font-black text-2xl">¥500<span className="text-sm font-normal text-purple-300">/月</span></div>
              <div className="text-purple-400 text-xs mt-1">※ PAY.JP決済（近日対応予定）</div>
            </div>
            <button onClick={handlePremiumPurchase}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black py-3 rounded-xl mb-3 hover:opacity-90 text-sm min-h-[44px]"
              aria-label="プレミアムプランを今すぐ購入してすべての副業を解放する">
              今すぐ解放する（無料お試し中）
            </button>
            <button onClick={() => setShowPremiumModal(false)}
              className="w-full text-purple-400 text-xs py-2 hover:text-purple-300 min-h-[44px]"
              aria-label="プレミアムモーダルを閉じる">
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* Goal Achievement Modal */}
      {showGoal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-white mb-2">月収¥100万達成！</h2>
            <p className="text-white/90 text-sm mb-6">あなたは真の副業マスターになりました！</p>
            <button onClick={shareToX}
              className="w-full bg-black text-white font-bold py-3 rounded-xl mb-3 hover:bg-gray-800 min-h-[44px]"
              aria-label="月収100万円達成をXでシェアする">
              X（Twitter）でシェアする
            </button>
            <button onClick={() => setShowGoal(false)}
              className="w-full bg-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/30 min-h-[44px]"
              aria-label="目標達成モーダルを閉じてプレイを続ける">
              続けてプレイ
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-black text-yellow-400 text-lg">💰 副業クリッカー</span>
          <div className="text-right">
            <div className="text-xs text-slate-400">累計収益</div>
            <div className="font-bold text-yellow-400">{fmt(totalEarned)}</div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Click Area */}
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="bg-slate-800 rounded-2xl p-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xs text-slate-400">所持金</div>
              <div className="font-bold text-green-400 text-sm">{fmt(money)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">月収</div>
              <div className="font-bold text-blue-400 text-sm">{fmt(monthlyIncome)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">クリック値</div>
              <div className="font-bold text-purple-400 text-sm">¥{clickMult}/回</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-800 rounded-2xl p-4">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>月収¥100万達成まで</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="bg-slate-700 rounded-full h-3">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full h-3 transition-all duration-300"
                style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Click Button */}
          <div className="relative flex justify-center">
            <button onClick={handleClick}
              className="relative w-48 h-48 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl hover:scale-105 active:scale-95 transition-transform flex flex-col items-center justify-center"
              aria-label={`クリックして¥${clickMult}稼ぐ`}
              type="button">
              <span className="text-5xl" aria-hidden="true">お金</span>
              <span className="font-black text-white text-sm mt-1">クリック！</span>
              <span className="text-white/80 text-xs">¥{clickMult}/回</span>
              {floats.map(f => (
                <span key={f.id}
                  className="absolute text-yellow-300 font-black text-sm pointer-events-none animate-bounce"
                  style={{ left: f.x, top: f.y, transform: "translate(-50%,-100%)" }}>
                  +¥{f.val}
                </span>
              ))}
            </button>
          </div>

          {/* Click Upgrades */}
          <div className="bg-slate-800 rounded-2xl p-4">
            <h3 className="font-bold text-sm text-slate-300 mb-3">スキルアップグレード</h3>
            <div className="space-y-2">
              {CLICK_VALUE_UPGRADES.map(u => {
                const bought = boughtUpgrades.includes(u.id);
                const canAfford = money >= u.cost;
                return (
                  <button key={u.id} onClick={() => buyUpgrade(u)} disabled={bought || !canAfford}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${bought ? "bg-green-900/30 opacity-50 cursor-default" : canAfford ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-700/50 opacity-40 cursor-default"}`}>
                    <span className="text-2xl">{u.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.desc}</div>
                    </div>
                    <div className={`text-xs font-bold ${bought ? "text-green-400" : canAfford ? "text-yellow-400" : "text-slate-500"}`}>
                      {bought ? "取得済" : fmt(u.cost)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Jobs */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-300">副業一覧</h3>
              <span className="text-xs text-slate-400">{fmt(incomePerSec)}/秒</span>
            </div>
            <div className="space-y-2">
              {JOBS.map(job => {
                const cnt = jobs[job.id] || 0;
                const cost = jobCost(job.id, job.baseCost);
                const canAfford = money >= cost;
                const locked = job.premium && !isPremium;
                if (locked) {
                  return (
                    <button key={job.id} onClick={() => setShowPremiumModal(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left bg-purple-900/30 border border-purple-800/50 hover:bg-purple-900/50 transition-colors">
                      <span className="text-2xl grayscale opacity-60">{job.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-purple-400">🔒 {job.name}</div>
                        <div className="text-xs text-purple-600">{job.desc}</div>
                      </div>
                      <div className="text-xs font-bold text-purple-500">👑 PRO</div>
                    </button>
                  );
                }
                return (
                  <button key={job.id} onClick={() => buyJob(job)}
                    disabled={!canAfford}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${canAfford ? "bg-slate-700 hover:bg-slate-600 active:scale-98" : "bg-slate-700/40 opacity-50 cursor-default"}`}>
                    <span className="text-2xl">{job.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{job.name}</div>
                      <div className="text-xs text-slate-400">{job.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold ${canAfford ? "text-yellow-400" : "text-slate-500"}`}>{fmt(cost)}</div>
                      {cnt > 0 && <div className="text-xs text-green-400">×{cnt}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Premium Banner */}
          {!isPremium && (
            <button onClick={() => setShowPremiumModal(true)}
              className="w-full bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-700 rounded-2xl p-4 text-left hover:border-purple-500 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <div>
                  <div className="text-sm font-bold text-purple-200">プレミアム解放 ¥500/月</div>
                  <div className="text-xs text-purple-400">AIコンサル・暗号資産・海外IPをアンロック</div>
                </div>
                <span className="ml-auto text-purple-400 text-xs">→</span>
              </div>
            </button>
          )}

          {/* Share & Reset */}
          <div className="bg-slate-800 rounded-2xl p-4 space-y-2">
            <button onClick={shareToX}
              className="w-full bg-black text-white font-bold py-2 rounded-xl hover:bg-gray-900 text-sm">
              X（Twitter）でスコアをシェア
            </button>
            <a href="https://fukugyo-advisor-ai.vercel.app"
              target="_blank" rel="noopener noreferrer"
              className="block w-full bg-amber-500 text-white font-bold py-2 rounded-xl hover:bg-amber-600 text-sm text-center">
              AIで本当の副業を見つける →
            </a>
            <button onClick={resetGame}
              className="w-full text-slate-500 text-xs py-1 hover:text-slate-400">
              リセット
            </button>
          </div>

          {/* Stats */}
          <div className="bg-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between"><span>総クリック数</span><span className="text-white">{clicks.toLocaleString()}回</span></div>
            <div className="flex justify-between"><span>副業種類</span><span className="text-white">{Object.keys(jobs).filter(k => (jobs[k] || 0) > 0).length}種類</span></div>
            <div className="flex justify-between"><span>収入/時間</span><span className="text-white">{fmt(incomePerSec * 3600)}</span></div>
          </div>

          {/* Legal Links */}
          <div className="text-center text-xs text-slate-600 space-x-3 pb-2">
            <a href="/legal" className="hover:text-slate-400">特定商取引法</a>
            <span>|</span>
            <a href="/privacy" className="hover:text-slate-400">プライバシーポリシー</a>
          </div>
        </div>
      </div>
    </div>
  );
}
