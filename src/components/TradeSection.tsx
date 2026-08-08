import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Coins, 
  Infinity as InfinityIcon, 
  Info, 
  Wallet, 
  Bell, 
  ChevronDown, 
  ArrowLeft, 
  ArrowDown, 
  ArrowUp,
  Search,
  Star,
  ChevronRight,
  PieChart,
  TrendingUp,
  Sliders,
  ChevronLeft
} from 'lucide-react';
import { User, ActiveTrade, SystemSettings } from '../types';
import { toast } from 'sonner';

interface TradeSectionProps {
  activeTrades: ActiveTrade[];
  isLoggedIn: boolean;
  currentUser: User | null;
  onExecuteTrade?: (amount: number, estimatedProfit: number, assetName: string, durationLabel: string) => void;
  onNavigateToWallet?: (subTab?: 'deposit' | 'withdraw' | 'history') => void;
  onNavigateToHome?: () => void;
  onInvestSelect?: (plan: any) => void;
  systemSettings: SystemSettings;
  onChangeTab?: (tab: string) => void;
}

type InternalTab = 'home' | 'defi' | 'futures' | 'info';

const DEFI_DATA = [
  { name: 'LISTA', sub: 'Lista', price: 0.0563, change: 3.87, icon: 'list' },
  { name: 'BEL', sub: 'Bella Protocol', price: 0.1056, change: 3.63, icon: 'bell' },
  { name: 'QI', sub: 'BENQI', price: 0.001272, change: 3.08, icon: 'zap' },
  { name: 'AVNT', sub: 'Avantis', price: 0.0893, change: 3.00, icon: 'rocket' },
  { name: 'CFG', sub: 'Centrifuge', price: 0.1631, change: 2.84, icon: 'settings' },
  { name: 'PENDLE', sub: 'Pendle', price: 1.40, change: 2.79, icon: 'clock' },
  { name: 'MMT', sub: 'Momentum', price: 0.2185, change: 26.96, icon: 'rocket' },
  { name: 'DODO', sub: 'DODO', price: 0.02273, change: 13.65, icon: 'eye' },
  { name: 'DYDX', sub: 'dYdX', price: 0.11581, change: 2.20, icon: 'trending-up' },
];

const FUTURES_DATA = [
  { pair: 'BTC', base: 'BTC', quote: 'USDT', price: 64182.50, change: 2.34, vol: '1.24B', high: 64800, low: 63600, oi: '12.4B' },
  { pair: 'ETH', base: 'ETH', quote: 'USDT', price: 3482.20, change: 1.87, vol: '876M', high: 3520, low: 3440, oi: '8.7B' },
  { pair: 'BNB', base: 'BNB', quote: 'USDT', price: 598.40, change: -0.32, vol: '234M', high: 605, low: 592, oi: '2.1B' },
  { pair: 'SOL', base: 'SOL', quote: 'USDT', price: 187.65, change: 5.13, vol: '567M', high: 192, low: 178, oi: '3.4B' },
  { pair: 'XRP', base: 'XRP', quote: 'USDT', price: 0.6214, change: 1.02, vol: '123M', high: 0.63, low: 0.61, oi: '890M' },
  { pair: 'ADA', base: 'ADA', quote: 'USDT', price: 0.4582, change: -1.24, vol: '98M', high: 0.47, low: 0.45, oi: '456M' },
];

export default function TradeSection({
  currentUser,
  onExecuteTrade,
  onChangeTab,
  systemSettings
}: TradeSectionProps) {
  const [activeTab, setActiveTab] = useState<InternalTab>('home');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [demoBalance, setDemoBalance] = useState(80000);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeAmount, setTradeAmount] = useState('100');
  const [tradeTime, setTradeTime] = useState('01:00');

  const realBalance = (currentUser?.depositWallet || 0) + (currentUser?.profitWallet || 0);
  const currentBalance = isDemoMode ? demoBalance : realBalance;

  // --- Chart Drawing Logic ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current && activeTab !== 'home') return;
    
    const drawChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;
      const points = 60;
      const data: number[] = [];
      let p = 100;
      for (let i = 0; i < points; i++) {
        p = p + (Math.random() - 0.5) * 5;
        data.push(p);
      }

      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min;

      ctx.clearRect(0, 0, w, h);
      
      // Grid
      ctx.strokeStyle = 'rgba(132, 142, 156, 0.1)';
      ctx.setLineDash([2, 2]);
      for (let i = 0; i < 5; i++) {
        const y = (h / 4) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.setLineDash([]);

      // Main Line
      ctx.beginPath();
      ctx.strokeStyle = '#f0b90b';
      ctx.lineWidth = 2;
      data.forEach((val, i) => {
        const x = (i / (points - 1)) * w;
        const y = h - ((val - min) / range) * h * 0.8 - h * 0.1;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Area
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(240, 185, 11, 0.1)');
      grad.addColorStop(1, 'transparent');
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fillStyle = grad;
      ctx.fill();
    };

    drawChart();
    const interval = setInterval(drawChart, 3000);
    return () => clearInterval(interval);
  }, [activeTab, selectedAsset]);

  const handleTrade = (type: 'buy' | 'sell') => {
    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    if (type === 'buy' && amount > currentBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (isDemoMode) {
      setDemoBalance(prev => type === 'buy' ? prev - amount : prev + amount);
      toast.success(`${type.toUpperCase()} executed (Demo)`);
    } else {
      if (onExecuteTrade && selectedAsset) {
        onExecuteTrade(amount, amount * 1.82, selectedAsset.pair || selectedAsset.name, '1m');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e11] text-[#eaecef] font-sans select-none overflow-hidden" id="full-trade-dashboard">
      {/* App Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#2b3139] bg-[#0b0e11] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => selectedAsset ? setSelectedAsset(null) : onChangeTab?.('plan')}
            className="p-1 text-[#848e9c] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[#f0b90b]">F<span className="text-white">utures</span></span>
            <span className="text-[9px] bg-[#f0b90b] text-black px-2 py-0.5 rounded-full font-bold">PRO</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1e2329] px-3 py-1.5 rounded-full border border-[#2b3139] cursor-pointer hover:border-[#f0b90b] transition-all">
            <Wallet className="w-4 h-4 text-[#f0b90b]" />
            <span className="text-xs font-bold text-[#0ecb81]">₹{realBalance.toLocaleString()}</span>
          </div>
          <button className="text-[#848e9c] hover:text-white">
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden bg-[#0b0e11] relative">
        <AnimatePresence mode="wait">
          {selectedAsset ? (
            <motion.div 
              key="trading-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full bg-[#0b0e11] overflow-hidden absolute inset-0"
            >
              {/* Header inside Trading View */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-[#1e232c] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedAsset(null)} className="p-1">
                    <ArrowLeft className="w-6 h-6 text-[#848e9c]" />
                  </button>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-[#848e9c] font-bold">Demo account</span>
                      <ChevronDown className="w-3 h-3 text-[#848e9c]" />
                    </div>
                    <span className="text-xl font-black text-white">₹{demoBalance.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-[#f0b90b] p-2 rounded-xl shadow-lg shadow-[#f0b90b]/10 cursor-pointer active:scale-95 transition-transform">
                    <Wallet className="w-5 h-5 text-black" />
                  </div>
                  <div className="w-9 h-9 rounded-full border-2 border-slate-700 p-0.5 overflow-hidden cursor-pointer">
                    <img src="https://i.ibb.co/f4pXh6S/logo.png" alt="Profile" className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Asset Selection Bar */}
              <div className="px-4 py-2 flex items-center gap-3 flex-shrink-0">
                <div className="p-2 bg-[#1e232c] rounded-lg cursor-pointer hover:bg-[#2b3139] transition-colors">
                  <span className="text-white font-bold">+</span>
                </div>
                <div className="flex-grow bg-[#1e232c] rounded-xl px-4 py-2 flex items-center justify-between cursor-pointer border border-transparent hover:border-[#f0b90b]/30">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[8px] font-bold text-black border border-black">B</div>
                      <div className="w-4 h-4 rounded-full bg-slate-500 flex items-center justify-center text-[8px] font-bold text-white border border-black">L</div>
                    </div>
                    <span className="text-xs font-black text-white tracking-wide">{selectedAsset.pair || selectedAsset.name} <span className="text-[#0ecb81]">82%</span></span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#848e9c]" />
                </div>
              </div>

              {/* Chart Area */}
              <div className="flex-grow relative mt-2 min-h-0">
                <canvas ref={canvasRef} className="w-full h-full" />
                
                {/* Time Labels Bottom */}
                <div className="absolute bottom-2 left-0 w-full px-4 flex justify-between text-[8px] font-bold text-[#5e6673] pointer-events-none">
                  <span>1:05:20 AM</span>
                  <span>1:05:40 AM</span>
                  <span>1:06 AM</span>
                  <span>1:06:20 AM</span>
                </div>

                {/* Floating Tools Toolbar (exactly as in image) */}
                <div className="absolute bottom-10 left-0 w-full flex justify-center">
                  <div className="flex items-center gap-2 bg-[#1e232c]/80 backdrop-blur-md rounded-2xl p-1.5 border border-white/5">
                    <div className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"><PieChart className="w-4 h-4" /></div>
                    <div className="flex flex-col items-center gap-0.5 px-3 py-1 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
                      <span className="text-[10px] font-black text-white">1s</span>
                      <div className="w-1.5 h-1.5 bg-[#f0b90b] rounded-full"></div>
                    </div>
                    <div className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"><TrendingUp className="w-4 h-4" /></div>
                    <div className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"><Sliders className="w-4 h-4" /></div>
                  </div>
                </div>
              </div>

              {/* Action Controls Section */}
              <div className="px-4 pb-6 space-y-3 flex-shrink-0 bg-[#0b0e11]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1e232c] rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[9px] text-[#848e9c] font-bold uppercase tracking-tighter">Amount</span>
                    <input 
                      type="number"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="bg-transparent text-center text-base font-black text-white outline-none w-full"
                    />
                  </div>
                  <div className="bg-[#1e232c] rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[9px] text-[#848e9c] font-bold uppercase tracking-tighter">Time</span>
                    <input 
                      type="text"
                      value={tradeTime}
                      onChange={(e) => setTradeTime(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="bg-transparent text-center text-base font-black text-white outline-none w-full"
                      placeholder="01:00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 h-10">
                  <button
                    onClick={() => handleTrade('buy')}
                    className="bg-[#0ecb81] rounded-xl flex items-center justify-center gap-2 text-white shadow-lg shadow-[#0ecb81]/20 active:scale-95 transition-all py-1 px-3"
                  >
                    <TrendingUp className="w-4 h-4 rotate-[-45deg]" />
                    <span className="text-xs font-black tracking-tight">
                      ₹{selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </button>
                  <button
                    onClick={() => handleTrade('sell')}
                    className="bg-[#f6465d] rounded-xl flex items-center justify-center gap-2 text-white shadow-lg shadow-[#f6465d]/20 active:scale-95 transition-all py-1 px-3"
                  >
                    <TrendingUp className="w-4 h-4 rotate-[135deg]" />
                    <span className="text-xs font-black tracking-tight">
                      ₹{selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'home' ? (
            <motion.div 
              key="home-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4 h-full overflow-y-auto scrollbar-hide absolute inset-0"
            >
              {/* Account Card */}
              <div 
                onClick={() => setIsDemoMode(!isDemoMode)}
                className="bg-gradient-to-br from-[#1a1f2a] to-[#0f1219] p-6 rounded-2xl border border-[#2b3139] relative overflow-hidden group cursor-pointer hover:border-[#f0b90b] transition-all"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#848e9c] uppercase font-bold tracking-wider">
                      {isDemoMode ? 'Demo Account' : 'Live Account'}
                    </span>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black ${isDemoMode ? 'bg-[#f0b90b] text-black' : 'bg-[#0ecb81] text-white'}`}>
                      {isDemoMode ? 'DEMO' : 'LIVE'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#5e6673] group-hover:text-white transition-colors" />
                </div>
                <div className="text-3xl font-black">
                  <span className="text-[#848e9c] text-lg font-bold mr-1">₹</span>
                  {currentBalance.toLocaleString()}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="bg-[#1e2329] px-4 py-1 rounded-full border border-[#2b3139] flex items-center gap-2">
                    <span className="text-sm font-black text-[#f0b90b]">82%</span>
                    <span className="text-[10px] text-[#848e9c] font-bold">Crypto IDX</span>
                    <div className="w-12 h-1 bg-[#2b3139] rounded-full overflow-hidden">
                      <div className="h-full bg-[#f0b90b] w-[82%]" />
                    </div>
                  </div>
                  <div className="text-xs font-bold text-[#0ecb81]">
                    <ArrowUp className="w-3 h-3 inline mr-0.5" /> 2.41%
                  </div>
                </div>
              </div>

              {/* Chart Summary */}
              <div className="bg-[#181a20] p-4 rounded-2xl border border-[#2b3139]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold">BTC/USDT <span className="text-[#848e9c] text-[10px]">Perpetual</span></span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">₹64,182.50</span>
                    <span className="text-xs font-bold text-[#0ecb81]">+2.34%</span>
                  </div>
                </div>
                <div className="h-24">
                   <canvas ref={canvasRef} className="w-full h-full" />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Deposit', icon: <ArrowDown className="text-[#0ecb81]" />, action: () => toast.info('Deposit feature coming soon') },
                  { label: 'Futures', icon: <InfinityIcon className="text-[#f0b90b]" />, action: () => setActiveTab('futures') },
                  { label: 'Withdraw', icon: <ArrowUp className="text-[#f6465d]" />, action: () => toast.info('Withdrawal feature coming soon') }
                ].map((act, i) => (
                  <button key={i} onClick={act.action} className="bg-[#181a20] border border-[#2b3139] p-4 rounded-xl flex flex-col items-center gap-1 hover:border-[#f0b90b] transition-all active:scale-95">
                    {act.icon}
                    <span className="text-[11px] font-bold text-[#848e9c]">{act.label}</span>
                  </button>
                ))}
              </div>

              {/* Watchlist */}
              <div className="bg-[#181a20] rounded-2xl border border-[#2b3139] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#2b3139] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#f0b90b]" />
                    <span className="text-xs font-bold text-[#848e9c]">Watchlist</span>
                  </div>
                  <button onClick={() => setActiveTab('futures')} className="text-[#f0b90b] text-[10px] font-bold">View all</button>
                </div>
                <div className="divide-y divide-[#2b3139]">
                  {FUTURES_DATA.slice(0, 4).map((s, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedAsset(s)}
                      className="px-4 py-3 flex justify-between items-center hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{s.base} <span className="text-[10px] text-[#848e9c]">/{s.quote}</span></span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">₹{s.price.toLocaleString()}</div>
                        <div className={`text-[10px] font-bold ${s.change >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                          {s.change >= 0 ? '+' : ''}{s.change}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'defi' ? (
            <motion.div 
              key="defi-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4 h-full overflow-y-auto scrollbar-hide absolute inset-0"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Coins className="w-6 h-6 text-[#f0b90b]" /> Top DeFi Tokens
                </h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5e6673]" />
                <input 
                  type="text" 
                  placeholder="Search token..."
                  className="w-full bg-[#1e2329] border border-[#2b3139] rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-[#f0b90b] transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="bg-[#181a20] rounded-2xl border border-[#2b3139] overflow-hidden">
                <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr] px-4 py-2 text-[10px] text-[#5e6673] font-bold uppercase tracking-wider border-b border-[#2b3139]">
                  <span>Icon</span>
                  <span>Name</span>
                  <span className="text-right">Price</span>
                  <span className="text-right">24h</span>
                </div>
                <div className="divide-y divide-[#2b3139]">
                  {DEFI_DATA.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).map((d, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedAsset(d)}
                      className="grid grid-cols-[1fr_2fr_1.5fr_1fr] px-4 py-3 items-center hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${d.change >= 0 ? 'bg-[#0ecb81]/10 text-[#0ecb81]' : 'bg-[#f6465d]/10 text-[#f6465d]'}`}>
                           <Coins className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{d.name}</span>
                        <span className="text-[10px] text-[#848e9c]">{d.sub}</span>
                      </div>
                      <span className="text-right text-sm font-bold">₹{d.price.toLocaleString()}</span>
                      <span className={`text-right text-xs font-bold ${d.change >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                        {d.change >= 0 ? '+' : ''}{d.change}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'futures' ? (
            <motion.div 
              key="futures-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4 h-full overflow-y-auto scrollbar-hide absolute inset-0"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <InfinityIcon className="w-6 h-6 text-[#f0b90b]" /> Futures Market
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {FUTURES_DATA.map((s, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedAsset(s)}
                    className="bg-[#181a20] p-4 rounded-xl border border-[#2b3139] cursor-pointer hover:border-[#f0b90b] transition-all active:scale-95 relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold">{s.base} <span className="text-[#848e9c] text-[10px]">/{s.quote}</span></span>
                       </div>
                       <span className="text-[8px] bg-[#2b3139] px-1.5 rounded text-[#848e9c] font-bold">PERP</span>
                    </div>
                    <div className="text-base font-bold">₹{s.price.toLocaleString()}</div>
                    <div className={`text-xs font-bold ${s.change >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                       {s.change >= 0 ? '+' : ''}{s.change}%
                    </div>
                    <div className="mt-2 text-[10px] text-[#5e6673]">Vol {s.vol}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
             <motion.div 
              key="info-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 h-full overflow-y-auto scrollbar-hide absolute inset-0"
            >
              <div className="bg-[#181a20] rounded-2xl border border-[#2b3139] p-6 space-y-4">
                <h3 className="text-xl font-bold">About Futures Trading</h3>
                <p className="text-sm text-[#848e9c] leading-relaxed">
                  Futures trading allows you to speculate on the price movement of crypto assets without owning the underlying asset. 
                  Trade with leverage, go long or short, and manage your risk with stop-loss and take-profit orders.
                </p>
                <div className="pt-4 border-t border-[#2b3139] space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#0ecb81]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0ecb81]" /> All prices are market real-time
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#0ecb81]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0ecb81]" /> Buy/Sell matched with wallet balance
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex justify-around items-center h-16 border-t border-[#2b3139] bg-[#0b0e11] flex-shrink-0 px-2">
        {[
          { id: 'home', icon: <Home className="w-6 h-6" />, label: 'Home' },
          { id: 'defi', icon: <Coins className="w-6 h-6" />, label: 'DeFi' },
          { id: 'futures', icon: <InfinityIcon className="w-6 h-6" />, label: 'Futures' },
          { id: 'info', icon: <Info className="w-6 h-6" />, label: 'Info' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as InternalTab);
              setSelectedAsset(null);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 transition-all relative ${
              activeTab === tab.id ? 'text-[#f0b90b]' : 'text-[#5e6673] hover:text-[#848e9c]'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-bold">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="nav-dot"
                className="absolute top-1 right-3 w-1.5 h-1.5 bg-[#f0b90b] rounded-full"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
