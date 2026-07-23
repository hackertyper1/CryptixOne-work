import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
  logoUrl?: string;
}

export default function SplashScreen({ onComplete, logoUrl }: SplashScreenProps) {
  const [phase, setPhase] = useState<'glow' | 'logo' | 'text' | 'tagline'>('glow');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'), 1000);
    const t2 = setTimeout(() => setPhase('text'), 2500);
    const t3 = setTimeout(() => setPhase('tagline'), 4000);
    const t4 = setTimeout(onComplete, 6500); // Extended for premium feel
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#020308] flex items-center justify-center overflow-hidden">
      {/* Background Animated Chart Elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <motion.path
            d="M 0 800 L 100 750 L 250 780 L 400 650 L 550 700 L 700 500 L 850 550 L 1000 350"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 5, ease: "easeInOut" }}
          />
          <motion.path
            d="M 0 900 L 150 820 L 300 850 L 450 720 L 600 780 L 750 580 L 900 630 L 1000 450"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 6, ease: "easeInOut", delay: 0.5 }}
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#FFFACD" />
              <stop offset="100%" stopColor="#AA7C11" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative flex flex-col items-center">
        {/* Ambient background glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 3 }}
          className="absolute inset-0 bg-amber-500/5 blur-[150px] rounded-full scale-150"
        />

        <AnimatePresence>
          {/* Phase 1: Initial Flare */}
          {phase === 'glow' && (
            <motion.div
              key="flare"
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
              transition={{ duration: 1 }}
              className="absolute w-32 h-32 bg-gradient-to-tr from-amber-500/30 to-white/20 blur-3xl rounded-full"
            />
          )}

          {/* Phase 2: The Emblem (C1) */}
          {(phase === 'logo' || phase === 'text' || phase === 'tagline') && (
            <motion.div
              key="emblem"
              initial={{ opacity: 0, scale: 0.7, rotateY: 180, filter: "brightness(2)" }}
              animate={{ opacity: 1, scale: 1, rotateY: 0, filter: "brightness(1)" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="mb-10 relative"
            >
              <div className="relative overflow-hidden flex items-center justify-center">
                {(!logoUrl || logoUrl === '/logo.png') ? (
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-500 to-emerald-400 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.4)] border-2 border-amber-300/60 relative group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.45),transparent)]"></div>
                    <span className="text-6xl md:text-8xl font-black font-display text-slate-950 tracking-tighter drop-shadow-md">CX</span>
                    <span className="text-xs md:text-sm font-mono tracking-widest text-slate-900 font-extrabold uppercase mt-1">CryptixOne OS</span>
                  </div>
                ) : (
                  <img 
                    src={logoUrl} 
                    alt="CryptixOne Logo" 
                    className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10" 
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                
                {/* Dynamic Rotating Glow */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-[1px] border-dashed border-amber-500/20"
                />
              </div>

              {/* Sweeping Shine */}
              <motion.div
                initial={{ left: '-100%' }}
                animate={{ left: '200%' }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: "circIn" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[35deg] pointer-events-none"
              />
            </motion.div>
          )}

          {/* Phase 3: Premium Brand Text */}
          {(phase === 'text' || phase === 'tagline') && (
            <motion.div
              key="brand-text"
              initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-black tracking-[-0.04em] flex flex-col md:flex-row items-center gap-0 md:gap-2">
                <span className="bg-gradient-to-b from-white via-slate-300 to-slate-500 bg-clip-text text-transparent drop-shadow-2xl">CRYPTIX</span>
                <span className="bg-gradient-to-b from-amber-200 via-amber-500 to-amber-700 bg-clip-text text-transparent drop-shadow-2xl">ONE</span>
              </h1>
            </motion.div>
          )}

          {/* Phase 4: Cinematic Tagline */}
          {phase === 'tagline' && (
            <motion.div
              key="tagline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="mt-8 flex flex-col items-center"
            >
              <div className="flex items-center gap-6">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-amber-500/40 to-amber-500/80" />
                <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.6em] text-slate-400">
                  TRADE <span className="text-amber-500 mx-1">|</span> 
                  INVEST <span className="text-amber-500 mx-1">|</span> 
                  GROW
                </span>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent via-amber-500/40 to-amber-500/80" />
              </div>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mt-4 max-w-[200px]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/60 pointer-events-none" />
    </div>
  );
}

import { CryptixLogo } from './Header';
