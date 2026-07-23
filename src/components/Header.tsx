import React, { useState } from 'react';
import { ShieldCheck, Phone, TrendingUp, Award, User, Wallet, Menu, X, LogOut, Home, Lock, MessageSquare, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setAuthMode: (mode: 'login' | 'signup') => void;
  authMode?: 'login' | 'signup';
  isLoggedIn: boolean;
  currentUser: any;
  onLogout: () => void;
  supportPhone: string;
  mobileShowHome?: boolean;
  setMobileShowHome?: (show: boolean) => void;
  isMobile?: boolean;
}

// Highly detailed, premium logo component using the new official CryptixOne logo
export function CryptixLogo({ className = "w-9 h-9", logoUrl }: { className?: string, logoUrl?: string }) {
  return (
    <img 
      src={logoUrl || "/logo.png"} 
      alt="CryptixOne Logo" 
      className={`${className} object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]`}
      referrerPolicy="no-referrer"
    />
  );
}

export default function Header({
  activeTab,
  setActiveTab,
  setAuthMode,
  authMode,
  isLoggedIn,
  currentUser,
  onLogout,
  supportPhone,
  mobileShowHome = false,
  setMobileShowHome,
  isMobile = false,
  logoUrl
}: HeaderProps & { logoUrl?: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="w-full bg-[#05070a]/98 backdrop-blur-xl text-white border-b border-white/5 sticky top-0 z-50 shadow-2xl" id="app-header">
        
        {/* DESKTOP HEADER (hidden on mobile) */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 py-5 flex-row justify-between items-center" id="main-nav-bar">
          {/* Branding (Desktop) */}
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <div 
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => setActiveTab('home')}
              >
                <CryptixLogo className="w-10 h-10 group-hover:scale-105 transition-transform" logoUrl={logoUrl} />
                <div className="flex flex-col text-left">
                  <span className="text-xl font-black tracking-tighter text-white font-sans leading-none group-hover:text-amber-500 transition-colors">
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
                  id="btn-desktop-home-nav"
                  onClick={() => setActiveTab('home')}
                  className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === 'home'
                      ? 'bg-white/10 text-white border border-white/10'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Home
                </button>
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
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setActiveTab('home')}
            >
              <div className="p-1 text-amber-500">
                <CryptixLogo className="w-8 h-8" logoUrl={logoUrl} />
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
                  <CryptixLogo className="w-8 h-8" logoUrl={logoUrl} />
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
