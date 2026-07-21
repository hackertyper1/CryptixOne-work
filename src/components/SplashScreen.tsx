import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#05070a] flex items-center justify-center overflow-hidden">
      <div className="relative">
        {/* Ambient Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1.2 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full"
        />

        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center space-x-3"
          >
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.3)]">
              <span className="text-4xl font-black text-slate-950">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-black tracking-tighter text-white">
                CRYPTIX<span className="text-amber-500">ONE</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-1">
                Institutional Node
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
            className="h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-6"
          />
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mt-4 font-black"
          >
            Initializing Secure Ingress...
          </motion.p>
        </div>
      </div>
    </div>
  );
}
