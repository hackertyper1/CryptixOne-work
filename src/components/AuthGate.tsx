import React from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, Briefcase, Zap, Diamond } from 'lucide-react';

interface AuthGateProps {
  onSelectLogin: () => void;
  onSelectSignup: () => void;
}

export default function AuthGate({ onSelectLogin, onSelectSignup }: AuthGateProps) {
  return (
    <div className="min-h-screen bg-[#0b101f] flex flex-col items-center p-6 pt-12 relative overflow-hidden">
      {/* Top Navigation for Guest */}
      <div className="absolute top-6 left-0 right-0 px-6 flex justify-between items-center z-20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg rotate-45 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <div className="w-3 h-3 bg-slate-950 rounded-sm" />
          </div>
          <span className="text-sm font-black text-white tracking-tight">CRYPTIX<span className="text-amber-500">ONE</span></span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onSelectLogin} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors">Login</button>
          <button onClick={onSelectSignup} className="text-[10px] font-black text-amber-500 uppercase tracking-widest border border-amber-500/20 px-3 py-1.5 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 transition-all">Sign Up</button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md space-y-8 relative z-10 mt-20"
      >
        <h1 className="text-2xl font-black text-white text-center mb-10">Tell us about yourself!</h1>

        {/* Action Cards */}
        <div className="space-y-4">
          <button
            onClick={onSelectSignup}
            className="w-full group bg-[#1e2330] hover:bg-[#252b3d] border border-slate-800/50 p-6 rounded-3xl transition-all text-left flex items-start space-x-5"
          >
            <div className="relative mt-1">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <MousePointer2 className="w-6 h-6 rotate-12" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-[#1e2330]">
                <Zap className="w-2.5 h-2.5 text-slate-950" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="block text-base font-black text-white">I'm New to Crypto</span>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                I've heard about Bitcoin and I'm willing to trade more popular coins.
              </p>
            </div>
          </button>

          <button
            onClick={onSelectLogin}
            className="w-full group bg-[#1e2330] hover:bg-[#252b3d] border border-slate-800/50 p-6 rounded-3xl transition-all text-left flex items-start space-x-5"
          >
            <div className="relative mt-1">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-[#1e2330]">
                <Diamond className="w-2.5 h-2.5 text-slate-950" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="block text-base font-black text-white">I'm a Crypto Pro</span>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                I'm experienced when it comes to crypto and feel confident to trade.
              </p>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Decorative dots (bottom) */}
      <div className="mt-auto pb-10">
        <div className="flex space-x-1.5">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
          <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
}
