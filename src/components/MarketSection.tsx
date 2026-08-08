import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Zap, 
  Globe, 
  Search, 
  Coins, 
  ShieldCheck, 
  Flame, 
  ArrowLeft, 
  Info, 
  Lock, 
  ChevronUp, 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  MoreVertical,
  Award,
  Bitcoin,
  CircleDollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { User, ActiveTrade, SystemSettings } from '../types';
import OrderBook from './OrderBook';

// Assets and Constants (extracted from TradeSection)
const CRYPTO_ASSETS = [
  { symbol: 'BTC/USDT', label: 'Bitcoin', extra: '4,102,401.90', price: 94120.00, change: 1.45, multiplier: '10x', icon: 'BTC' },
  { symbol: 'ETH/USDT', label: 'Ethereum', extra: '2,903,412.10', price: 3420.00, change: 2.10, multiplier: '10x', icon: 'ETH' },
  { symbol: 'SOL/USDT', label: 'Solana', extra: '1,500,412.50', price: 165.20, change: 5.67, multiplier: '10x', icon: 'OTHER' },
  { symbol: 'DOGE/USDT', label: 'Dogecoin', extra: '900,412.10', price: 0.14, change: -2.34, multiplier: '10x', icon: 'OTHER' },
  { symbol: 'BNB/USDT', label: 'BNB', extra: '1,324,291.50', price: 592.50, change: 0.85, multiplier: '10x', icon: 'BNB' },
  { symbol: 'NEXO/USDT', label: 'Nexo', extra: '329,023.10', price: 0.762, change: 0.93, multiplier: '5x', icon: 'OTHER' },
  { symbol: 'KERNEL/USDT', label: 'KernelDAO', extra: '324,291.76', price: 0.0338, change: -1.74, multiplier: '5x', icon: 'OTHER' },
  { symbol: 'MANA/USDT', label: 'Decentraland', extra: '325,222.90', price: 0.0697, change: 0.29, multiplier: '5x', icon: 'OTHER' },
  { symbol: 'LUNA/USDT', label: 'Terra', extra: '325,049.88', price: 0.0460, change: -0.22, multiplier: '5x', icon: 'OTHER' },
  { symbol: 'FOGO/USDT', label: 'FOGO', extra: '324,304.49', price: 0.00911, change: 1.11, multiplier: '5x', icon: 'OTHER' },
  { symbol: 'JUV/USDT', label: 'Juventus Fan Token', extra: '322,445.78', price: 0.327, change: -0.61, multiplier: '5x', icon: 'OTHER' },
  { symbol: 'COMP/USDT', label: 'Compound', extra: '318,013.52', price: 17.03, change: -0.70, multiplier: '5x', icon: 'OTHER' },
  { symbol: 'MEME/USDT', label: 'Memecoin', extra: '313,793.98', price: 0.000532, change: -0.37, multiplier: '5x', icon: 'OTHER' },
  { symbol: 'USUAL/USDT', label: 'Usual', extra: '310,221.37', price: 0.00860, change: 1.03, multiplier: '5x', icon: 'OTHER' },
  { symbol: 'Fartcoin/USDT', label: 'Fartcoin Meme Token', extra: '302,401.90', price: 0.13837, change: 4.77, multiplier: '5x', icon: 'OTHER' },
  { symbol: 'HANA/USDT', label: 'Hana Network', extra: '298,142.10', price: 0.043309, change: 20.36, multiplier: '5x', icon: 'OTHER' }
];

const ALPHA_ASSETS = [
  { symbol: 'EVAA', label: 'Evaa Protocol', extra: 'Vol: $5.86M', price: 0.95989, change: 23.94 },
  { symbol: 'HANA', label: 'Hana Network', extra: 'Vol: $16.03M', price: 0.043309, change: 20.36 },
  { symbol: 'ARX', label: 'ARX Protocol', extra: 'Vol: $1.11B', price: 0.16347, change: 10.07 },
  { symbol: 'quq', label: 'QUQ Token', extra: 'Vol: $161.03M', price: 0.0038559, change: -0.04 },
  { symbol: 'UP', label: 'UP token', extra: 'Vol: $138.75M', price: 0.33049, change: 1.42 },
  { symbol: 'O', label: 'O-Securities', extra: 'Vol: $124.61M', price: 0.62511, change: 6.98 },
  { symbol: 'BLUAI', label: 'BlueAI Ecosystem', extra: 'Vol: $83.38M', price: 0.012294, change: 5.23 },
  { symbol: 'AKE', label: 'Ake.Finance', extra: 'Vol: $56.04M', price: 0.0016604, change: -13.00 },
  { symbol: 'UB', label: 'UB Network', extra: 'Vol: $47.07M', price: 0.097238, change: 10.48 },
  { symbol: 'BEE', label: 'BEE Chain', extra: 'Vol: $40.91M', price: 0.046452, change: 2.30 },
  { symbol: 'NES', label: 'NES Systems', extra: 'Vol: $35.12M', price: 0.22543, change: -1.69 }
];

const renderAssetIcon = (iconType: string) => {
  switch (iconType) {
    case 'BTC': return <Bitcoin className="w-5 h-5 text-amber-500" />;
    case 'ETH': return <CircleDollarSign className="w-5 h-5 text-slate-400" />;
    case 'BNB': return <CircleDollarSign className="w-5 h-5 text-amber-400" />;
    default: return <Coins className="w-5 h-5 text-slate-500" />;
  }
};

const formatCryptoPrice = (price: number) => {
  if (!price || isNaN(price)) return '0.00';
  if (price === 0) return '0.00';
  if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (price >= 0.0001) return price.toFixed(6);
  return price.toFixed(8);
};

interface MarketSectionProps {
  isLoggedIn: boolean;
  currentUser?: User | null;
  onExecuteTrade?: (amount: number, estimatedProfit: number, assetName: string, durationLabel: string) => void;
  onNavigateToWallet?: (subTab?: 'deposit' | 'withdraw' | 'history') => void;
  systemSettings?: SystemSettings;
}

export default function MarketSection({
  isLoggedIn,
  currentUser,
  onExecuteTrade,
  onNavigateToWallet,
  systemSettings
}: MarketSectionProps) {
  const [activeTab, setActiveTab] = useState<'Crypto' | 'Alpha' | 'Options' | 'Grow' | 'Square' | 'Data'>(() => {
    const stored = localStorage.getItem('market_active_tab');
    return (stored as any) || 'Crypto';
  });

  useEffect(() => {
    localStorage.setItem('market_active_tab', activeTab);
  }, [activeTab]);

  // Shared state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [cryptoAssets, setCryptoAssets] = useState(CRYPTO_ASSETS);
  const [alphaAssets, setAlphaAssets] = useState(ALPHA_ASSETS);

  // Crypto specific state
  const [cryptoSubFilter, setCryptoSubFilter] = useState<'Spot' | 'USDⓈ-M' | 'COIN-M' | 'Options'>('Spot');
  const [cryptoCoinBadge, setCryptoCoinBadge] = useState<string>('USDT');

  // Options specific state
  const [optionsSubTab, setOptionsSubTab] = useState<'Spot' | 'Stocks' | 'Buy/Sell'>('Buy/Sell');
  const [optionsAsset, setOptionsAsset] = useState<string>('BTC/USDT');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('MARKET');
  const [tradeAmountInput, setTradeAmountInput] = useState('5000');
  const [targetDuration, setTargetDuration] = useState('3m');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

  // Alpha specific state
  const [showAlphaTokens, setShowAlphaTokens] = useState<boolean>(false);
  const [goldMode, setGoldMode] = useState<'SIP' | 'One Time'>('SIP');
  const [goldFrequency, setGoldFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [goldAmount, setGoldAmount] = useState<number>(1000);
  const [goldSipDate, setGoldSipDate] = useState<number>(22);
  const [liveGoldRate, setLiveGoldRate] = useState<number>(14853.01);
  const [alphaFilter, setAlphaFilter] = useState<'All' | 'Point+' | 'BSC' | 'Ethereum' | 'Solana'>('All');

  // Square specific state
  const [squareInput, setSquareInput] = useState('');
  const [squarePosts, setSquarePosts] = useState([
    { id: 1, author: '@TradeMaster', role: 'Elite Pro', avatarColor: 'bg-amber-500', time: '12m ago', content: 'BTC/USDT local bottom is fully consolidated around $65,200. Heavy volume spikes on micro contracts. Target $68k this week without fail!', likes: 45, comments: 12, liked: false },
    { id: 2, author: '@WhaleShield', role: 'VIP Alpha', avatarColor: 'bg-indigo-500', time: '1h ago', content: 'On-chain signals detected a massive movement of $ARX and $NEXO into institutional wallets. Highly suggest launching 15m or 1h slots for maximized returns.', likes: 89, comments: 24, liked: false },
    { id: 3, author: '@CryptoGurus', role: 'Growth Lead', avatarColor: 'bg-emerald-500', time: '3h ago', content: 'Just added ₹5,00,000 into the automatic ETH 102% yield pool. Absolute fire compounding rate. Secure MoF compliance structure makes it extremely seamless.', likes: 112, comments: 41, liked: false }
  ]);

  // Helper Functions
  const projectCryptoAsset = (asset: any) => {
    const btcAsset = cryptoAssets.find(a => a.symbol.includes('BTC') || a.label.toLowerCase() === 'bitcoin');
    const bnbAsset = cryptoAssets.find(a => a.symbol.includes('BNB') || a.label.toLowerCase() === 'bnb');
    const btcPriceVal = btcAsset ? btcAsset.price : 94120;
    const bnbPriceVal = bnbAsset ? bnbAsset.price : 592.50;

    let displayPrice = asset.price;
    const baseLabel = asset.label;
    const originalSymbol = asset.symbol;
    const coinSymbol = originalSymbol.split('/')[0];

    let finalCoinSymbol = coinSymbol;
    if (coinSymbol === cryptoCoinBadge) {
      if (coinSymbol === 'BTC') finalCoinSymbol = 'ETH';
      else finalCoinSymbol = 'BTC';
    }

    if (cryptoCoinBadge === 'USDC') displayPrice = displayPrice * 0.9998;
    else if (cryptoCoinBadge === 'U') displayPrice = displayPrice * 1.0015;
    else if (cryptoCoinBadge === 'USD1') displayPrice = displayPrice * 1.004;
    else if (cryptoCoinBadge === 'USD') displayPrice = displayPrice * 1.0008;
    else if (cryptoCoinBadge === 'BNB') displayPrice = displayPrice / bnbPriceVal;
    else if (cryptoCoinBadge === 'BTC') displayPrice = displayPrice / btcPriceVal;

    let finalSymbol = `${finalCoinSymbol}/${cryptoCoinBadge}`;
    let finalMultiplier = asset.multiplier || '5x';

    if (cryptoSubFilter === 'USDⓈ-M') {
      finalSymbol = `${finalCoinSymbol}${cryptoCoinBadge} Perpetual`;
      finalMultiplier = '20x';
    } else if (cryptoSubFilter === 'COIN-M') {
      finalSymbol = `${finalCoinSymbol}USD COIN-M`;
      finalMultiplier = '50x';
      displayPrice = asset.price;
    } else if (cryptoSubFilter === 'Options') {
      const strikePrice = Math.round(displayPrice * 1.05);
      finalSymbol = `${finalCoinSymbol}-${cryptoCoinBadge}-24JUL26-${strikePrice}-C`;
      finalMultiplier = 'Option';
      displayPrice = displayPrice * 0.024;
    }

    return {
      ...asset,
      baseSymbol: coinSymbol,
      symbol: finalSymbol,
      label: baseLabel,
      price: displayPrice,
      usdPrice: asset.price,
      multiplier: finalMultiplier,
    };
  };

  const getFilteredCryptoAssets = () => {
    let list = cryptoAssets.map(a => projectCryptoAsset(a));
    if (cryptoSubFilter === 'Spot') {
      if (cryptoCoinBadge === 'BTC') list = list.filter(a => !a.symbol.startsWith('BTC/'));
      else if (cryptoCoinBadge === 'BNB') list = list.filter(a => !a.symbol.startsWith('BNB/'));
      const shift = cryptoCoinBadge.length % list.length;
      list = [...list.slice(shift), ...list.slice(0, shift)];
    } else if (cryptoSubFilter === 'USDⓈ-M') {
      list = list.filter(a => ['BTC', 'ETH', 'BNB', 'NEXO', 'KERNEL', 'MANA', 'HANA', 'Fartcoin'].includes(a.baseSymbol || ''));
    } else if (cryptoSubFilter === 'COIN-M') {
      list = list.filter(a => ['BTC', 'ETH', 'BNB', 'LUNA', 'COMP', 'MEME', 'USUAL'].includes(a.baseSymbol || ''));
    } else if (cryptoSubFilter === 'Options') {
      list = list.filter(a => ['BTC', 'ETH', 'BNB'].includes(a.baseSymbol || ''));
      const optionsList: any[] = [];
      list.forEach(asset => {
        const basePrice = asset.price;
        const baseSymbol = asset.baseSymbol;
        optionsList.push({
          ...asset,
          symbol: `${baseSymbol}-${cryptoCoinBadge}-24JUL26-${Math.round(basePrice * 1.00)}-C`,
          label: `${asset.label} ATM Call Option`,
          price: basePrice * 0.035,
          multiplier: 'Option',
          change: asset.change * 4.5,
          baseSymbol: baseSymbol,
        });
      });
      list = optionsList;
    }
    return list.filter(a => a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || a.label.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const getFilteredAlphaAssets = () => {
    let list = alphaAssets;
    if (alphaFilter === 'Point+') list = list.filter(a => a.symbol.includes('HANA') || a.symbol.includes('EVAA') || a.symbol.includes('ARX'));
    else if (alphaFilter === 'BSC') list = list.filter((_, i) => i % 2 === 0);
    else if (alphaFilter === 'Ethereum') list = list.filter((_, i) => i % 3 === 0);
    else if (alphaFilter === 'Solana') list = list.filter((_, i) => i % 3 !== 0);
    return list.filter(a => a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || a.label.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const handleLikePost = (postId: number) => {
    setSquarePosts(posts => posts.map(p => p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const handlePostSquare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!squareInput.trim()) return;
    if (!isLoggedIn) { toast.error('Session Required'); return; }
    const newPost = { id: Date.now(), author: `@${currentUser?.username || 'You'}`, role: 'VIP Member', avatarColor: 'bg-emerald-600', time: 'Just now', content: squareInput, likes: 1, comments: 0, liked: true };
    setSquarePosts([newPost, ...squarePosts]);
    setSquareInput('');
    toast.success('Insight Published to Square Node');
  };

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { toast.error('Verification Required'); return; }
    const amt = parseFloat(tradeAmountInput);
    if (isNaN(amt) || amt <= 0) { toast.error('Invalid Amount'); return; }
    const availableBal = (currentUser?.depositWallet || 0) + (currentUser?.profitWallet || 0);
    if (amt > availableBal) { toast.warning('Insufficient Balance'); return; }
    let profitRate = 1.12;
    if (targetDuration === '60s') profitRate = 0.85;
    else if (targetDuration === '3m') profitRate = 1.05;
    else if (targetDuration === '5m') profitRate = 1.28;
    else if (targetDuration === '15m') profitRate = 1.95;
    else if (targetDuration === '1h') profitRate = 3.50;
    else if (targetDuration === '1D') profitRate = 14.50;
    const estimatedProfit = Math.round(amt * profitRate);
    if (onExecuteTrade) {
      onExecuteTrade(amt, estimatedProfit, selectedAsset?.symbol || 'Asset', targetDuration);
      toast.success('Trade Dispatched!');
      setSelectedAsset(null);
    }
  };

  // Live ticking simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoAssets(prev => prev.map(a => ({ ...a, price: a.price * (1 + (Math.random() - 0.5) * 0.004), change: a.change + (Math.random() - 0.5) * 0.1 })));
      setAlphaAssets(prev => prev.map(a => ({ ...a, price: a.price * (1 + (Math.random() - 0.5) * 0.005), change: a.change + (Math.random() - 0.5) * 0.15 })));
      setLiveGoldRate(prev => prev + (Math.random() - 0.49) * 0.25);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Tab Navigation */}
      <div className="bg-[#181a20] rounded-2xl border border-slate-800 px-4 py-3 flex items-center space-x-2 overflow-x-auto scrollbar-hide">
        {(['Crypto', 'Alpha', 'Options', 'Grow', 'Square', 'Data'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'Crypto' && (
          <motion.div
            key="crypto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#121212] rounded-3xl border border-slate-800 p-6 space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1e2026] text-white text-sm border border-slate-800 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex bg-[#1e2026] p-1 rounded-xl border border-slate-800 space-x-1">
                {(['Spot', 'USDⓈ-M', 'COIN-M', 'Options'] as const).map(sub => (
                  <button
                    key={sub}
                    onClick={() => setCryptoSubFilter(sub)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      cryptoSubFilter === sub ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3">Asset</th>
                    <th className="pb-3 text-right">Price</th>
                    <th className="pb-3 text-right">24h Chg%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {getFilteredCryptoAssets().map(coin => (
                    <tr
                      key={coin.symbol}
                      onClick={() => setSelectedAsset(coin)}
                      className="group hover:bg-[#1e2026]/50 cursor-pointer transition-all"
                    >
                      <td className="py-4 flex items-center space-x-3">
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                          {renderAssetIcon(coin.icon)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-black text-white font-mono">{coin.symbol}</span>
                            <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold">{coin.multiplier}</span>
                          </div>
                          <span className="text-xs text-slate-500">{coin.label}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <div className="text-sm font-black text-white font-mono">{formatCryptoPrice(coin.price)}</div>
                        <div className="text-[10px] text-slate-500 font-mono">${formatCryptoPrice(coin.usdPrice || coin.price)}</div>
                      </td>
                      <td className="py-4 text-right">
                        <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-black font-mono ${
                          coin.change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'Alpha' && (
          <motion.div
            key="alpha"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 max-w-2xl mx-auto text-left"
          >
            <div className="flex bg-[#121212] p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setShowAlphaTokens(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${!showAlphaTokens ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                🪙 Gold Investment
              </button>
              <button
                onClick={() => setShowAlphaTokens(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${showAlphaTokens ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                🔥 Alpha Tokens
              </button>
            </div>

            {!showAlphaTokens ? (
              <div className="bg-white rounded-3xl p-6 space-y-6 shadow-xl text-slate-900 font-sans">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h2 className="text-2xl font-black text-slate-900">Invest in Gold <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">24K</span></h2>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-rose-500 animate-pulse block">LIVE RATE</span>
                    <span className="text-lg font-black font-mono">₹{liveGoldRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  <button onClick={() => setGoldMode('SIP')} className={`flex-1 py-3 rounded-xl font-black ${goldMode === 'SIP' ? 'bg-[#005b52] text-white' : 'text-slate-400'}`}>SIP</button>
                  <button onClick={() => setGoldMode('One Time')} className={`flex-1 py-3 rounded-xl font-black ${goldMode === 'One Time' ? 'bg-[#005b52] text-white' : 'text-slate-400'}`}>ONE TIME</button>
                </div>

                <div className="bg-amber-50 rounded-3xl p-8 text-center space-y-4 border border-amber-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enter Amount</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-3xl font-black">₹</span>
                    <input type="number" value={goldAmount} onChange={e => setGoldAmount(Number(e.target.value))} className="bg-transparent text-5xl font-black outline-none w-48 text-center" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[500, 1000, 2000, 5000].map(amt => (
                      <button key={amt} onClick={() => setGoldAmount(amt)} className={`py-2 rounded-xl border text-xs font-bold ${goldAmount === amt ? 'bg-[#005b52] text-white border-[#005b52]' : 'bg-white border-slate-200'}`}>₹{amt}</button>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-[#005b52] text-white py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all">INVEST NOW</button>
              </div>
            ) : (
              <div className="bg-[#121212] rounded-3xl border border-slate-800 p-6 space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3">Token</th>
                        <th className="pb-3 text-right">Price</th>
                        <th className="pb-3 text-right">Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {getFilteredAlphaAssets().map(token => (
                        <tr key={token.symbol} className="hover:bg-[#1e2026]/50 cursor-pointer transition-all">
                          <td className="py-4 flex items-center space-x-3">
                            <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                            </div>
                            <div>
                              <span className="text-sm font-black text-white font-mono">${token.symbol}</span>
                              <span className="text-[10px] text-slate-500 block">{token.label}</span>
                            </div>
                          </td>
                          <td className="py-4 text-right font-mono text-white font-bold text-sm">{token.price.toFixed(5)}</td>
                          <td className="py-4 text-right">
                            <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${token.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'Options' && (
          <motion.div
            key="options"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#121212] rounded-3xl border border-slate-800 p-6 space-y-6 text-left"
          >
            <div className="flex bg-slate-900 p-1 rounded-xl max-w-xs">
              {(['Spot', 'Stocks', 'Buy/Sell'] as const).map(st => (
                <button key={st} onClick={() => setOptionsSubTab(st)} className={`flex-1 py-2 rounded-lg text-xs font-black ${optionsSubTab === st ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}>{st}</button>
              ))}
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-6">
                <div className="bg-[#181a20] p-6 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">Advanced Trading Terminal</h3>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Live Engine</span>
                    </div>
                  </div>
                  <div className="h-64 bg-slate-950 rounded-2xl border border-slate-900 flex items-center justify-center">
                    <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">Real-time Chart Stream</p>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-80 bg-[#181a20] p-6 rounded-3xl border border-slate-800 space-y-5">
                <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-xl">
                  <button onClick={() => setTradeType('BUY')} className={`py-2 rounded-lg font-black text-xs ${tradeType === 'BUY' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>BUY</button>
                  <button onClick={() => setTradeType('SELL')} className={`py-2 rounded-lg font-black text-xs ${tradeType === 'SELL' ? 'bg-rose-500 text-slate-950' : 'text-slate-400'}`}>SELL</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cycle Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['60s', '3m', '5m', '15m', '1h', '1D'].map(d => (
                        <button key={d} onClick={() => setTargetDuration(d)} className={`py-2 rounded-lg border text-[10px] font-bold ${targetDuration === d ? 'border-amber-500 text-amber-500 bg-amber-500/5' : 'border-slate-800 text-slate-400'}`}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Amount (INR)</label>
                    <input type="number" value={tradeAmountInput} onChange={e => setTradeAmountInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono outline-none focus:border-amber-500" />
                  </div>
                  <button onClick={handleTradeSubmit} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg ${tradeType === 'BUY' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>Execute {tradeType} Contract</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'Grow' && (
          <motion.div
            key="grow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left"
          >
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-8 rounded-3xl border border-indigo-500/20 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Institutional Yield</span>
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Earn up to 124.8% APR</h3>
                <p className="text-slate-400 text-sm max-w-lg">Stake your digital assets in secure MoF audited yield nodes for maximum automated returns.</p>
              </div>
              <button className="bg-amber-500 text-slate-950 font-black px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all">START EARNING</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { asset: 'ETH', apr: '102.5%', color: 'text-amber-500' },
                { asset: 'USDC', apr: '6.81%', color: 'text-blue-400' },
                { asset: 'SOL', apr: '41.5%', color: 'text-purple-400' },
                { asset: 'HANA', apr: '124.8%', color: 'text-emerald-400' }
              ].map(p => (
                <div key={p.asset} className="bg-[#121212] border border-slate-800 p-5 rounded-3xl space-y-4 hover:border-slate-700 transition-all group">
                  <div className="flex justify-between items-start">
                    <span className="text-lg font-black text-white">{p.asset} Saving</span>
                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded font-bold text-slate-500">Flexible</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase block">Yield Rate</span>
                    <span className={`text-2xl font-black ${p.color}`}>{p.apr} APR</span>
                  </div>
                  <button className="w-full bg-slate-900 text-white py-2 rounded-xl text-xs font-bold opacity-50 group-hover:opacity-100 transition-all border border-slate-800">Subscribe</button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'Square' && (
          <motion.div
            key="square"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 max-w-2xl mx-auto text-left"
          >
            <form onSubmit={handlePostSquare} className="bg-[#121212] border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-black text-slate-950 uppercase">{currentUser?.username?.slice(0,2) || 'TR'}</div>
                <textarea 
                  value={squareInput} 
                  onChange={e => setSquareInput(e.target.value)} 
                  placeholder="Share market insights..." 
                  className="flex-1 bg-[#1e2026] text-white p-3 rounded-xl border border-slate-800 outline-none h-20 resize-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-amber-500 text-slate-950 font-black px-6 py-2 rounded-xl text-xs uppercase shadow-lg">Post</button>
              </div>
            </form>

            <div className="space-y-4">
              {squarePosts.map(post => (
                <div key={post.id} className="bg-[#121212] border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 ${post.avatarColor} rounded-xl flex items-center justify-center text-white font-bold`}>{post.author.slice(1,3)}</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-white">{post.author}</span>
                          <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold">{post.role}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{post.time}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{post.content}</p>
                  <div className="flex items-center space-x-6 pt-3 border-t border-slate-900 text-slate-500">
                    <button onClick={() => handleLikePost(post.id)} className={`flex items-center space-x-2 text-xs font-bold ${post.liked ? 'text-amber-500' : ''}`}>
                      <ThumbsUp className={`w-4 h-4 ${post.liked ? 'fill-amber-500' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <div className="flex items-center space-x-2 text-xs font-bold">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </div>
                    <Share2 className="w-4 h-4 ml-auto cursor-pointer hover:text-white transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'Data' && (
          <motion.div
            key="data"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left"
          >
            <div className="bg-[#121212] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-3">Sentiment Index</h4>
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="text-6xl font-black text-amber-500 font-mono">7.67</div>
                <span className="bg-amber-500/10 text-amber-500 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Strong Bullish</span>
                <p className="text-[10px] text-slate-500 text-center max-w-xs uppercase font-mono">Institutional accumulation detected on spot liquidity nodes.</p>
              </div>
            </div>
            <div className="bg-[#121212] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-3">Yield Distribution</h4>
              <div className="space-y-6 py-6">
                <div className="flex justify-between text-xs font-black uppercase">
                  <span className="text-emerald-500">Up: 627</span>
                  <span className="text-rose-500">Down: 367</span>
                </div>
                <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                  <div className="bg-emerald-500 h-full" style={{ width: '63%' }}></div>
                  <div className="bg-rose-500 h-full" style={{ width: '37%' }}></div>
                </div>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Market breadth remains positive with strong volume support.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset Selection Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 text-left"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#121212] w-full max-w-4xl rounded-3xl border border-slate-800 overflow-hidden flex flex-col md:flex-row h-[90vh] shadow-2xl"
            >
              <div className="flex-1 p-6 overflow-y-auto space-y-6 border-r border-slate-800">
                <div className="flex justify-between items-center">
                  <button onClick={() => setSelectedAsset(null)} className="p-2 bg-slate-900 rounded-xl text-slate-400 hover:text-white border border-slate-800"><ArrowLeft className="w-5 h-5" /></button>
                  <h4 className="text-lg font-black text-white font-mono">{selectedAsset.symbol}</h4>
                  <div className="w-10"></div>
                </div>
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 text-center space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Live Price</span>
                  <div className="text-4xl font-black text-white font-mono tracking-tighter">{formatCryptoPrice(selectedAsset.price)}</div>
                  <span className={`text-sm font-bold font-mono px-3 py-1 rounded-full ${selectedAsset.change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-400'}`}>
                    {selectedAsset.change >= 0 ? '+' : ''}{selectedAsset.change.toFixed(2)}%
                  </span>
                </div>
                <div className="h-64 bg-slate-950 rounded-2xl border border-slate-900 flex items-center justify-center">
                  <p className="text-slate-700 font-mono text-[10px] uppercase tracking-[0.4em]">Proprietary Chart Engine Active</p>
                </div>
              </div>
              <div className="w-full md:w-80 bg-[#181a20] p-6 space-y-6">
                <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-xl">
                  <button onClick={() => setTradeType('BUY')} className={`py-2 rounded-lg font-black text-xs ${tradeType === 'BUY' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>BUY</button>
                  <button onClick={() => setTradeType('SELL')} className={`py-2 rounded-lg font-black text-xs ${tradeType === 'SELL' ? 'bg-rose-500 text-slate-950' : 'text-slate-400'}`}>SELL</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Maturity Window</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['60s', '3m', '5m', '15m', '1h', '1D'].map(d => (
                        <button key={d} onClick={() => setTargetDuration(d)} className={`py-2 rounded-lg border text-[10px] font-bold ${targetDuration === d ? 'border-amber-500 text-amber-500' : 'border-slate-800 text-slate-400'}`}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Contract Size (INR)</label>
                    <input type="number" value={tradeAmountInput} onChange={e => setTradeAmountInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono outline-none focus:border-amber-500" />
                  </div>
                  <button onClick={handleTradeSubmit} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg ${tradeType === 'BUY' ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'}`}>Confirm {tradeType} Entry</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
