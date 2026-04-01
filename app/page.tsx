"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { updateStreak, loadStreak, getStreakMilestoneMessage, type StreakData } from "@/lib/streak";
import OrbBackground from "@/components/OrbBackground";
import { useClickerBGM } from "@/hooks/useClickerBGM";
import { ScorePopLayer, type ScorePopItem } from "@/components/ScorePop";
import { ParticleCanvas, triggerParticleBurst } from "@/components/ParticleCanvas";

/* --- SVG Job Icons --- */
function JobIcon({ jobId }: { jobId: string }) {
  const icons: Record<string, React.ReactNode> = {
    part_time: (
      <svg viewBox="0 0 32 32" width={28} height={28}><rect x="4" y="6" width="24" height="20" rx="3" fill="#3B82F6" /><rect x="8" y="10" width="6" height="8" rx="1" fill="#93C5FD" /><rect x="18" y="10" width="6" height="3" rx="1" fill="#FDE68A" /><rect x="18" y="16" width="6" height="3" rx="1" fill="#FDE68A" /></svg>
    ),
    freelance: (
      <svg viewBox="0 0 32 32" width={28} height={28}><rect x="4" y="8" width="24" height="16" rx="2" fill="#6366F1" /><rect x="6" y="10" width="20" height="12" rx="1" fill="#312E81" /><path d="M10 15h12M10 19h8" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" /></svg>
    ),
    youtube: (
      <svg viewBox="0 0 32 32" width={28} height={28}><rect x="2" y="6" width="28" height="20" rx="6" fill="#DC2626" /><polygon points="13,10 23,16 13,22" fill="#fff" /></svg>
    ),
    blog: (
      <svg viewBox="0 0 32 32" width={28} height={28}><rect x="4" y="4" width="24" height="24" rx="3" fill="#F59E0B" /><path d="M9 10h14M9 15h10M9 20h12" stroke="#78350F" strokeWidth="2" strokeLinecap="round" /></svg>
    ),
    ebook: (
      <svg viewBox="0 0 32 32" width={28} height={28}><path d="M4 6c4-2 8-1 12 1 4-2 8-3 12-1v20c-4-2-8-1-12 1-4-2-8-3-12-1V6z" fill="#8B5CF6" /><path d="M16 7v20" stroke="#C4B5FD" strokeWidth="1.5" /></svg>
    ),
    saas: (
      <svg viewBox="0 0 32 32" width={28} height={28}><rect x="4" y="12" width="24" height="14" rx="2" fill="#475569" /><rect x="6" y="14" width="20" height="10" rx="1" fill="#0F172A" /><rect x="8" y="4" width="16" height="10" rx="2" fill="#64748B" /><circle cx="16" cy="19" r="3" fill="#22D3EE" /></svg>
    ),
    investment: (
      <svg viewBox="0 0 32 32" width={28} height={28}><rect x="6" y="10" width="20" height="16" rx="2" fill="#D97706" /><polygon points="6,10 16,4 26,10" fill="#F59E0B" /><rect x="13" y="16" width="6" height="10" rx="1" fill="#78350F" /></svg>
    ),
    startup: (
      <svg viewBox="0 0 32 32" width={28} height={28}><path d="M16 2L12 14h-6l10 16-4-12h6L16 2z" fill="#F59E0B" stroke="#D97706" strokeWidth="1" /></svg>
    ),
    ai_consulting: (
      <svg viewBox="0 0 32 32" width={28} height={28}><circle cx="16" cy="16" r="12" fill="#7C3AED" /><path d="M10 16h4l2-4 2 8 2-4h4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
    crypto: (
      <svg viewBox="0 0 32 32" width={28} height={28}><circle cx="16" cy="16" r="12" fill="#F59E0B" /><text x="16" y="22" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#78350F">B</text></svg>
    ),
    global_ip: (
      <svg viewBox="0 0 32 32" width={28} height={28}><circle cx="16" cy="16" r="12" fill="none" stroke="#3B82F6" strokeWidth="2" /><ellipse cx="16" cy="16" rx="6" ry="12" fill="none" stroke="#3B82F6" strokeWidth="1.5" /><path d="M4 16h24M16 4v24" stroke="#3B82F6" strokeWidth="1" /></svg>
    ),
  };
  return icons[jobId] || <svg viewBox="0 0 32 32" width={28} height={28}><circle cx="16" cy="16" r="12" fill="#6B7280" /></svg>;
}

function UpgradeIcon({ upgradeId }: { upgradeId: string }) {
  const icons: Record<string, React.ReactNode> = {
    mouse1: (<svg viewBox="0 0 32 32" width={28} height={28}><circle cx="16" cy="16" r="12" fill="#EF4444" /><path d="M12 18l4-8 4 8" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>),
    mouse2: (<svg viewBox="0 0 32 32" width={28} height={28}><circle cx="16" cy="16" r="12" fill="#8B5CF6" /><path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /></svg>),
    mouse3: (<svg viewBox="0 0 32 32" width={28} height={28}><circle cx="16" cy="16" r="12" fill="#F59E0B" /><polygon points="16,6 19,13 27,14 21,19 23,27 16,23 9,27 11,19 5,14 13,13" fill="#fff" /></svg>),
    mouse4: (<svg viewBox="0 0 32 32" width={28} height={28}><circle cx="16" cy="16" r="12" fill="#10B981" /><path d="M16 8v8l5 5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>),
  };
  return icons[upgradeId] || <svg viewBox="0 0 32 32" width={28} height={28}><circle cx="16" cy="16" r="12" fill="#6B7280" /></svg>;
}

/* --- Floating coins (coin particle overlay) --- */
function FloatingCoins() {
  return (
    <>
      <style>{`
        @keyframes coinFloat {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-36px) rotate(180deg); opacity: 0.9; }
          100% { transform: translateY(-72px) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {[10, 25, 42, 62, 78, 90].map((left, i) => (
        <div key={i} className="fixed pointer-events-none z-0" style={{
          left: `${left}%`, bottom: '3%',
          width: 7, height: 7,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #FBBF24 0%, #D97706 100%)',
          animation: `coinFloat ${5 + i * 0.9}s ease-in-out ${i * 0.7}s infinite`,
          boxShadow: '0 0 10px rgba(251,191,36,0.7)',
        }} />
      ))}
    </>
  );
}

// ===== GAME DATA =====
const FREE_JOBS = [
  { id: "part_time", name: "コンビニバイト", baseCost: 10, baseIncome: 0.1, desc: "¥0.1/秒", premium: false },
  { id: "freelance", name: "フリーランス案件", baseCost: 100, baseIncome: 1, desc: "¥1/秒", premium: false },
  { id: "youtube", name: "YouTubeチャンネル", baseCost: 1_000, baseIncome: 8, desc: "¥8/秒", premium: false },
  { id: "blog", name: "アフィリエイトブログ", baseCost: 8_000, baseIncome: 50, desc: "¥50/秒", premium: false },
  { id: "ebook", name: "電子書籍出版", baseCost: 50_000, baseIncome: 300, desc: "¥300/秒", premium: false },
  { id: "saas", name: "SaaSプロダクト", baseCost: 300_000, baseIncome: 2_000, desc: "¥2,000/秒", premium: false },
  { id: "investment", name: "不動産投資", baseCost: 2_000_000, baseIncome: 15_000, desc: "¥15,000/秒", premium: false },
  { id: "startup", name: "スタートアップ創業", baseCost: 15_000_000, baseIncome: 120_000, desc: "¥120,000/秒", premium: false },
] as const;

const PREMIUM_JOBS = [
  { id: "ai_consulting", name: "AIコンサルタント", baseCost: 100_000_000, baseIncome: 800_000, desc: "¥800,000/秒", premium: true },
  { id: "crypto", name: "暗号資産運用", baseCost: 500_000_000, baseIncome: 5_000_000, desc: "¥5,000,000/秒", premium: true },
  { id: "global_ip", name: "海外IPライセンス", baseCost: 2_000_000_000, baseIncome: 30_000_000, desc: "¥30,000,000/秒", premium: true },
] as const;

const JOBS = [...FREE_JOBS, ...PREMIUM_JOBS] as const;

type JobId = typeof JOBS[number]["id"];

const CLICK_VALUE_UPGRADES = [
  { id: "mouse1", name: "やる気UP", cost: 50, mult: 2, desc: "クリック値×2" },
  { id: "mouse2", name: "集中力MAX", cost: 500, mult: 5, desc: "クリック値×5" },
  { id: "mouse3", name: "副業スキル習得", cost: 5_000, mult: 10, desc: "クリック値×10" },
  { id: "mouse4", name: "経営センス覚醒", cost: 100_000, mult: 50, desc: "クリック値×50" },
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
const LAST_ACTIVE_KEY = "fukugyo_last_active";
// オフライン収益の上限（最大12時間分）
const OFFLINE_MAX_SECONDS = 60 * 60 * 12;

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

/** プレミアムユーザー向け：オフライン中の収益を計算して返す */
function calcOfflineEarnings(
  jobs: Record<string, number>,
  isPremium: boolean
): number {
  if (!isPremium) return 0;
  try {
    const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) ?? "0", 10);
    if (!lastActive) return 0;
    const offlineSec = Math.min(
      (Date.now() - lastActive) / 1000,
      OFFLINE_MAX_SECONDS
    );
    if (offlineSec < 10) return 0;
    const ips = JOBS.reduce((sum, job) => {
      const cnt = jobs[job.id] || 0;
      return sum + job.baseIncome * cnt;
    }, 0);
    return ips * offlineSec;
  } catch {
    return 0;
  }
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
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [streakMsg, setStreakMsg] = useState<string | null>(null);
  const [offlineBonus, setOfflineBonus] = useState(0);
  const [showOfflineBonus, setShowOfflineBonus] = useState(false);
  const [bgmMuted, setBgmMuted] = useState(false);
  const [scorePopItems, setScorePopItems] = useState<ScorePopItem[]>([]);
  const [glowClass, setGlowClass] = useState("glow-normal");
  const [shakeKey, setShakeKey] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const floatId = useRef(0);
  const prevTotalRef = useRef(0);
  const bgmStartedRef = useRef(false);
  const scorePopId = useRef(0);
  const { start: bgmStart, stop: bgmStop, setMuted: bgmSetMuted, playCoin, playUpgrade, playMilestone } = useClickerBGM();

  // Load save
  useEffect(() => {
    const s = loadSave();
    const premium = isPremiumUser();
    // オフライン収益計算（プレミアム限定）
    const offline = calcOfflineEarnings(s.jobs, premium);
    const moneyWithBonus = s.money + offline;
    const totalWithBonus = s.totalEarned + offline;
    setMoney(moneyWithBonus);
    setTotalEarned(totalWithBonus);
    setClickMult(s.clickMult);
    setJobs(s.jobs);
    setBoughtUpgrades(s.boughtUpgrades);
    prevTotalRef.current = totalWithBonus;
    if (totalWithBonus >= GOAL) setGoalShown(true);
    setIsPremium(premium);
    setStreak(loadStreak("fukugyou"));
    if (offline > 0) {
      setOfflineBonus(offline);
      setShowOfflineBonus(true);
      setTimeout(() => setShowOfflineBonus(false), 5000);
    }
    // 最終アクティブ時間を記録
    localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));

    // BGM: 初回ユーザーインタラクションで開始（autoplay policy 対応）
    const startBgmOnce = () => {
      if (!bgmStartedRef.current) {
        bgmStartedRef.current = true;
        bgmStart();
      }
      document.removeEventListener("click", startBgmOnce);
      document.removeEventListener("touchstart", startBgmOnce);
    };
    document.addEventListener("click", startBgmOnce);
    document.addEventListener("touchstart", startBgmOnce);
    return () => {
      document.removeEventListener("click", startBgmOnce);
      document.removeEventListener("touchstart", startBgmOnce);
      bgmStop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save every 5s + 最終アクティブ時間更新
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
      localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
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
    playCoin();
    setClicks(c => {
      if (c === 0) {
        const s = updateStreak("fukugyou");
        setStreak(s);
        const msg = getStreakMilestoneMessage(s.count);
        if (msg) setStreakMsg(msg);
      }
      return c + 1;
    });
    const rect = e.currentTarget.getBoundingClientRect();
    const id = floatId.current++;
    setFloats(f => [...f, {
      id, x: e.clientX - rect.left, y: e.clientY - rect.top, val
    }]);
    setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 800);

    // ScorePop: +¥N 浮き上がりアニメ
    const popId = scorePopId.current++;
    setScorePopItems(prev => [...prev, {
      id: popId,
      value: val,
      combo: Math.floor(clicks / 10),
      x: e.clientX,
      y: e.clientY - 20,
    }]);
    // コンボ段階によるグロー変化
    const comboLevel = Math.floor((clicks + 1) / 10);
    if (comboLevel >= 5) setGlowClass("glow-fever");
    else if (comboLevel >= 2) setGlowClass("glow-combo");
    else setGlowClass("glow-normal");
    // フィーバー演出: combo 10の倍数でfever-flashを挿入
    if ((clicks + 1) % 100 === 0) {
      const flashEl = document.createElement("div");
      flashEl.className = "fever-flash";
      document.body.appendChild(flashEl);
      setTimeout(() => flashEl.remove(), 500);
      // フィーバーパーティクル: 画面中央から爆発
      triggerParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 'fever');
    } else if (comboLevel >= 2 && (clicks + 1) % 10 === 0) {
      // コンボ達成パーティクル
      triggerParticleBurst(e.clientX, e.clientY, 'combo');
    } else {
      // 通常クリックパーティクル
      triggerParticleBurst(e.clientX, e.clientY, 'normal');
    }
  }, [clickMult, playCoin, clicks]);

  const jobCost = (jobId: string, base: number) => {
    const cnt = jobs[jobId] || 0;
    return Math.floor(base * Math.pow(1.15, cnt));
  };

  const buyJob = (job: typeof JOBS[number]) => {
    const cost = jobCost(job.id, job.baseCost);
    if (money < cost) return;
    setMoney(m => m - cost);
    setJobs(j => ({ ...j, [job.id]: (j[job.id] || 0) + 1 }));
    playUpgrade();
  };

  const buyUpgrade = (u: typeof CLICK_VALUE_UPGRADES[number]) => {
    if (money < u.cost || boughtUpgrades.includes(u.id)) return;
    setMoney(m => m - u.cost);
    setClickMult(c => c * u.mult);
    setBoughtUpgrades(b => [...b, u.id]);
    playMilestone();
    // アップグレード購入時: シェイク演出
    setIsShaking(false);
    setTimeout(() => {
      setIsShaking(true);
      setShakeKey(k => k + 1);
      setTimeout(() => setIsShaking(false), 400);
    }, 10);
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
    const text = `副業クリッカーで月収${fmt(incomePerSec * 86400 * 30)}達成！\n副業${totalJobs}種類を掛け持ち中\n#副業クリッカー #副業 #月収100万\nhttps://fukugyo-advisor-ai.vercel.app`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const progress = Math.min(100, (totalEarned / GOAL) * 100);
  const monthlyIncome = incomePerSec * 86400 * 30;

  return (
    <div
      key={shakeKey}
      className={`min-h-screen text-white select-none relative overflow-hidden ${isShaking ? "screen-shake" : ""}`}
      style={{ background: "transparent" }}
    >
      {/* ScorePopLayer: fixed overlay */}
      <ScorePopLayer
        items={scorePopItems}
        onRemove={id => setScorePopItems(prev => prev.filter(p => p.id !== id))}
      />
      {/* ParticleCanvas: グロー付きCanvasパーティクル */}
      <ParticleCanvas />
      {/* OrbBackground: fixed, z-index:0 */}
      <OrbBackground />
      <FloatingCoins />
      <div style={{ position: "relative", zIndex: 1 }}>
      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="border border-purple-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            style={{ background: "linear-gradient(135deg, rgba(88,28,135,0.95), rgba(49,46,129,0.95))", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
            <div className="mb-3"><svg viewBox="0 0 48 48" width={48} height={48} aria-hidden="true"><polygon points="24,2 30,18 48,20 34,32 38,48 24,40 10,48 14,32 0,20 18,18" fill="#FBBF24" /><circle cx="24" cy="24" r="8" fill="#7C3AED" /></svg></div>
            <h2 className="text-xl font-black text-white mb-1">プレミアム解放</h2>
            <p className="text-purple-300 text-xs mb-4">超高収益の3つの副業をアンロック</p>
            <ul className="text-left text-sm space-y-2 mb-6">
              {PREMIUM_JOBS.map(j => (
                <li key={j.id} className="flex items-center gap-2 text-purple-100">
                  <span aria-hidden="true"><JobIcon jobId={j.id} /></span>
                  <span className="font-medium">{j.name}</span>
                  <span className="text-purple-400 text-xs ml-auto">{j.desc}</span>
                </li>
              ))}
            </ul>
            {/* オフライン収益の価値訴求 */}
            <div className="bg-indigo-900/50 border border-indigo-700/50 rounded-xl p-3 mb-4 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-indigo-300 font-bold text-xs">オフラインでも収益が加算！</span>
              </div>
              <p className="text-indigo-400 text-xs leading-relaxed">
                ゲームを閉じている間も、最大12時間分の収益が自動でたまります。翌朝開いたら一気に受け取れる！
              </p>
            </div>
            <div className="bg-purple-800/50 rounded-xl p-3 mb-5">
              <div className="text-yellow-400 font-black text-2xl">¥500<span className="text-sm font-normal text-purple-300">/月</span></div>
              <div className="text-purple-300 text-sm font-bold mt-1">1日あたりたった33円で永続プレイ</div>
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
            <div className="mb-4 flex justify-center"><svg viewBox="0 0 64 64" width={64} height={64} aria-hidden="true"><circle cx="32" cy="32" r="28" fill="#FBBF24" /><path d="M32 12l6 14h16l-13 10 5 15-14-10-14 10 5-15L10 26h16z" fill="#FEF3C7" /></svg></div>
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
      <header className="border-b border-slate-700/60 px-4 py-3"
        style={{ background: "rgba(10,15,30,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", position: "relative", zIndex: 1 }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="font-black text-lg m-0" style={{
            background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.5))',
          }}>副業クリッカー</h1>
          <div className="flex items-center gap-3">
            {/* BGMミュートボタン */}
            <button
              onClick={() => { const next = !bgmMuted; setBgmMuted(next); bgmSetMuted(next); }}
              style={{
                minHeight: 44, minWidth: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(8px)",
                cursor: "pointer",
                padding: "0 8px",
              }}
              aria-label={bgmMuted ? "BGMをオンにする" : "BGMをオフにする"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {bgmMuted ? (
                  <>
                    <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#6B7280" />
                    <line x1="23" y1="9" x2="17" y2="15" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                    <line x1="17" y1="9" x2="23" y2="15" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#FBBF24" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
            {streak && streak.count > 0 && (
              <div
                className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/40 rounded-full px-3 py-1"
                aria-label={`${streak.count}日連続プレイ中`}
                title={`${streak.count}日連続プレイ中`}
              >
                <span className="text-orange-400 text-xs font-bold" aria-hidden="true">STREAK</span>
                <span className="text-orange-300 font-black text-sm">{streak.count}</span>
                <span className="text-orange-400 text-xs">日</span>
              </div>
            )}
            <div className="text-right">
              <div className="text-xs text-slate-400">累計収益</div>
              <div className="font-bold text-yellow-400">{fmt(totalEarned)}</div>
            </div>
          </div>
        </div>
        {streakMsg && (
          <div className="max-w-4xl mx-auto mt-2">
            <div className="bg-orange-500/20 border border-orange-500/40 rounded-xl px-4 py-2 text-orange-300 text-sm text-center font-bold">
              {streakMsg}
            </div>
          </div>
        )}
      </header>

      {/* オフラインボーナス通知 */}
      {showOfflineBonus && offlineBonus > 0 && (
        <div className="max-w-4xl mx-auto px-4 pt-3">
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-bold"
            style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)" }}
            role="status"
            aria-live="polite"
          >
            <span className="text-indigo-300">オフライン収益</span>
            <span className="text-yellow-300 font-black">{fmt(offlineBonus)}</span>
            <span className="text-indigo-400 text-xs ml-auto">受け取り完了！</span>
            <button
              onClick={() => setShowOfflineBonus(false)}
              className="text-indigo-500 hover:text-indigo-300 text-xs min-h-[44px] px-2"
              aria-label="オフライン収益通知を閉じる"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4" style={{ position: "relative", zIndex: 1 }}>
        {/* Left: Click Area */}
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="rounded-2xl p-4 grid grid-cols-3 gap-3 text-center"
            style={{ background: "rgba(30,41,59,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
            <div>
              <div className="text-xs text-slate-400">所持金</div>
              <div className="font-bold text-yellow-300 text-sm" style={{ textShadow: "0 0 20px rgba(251,191,36,0.5)" }}>{fmt(money)}</div>
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
          <div className="rounded-2xl p-4"
            style={{ background: "rgba(30,41,59,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
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
              className={`relative w-48 h-48 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 hover:scale-105 active:scale-95 transition-transform flex flex-col items-center justify-center ${glowClass}`}
              style={{
                boxShadow: undefined,
                transition: "box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.1s",
              }}
              aria-label={`クリックして¥${clickMult}稼ぐ`}
              type="button">
              <span aria-hidden="true"><svg viewBox="0 0 48 48" width={56} height={56}><circle cx="24" cy="24" r="20" fill="#FBBF24" /><circle cx="24" cy="24" r="15" fill="#F59E0B" /><text x="24" y="31" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#78350F">$</text></svg></span>
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
          <div className="rounded-2xl p-4"
            style={{ background: "rgba(30,41,59,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
            <h3 className="font-bold text-sm text-slate-300 mb-3">スキルアップグレード</h3>
            <div className="space-y-2">
              {CLICK_VALUE_UPGRADES.map(u => {
                const bought = boughtUpgrades.includes(u.id);
                const canAfford = money >= u.cost;
                return (
                  <button key={u.id} onClick={() => buyUpgrade(u)} disabled={bought || !canAfford}
                    aria-label={bought ? `${u.name}は取得済み` : `${u.name}を${fmt(u.cost)}で購入する（${u.desc}）`}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${bought ? "bg-green-900/30 opacity-50 cursor-default" : canAfford ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-700/50 opacity-40 cursor-default"}`}>
                    <span aria-hidden="true"><UpgradeIcon upgradeId={u.id} /></span>
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
          <div className="rounded-2xl p-4"
            style={{ background: "rgba(30,41,59,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
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
                      aria-label={`${job.name}はプレミアム限定です。プレミアムプランに登録してアンロックする`}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left bg-purple-900/30 border border-purple-800/50 hover:bg-purple-900/50 transition-colors">
                      <span className="grayscale opacity-60" aria-hidden="true"><JobIcon jobId={job.id} /></span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-purple-400"> {job.name}</div>
                        <div className="text-xs text-purple-600">{job.desc}</div>
                      </div>
                      <div className="text-xs font-bold text-purple-500"> PRO</div>
                    </button>
                  );
                }
                return (
                  <button key={job.id} onClick={() => buyJob(job)}
                    disabled={!canAfford}
                    aria-label={`${job.name}を${fmt(jobCost(job.id, job.baseCost))}で購入する（${job.desc}）`}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${canAfford ? "bg-slate-700 hover:bg-slate-600 active:scale-98" : "bg-slate-700/40 opacity-50 cursor-default"}`}>
                    <span aria-hidden="true"><JobIcon jobId={job.id} /></span>
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
              aria-label="プレミアムプランを月額500円で解放する。AIコンサルタント・暗号資産運用・海外IPライセンスがアンロック"
              className="w-full bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-700 rounded-2xl p-4 text-left hover:border-purple-500 transition-colors">
              <div className="flex items-center gap-2">
                <span aria-hidden="true"><svg viewBox="0 0 24 24" width={24} height={24}><polygon points="12,2 15,9 22,10 17,15 18,22 12,19 6,22 7,15 2,10 9,9" fill="#FBBF24" /></svg></span>
                <div>
                  <div className="text-sm font-bold text-purple-200">プレミアム解放 ¥500/月</div>
                  <div className="text-xs text-purple-400">AIコンサル・暗号資産・海外IPをアンロック</div>
                </div>
                <span className="ml-auto text-purple-400 text-xs">→</span>
              </div>
            </button>
          )}

          {/* Share & Reset */}
          <div className="rounded-2xl p-4 space-y-2"
            style={{ background: "rgba(30,41,59,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
            <button onClick={shareToX}
              aria-label="副業クリッカーの記録をXにシェアする"
              className="w-full bg-black text-white font-bold py-2 rounded-xl hover:bg-gray-900 text-sm min-h-[44px]">
              X（Twitter）でスコアをシェア
            </button>
            <a href="https://fukugyo-advisor-ai.vercel.app"
              target="_blank" rel="noopener noreferrer"
              className="block w-full bg-amber-500 text-white font-bold py-2 rounded-xl hover:bg-amber-600 text-sm text-center">
              AIで本当の副業を見つける →
            </a>
            <button onClick={resetGame}
              aria-label="ゲームの進行状況をリセットしてはじめからやり直す"
              className="w-full text-slate-500 text-xs py-1 hover:text-slate-400 min-h-[44px]">
              リセット
            </button>
          </div>

          {/* Stats */}
          <div className="rounded-2xl p-4 text-xs text-slate-400 space-y-1"
            style={{ background: "rgba(30,41,59,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
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
    </div>
  );
}
