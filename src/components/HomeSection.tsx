import React, { useState, useEffect } from 'react';
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
  ShieldCheck
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
      <div className="bg-[#05070a] border border-amber-500/10 rounded-[2.5rem] p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden text-center space-y-8" id="home-branding-banner">
        {/* Decorative Luxury Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #f59e0b 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-amber-500/20 rounded-tl-3xl"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-amber-500/20 rounded-br-3xl"></div>

        {/* 1. CryptixOne Website Name */}
        <div className="space-y-4 relative z-10 flex flex-col items-center">
          <img src={systemSettings.logoUrl || "/logo.png"} alt="CryptixOne" className="w-24 h-24 mb-4 drop-shadow-[0_0_20px_rgba(245,158,11,0.45)]" />
          <div className="space-y-3">
            <h1 className="text-5xl md:text-8xl font-black tracking-tight text-white font-sans text-center">
              Cryptix<span className="text-amber-500">One</span>
            </h1>
            <div className="flex items-center justify-center space-x-4">
              <div className="h-[1px] w-12 md:w-20 bg-amber-500/30"></div>
              <p className="text-[10px] md:text-sm font-black text-amber-400 tracking-[0.35em] md:tracking-[0.5em] uppercase font-sans text-center">
                Leading Digital Asset Management Platform
              </p>
              <div className="h-[1px] w-12 md:w-20 bg-amber-500/30"></div>
            </div>
          </div>
        </div>

        {/* 2. Official Authority Logos */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 pt-4 relative z-10">
          {/* Ministry of Finance India */}
          <div className="flex items-center space-x-4 bg-white/[0.02] backdrop-blur-sm p-4 rounded-2xl border border-white/5 shadow-2xl">
            <div className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center p-1.5 overflow-hidden bg-black/60">
              <img src={systemSettings.logoUrl || "/logo.png"} alt="Company Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-left font-sans">
              <p className="text-[9px] font-semibold text-amber-500 leading-tight uppercase tracking-wider">वित्त मंत्रालय</p>
              <p className="text-[11px] font-bold text-white leading-none mt-0.5">MINISTRY OF FINANCE</p>
              <p className="text-[8px] text-slate-500 leading-tight uppercase font-medium">GOVERNMENT OF INDIA</p>
            </div>
          </div>

          {/* SBI Finance of India */}
          <div className="flex items-center space-x-4 bg-white/[0.02] backdrop-blur-sm p-4 rounded-2xl border border-white/5 shadow-2xl">
            <div className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center p-1.5 overflow-hidden bg-black/60 shadow-lg">
              <img src={systemSettings.logoUrl || "/logo.png"} alt="Company Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-left font-sans">
              <p className="text-xs font-black text-[#00a5ec] leading-none tracking-tight">SBI Finance</p>
              <p className="text-[10px] font-bold text-white leading-none">OF INDIA</p>
              <p className="text-[8px] text-amber-500 font-mono tracking-widest uppercase mt-0.5">REGISTERED PLATFORM</p>
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
      </div>

      {/* Hero Welcome & Live Chart section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#05070a] p-10 md:p-16 border border-white/5 shadow-2xl" id="hero-banner">
        {/* Subtle Luxury Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
          {/* Main Info */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 text-left">
            <div className="inline-flex items-center space-x-3 bg-white/5 text-amber-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] w-fit border border-white/10">
              <Sparkles className="w-4 h-4" />
              <span>Secure Wealth Management</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white leading-[1.1] font-sans">
              Grow Your Capital With <br />
              <span className="text-amber-500">
                Professional Trading Tools
              </span>
            </h2>
            
            <p className="text-slate-400 text-lg max-w-xl leading-relaxed font-medium">
              Cryptix One is your gateway to professional digital asset management. Our platform uses advanced technology to help you achieve consistent growth while keeping your assets secure.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <button 
                onClick={onNavigateToPlans}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-10 py-5 rounded-xl text-xs uppercase tracking-[0.3em] transition-all shadow-[0_15px_30px_rgba(245,158,11,0.2)] hover:-translate-y-1"
              >
                Start Investing
              </button>
              <button 
                onClick={() => onNavigateToAuth('signup')}
                className="bg-transparent border border-white/10 hover:bg-white/5 text-white font-black px-10 py-5 rounded-xl text-xs uppercase tracking-[0.3em] transition-all"
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
            
            <div className="flex justify-between items-center pb-6 border-b border-white/5 relative z-10">
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
      </section>

      {/* Strategic Trading Intelligence Section */}
      <EducationSection />

      {/* How It Works Flow Chart Section */}
      <section className="bg-black border border-white/5 rounded-[3rem] p-12 md:p-20 relative overflow-hidden" id="how-it-works-section">
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
            <div key={idx} className="group relative">
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
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Support footer badge */}
      <section className="bg-gradient-to-r from-[#0a0c12] to-black rounded-[2rem] p-10 border border-white/5 flex flex-col sm:flex-row items-center justify-between text-left gap-8 shadow-2xl" id="support-bar">
        <div className="flex items-center space-x-6">
          <div className="w-14 h-14 bg-amber-500/5 rounded-2xl border border-amber-500/20 flex items-center justify-center shadow-inner">
            <MessageCircle className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h4 className="text-lg font-normal text-white uppercase tracking-widest font-sans">24/7 Priority Support Desk</h4>
            <p className="text-xs text-slate-500 font-medium">Direct integration with WhatsApp desk and regulatory email channels.</p>
          </div>
        </div>

        <div className="flex space-x-4 w-full sm:w-auto">
          <a
            href={`https://wa.me/91${systemSettings.supportWhatsApp}?text=Hello%20CryptixOne%20Team,%20I%20need%20assistance%20regarding%20investment%20slots.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-500/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat WhatsApp</span>
          </a>
          <a
            href={`mailto:${systemSettings.companyEmail}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white font-black px-8 py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] border border-white/10 transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>Email Support</span>
          </a>
        </div>
      </section>
    </div>
  );
}
