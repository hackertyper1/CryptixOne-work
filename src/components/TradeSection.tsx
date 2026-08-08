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
  Inbox
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
type ViewTab = 'spot' | 'usdm' | 'coinm' | 'options';
type FilterTab = 'DeFi' | 'Index' | 'Pre-IPO' | 'USDC' | 'Chinese' | 'Alpha' | 'AI' | 'all';

interface FuturesDashboardProps {
  currentUser: User | null;
  selectedAsset: Instrument;
  setSelectedAsset: (asset: Instrument) => void;
  onExecuteTrade?: (amount: number, estimatedProfit: number, assetName: string, durationLabel: string) => void;
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
    ctx.strokeStyle = '#2b3139';
    ctx.lineWidth = 0.5;
    for(let i=0; i<5; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Path
    ctx.beginPath();
    ctx.strokeStyle = data[data.length-1] >= data[0] ? '#0ecb81' : '#f6465d';
    ctx.lineWidth = 2;
    data.forEach((val, i) => {
      const x = (i / (points - 1)) * w;
      const y = h - ((val - min) / range) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Area
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, data[data.length-1] >= data[0] ? 'rgba(14,203,129,0.1)' : 'rgba(246,70,93,0.1)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();

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

    // Simulate network delay for micro-interaction
    setTimeout(() => {
      if (onExecuteTrade) {
        const profitMultiplier = finalType === 'BUY' ? 1.12 : 1.15; // simplified logic
        const profit = Math.round(amount * profitMultiplier);
        onExecuteTrade(amount, profit, selectedAsset.symbol, timeframe);
        toast.success(`${finalType} order executed for ${selectedAsset.symbol}`);
      }
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-3">
      <div className="lg:col-span-2 bg-[#181a20] rounded-xl border border-slate-800 p-4 space-y-3 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-white tracking-tighter uppercase">{selectedAsset.symbol} <span className="text-[8px] text-slate-500 font-normal ml-1 border border-slate-800 px-1 rounded">PERP</span></span>
            <span className={`text-xs font-black ${selectedAsset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {selectedAsset.change > 0 ? '+' : ''}{selectedAsset.change}%
            </span>
          </div>
          <div className="flex bg-slate-900 rounded-lg p-1">
            {['15m', '1h', '4h', '1D'].map(tf => (
              <button 
                key={tf} 
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all ${timeframe === tf ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-[220px] w-full relative bg-slate-950/50 rounded-lg border border-slate-800/50 overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full" />
          <div className="absolute top-2 left-2 flex flex-wrap gap-2 text-[8px] font-mono text-slate-500 pointer-events-none">
            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-500"></span> MA60: {selectedAsset.price.toFixed(4)}</span>
            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-amber-500"></span> MA5: {selectedAsset.vol}</span>
          </div>
          <div className="absolute bottom-2 right-2 flex flex-col items-end gap-0 pointer-events-none">
             <div className="text-lg font-black text-white font-mono">{selectedAsset.price.toFixed(4)}</div>
             <div className="text-[8px] text-slate-500 font-mono uppercase">USDT</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'High', val: (selectedAsset.price * 1.05).toFixed(4) },
            { label: 'Low', val: (selectedAsset.price * 0.95).toFixed(4) },
            { label: '24h Vol', val: selectedAsset.vol },
            { label: 'OI', val: (Math.random() * 20 + 10).toFixed(1) + 'B' }
          ].map(s => (
            <div key={s.label} className="bg-slate-900/30 p-1.5 rounded-lg border border-slate-800/50">
              <div className="text-[7px] text-slate-500 uppercase font-black tracking-tighter truncate">{s.label}</div>
              <div className="text-[10px] font-black text-white mt-0.5 truncate">{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade Controls */}
      <div className="bg-[#181a20] rounded-xl border border-slate-800 p-4 flex flex-col justify-between shadow-xl min-h-[400px]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => setTradeType('BUY')} 
              className={`py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${tradeType === 'BUY' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500'}`}
            >
              LONG
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => setTradeType('SELL')} 
              className={`py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${tradeType === 'SELL' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}
            >
              SHORT
            </motion.button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
              <span>Size</span>
              <span>Max: <span className="text-amber-500">${walletBalance.toFixed(0)}</span></span>
            </div>
            <div className="relative group">
              <input 
                type="number" 
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-3 text-white font-black text-xl outline-none focus:border-amber-500 transition-all text-center"
                placeholder="0.00"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 font-black text-[9px]">USDT</div>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[25, 50, 75, 100].map(p => (
                <button 
                  key={p} 
                  onClick={() => setTradeAmount((walletBalance * (p/100)).toFixed(0))}
                  className="py-1 rounded-md bg-slate-900 text-[9px] font-black text-slate-500 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all"
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-900">
            <div className="flex justify-between items-center text-[9px]">
              <span className="text-slate-500 font-bold uppercase tracking-tighter">Market Price</span>
              <span className="text-slate-300 font-mono font-bold">${selectedAsset.price.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center text-[9px]">
              <span className="text-slate-500 font-bold uppercase tracking-tighter">Liquidation</span>
              <span className="text-rose-400 font-mono font-bold">${(selectedAsset.price * (tradeType === 'BUY' ? 0.85 : 1.15)).toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center text-[9px]">
              <span className="text-slate-500 font-bold uppercase tracking-tighter">Est. ROI</span>
              <span className="text-emerald-400 font-black tracking-tight">+12.00%</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-6">
          <motion.button 
            whileTap={{ scale: 0.96 }}
            onClick={() => handleTrade()}
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center gap-2 ${
              isProcessing ? 'opacity-80 cursor-not-allowed' : 'active:scale-[0.98]'
            } ${
              tradeType === 'BUY' 
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/10' 
                : 'bg-rose-500 text-white shadow-rose-500/10'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                EXEC...
              </>
            ) : (
              `CONFIRM ${tradeType === 'BUY' ? 'LONG' : 'SHORT'}`
            )}
          </motion.button>
          <p className="text-[7px] text-slate-600 text-center uppercase font-black tracking-widest opacity-60">Auto-Scaling Enabled</p>
        </div>
      </div>

      {/* Asset Navigation Scroller */}
      <div className="lg:col-span-3 bg-[#121212] rounded-xl border border-slate-800 p-0.5 mt-auto">
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          {INSTRUMENTS.map((asset, index) => (
            <button 
              key={`${asset.symbol}-${index}`}
              onClick={() => setSelectedAsset(asset)}
              className={`flex-shrink-0 min-w-[110px] p-3 bg-[#121212] hover:bg-slate-900 transition-all text-left group border-r border-slate-800 last:border-0 ${selectedAsset.symbol === asset.symbol ? 'bg-slate-900/80 border-b border-b-[#f0b90b]' : ''}`}
            >
              <div className="text-[10px] font-black text-white group-hover:text-amber-500 transition-colors uppercase tracking-tight">{asset.symbol}</div>
              <div className="flex justify-between items-center mt-1">
                 <span className="text-[8px] text-slate-600 font-mono font-bold">${asset.price < 10 ? asset.price.toFixed(4) : asset.price.toFixed(1)}</span>
                 <span className={`text-[9px] font-black ${asset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {asset.change > 0 ? '+' : ''}{asset.change}%
                 </span>
              </div>
            </button>
          ))}
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
  const [currentView, setCurrentView] = useState<ViewTab>('spot');
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
        {currentView === 'usdm' || currentView === 'coinm' || currentView === 'options' ? (
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
          { icon: <Home className="w-4 h-4" />, label: 'Home', onClick: () => onChangeTab?.('plan') },
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
