'use client';
import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; color: string;
  alpha: number; life: number; maxLife: number;
}

type BurstType = 'normal' | 'combo' | 'fever';

const BURST_CONFIG = {
  normal: {
    count: 8,
    colors: ['#FFD700', '#FF6B35', '#FFFFFF'],
    spread: 60, speedMin: 2, speedMax: 5, gravity: 0.3, duration: 600,
  },
  combo: {
    count: 15,
    colors: ['#FFD700', '#FF6B35', '#FF1744', '#FFFFFF'],
    spread: 90, speedMin: 3, speedMax: 7, gravity: 0.25, duration: 800,
  },
  fever: {
    count: 30,
    colors: ['#FFD700', '#FF1744', '#FF6B35', '#FFFFFF', '#00E5FF'],
    spread: 360, speedMin: 4, speedMax: 9, gravity: 0.2, duration: 1200,
  },
} as const;

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const burst = useCallback((x: number, y: number, type: BurstType = 'normal') => {
    const cfg = BURST_CONFIG[type];
    for (let i = 0; i < cfg.count; i++) {
      const angle = (Math.random() * cfg.spread - cfg.spread / 2) * (Math.PI / 180);
      const speed = cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin);
      particlesRef.current.push({
        x, y,
        vx: Math.sin(angle) * speed,
        vy: -Math.cos(angle) * speed,
        size: 4 + Math.random() * 8,
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
        alpha: 1, life: 0, maxLife: cfg.duration,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => {
        p.vy += 0.3;
        p.x += p.vx; p.y += p.vy;
        p.life += 16;
        p.alpha = 1 - p.life / p.maxLife;
        if (p.alpha <= 0) return false;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // グローバルイベントで外部からバーストを呼べるようにする
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ x: number; y: number; type: BurstType }>;
      burst(ce.detail.x, ce.detail.y, ce.detail.type);
    };
    window.addEventListener('particle-burst', handler);
    return () => window.removeEventListener('particle-burst', handler);
  }, [burst]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        pointerEvents: 'none',
      }}
    />
  );
}

// 外部から呼ぶユーティリティ関数
export function triggerParticleBurst(x: number, y: number, type: BurstType = 'normal') {
  window.dispatchEvent(new CustomEvent('particle-burst', { detail: { x, y, type } }));
}
