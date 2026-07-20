import React from 'react';
import { ShieldCheck, Phone, TrendingUp, HelpCircle, Home, Award, User, Lock, Wallet } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setAuthMode: (mode: 'login' | 'signup') => void;
  isLoggedIn: boolean;
  currentUser: any;
  onLogout: () => void;
  supportPhone: string;
}

export default function Header({
  activeTab,
  setActiveTab,
  setAuthMode,
  isLoggedIn,
  currentUser,
  onLogout,
  supportPhone
}: HeaderProps) {
  return (
    <>
      <header className="w-full bg-[#05070a]/98 backdrop-blur-xl text-white border-b border-white/5 sticky top-0 z-50 shadow-2xl" id="app-header">
      {/* Main Branding Header Row */}
      <div className="hidden md:flex max-w-7xl mx-auto px-6 py-5 flex-row justify-between items-center" id="main-nav-bar">
        
        {/* Branding (Mobile & Desktop) */}
        <div className="flex items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-xl font-black tracking-tighter text-white font-sans">
                Cryptix<span className="text-amber-500">One</span>
              </span>
            </div>
            <div className="hidden lg:block h-6 w-[1px] bg-white/10 mx-2"></div>
            <div className="hidden lg:flex items-center space-x-2 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-bold tracking-widest uppercase">+91 {supportPhone}</span>
            </div>
          </div>
        </div>

        {/* Navigation & User Profiles */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {!isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAuthMode('login')}
                className="px-3 md:px-5 py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Login
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className="px-3 md:px-5 py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <nav className="hidden md:flex items-center space-x-2 bg-white/5 p-1.5 rounded-xl border border-white/5">
                <button
                  id="btn-nav-plan"
                  onClick={() => setActiveTab('plan')}
                  className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === 'plan'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
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
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Trade
                </button>
                <button
                  id="btn-nav-wallet"
                  onClick={() => setActiveTab('wallet')}
                  className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === 'wallet'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
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
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Account
                </button>
            </nav>
          )}

          {/* Secure Badge / Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Secure</span>
            </div>
            
            {/* Logout button removed - already present in Account section */}
          </div>
        </div>
      </div>
    </header>

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
