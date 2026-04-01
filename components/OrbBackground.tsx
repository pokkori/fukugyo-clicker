"use client";
import React from "react";

// 副業クリッカー / お金・成功テーマ:
// 金(#FBBF24) / 緑(#10B981) / 青(#3B82F6) / 紫(#7C3AED) の8オーブ
const orbs = [
  { size: 360, left: 5,  top: 8,  color: "rgba(251,191,36,0.16)",  duration: 10, delay: 0,   blur: 95 },
  { size: 280, left: 75, top: 15, color: "rgba(16,185,129,0.13)",  duration: 13, delay: 1.5, blur: 85 },
  { size: 310, left: 40, top: 62, color: "rgba(59,130,246,0.14)",  duration: 11, delay: 0.8, blur: 100},
  { size: 220, left: 88, top: 52, color: "rgba(124,58,237,0.14)",  duration: 7,  delay: 2.2, blur: 70 },
  { size: 390, left: 3,  top: 74, color: "rgba(251,191,36,0.09)",  duration: 14, delay: 0.3, blur: 110},
  { size: 200, left: 60, top: 20, color: "rgba(16,185,129,0.11)",  duration: 6,  delay: 1.0, blur: 72 },
  { size: 260, left: 25, top: 40, color: "rgba(124,58,237,0.12)",  duration: 12, delay: 3.0, blur: 90 },
  { size: 240, left: 70, top: 80, color: "rgba(59,130,246,0.10)",  duration: 8,  delay: 0.6, blur: 80 },
];

const OrbBackground = React.memo(function OrbBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d1428 40%, #0a1420 100%)",
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes orbFloatClicker {
          0%   { transform: translate(-50%, -50%) scale(1);    opacity: 0.5; }
          25%  { transform: translate(-50%, -50%) translate(14px, -20px) scale(1.06); opacity: 0.8; }
          50%  { transform: translate(-50%, -50%) translate(-12px, -34px) scale(0.94); opacity: 0.6; }
          75%  { transform: translate(-50%, -50%) translate(18px, -12px) scale(1.03); opacity: 0.75; }
          100% { transform: translate(-50%, -50%) scale(1);    opacity: 0.5; }
        }
      `}</style>
      {orbs.map((orb, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${orb.blur}px)`,
            animation: `orbFloatClicker ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
});

export default OrbBackground;
