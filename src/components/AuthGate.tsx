import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ShieldCheck, TrendingUp } from 'lucide-react';

interface AuthGateProps {
  onSelectLogin: () => void;
  onSelectSignup: () => void;
}

export default function AuthGate({ onSelectLogin, onSelectSignup }: AuthGateProps) {
  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-10 relative z-10 text-center"
      >
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/20">
            <ShieldCheck className="w-10 h-10 text-slate-950" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tighter">
              CRYPTIX<span className="text-amber-500">ONE</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Global Asset Settlement Network</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={onSelectLogin}
            className="group flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-[2rem] transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <LogIn className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-black text-white uppercase tracking-wider">Access Node</span>
                <span className="text-[10px] text-slate-500 font-bold">Log in to your existing account</span>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-700 group-hover:text-amber-500 transition-colors" />
          </button>

          <button
            onClick={onSelectSignup}
            className="group flex items-center justify-between bg-amber-500 hover:bg-amber-400 p-6 rounded-[2rem] transition-all shadow-xl shadow-amber-500/10"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-black text-slate-950 uppercase tracking-wider">Deploy Account</span>
                <span className="text-[10px] text-slate-900/60 font-bold">Create new institutional credentials</span>
              </div>
            </div>
            <ShieldCheck className="w-5 h-5 text-slate-950/40" />
          </button>
        </div>

        {/* Footer Info */}
        <div className="pt-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Secure Server Status: Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
