import React, { useState } from 'react';
import { ShieldCheck, Phone, TrendingUp, Award, User, Wallet, Menu, X, LogOut, Home, Lock, MessageSquare, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setAuthMode: (mode: 'login' | 'signup') => void;
  isLoggedIn: boolean;
  currentUser: any;
  onLogout: () => void;
  supportPhone: string;
  mobileShowHome?: boolean;
  setMobileShowHome?: (show: boolean) => void;
  isMobile?: boolean;
}

// Highly detailed, premium inline SVG logo matching the user's golden/silver logo style with transparent background
export function CryptixLogo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Advanced Metallic Gold Gradient */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="20%" stopColor="#D4AF37" />
          <stop offset="40%" stopColor="#AA7C11" />
          <stop offset="60%" stopColor="#F3E5AB" />
          <stop offset="80%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#5A3E00" />
        </linearGradient>

        {/* Polished Platinum/Silver Gradient */}
        <linearGradient id="silverGradient" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="70%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Outer Glow Filter */}
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Radial Dark Background for the circle interior */}
        <radialGradient id="sphereBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#080e22" />
          <stop offset="70%" stopColor="#03050c" />
          <stop offset="100%" stopColor="#010205" />
        </radialGradient>
      </defs>

      {/* Outer Golden Glow Ring */}
      <circle cx="50" cy="50" r="46" stroke="url(#goldGradient)" strokeWidth="1.2" filter="url(#goldGlow)" opacity="0.85" />
      
      {/* Middle Silver/Platinum Ring */}
      <circle cx="50" cy="50" r="43.5" stroke="url(#silverGradient)" strokeWidth="1.8" />
      
      {/* Inner Thin Gold Ring */}
      <circle cx="50" cy="50" r="41" stroke="url(#goldGradient)" strokeWidth="0.8" />

      {/* Inner Sphere Dark Ambient Background */}
      <circle cx="50" cy="50" r="40" fill="url(#sphereBg)" />

      {/* Candlestick & Trading lines elements inside the sphere */}
      <g opacity="0.25">
        {/* Bullish and Bearish Tiny Candlestick Bars */}
        <line x1="32" y1="36" x2="32" y2="44" stroke="#D4AF37" strokeWidth="0.6" />
        <rect x="30.5" y="38" width="3" height="4" fill="#D4AF37" />

        <line x1="38" y1="46" x2="38" y2="58" stroke="#D4AF37" strokeWidth="0.6" />
        <rect x="36.5" y="49" width="3" height="6" fill="#D4AF37" />

        <line x1="68" y1="38" x2="68" y2="52" stroke="#AA7C11" strokeWidth="0.6" />
        <rect x="66.5" y="41" width="3" height="8" fill="#AA7C11" />

        <line x1="74" y1="48" x2="74" y2="62" stroke="#D4AF37" strokeWidth="0.6" />
        <rect x="72.5" y="51" width="3" height="7" fill="#D4AF37" />

        {/* Trend line dots */}
        <path d="M 28 58 L 36 50 L 44 54 L 52 42 L 60 48 L 70 36" stroke="url(#goldGradient)" strokeWidth="0.8" fill="none" />
        <circle cx="36" cy="50" r="1.2" fill="#FFFFFF" />
        <circle cx="52" cy="42" r="1.2" fill="#FFFFFF" />
        <circle cx="70" cy="36" r="1.2" fill="#FFFFFF" />
      </g>

      {/* Silver Crescent G/C Emblem */}
      {/* Recreates the elegant chrome C curve from top-right down to bottom-right */}
      <path 
        d="M 62.5 31.5 
           C 51.5 24.5, 34.5 28.5, 31.5 44.5 
           C 28.5 60.5, 41.5 73.5, 54.5 72.5 
           C 60.5 72.0, 64.5 68.5, 66.5 65.5 
           L 57.5 61.5 
           C 51.5 65.0, 41.5 63.5, 39.5 53.5 
           C 37.5 43.5, 46.5 37.5, 53.5 38.5 
           C 56.5 38.9, 59.5 41.5, 60.5 43.5 
           Z" 
        fill="url(#silverGradient)" 
      />

      {/* Gold Overlapping Number '1' Emblem */}
      {/* Recreates the sharp, angular 1 with its distinct serif and dynamic base */}
      <path 
        d="M 49.5 41.5 
           L 65.5 31.0 
           L 65.5 61.5 
           C 65.5 62.0, 68.5 62.0, 68.5 62.0 
           L 68.5 68.0 
           L 52.0 68.0 
           L 52.0 62.0 
           C 54.5 62.0, 57.5 62.0, 57.5 61.5 
           L 57.5 42.5 
           L 49.5 45.0 
           Z" 
        fill="url(#goldGradient)" 
      />

      {/* Dynamic Golden Flare Highlight on the top-left outer ring */}
      <circle cx="21" cy="40" r="1.5" fill="#FFFFFF" filter="url(#goldGlow)" />
      <circle cx="79" cy="42" r="1.2" fill="#FFFFFF" filter="url(#goldGlow)" />
    </svg>
  );
}

export default function Header({
  activeTab,
  setActiveTab,
  setAuthMode,
  isLoggedIn,
  currentUser,
  onLogout,
  supportPhone,
  mobileShowHome = false,
  setMobileShowHome,
  isMobile = false
}: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="w-full bg-[#05070a]/98 backdrop-blur-xl text-white border-b border-white/5 sticky top-0 z-50 shadow-2xl" id="app-header">
        
        {/* DESKTOP HEADER (hidden on mobile) */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 py-5 flex-row justify-between items-center" id="main-nav-bar">
          {/* Branding (Desktop) */}
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <CryptixLogo className="w-10 h-10" />
                <div className="flex flex-col text-left">
                  <span className="text-xl font-black tracking-tighter text-white font-sans leading-none">
                    Cryptix<span className="text-amber-500 font-black">One</span>
                  </span>
                  <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5 leading-none">
                    TRADE • INVEST • GROW
                  </span>
                </div>
              </div>
              <div className="hidden lg:block h-6 w-[1px] bg-white/10 mx-2"></div>
              <div className="hidden lg:flex items-center space-x-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-bold tracking-widest uppercase">+91 {supportPhone}</span>
              </div>
            </div>
          </div>

          {/* Navigation & User Profiles (Desktop) */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {!isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAuthMode('login')}
                  className="px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthMode('signup')}
                  className="px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <nav className="flex items-center space-x-2 bg-white/5 p-1.5 rounded-xl border border-white/5">
                <button
                  id="btn-nav-plan"
                  onClick={() => setActiveTab('plan')}
                  className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === 'plan'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Plans
                </button>
                <button
                  id="btn-nav-trade"
                  onClick={() => setActiveTab('trade')}
                  className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === 'trade'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Trade
                </button>
                <button
                  id="btn-nav-market"
                  onClick={() => setActiveTab('market')}
                  className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === 'market'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Market
                </button>
                <button
                  id="btn-nav-wallet"
                  onClick={() => setActiveTab('wallet')}
                  className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === 'wallet'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Wallet
                </button>
                <button
                  id="btn-nav-account"
                  onClick={() => setActiveTab('account')}
                  className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === 'account'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Account
                </button>
              </nav>
            )}

            {/* Secure Badge */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE HEADER (visible only on mobile) */}
        {(activeTab === 'home' || activeTab === 'plan' || activeTab === 'account' || activeTab === 'market' || activeTab === 'trade' || activeTab === 'wallet') && (
          <div className="flex md:hidden w-full px-4 py-3 flex-row justify-between items-center bg-[#05070a]" id="mobile-header-bar">
            {/* Logo & Brand (Left) */}
            <div className="flex items-center space-x-2">
              <div className="p-1 text-amber-500">
                <CryptixLogo className="w-8 h-8" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-black tracking-tight text-white leading-none">
                  CRYPTIX<span className="text-amber-500 font-black">ONE</span>
                </span>
                <span className="text-[7px] text-slate-500 font-extrabold uppercase tracking-[0.15em] mt-0.5 leading-none">
                  TRADE • INVEST • GROW
                </span>
              </div>
            </div>

            {/* Actions (Right) */}
            <div className="flex items-center space-x-2">
              {!isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAuthMode('login')}
                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-400 border border-white/5 bg-white/5 transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    Signup
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded flex items-center space-x-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                    <span className="text-[7px] text-amber-500 font-black tracking-widest uppercase">SECURE</span>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="p-1.5 text-slate-400 hover:text-white bg-white/5 border border-white/5 rounded-lg transition-all focus:outline-none flex items-center justify-center"
                    id="mobile-drawer-toggle"
                  >
                    <Menu className="w-5 h-5 text-amber-500" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Slide-in Mobile Drawer Menu Component */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[290px] max-w-[85vw] bg-[#070b14] border-l border-white/5 shadow-2xl z-50 md:hidden flex flex-col overflow-hidden"
              id="mobile-side-drawer"
            >
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#05070a]">
                <div className="flex items-center space-x-2">
                  <CryptixLogo className="w-8 h-8" />
                  <span className="text-sm font-black tracking-tight text-white font-sans">
                    CRYPTIX<span className="text-amber-500">ONE</span>
                  </span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content (Scrollable) */}
              <div className="flex-grow overflow-y-auto p-4 space-y-5">
                {/* User Session Info Card */}
                <div className="bg-[#0b101f] border border-white/5 rounded-xl p-4 space-y-3">
                  {isLoggedIn && currentUser ? (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          <span className="text-[9px] text-emerald-400 uppercase font-mono font-black tracking-wider">HFT Active Link</span>
                        </div>
                        <h4 className="text-xs font-black text-white tracking-tight leading-tight uppercase">{currentUser.name}</h4>
                        <p className="text-[9px] text-slate-500 font-mono">ID: @{currentUser.username}</p>
                      </div>
                      
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Yield Portfolio</span>
                        <span className="text-emerald-400 font-mono font-black">₹{currentUser.profitWallet?.toLocaleString() || '0'}</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span className="text-[9px] text-amber-500 uppercase font-mono font-black tracking-wider">Sovereign Guest</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans font-medium">
                        Access micro-yield HFT trading contracts and institutional ledger compliance.
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation Links */}
                <div className="space-y-1.5">
                  <span className="text-[8px] uppercase font-mono tracking-[0.2em] text-slate-500 font-black block mb-2 px-1">
                    System Hub Navigation
                  </span>
                  
                  {!isLoggedIn ? (
                    <>
                      {/* Guest Navigation */}
                      <button
                        onClick={() => {
                          setAuthMode('login');
                          setActiveTab('account');
                          setDrawerOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all border ${
                          activeTab === 'account' && authMode === 'login'
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                            : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <User className="w-4 h-4 shrink-0" />
                        <span>Access Login</span>
                      </button>

                      <button
                        onClick={() => {
                          setAuthMode('signup');
                          setActiveTab('account');
                          setDrawerOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-[10px] uppercase tracking-wider font-black text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
                        <span>Create Account</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Member Navigation */}
                      <button
                        onClick={() => {
                          setActiveTab('plan');
                          setDrawerOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all border ${
                          activeTab === 'plan'
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                            : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Award className="w-4 h-4 shrink-0" />
                        <span>Trading Plans</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('trade');
                          setDrawerOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all border ${
                          activeTab === 'trade'
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                            : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4 shrink-0" />
                        <span>Live Trading Desk</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('market');
                          setDrawerOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all border ${
                          activeTab === 'market'
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                            : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <BarChart2 className="w-4 h-4 shrink-0" />
                        <span>Market Intelligence</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('wallet');
                          setDrawerOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all border ${
                          activeTab === 'wallet'
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                            : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Wallet className="w-4 h-4 shrink-0" />
                        <span>Ledger Wallet</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('account');
                          setDrawerOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all border ${
                          activeTab === 'account'
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                            : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <User className="w-4 h-4 shrink-0" />
                        <span>Client Profile</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Desk Directives */}
                <div className="space-y-2 pt-4 border-t border-slate-800/60">
                  <span className="text-[8px] uppercase font-mono tracking-[0.2em] text-slate-500 font-black block mb-1 px-1">
                    Compliance & Support
                  </span>
                  <div className="space-y-2 text-[10px] font-mono text-slate-400">
                    <div className="flex items-center space-x-2 px-1">
                      <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>+91 {supportPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2 px-1 text-[8px] text-slate-500 leading-normal uppercase">
                      <span>M-F • 9:00 AM - 6:00 PM IST</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Sticky Bottom Action */}
              {isLoggedIn && (
                <div className="p-4 border-t border-white/5 bg-[#05070a]">
                  <button
                    onClick={() => {
                      onLogout();
                      setDrawerOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Terminate Session</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom Navigation Bar */}
      {isLoggedIn && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#070b14]/95 border-t border-slate-850 py-1.5 px-1 flex justify-around items-center z-50 shadow-2xl backdrop-blur-md" id="mobile-bottom-nav">
          <>
            {/* Plans Button */}
            <button
              onClick={() => setActiveTab('plan')}
              className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2 rounded-xl transition-all ${
                activeTab === 'plan' ? 'text-amber-400 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-4.5 h-4.5" />
              <span className="text-[9px] tracking-wide font-mono uppercase">Plans</span>
            </button>

            {/* Trade Button */}
            <button
              onClick={() => setActiveTab('trade')}
              className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2 rounded-xl transition-all ${
                activeTab === 'trade' ? 'text-amber-400 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4.5 h-4.5" />
              <span className="text-[9px] tracking-wide font-mono uppercase">Trade</span>
            </button>

            {/* Market Button */}
            <button
              onClick={() => setActiveTab('market')}
              className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2 rounded-xl transition-all ${
                activeTab === 'market' ? 'text-amber-400 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-4.5 h-4.5" />
              <span className="text-[9px] tracking-wide font-mono uppercase">Market</span>
            </button>

            {/* Wallet Button */}
            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2 rounded-xl transition-all ${
                activeTab === 'wallet' ? 'text-amber-400 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-4.5 h-4.5" />
              <span className="text-[9px] tracking-wide font-mono uppercase">Wallet</span>
            </button>

            {/* Account Button */}
            <button
              onClick={() => setActiveTab('account')}
              className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2 rounded-xl transition-all ${
                activeTab === 'account' ? 'text-amber-400 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4.5 h-4.5" />
              <span className="text-[9px] tracking-wide font-mono uppercase">Account</span>
            </button>
          </>
        </div>
      )}
    </>
  );
}
