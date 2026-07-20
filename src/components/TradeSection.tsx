import React, { useState, useEffect } from 'react';
import { ActiveTrade, StockTicker, InvestmentPlan, SystemSettings } from '../types';
import { formatIndianCurrency, INVESTMENT_PLANS } from '../data';
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  Coins, 
  Globe, 
  Zap,
  Calculator
} from 'lucide-react';

interface TradeSectionProps {
  activeTrades: ActiveTrade[];
  isLoggedIn: boolean;
  onNavigateToHome: () => void;
  onInvestSelect?: (plan: InvestmentPlan) => void;
  systemSettings?: SystemSettings;
}

export default function TradeSection({
  activeTrades,
  isLoggedIn,
  onNavigateToHome,
  onInvestSelect,
  systemSettings
}: TradeSectionProps) {
  // Calculator states
  const [selectedPlanId, setSelectedPlanId] = useState<string>(INVESTMENT_PLANS[0].id);
  const [selectedDuration, setSelectedDuration] = useState<number>(7); // Days: 7, 15, 30

  // Chart Selection state
  const [selectedChart, setSelectedChart] = useState<'STOCK' | 'CRYPTO' | 'FOREX'>('STOCK');
  
  // Real-time ticking price states
  const [sbiPrice, setSbiPrice] = useState(843.50);
  const [btcPrice, setBtcPrice] = useState(5412980);
  const [forexPrice, setForexPrice] = useState(89.42);

  // Random tick changes
  const [sbiHistory, setSbiHistory] = useState<number[]>([]);
  const [btcHistory, setBtcHistory] = useState<number[]>([]);
  const [forexHistory, setForexHistory] = useState<number[]>([]);

  // Initialize and run price ticker loops
  useEffect(() => {
    // Stock (SBI)
    const initSbi = Array.from({ length: 15 }, () => 840 + Math.random() * 8);
    setSbiHistory(initSbi);
    setSbiPrice(initSbi[initSbi.length - 1]);

    // Crypto (BTC)
    const initBtc = Array.from({ length: 15 }, () => 5410000 + Math.random() * 8000);
    setBtcHistory(initBtc);
    setBtcPrice(initBtc[initBtc.length - 1]);

    // Forex (EUR/INR)
    const initForex = Array.from({ length: 15 }, () => 89.1 + Math.random() * 0.7);
    setForexHistory(initForex);
    setForexPrice(initForex[initForex.length - 1]);

    // Set tickers
    const interval = setInterval(() => {
      setSbiPrice(prev => {
        const change = (Math.random() - 0.48) * 1.5;
        const next = Math.max(10, prev + change);
        setSbiHistory(h => [...h.slice(1), next]);
        return next;
      });

      setBtcPrice(prev => {
        const change = (Math.random() - 0.47) * 950;
        const next = Math.max(100, prev + change);
        setBtcHistory(h => [...h.slice(1), next]);
        return next;
      });

      setForexPrice(prev => {
        const change = (Math.random() - 0.49) * 0.08;
        const next = Math.max(1, prev + change);
        setForexHistory(h => [...h.slice(1), next]);
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Compute active trade countdown progress and simulated floating profits
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate dynamic compound outputs for calculator
  const selectedPlan = INVESTMENT_PLANS.find(p => p.id === selectedPlanId) || INVESTMENT_PLANS[0];
  
  const calculateReturns = () => {
    const principal = selectedPlan.amount;
    const hourProfit = selectedPlan.estimatedProfit;
    
    // Dynamic multiplier for Days based on 1-hour profit
    let multiplier = 1;
    if (selectedDuration === 7) {
      multiplier = 8.5; 
    } else if (selectedDuration === 15) {
      multiplier = 18.2; 
    } else if (selectedDuration === 30) {
      multiplier = 38.6; 
    }
    
    const netProfit = hourProfit * multiplier;
    const totalReturn = principal + netProfit;
    
    return {
      principal,
      netProfit: Math.round(netProfit),
      totalReturn: Math.round(totalReturn)
    };
  };

  const { principal, netProfit, totalReturn } = calculateReturns();

  // SVG Chart path calculation helper
  const getSvgPathForPoints = (points: number[]) => {
    if (points.length === 0) return '';
    const min = Math.min(...points);
    const max = Math.max(...points);
    const height = 180;
    const width = 600;
    const range = max - min || 1;
    
    return points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * height + 15;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getSvgAreaPathForPoints = (points: number[]) => {
    const linePath = getSvgPathForPoints(points);
    if (!linePath) return '';
    const width = 600;
    const height = 210;
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  };

  const getActiveChartDetails = () => {
    if (selectedChart === 'STOCK') {
      return {
        title: 'State Bank of India (SBI-IN)',
        price: sbiPrice,
        history: sbiHistory,
        unit: 'INR',
        icon: <Zap className="w-5 h-5 text-cyan-400" />,
        color: 'cyan',
        themeClass: 'from-cyan-500/10 to-transparent',
        strokeColor: '#22d3ee'
      };
    } else if (selectedChart === 'CRYPTO') {
      return {
        title: 'Bitcoin / Indian Rupee (BTC-INR)',
        price: btcPrice,
        history: btcHistory,
        unit: 'INR',
        icon: <Coins className="w-5 h-5 text-amber-500" />,
        color: 'amber',
        themeClass: 'from-amber-500/10 to-transparent',
        strokeColor: '#f59e0b'
      };
    } else {
      return {
        title: 'EUR / INR Currency Exchange Spot',
        price: forexPrice,
        history: forexHistory,
        unit: 'INR',
        icon: <Globe className="w-5 h-5 text-emerald-400" />,
        color: 'emerald',
        themeClass: 'from-emerald-500/10 to-transparent',
        strokeColor: '#10b981'
      };
    }
  };

  const currentChart = getActiveChartDetails();

  return (
    <div className="space-y-10 pb-16" id="trade-section-container">
      {/* 1. Upper Grid: Real-time Multi-Charts View */}
      <section className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden" id="three-chart-terminal">
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 mb-6 text-left gap-4">
          <div>
            <h3 className="text-xl md:text-3xl font-black text-white tracking-tight flex items-center font-display uppercase">
              <Activity className="w-6 h-6 mr-3 text-emerald-500 animate-pulse" />
              Market <span className="text-emerald-500 ml-2">Terminal</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time Data Integration Node v9.2.4</p>
          </div>

          {/* Quick Chart Switches */}
          <div className="flex bg-[#050914] p-1 rounded-2xl border border-slate-800 space-x-1 w-full md:w-auto shadow-inner overflow-x-auto scrollbar-hide">
            <button
              id="btn-chart-stock"
              onClick={() => setSelectedChart('STOCK')}
              className={`flex-1 md:flex-initial px-5 py-2.5 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center space-x-2 uppercase tracking-widest whitespace-nowrap ${
                selectedChart === 'STOCK'
                  ? 'bg-emerald-500 text-[#070b14]'
                  : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Equities</span>
            </button>
            <button
              id="btn-chart-crypto"
              onClick={() => setSelectedChart('CRYPTO')}
              className={`flex-1 md:flex-initial px-5 py-2.5 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center space-x-2 uppercase tracking-widest whitespace-nowrap ${
                selectedChart === 'CRYPTO'
                  ? 'bg-emerald-500 text-[#070b14]'
                  : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Digital</span>
            </button>
            <button
              id="btn-chart-forex"
              onClick={() => setSelectedChart('FOREX')}
              className={`flex-1 md:flex-initial px-5 py-2.5 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center space-x-2 uppercase tracking-widest whitespace-nowrap ${
                selectedChart === 'FOREX'
                  ? 'bg-emerald-500 text-[#070b14]'
                  : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Currency</span>
            </button>
          </div>
        </div>

        {/* Current Active Chart Dashboard Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Chart Drawing */}
          <div className="lg:col-span-8 bg-[#070c18] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between relative shadow-inner">
            <div className="flex justify-between items-center mb-4 gap-4">
              <div className="flex items-center space-x-2 text-left min-w-0">
                <div className="shrink-0">{currentChart.icon}</div>
                <span className="text-sm font-bold text-white font-mono truncate">{currentChart.title}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500 block uppercase font-mono tracking-wider font-bold">Trading Spot Price</span>
                <span className="text-lg md:text-xl font-bold font-mono text-white whitespace-nowrap">
                  {currentChart.unit === 'INR' ? formatIndianCurrency(currentChart.price) : `${currentChart.price.toFixed(4)}`}
                </span>
              </div>
            </div>

            {/* SVG Plotting */}
            <div className="relative h-44 md:h-52 w-full mt-4" id="large-trading-chart-svg">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 210" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`gradient-${currentChart.color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentChart.strokeColor} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={currentChart.strokeColor} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Horizontal reference lines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="#111827" strokeWidth="1" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="#111827" strokeWidth="1" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="#111827" strokeWidth="1" />
                
                {/* Area path */}
                <path d={getSvgAreaPathForPoints(currentChart.history)} fill={`url(#gradient-${currentChart.color})`} />
                {/* Line path */}
                <path d={getSvgPathForPoints(currentChart.history)} fill="none" stroke={currentChart.strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase tracking-widest pt-3 border-t border-slate-900 mt-4">
              <span>M5 Candle Feed</span>
              <span>100% Guaranteed transparency</span>
              <span>Auto-stabilized</span>
            </div>
          </div>

          {/* Side stats / technicals */}
          <div className="lg:col-span-4 bg-[#050914] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-5 text-left">
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">Live Order Book Market Activity</h4>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Day High</span>
                  <span className="text-slate-200">
                    {formatIndianCurrency(currentChart.price * 1.035)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Day Low</span>
                  <span className="text-slate-200">
                    {formatIndianCurrency(currentChart.price * 0.978)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Spread Gap</span>
                  <span className="text-slate-200">₹0.15</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Volume</span>
                  <span className="text-slate-200">2.41M contracts</span>
                </div>
              </div>
            </div>

            {/* Buying pressure visual bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-emerald-400 font-bold">Buy 68.4%</span>
                <span className="text-rose-400 font-bold">Sell 31.6%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: '68%' }}></div>
                <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: '32%' }}></div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-amber-500/5 rounded-xl border border-amber-500/10 p-3 flex space-x-2 text-left">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-[10px] text-slate-400 leading-normal">
                <b>Trading Signal:</b> Heavy institutional consolidation detected. Micro-investment slots are highly favored for instant short-term compounding during this cycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. User Active Micro-Investment Trades Tracker */}
      <section className="bg-slate-950 rounded-[2.5rem] border border-slate-800 p-8 md:p-10 shadow-2xl text-left relative overflow-hidden" id="user-active-trades-section">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 border-b border-slate-900 pb-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20">
              <Clock className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Active Cycle Synchronized</span>
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter font-display uppercase">
              Active <span className="text-emerald-500">Trades</span> Tracker
            </h3>
            <p className="text-slate-500 text-xs font-medium max-w-xl">
              Monitor your real-time investment performance. Payouts are automatically added to your profit wallet upon completion.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 bg-[#050914] px-4 py-2 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest">Active Contracts</span>
            <span className="text-lg font-black text-white font-mono">{activeTrades.length}</span>
          </div>
        </div>

        {!isLoggedIn ? (
          <div className="text-center py-16 bg-slate-950/40 rounded-[2rem] border border-dashed border-slate-800 space-y-6">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto border border-slate-800">
              <Lock className="w-8 h-8 text-slate-700" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-black text-white uppercase font-display tracking-tight">Identity Verification Required</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Please authenticate your session to access restricted terminal allocation data.</p>
            </div>
            <button
              onClick={onNavigateToHome}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-3 rounded-2xl text-[10px] tracking-[0.2em] uppercase transition-all shadow-xl shadow-emerald-500/20"
            >
              Sign In To Terminal
            </button>
          </div>
        ) : activeTrades.length === 0 ? (
          <div className="text-center py-16 bg-[#060912] rounded-[2rem] border border-dashed border-slate-800 space-y-6">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto border border-slate-800 opacity-50">
              <Activity className="w-8 h-8 text-slate-600" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-black text-white uppercase font-display tracking-tight">No Active Allocations</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto font-mono">Terminal currently idle. No institutional contracts detected in your portfolio node.</p>
            </div>
            <button
              onClick={onNavigateToHome}
              className="bg-emerald-500 hover:bg-emerald-400 text-[#0a0f1d] font-black px-10 py-4 rounded-2xl text-[10px] tracking-[0.2em] uppercase transition-all shadow-2xl shadow-emerald-500/30"
            >
              Initialize New Allocation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {activeTrades.map(trade => {
              const totalSecs = (trade.endTime - trade.startTime) / 1000;
              const elapsedSecs = Math.max(0, (now - trade.startTime) / 1000);
              const percent = Math.min(100, (elapsedSecs / totalSecs) * 100);
              const isFinished = elapsedSecs >= totalSecs;

              const floatingProfit = isFinished 
                ? trade.estimatedProfit 
                : Math.min(trade.estimatedProfit, (elapsedSecs / totalSecs) * trade.estimatedProfit + (Math.sin(elapsedSecs / 5) * (trade.estimatedProfit * 0.01)));

              const remainingSecs = Math.max(0, Math.floor((trade.endTime - now) / 1000));
              const displayMinutes = Math.floor(remainingSecs / 60);
              const displaySeconds = remainingSecs % 60;

              return (
                <div 
                  key={trade.id} 
                  className="bg-[#0b101f] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-emerald-500 to-cyan-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />

                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-[0.2em] font-mono">
                          {trade.planName.toUpperCase()} PROTOCOL ACTIVE
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono font-black tracking-widest">NODE_ID: {trade.id}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest">Allocated Capital</p>
                        <h4 className="text-3xl font-black text-white font-mono tracking-tighter">
                          {formatIndianCurrency(trade.amount)}
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 font-mono">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Cycle Window</span>
                        <div className="text-lg font-black text-white flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-emerald-500" />
                          {isFinished ? (
                            <span className="text-emerald-400 text-sm tracking-widest">SETTLED</span>
                          ) : (
                            <span>{displayMinutes.toString().padStart(2, '0')}:{displaySeconds.toString().padStart(2, '0')}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-right">
                        <span className="text-[9px] text-emerald-500/50 uppercase font-black tracking-widest block">Live Yield</span>
                        <span className="text-2xl font-black text-emerald-400 tabular-nums">
                          +{formatIndianCurrency(Math.max(0, floatingProfit))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest">
                        <div className={`w-2 h-2 rounded-full ${isFinished ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'}`} />
                        <span>{isFinished ? 'Contract Matured' : 'Real-time Execution In-progress'}</span>
                      </div>
                      <span className="text-[10px] text-white font-mono font-black">{percent.toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-[#050914] h-3 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono relative z-10">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 uppercase font-black tracking-widest">Maturity Payload:</span>
                      <span className="text-white font-black">{formatIndianCurrency(trade.amount + trade.estimatedProfit)}</span>
                    </div>
                    <div className="bg-[#050914] px-4 py-2 rounded-xl border border-slate-800 text-slate-500 font-black tracking-tighter uppercase">
                      Automatic Liquid Settlement to <span className="text-emerald-400">Profit Ledger</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Interactive Profit Calculator Section (Moved to Bottom) */}
      <section className="bg-gradient-to-b from-[#0e172a] to-[#090e1a] rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl" id="profit-calculator-section">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-2 mb-8">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight font-display">Profit Projection Calculator</h3>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl">
              Simulate potential earnings based on plan yields and duration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Input Form Controls */}
            <div className="space-y-5 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-center">
              {/* Dropdown Plan Select */}
              <div className="flex flex-col text-left">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Plan</label>
                <div className="relative">
                  <select
                    id="calc-plan-select"
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full bg-[#0d1222] text-white font-bold text-sm border border-slate-800 rounded-lg py-3 px-4 outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                  >
                    {INVESTMENT_PLANS.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.category} — ₹{plan.amount.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selector Buttons for Days */}
              <div className="flex flex-col text-left mt-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[7, 15, 30].map(days => (
                    <button
                      key={days}
                      id={`calc-duration-${days}`}
                      onClick={() => setSelectedDuration(days)}
                      type="button"
                      className={`py-3 px-3 rounded-lg font-bold text-xs uppercase tracking-wider border transition-all ${
                        selectedDuration === days
                          ? 'bg-emerald-500 text-[#070b15] border-emerald-400 shadow-lg'
                          : 'bg-[#0d1222] text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Return Visual Cards */}
            <div className="bg-[#040813] border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full space-y-6">
              {/* Premium Glow line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500"></div>

              {/* Header Details */}
              <div className="flex justify-between items-start text-left">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">PROJECTED RETURN</h4>
                  <p className="text-[10px] text-slate-400">{selectedDuration} Days investment simulation</p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                  +{principal > 0 ? ((netProfit / principal) * 100).toFixed(0) : '0'}% ROI
                </div>
              </div>

              {/* Math Display */}
              <div className="space-y-3.5 text-left">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Principal</span>
                  <span className="text-lg font-bold text-slate-300">{formatIndianCurrency(principal)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Net Profit</span>
                  <span className="text-xl font-black text-emerald-400">+{formatIndianCurrency(netProfit)}</span>
                </div>
                <div className="pt-2.5 border-t border-slate-800">
                  <span className="text-[9px] text-emerald-500 uppercase block font-bold">Total Payout</span>
                  <span className="text-2xl font-extrabold text-white tracking-tight">
                    {formatIndianCurrency(totalReturn)}
                  </span>
                </div>
              </div>

              {onInvestSelect && (
                <button
                  onClick={() => onInvestSelect(selectedPlan)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#070b15] font-black text-xs uppercase tracking-widest py-3 rounded-lg transition-all"
                >
                  Invest Now
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
