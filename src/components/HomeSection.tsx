import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SystemSettings, StockTicker } from '../types';
import { formatIndianCurrency, INITIAL_TICKERS } from '../data';
import { CryptixLogo } from './Header';
import { 
  TrendingUp, 
  Sparkles, 
  MessageCircle, 
  Mail, 
  DollarSign, 
  Lock, 
  User,
  Award,
  ShieldCheck,
  Landmark,
  Zap,
  CreditCard,
  Check,
  Smartphone,
  Globe,
  Shield,
  BarChart3,
  Coins,
  Code2,
  Headphones,
  Phone
} from 'lucide-react';

import EducationSection from './EducationSection';

interface HomeSectionProps {
  systemSettings: SystemSettings;
  isLoggedIn: boolean;
  onNavigateToAuth: (mode?: 'login' | 'signup') => void;
  onNavigateToPlans: () => void;
}

export default function HomeSection({
  systemSettings,
  isLoggedIn,
  onNavigateToAuth,
  onNavigateToPlans
}: HomeSectionProps) {
  // Market Index Chart state (Nifty 50 or Sensex)
  const [chartIndex, setChartIndex] = useState<'NIFTY' | 'SENSEX' | 'CRYPTIX'>('NIFTY');
  const [chartData, setChartData] = useState<number[]>([]);
  const [tickers, setTickers] = useState<StockTicker[]>(INITIAL_TICKERS);

  // Simulate real-time stock price fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers(prev =>
        prev.map(ticker => {
          const changePercent = (Math.random() - 0.48) * 0.4; // slight bias upwards
          const newPrice = ticker.price * (1 + changePercent / 100);
          const diff = newPrice - ticker.price;
          const currentChange = ticker.change + (diff / ticker.price) * 100;
          return {
            ...ticker,
            price: Number(newPrice.toFixed(2)),
            change: Number(currentChange.toFixed(2)),
            trend: currentChange >= 0 ? 'up' : 'down'
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Generate initial chart data
  useEffect(() => {
    let basePrice = chartIndex === 'NIFTY' ? 23500 : chartIndex === 'SENSEX' ? 77200 : 10000;
    const initialPoints = Array.from({ length: 20 }, (_, i) => {
      basePrice = basePrice + (Math.random() - 0.47) * 80;
      return basePrice;
    });
    setChartData(initialPoints);
  }, [chartIndex]);

  // Update chart data in real time
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        if (prev.length === 0) return [];
        const last = prev[prev.length - 1];
        const nextPrice = last + (Math.random() - 0.46) * 45; // slight upward drift
        const updated = [...prev.slice(1), nextPrice];
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // SVG Chart path calculation helper
  const getSvgPath = () => {
    if (chartData.length === 0) return '';
    const min = Math.min(...chartData);
    const max = Math.max(...chartData);
    const height = 140;
    const width = 500;
    const range = max - min || 1;
    
    return chartData.map((val, idx) => {
      const x = (idx / (chartData.length - 1)) * width;
      const y = height - ((val - min) / range) * height + 10;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // SVG Area path calculation helper
  const getSvgAreaPath = () => {
    const linePath = getSvgPath();
    if (!linePath) return '';
    const width = 500;
    const height = 160;
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  };

  return (
    <div className="space-y-12 pb-16" id="home-section-container">
      {/* Brand & Regulatory Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-[#05070a] border border-amber-500/10 rounded-[2.5rem] p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden text-center space-y-8" id="home-branding-banner">
        {/* Decorative Luxury Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #f59e0b 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-amber-500/20 rounded-tl-3xl"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-amber-500/20 rounded-br-3xl"></div>

        {/* 1. CryptixOne Website Name */}
        <div className="space-y-4 relative z-10 flex flex-col items-center">
          <div className="space-y-3">
            <h1 className="text-[42px] font-bold leading-[21px] tracking-tight text-white font-sans text-center">
              Cryptix<span className="text-amber-500">One</span>
            </h1>
            <div className="flex items-center justify-center space-x-4">
              <div className="h-[1px] w-12 md:w-20 bg-amber-500/30"></div>
              <p className="text-[8px] leading-[13px] font-['Inter'] font-black text-amber-400 tracking-[0.35em] md:tracking-[0.5em] uppercase font-sans text-center">
                Leading Digital Asset Management Platform
              </p>
              <div className="h-[1px] w-12 md:w-20 bg-amber-500/30"></div>
            </div>
          </div>
        </div>

        {/* 3. Real-time Ticker Tape */}
        <div className="bg-black/40 backdrop-blur-md text-xs py-3 overflow-hidden border-y border-white/5 flex items-center relative mt-6" id="ticker-tape">
          <div className="absolute left-0 top-0 bottom-0 bg-amber-500 px-4 font-black text-slate-950 flex items-center z-10 text-[9px] uppercase tracking-[0.2em]">
            Live Market
          </div>
          <div className="flex animate-marquee whitespace-nowrap pl-32 space-x-12">
            {tickers.map((ticker, idx) => (
              <div key={`${ticker.symbol}-${idx}`} className="inline-flex items-center space-x-3 text-[11px] font-mono">
                <span className="text-slate-500 font-bold uppercase">{ticker.symbol}</span>
                <span className="text-white font-black">{formatIndianCurrency(ticker.price)}</span>
                <span className={`font-black flex items-center ${ticker.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {ticker.trend === 'up' ? '▲' : '▼'} {Math.abs(ticker.change).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Hero Welcome & Live Chart section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-[#05070a] p-10 md:p-16 border border-white/5 shadow-2xl" id="hero-banner">
        {/* Subtle Luxury Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
          {/* Main Info */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 text-left">
            <div className="inline-flex items-center space-x-3 bg-white/5 text-amber-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] w-fit border border-white/10">
              <Sparkles className="w-4 h-4" />
              <span>Secure Wealth Management</span>
            </div>
            
            <h2 className="text-[28px] font-bold tracking-tighter text-white leading-[29.6px] font-sans">
              Grow Your Capital With <br />
              <span className="text-amber-500">
                Professional Trading Tools
              </span>
            </h2>
            
            <p className="text-slate-400 text-[17px] max-w-xl leading-[26.25px] font-medium">
              Cryptix One is your gateway to professional digital asset management. Our platform uses advanced technology to help you achieve consistent growth while keeping your assets secure.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <button 
                onClick={onNavigateToPlans}
                className="brand-gradient-button group"
              >
                <span>
                  Start Free Trial
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform">
                    <path d="M7 7h10v10"></path>
                    <path d="M7 17 17 7"></path>
                  </svg>
                </span>
              </button>
              <button 
                onClick={() => onNavigateToAuth('signup')}
                className="bg-transparent border border-white/10 hover:bg-white/5 text-white font-black px-10 py-5 rounded-xl text-[12px] leading-[5px] uppercase tracking-[0.3em] transition-all"
              >
                {isLoggedIn ? "Go to Dashboard" : "Create Account"}
              </button>
            </div>
          </div>

          {/* Real-time Widget Chart */}
          <div className="lg:col-span-5 bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Award className="w-24 h-24 text-amber-500" />
            </div>
            
            <div className="flex justify-between items-center pb-6 border-b border-white/5 relative z-10 text-[15px] leading-[12px] rounded-[23px]">
              <div className="flex space-x-3">
                {(['NIFTY', 'SENSEX', 'CRYPTIX'] as const).map(idx => (
                  <button
                    key={idx}
                    onClick={() => setChartIndex(idx)}
                    className={`px-4 py-2 text-[10px] rounded-lg font-black uppercase tracking-widest transition-all ${
                      chartIndex === idx
                        ? 'bg-amber-500 text-slate-950 shadow-lg'
                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {idx === 'CRYPTIX' ? 'Cryptix' : idx === 'NIFTY' ? 'Nifty 50' : 'Sensex'}
                  </button>
                ))}
              </div>
              <span className="text-[9px] uppercase font-black text-amber-500 tracking-[0.2em] flex items-center bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
                Live
              </span>
            </div>

            <div className="py-8 flex flex-col items-start relative z-10">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Market Price</p>
              <div className="flex items-baseline space-x-3 mt-2">
                <span className="text-4xl font-black text-white tabular-nums font-mono tracking-tighter">
                  {chartData.length > 0 ? chartData[chartData.length - 1].toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '...'}
                </span>
                <span className="text-sm font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">+1.24%</span>
              </div>
            </div>

            {/* Simulated Live SVG Line Chart */}
            <div className="relative h-32 w-full mt-4" id="live-line-chart-svg">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                {/* Subtle Grid */}
                <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                
                {/* Area path */}
                <path d={getSvgAreaPath()} fill="url(#chartGlow)" />
                {/* Line path */}
                <path d={getSvgPath()} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5 text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">
              <span></span>
              <span className="flex items-center"><Lock className="w-3 h-3 mr-1.5" /> High-Encryption Mode</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Strategic Trading Intelligence Section */}
      <EducationSection />

      {/* Features Section */}
      {!isLoggedIn && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="sm:px-6 lg:px-8 max-w-7xl mr-auto ml-auto pt-16 pr-4 pb-24 pl-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 ring-1 ring-white/5 text-sm text-zinc-400 mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Features</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl tracking-tight font-semibold mb-6">
              Everything you need
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              A complete payment solution designed for modern businesses. Fast, secure, and reliable.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feature 1 - Instant Payments */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative rounded-3xl bg-zinc-950/80 ring-1 ring-white/5 p-6 sm:p-7 overflow-hidden hover:ring-white/10 transition-all">
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none [mask-image:radial-gradient(60%_60%_at_80%_0%,white,transparent)]"
                style={{ background: 'radial-gradient(1200px 400px at 85% -10%, rgba(120,120,255,0.08), transparent)' }}></div>

              <div className="relative">
                <div className="size-12 rounded-2xl bg-zinc-900 ring-1 ring-white/5 flex items-center justify-center mb-5">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>

                <h3 className="text-2xl tracking-tight font-semibold mb-3">Instant Payments</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Process transactions in real-time with our lightning-fast payment infrastructure. No delays, no hassle.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-zinc-900/60 ring-1 ring-white/5">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm">All major cards</span>
                    </div>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-zinc-900/60 ring-1 ring-white/5">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm">Digital wallets</span>
                    </div>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-zinc-900/60 ring-1 ring-white/5">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm">Global coverage</span>
                    </div>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 - Secure Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative rounded-3xl bg-zinc-950/90 ring-1 ring-white/5 p-6 sm:p-8 overflow-hidden hover:ring-white/10 transition-all">
              <div className="absolute inset-x-0 -bottom-24 h-64 pointer-events-none"
                style={{ background: 'radial-gradient(60% 50% at 50% 100%, rgba(16,185,129,0.18), transparent 60%)' }}></div>

              <div className="relative">
                <div
                  className="size-12 rounded-2xl bg-emerald-600/20 ring-1 ring-emerald-500/30 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>

                <h3 className="text-2xl tracking-tight font-semibold mb-3">Secure Transactions</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Bank-level encryption and fraud detection to keep your payments safe and secure.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Encryption</p>
                    <p className="text-lg font-semibold text-zinc-200">256-bit SSL</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Uptime</p>
                    <p className="text-lg font-semibold text-zinc-200">99.99%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Compliance</p>
                    <p className="text-lg font-semibold text-zinc-200">PCI DSS</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Verification</p>
                    <div className="inline-flex items-center gap-1.5">
                      <div className="size-1.5 rounded-full bg-emerald-400"></div>
                      <p className="text-lg font-semibold text-emerald-400">Active</p>
                    </div>
                  </div>
                </div>

                <div
                  className="relative rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 ring-1 ring-white/5 p-4 overflow-hidden">
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ background: 'linear-gradient(120deg, rgba(16,185,129,0.18), transparent 40%)' }}></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium">End-to-end encrypted</span>
                    </div>
                    <Shield className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 - Analytics Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative rounded-3xl bg-zinc-950/90 ring-1 ring-white/5 p-5 overflow-hidden hover:ring-white/10 transition-all flex flex-col">
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: 'linear-gradient(160deg, rgba(168,85,247,0.18), transparent 40%)' }}></div>

              <div className="relative flex-1 flex flex-col">
                <div
                  className="size-12 rounded-2xl bg-purple-600/20 ring-1 ring-purple-500/30 flex items-center justify-center mb-5">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>

                <h3 className="text-2xl tracking-tight font-semibold mb-3">Analytics Dashboard</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Track every transaction with real-time insights and detailed reporting.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-zinc-400">Total Revenue</span>
                    <span className="text-sm font-semibold">$847,250</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-900 overflow-hidden ring-1 ring-white/5">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: '68%' }}></div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-zinc-400">Transactions</span>
                    <span className="text-sm font-semibold">12,847</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-900 overflow-hidden ring-1 ring-white/5">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: '84%' }}></div>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <button 
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 text-zinc-100 py-3.5 ring-1 ring-white/5 hover:bg-zinc-800 transition"
                    onClick={() => onNavigateToAuth('login')}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">View Dashboard</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* How It Works Flow Chart Section */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-black border border-white/5 rounded-[3rem] p-12 md:p-20 relative overflow-hidden" id="how-it-works-section">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[150px]"></div>
        
        <div className="text-center space-y-6 mb-20 max-w-3xl mx-auto">
          <div className="text-[10px] text-amber-500 font-black tracking-[0.5em] uppercase mb-2">Process Overview</div>
          <h3 className="text-3xl md:text-5xl font-normal text-white tracking-tighter font-sans">How <span className="text-amber-500">It</span> Works</h3>
          <p className="text-slate-500 text-base leading-relaxed font-medium">
            Our simple 4-step process to start growing your wealth with Cryptix One.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10 text-left">
          {[
            { step: '01', title: 'Create Account', desc: 'Sign up for a free account on our platform. It only takes a few minutes to get started.', icon: User },
            { step: '02', title: 'Choose a Plan', desc: 'Browse our range of investment plans and select the one that best fits your financial goals.', icon: DollarSign },
            { step: '03', title: 'Add Funds', desc: 'Deposit money into your wallet securely and invest in your chosen plan.', icon: Lock },
            { step: '04', title: 'Withdraw Profits', desc: 'Watch your profits grow. Once your investment cycle is complete, you can withdraw your earnings.', icon: Sparkles }
          ].map((item, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group relative">
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-500">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-5xl font-black text-white/5 font-sans group-hover:text-amber-500/10 transition-colors">{item.step}</span>
                </div>
                <h4 className="text-xl font-normal text-white font-sans tracking-tight">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
              {idx < 3 && <div className="hidden lg:block absolute top-7 -right-6 w-12 h-[1px] bg-white/5"></div>}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Institutional Trust Section */}
      <section className="py-8 border-y border-white/5 bg-[#05070a]/50 backdrop-blur-sm rounded-3xl" id="institutional-trust-footer">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-60 hover:opacity-100 transition-opacity duration-500">
            {/* Govt of India */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center p-1.5 bg-black/60 shadow-lg">
                <img src="/src/assets/images/ministry_finance_india_logo_1784909476009.jpg" alt="Govt of India" className="w-full h-full object-contain" loading="lazy" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-amber-500 leading-none uppercase tracking-widest">MINISTRY OF FINANCE</p>
                <p className="text-[8px] text-white leading-tight uppercase font-bold mt-1 tracking-tighter">GOVERNMENT OF INDIA</p>
              </div>
            </div>

            {/* SBI Finance */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center p-1.5 bg-black/60 shadow-lg">
                <img src="/src/assets/images/sbi_finance_logo_1784909491498.jpg" alt="SBI" className="w-full h-full object-contain" loading="lazy" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-blue-400 leading-none uppercase tracking-widest">SBI FINANCE</p>
                <p className="text-[8px] text-white leading-tight uppercase font-bold mt-1 tracking-tighter">OFFICIAL PARTNER</p>
              </div>
            </div>

            {/* SEBI Compliance Placeholder Icon */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full border border-emerald-500/30 flex items-center justify-center p-1.5 bg-black/60 shadow-lg text-emerald-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-emerald-400 leading-none uppercase tracking-widest">SECURE & VERIFIED</p>
                <p className="text-[8px] text-white leading-tight uppercase font-bold mt-1 tracking-tighter">REGULATORY COMPLIANT</p>
              </div>
            </div>
          </div>
        </div>
      </section>




      {/* Customer Success Section */}
      <section className="z-10 sm:pb-8 sm:pt-8 sm:ml-auto sm:mr-auto sm:mt-24 sm:mb-24 max-w-7xl mt-24 mr-auto mb-24 ml-auto pt-8 pr-6 pb-8 pl-6 relative shadow-2xl" id="customer-success-results">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
          </svg>
          <span className="font-normal font-geist">Customer Success</span>
        </div>
        <div className="mt-2 text-left">
          <h2 className="text-[44px] sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.9] text-white font-geist font-medium tracking-tighter">
            Results.
          </h2>
          <p className="mt-1 text-sm sm:text-base text-zinc-400 font-normal font-geist">
            Real impact from real workflows
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 text-left">
          {/* Metrics card */}
          <motion.article 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="sm:p-6 flex flex-col min-h-[420px] bg-zinc-800/50 rounded-2xl pt-5 pr-5 pb-5 pl-5 backdrop-blur-lg justify-between hover:border-zinc-700 transition border border-white/5 relative overflow-hidden group">
            <div className="space-y-5">
              <div className="flex items-end gap-2">
                <span className="text-5xl sm:text-6xl text-white font-geist font-normal tracking-tighter">
                  99.8
                </span>
                <span className="text-zinc-400 text-base font-normal font-geist">
                  %
                </span>
              </div>
              <p className="text-sm text-zinc-300 font-geist">
                We've automated <span className="font-medium text-white font-geist">250K+ workflows</span> with industry-leading uptime and reliability.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white font-geist">
                  CryptixAI®
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-zinc-300" />
                </div>
                <div className="h-7 w-7 bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-700 -ml-2 rounded-full flex items-center justify-center">
                  <Award className="h-3 w-3 text-zinc-300" />
                </div>
                <div className="h-7 w-7 bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-700 -ml-2 rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-3 w-3 text-zinc-300" />
                </div>
                <span className="inline-flex items-center justify-center -ml-1 h-7 px-2 rounded-full bg-white text-zinc-900 text-xs font-normal font-geist">
                  250K+
                </span>
              </div>
              <div className="flex items-center gap-1 text-emerald-500">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs text-zinc-400 font-normal font-geist">
                  Active across 50+ industries
                </span>
              </div>
            </div>
          </motion.article>

          {/* Testimonial columns */}
          <div className="grid grid-rows-[auto_1fr] gap-4">
            <article className="flex bg-zinc-800/50 rounded-2xl pt-4 pr-4 pb-4 pl-4 backdrop-blur-lg items-center justify-between hover:border-zinc-700 transition border border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-cover rounded-md bg-zinc-700" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320')" }}></div>
                <div className="text-left">
                  <p className="text-sm font-medium tracking-tight leading-tight text-white font-geist">
                    Sarah Chen
                  </p>
                  <p className="text-xs text-zinc-400 font-geist">
                    TechFlow Solutions
                  </p>
                </div>
              </div>
              <span className="text-zinc-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
              </span>
            </article>

            <article className="sm:p-6 flex flex-col min-h-[420px] bg-zinc-800/50 border border-zinc-800 rounded-2xl pt-5 pr-5 pb-5 pl-5 backdrop-blur-lg justify-between hover:border-zinc-700 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-emerald-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 fill-emerald-500">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                    </svg>
                  ))}
                </div>
                <span className="text-zinc-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </span>
              </div>
              <p className="text-2xl sm:text-3xl text-right leading-snug text-white font-geist font-normal tracking-tighter">
                CryptixOne reduced our processing time by 85% and eliminated manual errors completely.
              </p>
            </article>
          </div>

          <div className="grid grid-rows-[1fr_auto] gap-4">
            <article className="flex flex-col min-h-[420px] bg-zinc-800/50 border border-zinc-800 rounded-2xl pt-6 pr-6 pb-6 pl-6 backdrop-blur-lg justify-between hover:border-zinc-700 transition">
              <p className="text-2xl sm:text-3xl text-center leading-snug text-white font-geist font-normal tracking-tighter">
                The AI learns our patterns and suggests optimizations we never considered.
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-1 text-emerald-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 fill-emerald-500">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                    </svg>
                  ))}
                </div>
                <span className="text-zinc-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </span>
              </div>
            </article>

            <article className="flex gap-3 bg-zinc-800/50 border border-zinc-800 rounded-2xl pt-4 pr-4 pb-4 pl-4 backdrop-blur-lg items-center hover:border-zinc-700 transition">
              <div className="h-9 w-9 bg-cover border border-zinc-700 rounded-md bg-zinc-700" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320')" }}></div>
              <div className="text-left">
                <p className="text-sm font-medium tracking-tight leading-tight text-white font-geist">
                  Marcus Johnson
                </p>
                <p className="text-xs text-zinc-400 font-geist">Innovate Labs</p>
              </div>
            </article>
          </div>

          <div className="grid grid-rows-[auto_1fr] gap-4">
            <article className="flex bg-zinc-800/50 border border-zinc-800 rounded-2xl pt-4 pr-4 pb-4 pl-4 backdrop-blur-lg items-center justify-between hover:border-zinc-700 transition">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-cover border border-zinc-700 rounded-md bg-zinc-700" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=320')" }}></div>
                <div className="text-left">
                  <p className="text-sm font-medium tracking-tight leading-tight text-white font-geist">
                    Maya Patel
                  </p>
                  <p className="text-xs text-zinc-400 font-geist">
                    Operations Director
                  </p>
                </div>
              </div>
              <span className="text-zinc-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
              </span>
            </article>

            <article className="sm:p-6 flex flex-col min-h-[420px] bg-zinc-800/50 border border-zinc-800 rounded-2xl pt-5 pr-5 pb-5 pl-5 backdrop-blur-lg justify-between hover:border-zinc-700 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-emerald-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 fill-emerald-500">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                    </svg>
                  ))}
                </div>
                <span className="text-zinc-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </span>
              </div>
              <p className="text-2xl sm:text-3xl text-right leading-snug text-white font-geist font-normal tracking-tighter">
                Seamless integration with our existing tools. Setup took minutes, not weeks.
              </p>
            </article>
          </div>
        </div>
      </section>

    </div>
  );
}

