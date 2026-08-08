import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Coins, 
  Building2, 
  Zap, 
  Leaf, 
  LayoutGrid, 
  RefreshCcw, 
  DollarSign, 
  Sliders, 
  ChevronDown,
  Home,
  PieChart,
  Repeat,
  BarChart2,
  Wallet,
  TrendingUp,
  Menu,
  Inbox,
  ArrowLeft,
  Bell,
  Maximize2,
  ChevronRight
} from 'lucide-react';
import { ActiveTrade, InvestmentPlan, SystemSettings, User } from '../types';
import { toast } from 'sonner';
import { INSTRUMENTS, Instrument } from '../data/tradeData';

interface TradeSectionProps {
  activeTrades: ActiveTrade[];
  isLoggedIn: boolean;
  currentUser?: User | null;
  onNavigateToHome: () => void;
  onInvestSelect?: (plan: InvestmentPlan) => void;
  systemSettings?: SystemSettings;
  onChangeTab?: (tab: string) => void;
  onExecuteTrade?: (amount: number, estimatedProfit: number, assetName: string, durationLabel: string) => void;
  onNavigateToWallet?: (subTab?: 'deposit' | 'withdraw' | 'history') => void;
}

type BrandTab = 'favorites' | 'crypto' | 'tradfi' | 'alpha' | 'grow' | 'square';
type ViewTab = 'binary' | 'spot' | 'usdm' | 'coinm' | 'options';
type FilterTab = 'DeFi' | 'Index' | 'Pre-IPO' | 'USDC' | 'Chinese' | 'Alpha' | 'AI' | 'all';

interface FuturesDashboardProps {
  currentUser: User | null;
  selectedAsset: Instrument;
  setSelectedAsset: (asset: Instrument) => void;
  onExecuteTrade?: (amount: number, estimatedProfit: number, assetName: string, durationLabel: string) => void;
}

function BinaryDashboard({ currentUser, onExecuteTrade }: { currentUser: User | null; onExecuteTrade?: any }) {
  const [amount, setAmount] = useState('100');
  const [time, setTime] = useState('01:16');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const points = 80;
    const data: number[] = [];
    let p = 641.8673;
    for (let i = 0; i < points; i++) {
      p = p + (Math.random() - 0.5) * 0.0005;
      data.push(p);
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    ctx.clearRect(0, 0, w, h);

    // Grid (Vertical)
    ctx.strokeStyle = 'rgba(132, 142, 156, 0.1)';
    ctx.setLineDash([2, 2]);
    for (let i = 0; i < 6; i++) {
      const x = (w / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    // Grid (Horizontal)
    for (let i = 0; i < 8; i++) {
      const y = (h / 7) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      
      // Price Labels on right
      ctx.setLineDash([]);
      ctx.fillStyle = '#848e9c';
      ctx.font = '8px monospace';
      ctx.textAlign = 'right';
      const val = max - (i / 7) * range;
      ctx.fillText(val.toFixed(9), w - 5, y - 5);
      ctx.setLineDash([2, 2]);
    }
    ctx.setLineDash([]);

    // Main Trading Line (Cyan/Blue as in image)
    ctx.beginPath();
    ctx.strokeStyle = '#3182ce';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(49, 130, 206, 0.5)';
    data.forEach((val, i) => {
      const x = (i / (points - 1)) * w;
      const y = h - ((val - min) / range) * (h * 0.6) - (h * 0.2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fill Area
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(49, 130, 206, 0.15)');
    grad.addColorStop(1, 'transparent');
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fillStyle = grad;
    ctx.fill();

    // Price Tracker Label
    const lastVal = data[data.length - 1];
    const ly = h - ((lastVal - min) / range) * (h * 0.6) - (h * 0.2);
    ctx.fillStyle = '#1e232c';
    ctx.fillRect(w - 70, ly - 8, 70, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(lastVal.toFixed(9), w - 35, ly + 3);

  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0b0e11] overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#1e232c]">
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#848e9c] font-bold">Demo account</span>
            <ChevronDown className="w-3 h-3 text-[#848e9c]" />
          </div>
          <span className="text-xl font-black text-white">₹805,426.96</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#f0b90b] p-2.5 rounded-xl shadow-lg shadow-[#f0b90b]/10 cursor-pointer active:scale-95 transition-transform">
            <Wallet className="w-6 h-6 text-black" />
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-slate-700 p-0.5 overflow-hidden cursor-pointer">
            <img src="https://i.ibb.co/f4pXh6S/logo.png" alt="Profile" className="w-full h-full rounded-full object-cover" />
          </div>
        </div>
      </div>

      {/* Asset Row */}
      <div className="px-4 py-2 flex items-center gap-3">
        <div className="p-2 bg-[#1e232c] rounded-lg cursor-pointer hover:bg-[#2b3139] transition-colors">
          <span className="text-white font-bold">+</span>
        </div>
        <div className="flex-grow bg-[#1e232c] rounded-xl px-4 py-2 flex items-center justify-between cursor-pointer group hover:bg-[#2b3139] transition-colors border border-transparent hover:border-[#f0b90b]/30">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[8px] font-bold text-black border border-black">B</div>
              <div className="w-4 h-4 rounded-full bg-slate-500 flex items-center justify-center text-[8px] font-bold text-white border border-black">L</div>
            </div>
            <span className="text-xs font-black text-white tracking-wide">Crypto IDX <span className="text-[#0ecb81]">82%</span></span>
          </div>
          <ChevronDown className="w-3 h-3 text-[#848e9c] group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-grow relative mt-4">
        <canvas ref={canvasRef} className="w-full h-full" />
        
        {/* Time Labels Bottom */}
        <div className="absolute bottom-2 left-0 w-full px-4 flex justify-between text-[8px] font-bold text-[#5e6673] pointer-events-none">
          <span>1:05:20 AM</span>
          <span>1:05:40 AM</span>
          <span>1:06 AM</span>
          <span>1:06:20 AM</span>
        </div>
      </div>

      {/* Floating Tools Toolbar */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 bg-[#1e232c]/80 backdrop-blur-md rounded-2xl p-1.5 border border-white/5">
          <div className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"><PieChart className="w-4.5 h-4.5" /></div>
          <div className="flex flex-col items-center gap-0.5 px-3 py-1 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
             <span className="text-[10px] font-black text-white">1s</span>
             <div className="w-1.5 h-1.5 bg-[#f0b90b] rounded-full"></div>
          </div>
          <div className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"><TrendingUp className="w-4.5 h-4.5" /></div>
          <div className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"><Sliders className="w-4.5 h-4.5" /></div>
        </div>
      </div>

      {/* Action Controls Section */}
      <div className="px-4 pb-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1e232c] rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#2b3139] transition-colors group">
            <span className="text-[10px] text-[#848e9c] font-bold group-hover:text-white transition-colors">Amount</span>
            <span className="text-base font-black text-white">₹{amount}</span>
          </div>
          <div className="bg-[#1e232c] rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#2b3139] transition-colors group">
            <span className="text-[10px] text-[#848e9c] font-bold group-hover:text-white transition-colors">Time</span>
            <span className="text-base font-black text-white">{time}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 h-16">
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="bg-[#0ecb81] rounded-2xl flex items-center justify-center gap-4 text-white shadow-lg shadow-[#0ecb81]/20 active:opacity-90 transition-opacity"
            onClick={() => onExecuteTrade?.(100, 182, 'Crypto IDX', '1m')}
          >
            <TrendingUp className="w-6 h-6 rotate-[-45deg]" />
            <span className="text-lg font-black tracking-tight">₹182.00</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="bg-[#f6465d] rounded-2xl flex items-center justify-center gap-4 text-white shadow-lg shadow-[#f6465d]/20 active:opacity-90 transition-opacity"
            onClick={() => onExecuteTrade?.(100, 182, 'Crypto IDX', '1m')}
          >
            <TrendingUp className="w-6 h-6 rotate-[135deg]" />
            <span className="text-lg font-black tracking-tight">₹182.00</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function FuturesDashboard({ currentUser, selectedAsset, setSelectedAsset, onExecuteTrade }: FuturesDashboardProps) {
  const [tradeAmount, setTradeAmount] = useState('100');
  const [timeframe, setTimeframe] = useState('15m');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const walletBalance = (currentUser?.depositWallet || 0) + (currentUser?.profitWallet || 0);

  // Draw simulated chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const points = 60;
    const data: number[] = [];
    let p = selectedAsset.price;
    for (let i = 0; i < points; i++) {
      p = p * (1 + (Math.random() - 0.5) * 0.02);
      data.push(p);
    }

    const min = Math.min(...data) * 0.995;
    const max = Math.max(...data) * 1.005;
    const range = max - min;

    ctx.clearRect(0, 0, w, h);
    
    // Grid lines
    ctx.strokeStyle = '#1e232c';
    ctx.lineWidth = 0.5;
    for(let i=0; i<5; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Main Line (Yellowish/Amber for a professional feel like image)
    ctx.beginPath();
    ctx.strokeStyle = '#f0b90b';
    ctx.lineWidth = 2;
    data.forEach((val, i) => {
      const x = (i / (points - 1)) * w;
      const y = h - ((val - min) / range) * (h * 0.7) - (h * 0.15);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Area
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(240,185,11,0.1)');
    grad.addColorStop(1, 'transparent');
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fillStyle = grad;
    ctx.fill();

    // Volume bars at bottom
    ctx.fillStyle = 'rgba(246, 70, 93, 0.4)';
    for (let i = 0; i < points; i++) {
      const barH = Math.random() * (h * 0.2);
      const x = (i / points) * w;
      ctx.fillRect(x, h - barH, (w / points) - 1, barH);
    }

  }, [selectedAsset, timeframe]);

  const handleTrade = (typeOverride?: 'BUY' | 'SELL') => {
    if (isProcessing) return;
    const finalType = typeOverride || tradeType;
    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter valid amount');
      return;
    }

    if (amount > walletBalance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      if (onExecuteTrade) {
        const profitMultiplier = finalType === 'BUY' ? 1.12 : 1.15;
        const profit = Math.round(amount * profitMultiplier);
        onExecuteTrade(amount, profit, selectedAsset.symbol, timeframe);
        toast.success(`${finalType} order executed`);
      }
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e11] overflow-hidden text-left font-sans">
      {/* Top Header - Pair Info */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-[#1e232c] bg-[#0b0e11] flex-shrink-0">
        <div className="flex items-center gap-3">
          <ArrowLeft className="w-5 h-5 text-white cursor-pointer" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-base font-black text-white leading-tight">{selectedAsset.symbol}</span>
              <span className="text-[9px] text-[#848e9c] bg-[#2b3139] px-1 rounded font-bold">Perp</span>
              <ChevronDown className="w-3 h-3 text-[#848e9c]" />
            </div>
            <span className="text-[10px] text-[#848e9c] font-medium">{selectedAsset.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Star className="w-5 h-5 text-[#848e9c] hover:text-[#f0b90b] transition-colors" />
          <Bell className="w-5 h-5 text-[#848e9c] hover:text-white transition-colors" />
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-6 px-4 py-2 text-[11px] font-bold text-[#848e9c] border-b border-[#1e232c] overflow-x-auto scrollbar-hide flex-shrink-0">
        <span className="text-[#f0b90b] border-b-2 border-[#f0b90b] pb-1 whitespace-nowrap">Price</span>
        <span className="whitespace-nowrap hover:text-white transition-colors cursor-pointer">Info</span>
        <span className="whitespace-nowrap hover:text-white transition-colors cursor-pointer">Data</span>
        <span className="whitespace-nowrap hover:text-white transition-colors cursor-pointer">Audit</span>
        <span className="whitespace-nowrap hover:text-white transition-colors cursor-pointer">Square</span>
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span>Trade-X</span>
          <span className="text-[7px] bg-[#f0b90b] text-black px-1 rounded font-black">New</span>
        </div>
      </div>

      {/* Main Stats Display */}
      <div className="px-4 py-3 flex justify-between items-start flex-shrink-0">
        <div className="flex flex-col">
          <div className="text-[10px] text-[#848e9c] flex items-center gap-1">Last Price <ChevronDown className="w-3 h-3" /></div>
          <div className={`text-3xl font-black leading-none mt-1 ${selectedAsset.change >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
            {selectedAsset.price.toFixed(4)}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-white font-bold opacity-80">${selectedAsset.price.toFixed(8)}</span>
            <span className={`text-[10px] font-black ${selectedAsset.change >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
              {selectedAsset.change > 0 ? '+' : ''}{selectedAsset.change}%
            </span>
          </div>
          <div className="text-[10px] text-[#848e9c] mt-1 font-medium">Mark Price {selectedAsset.price.toFixed(4)}</div>
        </div>
        
        {/* Right Side Grid Stats */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-medium leading-tight">
          <span className="text-[#848e9c]">24h High</span>
          <span className="text-white text-right">{(selectedAsset.price * 1.05).toFixed(4)}</span>
          <span className="text-[#848e9c]">24h Low</span>
          <span className="text-white text-right">{(selectedAsset.price * 0.95).toFixed(4)}</span>
          <span className="text-[#848e9c] truncate max-w-[60px]">24h Vol({selectedAsset.symbol.replace('USDT','').replace('USDC','')})</span>
          <span className="text-white text-right">{selectedAsset.vol}</span>
          <span className="text-[#848e9c]">24h Vol(USDT)</span>
          <span className="text-white text-right">14.50M</span>
        </div>
      </div>

      {/* Chart Timeframes & Controls */}
      <div className="px-4 py-1 flex items-center justify-between border-y border-[#1e232c] text-[10px] font-bold text-[#848e9c] flex-shrink-0 bg-[#0b0e11]">
        <div className="flex items-center gap-4">
          <span className="text-white border-b border-white pb-0.5">Time</span>
          {['15m', '1h', '4h', '1D'].map(tf => (
            <span 
              key={tf} 
              onClick={() => setTimeframe(tf)}
              className={`cursor-pointer hover:text-white transition-colors ${timeframe === tf ? 'text-white' : ''}`}
            >
              {tf}
            </span>
          ))}
          <div className="flex items-center gap-0.5 cursor-pointer hover:text-white transition-colors">
            <span>More</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <BarChart2 className="w-4 h-4 cursor-pointer hover:text-white" />
          <LayoutGrid className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Indicator Labels */}
      <div className="px-4 py-1 text-[9px] text-[#848e9c] font-mono flex items-center gap-3 flex-shrink-0">
        <span className="text-[#f0b90b]">MA60 {selectedAsset.price.toFixed(4)}</span>
        <span className="text-blue-400">MA5 {selectedAsset.vol}</span>
      </div>

      {/* Trading Chart Content */}
      <div className="flex-grow relative min-h-[220px] w-full bg-[#0b0e11]">
        <canvas ref={canvasRef} className="w-full h-full" />
        
        {/* Horizontal Price Tracker Line (Simulated) */}
        <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-[#848e9c]/30 pointer-events-none" style={{ top: '60%' }}>
          <div className="absolute right-0 -translate-y-1/2 bg-[#1e232c] text-white text-[10px] px-1.5 py-0.5 border-l-2 border-[#f0b90b] flex items-center gap-1 font-mono">
            {selectedAsset.price.toFixed(4)} <ChevronRight className="w-3 h-3" />
          </div>
        </div>
        
        {/* Fullscreen Icon */}
        <div className="absolute bottom-4 left-4 p-1.5 bg-[#1e232c]/60 rounded border border-[#2b3139] cursor-pointer hover:bg-[#1e232c] transition-colors">
          <Maximize2 className="w-3.5 h-3.5 text-[#848e9c]" />
        </div>
      </div>

      {/* Indicator Tabs */}
      <div className="px-4 py-2 border-t border-[#1e232c] flex-shrink-0 bg-[#0b0e11]">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide text-[10px] font-black text-[#848e9c] uppercase tracking-tighter">
          <span className="text-white border-b border-white pb-0.5 whitespace-nowrap">MA</span>
          <span className="whitespace-nowrap hover:text-white">EMA</span>
          <span className="whitespace-nowrap hover:text-white">BOLL</span>
          <span className="whitespace-nowrap hover:text-white">SAR</span>
          <span className="whitespace-nowrap hover:text-white">AVL</span>
          <span className="whitespace-nowrap hover:text-white">SUPER</span>
          <span className="text-white border-b border-white pb-0.5 whitespace-nowrap">VOL</span>
          <span className="whitespace-nowrap hover:text-white">MACD</span>
          <span className="whitespace-nowrap hover:text-white">RSI</span>
        </div>
        
        {/* Market Change Statistics */}
        <div className="flex items-center justify-between mt-3 text-[9px] font-bold">
          <div className="flex flex-col">
            <span className="text-[#848e9c]">Today</span>
            <span className="text-[#f6465d]">-6.63%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#848e9c]">7 Days</span>
            <span className="text-[#f6465d]">-44.01%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#848e9c]">30 Days</span>
            <span className="text-[#0ecb81]">0.26%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#848e9c]">90 Days</span>
            <span className="text-[#0ecb81]">33.32%</span>
          </div>
        </div>
      </div>

      {/* Lower Section Tabs */}
      <div className="px-4 py-2 flex items-center gap-6 text-[11px] font-black text-[#848e9c] border-t border-[#1e232c] flex-shrink-0 bg-[#0b0e11]">
        <span className="text-white border-b-2 border-white pb-1">Order Book</span>
        <span className="hover:text-white transition-colors">Depth</span>
        <span className="hover:text-white transition-colors">Trades</span>
      </div>

      {/* Action Navigation Footer */}
      <div className="mt-auto px-4 py-3 bg-[#0b0e11] border-t border-[#1e232c] flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-5 text-[#848e9c]">
          <div className="flex flex-col items-center cursor-pointer group">
            <div className="p-1 group-hover:bg-slate-900 rounded-full transition-colors">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[8px] mt-0.5 font-bold">More</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer group">
            <div className="p-1 group-hover:bg-slate-900 rounded-full transition-colors">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="text-[8px] mt-0.5 font-bold">Hub</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer group">
            <div className="p-1 group-hover:bg-slate-900 rounded-full transition-colors">
              <Repeat className="w-5 h-5" />
            </div>
            <span className="text-[8px] mt-0.5 font-bold">Spot</span>
          </div>
        </div>
        
        {/* Core Trade Action Buttons */}
        <div className="flex-grow grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTrade('BUY')}
            disabled={isProcessing}
            className="bg-[#0ecb81] text-white py-3.5 rounded-xl font-black text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#0ecb81]/10 active:opacity-90"
          >
            {isProcessing && tradeType === 'BUY' ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              'Long'
            )}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTrade('SELL')}
            disabled={isProcessing}
            className="bg-[#f6465d] text-white py-3.5 rounded-xl font-black text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#f6465d]/10 active:opacity-90"
          >
            {isProcessing && tradeType === 'SELL' ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              'Short'
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function TradeSection({
  isLoggedIn,
  currentUser,
  onExecuteTrade,
  onNavigateToWallet,
  onChangeTab,
}: TradeSectionProps) {
  // --- State ---
  const [currentBrand, setCurrentBrand] = useState<BrandTab>('favorites');
  const [currentView, setCurrentView] = useState<ViewTab>('binary');
  const [currentFilter, setCurrentFilter] = useState<FilterTab>('all');
  const [instruments, setInstruments] = useState<Instrument[]>(INSTRUMENTS);
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>(INSTRUMENTS[0].symbol);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'LTCUSDT', 'PYPLUSDT', 'JPMUSDT']));
  const [updateTime, setUpdateTime] = useState<string>(new Date().toLocaleTimeString('en-US', { hour12: false }));

  const selectedAsset = useMemo(() => {
    return instruments.find(i => i.symbol === selectedAssetSymbol) || instruments[0];
  }, [instruments, selectedAssetSymbol]);

  // --- Real-time Price Simulation ---
  useEffect(() => {
    const interval = setInterval(() => {
      setInstruments(prev => prev.map(item => {
        const delta = (Math.random() - 0.5) * 0.008;
        let newPrice = item.price * (1 + delta);
        if (newPrice < 0.0001) newPrice = 0.0001;

        const shift = (Math.random() - 0.5) * 0.3;
        let newChange = item.change + shift;
        if (newChange > 30) newChange = 30;
        if (newChange < -30) newChange = -30;

        return {
          ...item,
          price: newPrice,
          change: Math.round(newChange * 100) / 100
        };
      }));
      setUpdateTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // --- Helpers ---
  const formatPrice = (p: number) => {
    if (p >= 1000) return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 1) return p.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    if (p >= 0.01) return p.toFixed(5);
    if (p >= 0.0001) return p.toFixed(7);
    return p.toFixed(8);
  };

  const toggleFavorite = (symbol: string) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(symbol)) newFavs.delete(symbol);
    else newFavs.add(symbol);
    setFavorites(newFavs);
  };

  const filteredData = useMemo(() => {
    let list = instruments;

    // Brand filter
    if (currentBrand === 'favorites') {
      list = list.filter(item => favorites.has(item.symbol));
      if (list.length === 0) list = instruments.slice(0, 20);
    } else if (currentBrand === 'crypto') {
      list = list.filter(item => item.type === 'crypto' || item.type === 'cross');
    } else if (currentBrand === 'tradfi') {
      list = list.filter(item => item.type === 'stocks');
    } else if (currentBrand === 'alpha') {
      list = list.filter(item => Math.abs(item.change) > 5);
    } else if (currentBrand === 'grow') {
      list = list.filter(item => item.change > 0 && item.vol.includes('M') && parseFloat(item.vol) > 10);
    }

    // Category filter (dummy logic for new labels)
    if (currentFilter !== 'all') {
      const lower = currentFilter.toLowerCase();
      list = list.filter(item => item.category === lower || item.symbol.toLowerCase().includes(lower));
    }

    return list;
  }, [instruments, currentBrand, currentFilter, favorites]);

  const BRAND_TABS: { id: BrandTab; label: string }[] = [
    { id: 'favorites', label: 'Favorites' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'tradfi', label: 'TradFi' },
    { id: 'alpha', label: 'Alpha' },
    { id: 'grow', label: 'Grow' },
    { id: 'square', label: 'Square' },
  ];

  const VIEW_TABS: { id: ViewTab; label: string }[] = [
    { id: 'spot', label: 'Spot' },
    { id: 'usdm', label: 'USDⓈ-M' },
    { id: 'coinm', label: 'COIN-M' },
    { id: 'options', label: 'Options' },
  ];

  const FILTER_TABS: FilterTab[] = ['DeFi', 'Index', 'Pre-IPO', 'USDC', 'Chinese', 'Alpha', 'AI'];

  return (
    <div className="max-w-[1400px] w-full mx-auto bg-[#0b0e11] rounded-[24px] p-2 md:p-4 border border-[#2b3139] text-left overflow-hidden shadow-2xl h-[calc(100vh-160px)] flex flex-col" id="trade-terminal-app">
      
      {/* Top Nav / Brand Tabs */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-[#1e232c] mb-1 -mx-2 px-2 overflow-x-auto scrollbar-hide bg-[#0b0e11] sticky top-0 z-10">
        <div className="flex items-center gap-0 flex-nowrap">
          {BRAND_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentBrand(tab.id)}
              className={`relative px-3 py-3 text-xs font-bold transition-all whitespace-nowrap ${
                currentBrand === tab.id ? 'text-[#f0b90b]' : 'text-[#848e9c]'
              }`}
            >
              {tab.label}
              {currentBrand === tab.id && (
                <motion.div 
                  layoutId="brandUnderline"
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#f0b90b] rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary / View Tabs */}
      <div className="flex items-center gap-4 flex-nowrap mb-4 px-2 mt-2 overflow-x-auto scrollbar-hide">
        {VIEW_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className={`text-xs font-black transition-all uppercase tracking-tighter ${
              currentView === tab.id ? 'text-[#eaecef] scale-105' : 'text-[#848e9c] hover:text-[#eaecef]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-1 flex-nowrap mb-4 px-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1">
          {FILTER_TABS.map(filter => (
            <button
              key={filter}
              onClick={() => setCurrentFilter(filter)}
              className={`px-3 py-1 rounded-md text-[10px] font-black transition-all whitespace-nowrap border ${
                currentFilter === filter ? 'bg-[#2b3139] text-white border-transparent' : 'text-[#848e9c] border-[#2b3139] hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <button className="p-1.5 ml-2 text-[#848e9c] hover:text-white transition-all bg-[#1e232c] rounded-md">
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-grow overflow-hidden flex flex-col min-h-0">
        {currentView === 'binary' ? (
          <div className="flex-grow overflow-hidden">
            <BinaryDashboard 
              currentUser={currentUser || null} 
              onExecuteTrade={onExecuteTrade} 
            />
          </div>
        ) : currentView === 'usdm' || currentView === 'coinm' || currentView === 'options' ? (
          <div className="flex-grow overflow-y-auto scrollbar-hide py-2">
            <FuturesDashboard 
              currentUser={currentUser || null} 
              onExecuteTrade={onExecuteTrade} 
              selectedAsset={selectedAsset} 
              setSelectedAsset={(asset) => setSelectedAssetSymbol(asset.symbol)}
            />
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="grid grid-cols-[2fr_1.2fr_0.9fr_0.8fr] px-2 py-1.5 border-b border-[#2b3139] text-[9px] font-black text-[#848e9c] uppercase tracking-widest bg-[#181a20]/30 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                Name / Vol
              </div>
              <div className="text-right">Last Price</div>
              <div className="text-right">24h Chg</div>
              <div className="text-right opacity-40"><Star className="w-2.5 h-2.5 ml-auto" /></div>
            </div>

            {/* Table Body */}
            <div className="flex-grow overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <motion.div
                      layout
                      key={`${item.symbol}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => {
                        setSelectedAssetSymbol(item.symbol);
                        setCurrentView('usdm');
                      }}
                      className="grid grid-cols-[2fr_1.2fr_0.9fr_0.8fr] items-center px-2 py-2 border-b border-[#1e232c] hover:bg-[#1a1f28] transition-colors group cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 font-black text-xs text-[#eaecef] uppercase">
                          {item.symbol}
                          <span className="text-[7px] font-normal bg-[#2b3139] text-[#848e9c] px-1 py-0.5 rounded uppercase tracking-tighter">
                            {currentView === 'spot' ? 'Spot' : currentView === 'usdm' ? 'USDⓂ' : currentView === 'coinm' ? 'COINⓂ' : 'Option'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-[#848e9c] mt-0.5">
                          <span className="truncate max-w-[50px]">{item.name}</span>
                          <span className="text-[#5e6673]">{item.vol && item.vol !== '—' ? `${item.vol}` : '—'}</span>
                        </div>
                      </div>
                      <div className="text-right font-bold text-xs text-[#eaecef]">
                        {formatPrice(item.price)}
                      </div>
                      <div className="flex justify-end">
                        <div className={`text-[10px] font-black px-2 py-0.5 rounded min-w-[55px] text-center ${
                          item.change > 0 ? 'text-[#0ecb81] bg-[#0ecb81]/10' : 
                          item.change < 0 ? 'text-[#f6465d] bg-[#f6465d]/10' : 
                          'text-[#848e9c] bg-[#848e9c]/10'
                        }`}>
                          {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
                        </div>
                      </div>
                      <div 
                        className="text-right cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.symbol);
                        }}
                      >
                        <Star className={`w-3 h-3 ml-auto transition-colors ${favorites.has(item.symbol) ? 'text-[#f0b90b] fill-[#f0b90b]' : 'text-[#5e6673] hover:text-[#f0b90b]'}`} />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-[#5e6673]">
                    <Inbox className="w-10 h-10 mb-3 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No assets match</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Footer Nav */}
      <div className="flex-shrink-0 flex items-center justify-around mt-auto pt-3 border-t border-[#1e232c] bg-[#0b0e11]">
        {[
          { icon: <Home className="w-4 h-4" />, label: 'Home', onClick: () => setCurrentView('binary'), active: currentView === 'binary' },
          { icon: <Repeat className="w-4 h-4" />, label: 'Trade', onClick: () => setCurrentView('spot'), active: currentView === 'spot' },
          { icon: <BarChart2 className="w-4 h-4" />, label: 'Futures', onClick: () => setCurrentView('usdm'), active: currentView === 'usdm' },
          { icon: <Wallet className="w-4 h-4" />, label: 'Assets', onClick: () => onChangeTab?.('wallet') },
        ].map((link, i) => (
          <button 
            key={i} 
            onClick={link.onClick}
            className={`flex flex-col items-center gap-1 transition-all ${link.active ? 'text-[#f0b90b]' : 'text-[#848e9c] hover:text-[#eaecef]'}`}
          >
            {link.icon}
            <span className="text-[8px] font-black uppercase tracking-tighter">{link.label}</span>
          </button>
        ))}
      </div>

      {/* Status Bar */}
      <div className="flex justify-between items-center mt-3 px-1 text-[8px] text-[#5e6673] font-black uppercase tracking-widest opacity-60">
        <div className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-[#0ecb81] animate-pulse"></span>
          Live
        </div>
        <div>{updateTime}</div>
        <div>{filteredData.length} SEC</div>
      </div>
    </div>
  );
}
