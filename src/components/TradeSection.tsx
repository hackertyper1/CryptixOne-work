import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import OrderBook from './OrderBook';
import { ActiveTrade, InvestmentPlan, SystemSettings, User } from '../types';
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
  Calculator,
  Flame,
  Award,
  ArrowLeft,
  Search,
  Star,
  Info,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  CheckCircle2,
  Wallet,
  ShieldCheck,
  Percent,
  Lock,
  MessageSquare,
  ThumbsUp,
  Share2,
  Heart,
  Bitcoin,
  CircleDollarSign
} from 'lucide-react';
import { toast } from 'sonner';

// Strict Asset Configurations matching provided image data exactly
import { CRYPTO_ASSETS, TRADFI_ASSETS, ALPHA_ASSETS, getLogoUrl } from '../data/assets';

interface TradeSectionProps {
  activeTrades: ActiveTrade[];
  isLoggedIn: boolean;
  currentUser?: User | null;
  onNavigateToHome: () => void;
  onInvestSelect?: (plan: InvestmentPlan) => void;
  systemSettings?: SystemSettings;
  onChangeTab?: (tab: string) => void;
  onExecuteTrade?: (amount: number, estimatedProfit: number, assetName: string, durationLabel: string) => void;
}

export default function TradeSection({
  activeTrades,
  isLoggedIn,
  currentUser,
  onNavigateToHome,
  onInvestSelect,
  systemSettings,
  onChangeTab,
  onExecuteTrade
}: TradeSectionProps) {
  // Calculator states
  const [selectedPlanId, setSelectedPlanId] = useState<string>(INVESTMENT_PLANS[0].id);
  const [selectedDuration, setSelectedDuration] = useState<number>(7); // Days: 7, 15, 30

  // Chart Selection state (for custom terminal widget compatibility)
  const [selectedChart, setSelectedChart] = useState<'STOCK' | 'CRYPTO' | 'FOREX'>('STOCK');

  // Exact design header navigation tabs state (Crypto, TradFi, Alpha, Grow, Square, Data)
  const [activeHeaderTab, setActiveHeaderTab] = useState<'Crypto' | 'TradFi' | 'Alpha' | 'Grow' | 'Square' | 'Data'>('Crypto');

  // Search query & filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [cryptoSubFilter, setCryptoSubFilter] = useState<'Spot' | 'USDⓈ-M' | 'COIN-M' | 'Options'>('Spot');
  const [cryptoCoinBadge, setCryptoCoinBadge] = useState<string>('USDT');

  const [tradfiSubFilter, setTradfiSubFilter] = useState<'Stocks' | 'Spot' | 'USDⓈ-M'>('Stocks');
  const [tradfiUSFilter, setTradfiUSFilter] = useState<'US Stocks' | 'ETFs'>('US Stocks');

  const [alphaFilter, setAlphaFilter] = useState<'All' | 'Point+' | 'Tokenized Securities' | 'BSC' | 'Ethereum' | 'Solana'>('All');

  // Copy Trade & staking interactive state
  const [selectedTrader, setSelectedTrader] = useState<any | null>(null);
  const [copyAmount, setCopyAmount] = useState('10000');
  const [copyDuration, setCopyDuration] = useState('7 Days');

  // Square interaction state
  const [squarePosts, setSquarePosts] = useState([
    { id: 1, author: '@TradeMaster', role: 'Elite Pro', avatarColor: 'bg-amber-500', time: '12m ago', content: 'BTC/USDT local bottom is fully consolidated around $65,200. Heavy volume spikes on micro contracts. Target $68k this week without fail!', likes: 45, comments: 12, liked: false },
    { id: 2, author: '@WhaleShield', role: 'VIP Alpha', avatarColor: 'bg-indigo-500', time: '1h ago', content: 'On-chain signals detected a massive movement of $ARX and $NEXO into institutional wallets. Highly suggest launching 15m or 1h slots for maximized returns.', likes: 89, comments: 24, liked: false },
    { id: 3, author: '@CryptoGurus', role: 'Growth Lead', avatarColor: 'bg-emerald-500', time: '3h ago', content: 'Just added ₹5,00,000 into the automatic ETH 102% yield pool. Absolute fire compounding rate. Secure MoF compliance structure makes it extremely seamless.', likes: 112, comments: 41, liked: false }
  ]);
  const [squareInput, setSquareInput] = useState('');

  // Interactive Live detail / trade execution screen
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [cryptoAssets, setCryptoAssets] = useState(CRYPTO_ASSETS);
  const [tradFiAssets, setTradFiAssets] = useState(TRADFI_ASSETS);
  const [alphaAssets, setAlphaAssets] = useState(ALPHA_ASSETS);

  // Helper to project any base crypto asset to the selected category & quote coin
  const projectCryptoAsset = (asset: any) => {
    const btcAsset = cryptoAssets.find(a => a.symbol.includes('BTC') || a.label.toLowerCase() === 'bitcoin');
    const bnbAsset = cryptoAssets.find(a => a.symbol.includes('BNB') || a.label.toLowerCase() === 'bnb');
    const btcPriceVal = btcAsset ? btcAsset.price : 94120;
    const bnbPriceVal = bnbAsset ? bnbAsset.price : 592.50;

    let displayPrice = asset.price;
    const baseLabel = asset.label;
    const originalSymbol = asset.symbol;
    const coinSymbol = originalSymbol.split('/')[0];

    // If the coin is the same as the badge (e.g. BTC/BTC), swap it to make it look great
    let finalCoinSymbol = coinSymbol;
    if (coinSymbol === cryptoCoinBadge) {
      if (coinSymbol === 'BTC') finalCoinSymbol = 'ETH';
      else finalCoinSymbol = 'BTC';
    }

    // Calculate relative price based on selected quote badge
    if (cryptoCoinBadge === 'USDC') {
      displayPrice = displayPrice * 0.9998;
    } else if (cryptoCoinBadge === 'U') {
      displayPrice = displayPrice * 1.0015;
    } else if (cryptoCoinBadge === 'USD1') {
      displayPrice = displayPrice * 1.004;
    } else if (cryptoCoinBadge === 'USD') {
      displayPrice = displayPrice * 1.0008;
    } else if (cryptoCoinBadge === 'BNB') {
      displayPrice = displayPrice / bnbPriceVal;
    } else if (cryptoCoinBadge === 'BTC') {
      displayPrice = displayPrice / btcPriceVal;
    }

    // Format symbol based on sub-filter (Spot, USDⓈ-M, COIN-M, Options)
    let finalSymbol = `${finalCoinSymbol}/${cryptoCoinBadge}`;
    let finalMultiplier = asset.multiplier || '5x';

    if (cryptoSubFilter === 'USDⓈ-M') {
      finalSymbol = `${finalCoinSymbol}${cryptoCoinBadge} Perpetual`;
      finalMultiplier = '20x';
    } else if (cryptoSubFilter === 'COIN-M') {
      finalSymbol = `${finalCoinSymbol}USD COIN-M`;
      finalMultiplier = '50x';
      displayPrice = asset.price; // keep USD-based price
    } else if (cryptoSubFilter === 'Options') {
      const strikePrice = Math.round(displayPrice * 1.05);
      finalSymbol = `${finalCoinSymbol}-${cryptoCoinBadge}-24JUL26-${strikePrice}-C`;
      finalMultiplier = 'Option';
      displayPrice = displayPrice * 0.024; // Options premium is a small fraction of spot price
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

  const liveSelectedAsset = selectedAsset ? (
    selectedAsset.baseSymbol ? (
      (() => {
        const base = cryptoAssets.find(a => a.symbol.startsWith(selectedAsset.baseSymbol + '/') || a.symbol === selectedAsset.baseSymbol);
        return base ? projectCryptoAsset(base) : selectedAsset;
      })()
    ) : (
      cryptoAssets.find(a => a.symbol === selectedAsset.symbol) ||
      tradFiAssets.find(a => a.symbol === selectedAsset.symbol) ||
      alphaAssets.find(a => a.symbol === selectedAsset.symbol) ||
      selectedAsset
    )
  ) : null;
  const activeAsset = liveSelectedAsset || selectedAsset;
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('MARKET');
  const [limitPrice, setLimitPrice] = useState('');
  const [tradeAmountInput, setTradeAmountInput] = useState('5000');
  const [targetDuration, setTargetDuration] = useState('3m'); // 60s, 3m, 5m, 15m, 1h, 1D
  const [chartTimeframe, setChartTimeframe] = useState<'Time' | '15m' | '1h' | '4h' | '1D' | 'More'>('15m');
  const [indicatorMode, setIndicatorMode] = useState<'MA' | 'EMA' | 'BOLL' | 'SAR' | 'AVL' | 'SUPER' | 'VOL' | 'MACD' | 'RSI'>('MA');
  const [orderBookTab, setOrderBookTab] = useState<'Order Book' | 'Depth' | 'Trades' | 'Network'>('Order Book');

  // Real-time fluctuating tickers for the trading screens
  const [sbiPrice, setSbiPrice] = useState(843.50);
  const [btcPrice, setBtcPrice] = useState(5412980);
  const [forexPrice, setForexPrice] = useState(89.42);

  // Sparkline history data
  const [sbiHistory, setSbiHistory] = useState<number[]>([]);
  const [btcHistory, setBtcHistory] = useState<number[]>([]);
  const [forexHistory, setForexHistory] = useState<number[]>([]);

  // Tickers update interval
  useEffect(() => {
    const initSbi = Array.from({ length: 15 }, () => 840 + Math.random() * 8);
    setSbiHistory(initSbi);
    setSbiPrice(initSbi[initSbi.length - 1]);

    const initBtc = Array.from({ length: 15 }, () => 5410000 + Math.random() * 8000);
    setBtcHistory(initBtc);
    setBtcPrice(initBtc[initBtc.length - 1]);

    const initForex = Array.from({ length: 15 }, () => 89.1 + Math.random() * 0.7);
    setForexHistory(initForex);
    setForexPrice(initForex[initForex.length - 1]);

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

      // Update Crypto, TradFi, and Alpha assets with random live ticking fluctuations
      setCryptoAssets(prev => prev.map(asset => {
        const changePercent = (Math.random() - 0.5) * 0.4;
        const nextPrice = Math.max(0.000001, asset.price * (1 + changePercent / 100));
        const nextChange = asset.change + changePercent;
        return { ...asset, price: nextPrice, change: nextChange };
      }));

      setTradFiAssets(prev => prev.map(asset => {
        const changePercent = (Math.random() - 0.5) * 0.3;
        const nextPrice = Math.max(0.0001, asset.price * (1 + changePercent / 100));
        const nextChange = asset.change + changePercent;
        return { ...asset, price: nextPrice, change: nextChange };
      }));

      setAlphaAssets(prev => prev.map(asset => {
        const changePercent = (Math.random() - 0.5) * 0.5;
        const nextPrice = Math.max(0.000001, asset.price * (1 + changePercent / 100));
        const nextChange = asset.change + changePercent;
        return { ...asset, price: nextPrice, change: nextChange };
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Compute active trade countdown progress
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Set default values for limit price when an asset is clicked
  useEffect(() => {
    if (selectedAsset) {
      setLimitPrice(selectedAsset.price.toString());
    }
  }, [selectedAsset]);

  // Sync activeHeaderTab with main terminal selections
  useEffect(() => {
    if (selectedChart === 'CRYPTO') {
      setActiveHeaderTab('Crypto');
    } else if (selectedChart === 'STOCK' || selectedChart === 'FOREX') {
      setActiveHeaderTab('TradFi');
    }
  }, [selectedChart]);

  // Calculate dynamic compound outputs for calculator
  const selectedPlan = INVESTMENT_PLANS.find(p => p.id === selectedPlanId) || INVESTMENT_PLANS[0];
  
  const calculateReturns = () => {
    const principal = selectedPlan.amount;
    const hourProfit = selectedPlan.estimatedProfit;
    
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

  // Format price gracefully based on its scale to avoid redundant trailing zeros or truncation of small values
  const formatCryptoPrice = (price: number) => {
    if (!price || isNaN(price)) return '0.00';
    if (price === 0) return '0.00';
    if (price >= 1000) {
      return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (price >= 1) {
      return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    }
    if (price >= 0.0001) {
      return price.toFixed(6);
    }
    return price.toFixed(8);
  };

  // Filtered Assets based on user selections and Search Query
  const getFilteredCryptoAssets = () => {
    let list = cryptoAssets.map(a => projectCryptoAsset(a));

    if (cryptoSubFilter === 'Spot') {
      if (cryptoCoinBadge === 'BTC') {
        list = list.filter(a => !a.symbol.startsWith('BTC/'));
      } else if (cryptoCoinBadge === 'BNB') {
        list = list.filter(a => !a.symbol.startsWith('BNB/'));
      }
      const shift = cryptoCoinBadge.length % list.length;
      list = [...list.slice(shift), ...list.slice(0, shift)];
    } 
    else if (cryptoSubFilter === 'USDⓈ-M') {
      list = list.filter(a => ['BTC', 'ETH', 'BNB', 'NEXO', 'KERNEL', 'MANA', 'HANA', 'Fartcoin'].includes(a.baseSymbol || ''));
      const shift = (cryptoCoinBadge.length + 2) % Math.max(1, list.length);
      list = [...list.slice(shift), ...list.slice(0, shift)];
    } 
    else if (cryptoSubFilter === 'COIN-M') {
      list = list.filter(a => ['BTC', 'ETH', 'BNB', 'LUNA', 'COMP', 'MEME', 'USUAL'].includes(a.baseSymbol || ''));
      const shift = (cryptoCoinBadge.length + 4) % Math.max(1, list.length);
      list = [...list.slice(shift), ...list.slice(0, shift)];
    } 
    else if (cryptoSubFilter === 'Options') {
      list = list.filter(a => ['BTC', 'ETH', 'BNB'].includes(a.baseSymbol || ''));
      const optionsList: any[] = [];
      list.forEach(asset => {
        const basePrice = asset.price;
        const baseSymbol = asset.baseSymbol;
        
        const strike1 = Math.round(basePrice * 1.00);
        optionsList.push({
          ...asset,
          symbol: `${baseSymbol}-${cryptoCoinBadge}-24JUL26-${strike1}-C`,
          label: `${asset.label} ATM Call Option`,
          price: basePrice * 0.035,
          multiplier: 'Option',
          change: asset.change * 4.5,
          baseSymbol: baseSymbol,
        });

        const strike2 = Math.round(basePrice * 1.05);
        optionsList.push({
          ...asset,
          symbol: `${baseSymbol}-${cryptoCoinBadge}-24JUL26-${strike2}-C`,
          label: `${asset.label} OTM $${strike2} Call`,
          price: basePrice * 0.015,
          multiplier: 'Option',
          change: asset.change * 8.2,
          baseSymbol: baseSymbol,
        });

        const strike3 = Math.round(basePrice * 0.98);
        optionsList.push({
          ...asset,
          symbol: `${baseSymbol}-${cryptoCoinBadge}-24JUL26-${strike3}-P`,
          label: `${asset.label} ITM $${strike3} Put`,
          price: basePrice * 0.022,
          multiplier: 'Option',
          change: asset.change * -5.4,
          baseSymbol: baseSymbol,
        });
      });
      list = optionsList;
    }

    return list.filter(a => {
      const matchSearch = a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || a.label.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  };

  const getFilteredTradFiAssets = () => {
    let list = tradFiAssets;
    
    if (tradfiUSFilter === 'ETFs') {
      list = list.filter(a => a.symbol.includes('on') || a.symbol.includes('ETF') || a.label.includes('ETF'));
    } else {
      list = list.filter(a => !a.symbol.includes('on') && !a.symbol.includes('ETF') && !a.label.includes('ETF'));
    }
    
    if (tradfiSubFilter === 'Spot') {
      const shift = 2 % Math.max(1, list.length);
      list = [...list.slice(shift), ...list.slice(0, shift)];
    } else if (tradfiSubFilter === 'USDⓈ-M') {
      const shift = 4 % Math.max(1, list.length);
      list = [...list.slice(shift), ...list.slice(0, shift)].map(item => ({
        ...item,
        symbol: `${item.symbol} Perpetual`,
        multiplier: '20x'
      }));
    }

    return list.filter(a => {
      const matchSearch = a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || a.label.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  };

  const getFilteredAlphaAssets = () => {
    let list = alphaAssets;

    if (alphaFilter === 'Point+') {
      list = list.filter(a => a.symbol.includes('HANA') || a.symbol.includes('EVAA') || a.symbol.includes('ARX'));
    } else if (alphaFilter === 'BSC') {
      list = list.filter((_, i) => i % 2 === 0);
    } else if (alphaFilter === 'Ethereum') {
      list = list.filter((_, i) => i % 3 === 0);
    } else if (alphaFilter === 'Solana') {
      list = list.filter((_, i) => i % 3 !== 0);
    }

    return list.filter(a => {
      const matchSearch = a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || a.label.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  };

  // Handle Trade Execution Submit
  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Identity Verification Required', {
        description: 'Please authenticate your profile session under the Account section first.',
      });
      return;
    }

    const amt = parseFloat(tradeAmountInput);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Invalid Allocation Amount', {
        description: 'Please specify a valid numeric transaction size.',
      });
      return;
    }

    const availableBal = (currentUser?.depositWallet || 0) + (currentUser?.profitWallet || 0);
    if (availableBal < amt) {
      toast.error('Insufficient Capital Reserves', {
        description: `Your available system balance is ₹${availableBal.toLocaleString()}. Please complete a deposit form.`,
      });
      return;
    }

    // Determine return multiplier based on duration
    let profitRate = 1.12; // default +12%
    if (targetDuration === '60s') profitRate = 0.85; // +85% payout
    else if (targetDuration === '3m') profitRate = 1.05; // +105% payout
    else if (targetDuration === '5m') profitRate = 1.28; // +128% payout
    else if (targetDuration === '15m') profitRate = 1.95; // +195% payout
    else if (targetDuration === '1h') profitRate = 3.50; // +350% payout
    else if (targetDuration === '1D') profitRate = 14.50; // +1450% payout

    const estimatedProfit = Math.round(amt * profitRate);

    if (onExecuteTrade) {
      onExecuteTrade(amt, estimatedProfit, selectedAsset?.symbol || 'Asset', targetDuration);
      toast.success('Trade Execution Dispatched!', {
        description: `Deducted ₹${amt.toLocaleString()} to activate secure ${selectedAsset?.symbol} ${targetDuration} micro-contract.`,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      });
      setSelectedAsset(null); // close modal
      
      // scroll to active contracts tracker
      setTimeout(() => {
        const trackerEl = document.getElementById('user-active-trades-section');
        if (trackerEl) trackerEl.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  // Square action logic
  const handleLikePost = (postId: number) => {
    setSquarePosts(posts => posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          liked: !p.liked,
          likes: p.liked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const handlePostSquare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!squareInput.trim()) return;
    if (!isLoggedIn) {
      toast.error('Session Required', { description: 'Please log in to share trading insights.' });
      return;
    }

    const newPost = {
      id: Date.now(),
      author: `@${currentUser?.username || 'You'}`,
      role: 'VIP Member',
      avatarColor: 'bg-emerald-600',
      time: 'Just now',
      content: squareInput,
      likes: 1,
      comments: 0,
      liked: true
    };

    setSquarePosts([newPost, ...squarePosts]);
    setSquareInput('');
    toast.success('Insight Published to Square Node');
  };

  // Copy trading execution
  const handleCopyTraderAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Identity Verification Required');
      return;
    }
    const amt = parseFloat(copyAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    const availableBal = (currentUser?.depositWallet || 0) + (currentUser?.profitWallet || 0);
    if (availableBal < amt) {
      toast.error('Insufficient Wallet Capital');
      return;
    }

    // Launch active trade simulating copy process
    if (onExecuteTrade) {
      const estimatedProfit = Math.round(amt * 1.85); // 85% return on 7 days block
      onExecuteTrade(amt, estimatedProfit, `Copy Trader (${selectedTrader.name})`, copyDuration);
      toast.success('Copy Portfolio Subscribed!', {
        description: `Successfully allocated ₹${amt.toLocaleString()} to mirror ${selectedTrader.name}.`,
        icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
      });
      setSelectedTrader(null);
    }
  };

  return (
    <div className="space-y-10 pb-16" id="trade-section-container">
      
      {/* Premium Horizontal Navigation Bar mirroring user's image */}
      <div className="bg-[#181a20] rounded-2xl border border-slate-800/80 px-6 py-4 shadow-2xl flex flex-row items-center justify-between gap-4" id="premium-terminal-tagbar">
        <div className="flex items-center space-x-6 md:space-x-10 overflow-x-auto scrollbar-hide py-1">
          {(['Crypto', 'TradFi', 'Alpha', 'Grow', 'Square', 'Data'] as const).map((tab) => {
            const isActive = activeHeaderTab === tab;
            return (
              <button
                key={tab}
                id={`btn-terminal-tag-${tab.toLowerCase()}`}
                onClick={() => {
                  setActiveHeaderTab(tab);
                  if (tab === 'Crypto') {
                    setSelectedChart('CRYPTO');
                  } else if (tab === 'TradFi') {
                    setSelectedChart('STOCK');
                  }
                }}
                className="relative pb-2.5 pt-1.5 px-2 transition-all duration-300 focus:outline-none select-none shrink-0"
              >
                <span className={`text-base md:text-xl font-bold tracking-tight ${
                  isActive ? 'text-[#f0b90b] font-extrabold' : 'text-[#848e9c] hover:text-slate-200'
                }`}>
                  {tab}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeUnderlineBar"
                    className="absolute bottom-0 left-1 right-1 h-[4px] bg-[#f0b90b] rounded-full shadow-[0_2px_10px_rgba(240,185,11,0.6)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Live Status indicator right-aligned */}
        <div className="hidden sm:flex items-center space-x-3 shrink-0 pl-4 border-l border-slate-800">
          <div className="flex items-center space-x-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f0b90b] animate-pulse shadow-[0_0_8px_#f0b90b]"></span>
            <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">
              {activeHeaderTab.toUpperCase()} ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Main Dynamic View Content */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: CRYPTO LIST COMPONENT */}
        {activeHeaderTab === 'Crypto' && (
          <motion.div
            key="crypto-tab-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-[#121212] rounded-3xl border border-slate-800 p-5 md:p-6 shadow-2xl space-y-5 text-left"
          >
            {/* Search and Category Badges */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search coin pair and trend..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1e2026] text-white text-sm border border-slate-800 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#f0b90b] transition-all"
                />
              </div>

              {/* Sub filters */}
              <div className="flex bg-[#1e2026] p-1 rounded-xl border border-slate-800 space-x-1 overflow-x-auto">
                {(['Spot', 'USDⓈ-M', 'COIN-M', 'Options'] as const).map(sub => (
                  <button
                    key={sub}
                    onClick={() => setCryptoSubFilter(sub)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                      cryptoSubFilter === sub ? 'bg-[#f0b90b] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick coin badges selector */}
            <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-hide border-b border-slate-900 pb-3">
              {(['USDC', 'USDT', 'U', 'USD1', 'USD', 'BNB', 'BTC'] as const).map(badge => (
                <button
                  key={badge}
                  onClick={() => setCryptoCoinBadge(badge)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold border transition-all uppercase whitespace-nowrap ${
                    cryptoCoinBadge === badge 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                      : 'bg-[#181a20] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {badge}
                </button>
              ))}
            </div>

            {/* Crypto Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 text-[11px] font-mono uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Name / Vol</th>
                    <th className="pb-3 text-right font-semibold">Last Price</th>
                    <th className="pb-3 text-right font-semibold">24h Chg%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {getFilteredCryptoAssets().map((coin) => {
                    const isUp = coin.change >= 0;
                    return (
                      <tr
                        key={coin.symbol}
                        onClick={() => setSelectedAsset(coin)}
                        className="group hover:bg-[#1e2026]/50 cursor-pointer transition-all border-b border-slate-900/40"
                      >
                        <td className="py-4 flex items-center space-x-3">
                          <img src={getLogoUrl(coin.label)} alt={coin.label} className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-black text-white tracking-tight font-mono">{coin.symbol}</span>
                              <span className="text-[9px] bg-amber-500/10 text-[#f0b90b] px-1.5 py-0.5 rounded font-bold">{coin.multiplier}</span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">{coin.label} | Vol: {coin.extra}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="text-sm font-black text-white font-mono">{formatCryptoPrice(coin.price)}</div>
                          <div className="text-[10px] text-slate-500 font-mono">${formatCryptoPrice(coin.usdPrice || coin.price)}</div>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-black font-mono transition-all duration-300 ${
                            isUp 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20'
                          }`}>
                            {isUp ? '+' : ''}{coin.change.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 2: TRADFI LIST COMPONENT */}
        {activeHeaderTab === 'TradFi' && (
          <motion.div
            key="tradfi-tab-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-[#121212] rounded-3xl border border-slate-800 p-5 md:p-6 shadow-2xl space-y-5 text-left"
          >
            {/* Header / Sub controls */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search equities & indexes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1e2026] text-white text-sm border border-slate-800 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#f0b90b] transition-all"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setTradfiUSFilter('US Stocks')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                    tradfiUSFilter === 'US Stocks'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'bg-[#1e2026] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  US Stocks
                </button>
                <button
                  onClick={() => setTradfiUSFilter('ETFs')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                    tradfiUSFilter === 'ETFs'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'bg-[#1e2026] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ETFs
                </button>
              </div>
            </div>

            {/* TradFi Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 text-[11px] font-mono uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Name / MCap</th>
                    <th className="pb-3 text-right font-semibold">Last Price</th>
                    <th className="pb-3 text-right font-semibold">Change(%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {getFilteredTradFiAssets().map((stock) => {
                    const isUp = stock.change >= 0;
                    return (
                      <tr
                        key={stock.symbol}
                        onClick={() => setSelectedAsset(stock)}
                        className="group hover:bg-[#1e2026]/50 cursor-pointer transition-all border-b border-slate-900/40"
                      >
                        <td className="py-4 flex items-center space-x-3">
                          <img src={getLogoUrl(stock.label)} alt={stock.label} className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900" />
                          <div>
                            <span className="text-sm font-black text-white tracking-tight font-mono">{stock.symbol}</span>
                            <span className="text-[11px] text-slate-500 font-medium block">{stock.label} | {stock.extra}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="text-sm font-black text-white font-mono">${stock.price.toFixed(3)}</div>
                          <div className="text-[10px] text-slate-500 font-mono">${stock.price.toFixed(2)}</div>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-black font-mono transition-all duration-300 ${
                            isUp 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20'
                          }`}>
                            {isUp ? '+' : ''}{stock.change.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 3: ALPHA WEB3 LIST COMPONENT */}
        {activeHeaderTab === 'Alpha' && (
          <motion.div
            key="alpha-tab-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-[#121212] rounded-3xl border border-slate-800 p-5 md:p-6 shadow-2xl space-y-5 text-left"
          >
            {/* Warning Indicator */}
            <div className="bg-amber-500/5 rounded-2xl border border-amber-500/10 p-4 flex items-start space-x-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-normal">
                <b>On-Chain Web3 Tokens:</b> These tokens are subject to greater fluctuations and capital liquidity risks. Please exercise absolute risk management.
              </p>
            </div>

            {/* Alpha Search / Filter tags */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search VIP Alpha tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1e2026] text-white text-sm border border-slate-800 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#f0b90b] transition-all"
                />
              </div>

              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-hide">
                {(['All', 'Point+', 'BSC', 'Ethereum', 'Solana'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setAlphaFilter(f)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      alphaFilter === f ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Alpha Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 text-[11px] font-mono uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Name / Vol</th>
                    <th className="pb-3 text-right font-semibold">Last Price</th>
                    <th className="pb-3 text-right font-semibold">24h Chg%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {getFilteredAlphaAssets().map((token) => {
                    const isUp = token.change >= 0;
                    return (
                      <tr
                        key={token.symbol}
                        onClick={() => setSelectedAsset(token)}
                        className="group hover:bg-[#1e2026]/50 cursor-pointer transition-all border-b border-slate-900/40"
                      >
                        <td className="py-4 flex items-center space-x-3">
                          <img src={getLogoUrl(token.label)} alt={token.label} className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900" />
                          <div>
                            <span className="text-sm font-black text-white tracking-tight font-mono">${token.symbol}</span>
                            <span className="text-[11px] text-slate-500 font-medium block">{token.label} | {token.extra}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="text-sm font-black text-white font-mono">{token.price.toFixed(5)}</div>
                          <div className="text-[10px] text-slate-500 font-mono">${token.price.toFixed(5)}</div>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-black font-mono transition-all duration-300 ${
                            isUp 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20'
                          }`}>
                            {isUp ? '+' : ''}{token.change.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 4: GROW SECTION */}
        {activeHeaderTab === 'Grow' && (
          <motion.div
            key="grow-tab-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 text-left"
          >
            {/* ETH APR Banner */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-950 to-indigo-950 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
              <div className="space-y-2 relative z-10">
                <span className="text-[9px] font-extrabold text-[#f0b90b] bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-widest">Stake Node</span>
                <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight font-display">Earn 2.36% APR on ETH</h4>
                <p className="text-xs text-slate-400 max-w-xl">
                  Automated staking protocols with auto-liquid yield distribution. Compound rewards deposited directly into wallet profit vaults.
                </p>
              </div>
              <button
                onClick={() => {
                  const calcEl = document.getElementById('profit-calculator-section');
                  if (calcEl) calcEl.scrollIntoView({ behavior: 'smooth' });
                  setSelectedPlanId(INVESTMENT_PLANS[1]?.id || INVESTMENT_PLANS[0].id);
                }}
                className="bg-indigo-500 hover:bg-indigo-400 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all whitespace-nowrap shadow-lg shadow-indigo-500/20"
              >
                View More
              </button>
            </div>

            {/* Start Earning cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { asset: 'USDC', apr: '6.81% Max APR', desc: 'Secure yield compounding with fiat stablecoins.', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'from-blue-950/20 to-transparent' },
                { asset: 'ETH', apr: '102.53% Max APR', desc: 'Leveraged on-chain validators node staking.', color: 'text-[#f0b90b]', border: 'border-amber-500/20', bg: 'from-amber-950/20 to-transparent' },
                { asset: 'SOL', apr: '41.5% Max APR', desc: 'High concurrency Solana network pools.', color: 'text-purple-400', border: 'border-purple-500/20', bg: 'from-purple-950/20 to-transparent' },
                { asset: 'HANA', apr: '124.8% Max APR', desc: 'High performance Hana Network yield staking.', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'from-emerald-950/20 to-transparent' },
              ].map(item => (
                <div
                  key={item.asset}
                  className={`bg-gradient-to-b ${item.bg} bg-slate-950 border ${item.border} rounded-2xl p-5 flex flex-col justify-between space-y-4`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-sm font-black text-white tracking-tight">{item.asset} Saving</h5>
                      <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono font-bold">Flexible</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">Estimated Return</span>
                      <span className={`text-xl font-black ${item.color}`}>{item.apr}</span>
                    </div>
                    <button
                      onClick={() => {
                        const calcEl = document.getElementById('profit-calculator-section');
                        if (calcEl) calcEl.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white"
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Traders to Copy */}
            <div className="bg-[#121212] rounded-3xl border border-slate-800 p-5 md:p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center">
                  <Award className="w-4 h-4 mr-2 text-yellow-500" />
                  Top Traders to Copy
                </h4>
                <span className="text-xs text-slate-500 font-mono">Spot & Margin Master</span>
              </div>

              <div className="divide-y divide-slate-900">
                {[
                  { name: '带带 (Spot)', roi: '+9.31% 7D ROI', followers: '1,421/1,500', color: 'bg-amber-500', performance: [4, 6, 5, 8, 7, 9, 10, 9.31] },
                  { name: '心指挥头脑 (Spot)', roi: '+3.88% 7D ROI', followers: '840/1,000', color: 'bg-rose-500', performance: [1, 2, 1.8, 3, 2.5, 3.4, 3.88] },
                  { name: 'JaBBBBi (Spot)', roi: '+2.2% 7D ROI', followers: '422/500', color: 'bg-indigo-500', performance: [0.5, 1, 1.2, 1.5, 1.8, 2, 2.2] }
                ].map(trader => (
                  <div key={trader.name} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${trader.color} rounded-full flex items-center justify-center font-bold text-slate-950 font-display uppercase shadow-lg`}>
                        {trader.name.slice(0, 2)}
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-white tracking-tight">{trader.name}</h5>
                        <p className="text-xs text-slate-500">Active copying slots: {trader.followers}</p>
                      </div>
                    </div>

                    {/* Chart Plotting for ROI */}
                    <div className="hidden md:block h-10 w-28">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                        <path
                          d={`M ${trader.performance.map((val, idx) => `${(idx / (trader.performance.length - 1)) * 100} ${40 - (val / 10) * 35}`).join(' L ')}`}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-left md:text-right">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">7D Yield ROI</span>
                        <span className="text-sm font-black text-emerald-400 font-mono">{trader.roi}</span>
                      </div>
                      <button
                        onClick={() => setSelectedTrader(trader)}
                        className="bg-[#f0b90b] hover:bg-yellow-500 text-slate-950 font-black px-4 py-2.5 rounded-lg text-[10px] uppercase tracking-wider transition-all shadow-md whitespace-nowrap"
                      >
                        Copy Portfolio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: SQUARE SOCIAL CHAT */}
        {activeHeaderTab === 'Square' && (
          <motion.div
            key="square-tab-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 text-left"
          >
            {/* Publisher Form */}
            <form onSubmit={handlePostSquare} className="bg-[#121212] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center font-bold text-slate-950 font-display">
                  {currentUser?.username?.slice(0, 2).toUpperCase() || 'TR'}
                </div>
                <textarea
                  value={squareInput}
                  onChange={(e) => setSquareInput(e.target.value)}
                  placeholder="Share your trade predictions, entry logs or market alpha..."
                  className="flex-1 bg-[#1e2026] text-white text-sm border border-slate-800 rounded-xl p-3 h-20 outline-none focus:border-[#f0b90b] resize-none transition-all"
                />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                <span className="text-xs text-slate-500 font-mono">Posting as {currentUser?.username || 'Guest'}</span>
                <button
                  type="submit"
                  className="bg-[#f0b90b] hover:bg-yellow-500 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Post Insight
                </button>
              </div>
            </form>

            {/* Social Posts lists */}
            <div className="space-y-4">
              {squarePosts.map(post => (
                <div key={post.id} className="bg-[#121212] border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 ${post.avatarColor} rounded-xl flex items-center justify-center font-bold text-white text-xs uppercase`}>
                        {post.author.slice(1, 3)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-white">{post.author}</span>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">{post.role}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{post.time}</span>
                      </div>
                    </div>
                    <MoreVertical className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{post.content}</p>

                  <div className="flex items-center space-x-6 pt-3 border-t border-slate-900 text-slate-500 text-xs">
                    <button 
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center space-x-2 transition-all hover:text-amber-400 ${post.liked ? 'text-amber-400 font-bold' : ''}`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${post.liked ? 'fill-amber-500' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <div className="flex items-center space-x-2 cursor-pointer hover:text-white">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments} Comments</span>
                    </div>
                    <div className="flex items-center space-x-2 cursor-pointer hover:text-white ml-auto">
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Share</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 6: DATA REPORTING SECTION */}
        {activeHeaderTab === 'Data' && (
          <motion.div
            key="data-tab-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 text-left"
          >
            {/* Upper Grid row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* BTC Sentiment Bar */}
              <div className="bg-[#121212] border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h5 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-black">BTC Sentiment Index</h5>
                  <span className="text-[10px] text-emerald-400 font-mono">+1.30% ($65,465.50)</span>
                </div>
                
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                  {/* Big speedometer mockup */}
                  <div className="relative w-40 h-20 overflow-hidden flex items-end justify-center">
                    <div className="absolute inset-0 border-8 border-slate-800 rounded-full border-b-transparent"></div>
                    {/* Golden segment */}
                    <div className="absolute inset-0 border-8 border-amber-500 rounded-full border-b-transparent rotate-[45deg] transition-all"></div>
                    <div className="text-center relative z-10">
                      <span className="text-3xl font-black text-white font-mono">7.67</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Strong Positive Sentiment</span>
                  <p className="text-[10px] text-slate-500 text-center max-w-xs font-mono">Cumulative indices extracted from 1,420 automated spot tracking tickers in real-time.</p>
                </div>
              </div>

              {/* Price Change Distribution */}
              <div className="bg-[#121212] border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
                    <h5 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-black">Price Change Distribution</h5>
                    <span className="text-xs text-slate-500 font-mono">Total Traded: 994</span>
                  </div>
                  <p className="text-xs text-slate-400">Total coin assets distributed across positive vs negative yield trends over past 24 hours.</p>
                </div>

                <div className="space-y-3 py-4">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">Up: 627 (63%)</span>
                    <span className="text-rose-400 font-bold">Down: 367 (37%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex border border-slate-900">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: '63%' }}></div>
                    <div className="bg-rose-500 h-full transition-all" style={{ width: '37%' }}></div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono border-t border-slate-900 pt-3">
                  Institutional accumulation ratio high. Bullish outlook maintained.
                </div>
              </div>

            </div>

            {/* Colored Grid Heatmap Tiles */}
            <div className="bg-[#121212] border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
              <h5 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-black border-b border-slate-900 pb-3">Market Volatility Heatmap</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-left">
                {[
                  { symbol: 'BTCUSDT', price: '65,437.10', change: '+1.46%', isUp: true, size: 'col-span-2 row-span-2 h-28 bg-emerald-950/40 border-emerald-500/30' },
                  { symbol: 'ETHUSDT', price: '1,899.02', change: '+1.59%', isUp: true, size: 'h-28 bg-emerald-950/30 border-emerald-500/20' },
                  { symbol: 'BTCUSDC', price: '65,441.20', change: '+1.47%', isUp: true, size: 'h-28 bg-emerald-950/30 border-emerald-500/20' },
                  { symbol: 'SNDK', price: '1,428.06', change: '+5.19%', isUp: true, size: 'h-24 bg-emerald-950/20 border-emerald-500/20' },
                  { symbol: 'AAPL', price: '325.41', change: '-2.43%', isUp: false, size: 'h-24 bg-rose-950/30 border-rose-500/20' },
                  { symbol: 'NVDA', price: '205.79', change: '+1.51%', isUp: true, size: 'h-24 bg-emerald-950/20 border-emerald-500/10' },
                  { symbol: 'META', price: '647.14', change: '+0.33%', isUp: true, size: 'h-24 bg-emerald-950/10 border-emerald-500/5' }
                ].map((tile, idx) => (
                  <div
                    key={idx}
                    className={`${tile.size} rounded-xl border p-4 flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer`}
                  >
                    <div>
                      <span className="text-xs font-black text-white">{tile.symbol}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{tile.price}</p>
                    </div>
                    <span className={`text-xs font-black ${tile.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>{tile.change}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Money Flow segment distribution */}
            <div className="bg-[#121212] border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
              <h5 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-black border-b border-slate-900 pb-3">Money Flow Over Past 15m</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative w-44 h-44 mx-auto">
                  {/* Decorative pie donut via conic-gradient */}
                  <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(#10b981 0% 46%, #ef4444 46% 73%, #f59e0b 73% 87%, #3b82f6 87% 100%)' }}></div>
                  <div className="absolute inset-6 bg-[#121212] rounded-full flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-slate-500 font-mono block">Volume Flow</span>
                    <span className="text-lg font-black text-white font-mono">₹4.11B</span>
                  </div>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-emerald-500 rounded"></span>
                      <span className="text-slate-400">Large Buyer Inflow</span>
                    </div>
                    <span className="text-white font-bold">46.12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-rose-500 rounded"></span>
                      <span className="text-slate-400">Large Seller Outflow</span>
                    </div>
                    <span className="text-white font-bold">27.06%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-amber-500 rounded"></span>
                      <span className="text-slate-400">Medium Net Outflow</span>
                    </div>
                    <span className="text-white font-bold">13.89%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-blue-500 rounded"></span>
                      <span className="text-slate-400">Retail Balance Flow</span>
                    </div>
                    <span className="text-white font-bold">12.93%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

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
              className="bg-[#f0b90b] hover:bg-yellow-500 text-slate-950 font-black px-8 py-3 rounded-2xl text-[10px] tracking-[0.2em] uppercase transition-all shadow-xl shadow-[#f0b90b]/20"
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
              onClick={() => {
                setActiveHeaderTab('Crypto');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-[#f0b90b] hover:bg-yellow-500 text-[#0a0f1d] font-black px-10 py-4 rounded-2xl text-[10px] tracking-[0.2em] uppercase transition-all shadow-2xl shadow-[#f0b90b]/30"
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
      <section 
        className={`bg-gradient-to-b from-[#0e172a] to-[#090e1a] rounded-3xl p-6 md:p-8 border shadow-xl transition-all duration-500 ${
          activeHeaderTab === 'Grow' 
            ? 'border-[#f0b90b] shadow-[#f0b90b]/10 ring-1 ring-[#f0b90b]/20 scale-[1.01]' 
            : 'border-slate-800'
        }`} 
        id="profit-calculator-section"
      >
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
                          ? 'bg-[#f0b90b] text-[#070b15] border-[#f0b90b] shadow-lg'
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
            <div className="bg-[#040813] border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full space-y-6 text-left">
              {/* Premium Glow line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500"></div>

              {/* Header Details */}
              <div className="flex justify-between items-start text-left">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">PROJECTED RETURN</h4>
                  <p className="text-[10px] text-slate-400">{selectedDuration} Days investment simulation</p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                  +{principal > 0 ? ((netProfit / principal) * 100).toFixed(0) : '0'}% ROI
                </div>
              </div>

              {/* Math Display */}
              <div className="space-y-3.5 text-left">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Principal</span>
                  <span className="text-lg font-bold text-slate-300 font-mono">{formatIndianCurrency(principal)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Net Profit</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">+{formatIndianCurrency(netProfit)}</span>
                </div>
                <div className="pt-2.5 border-t border-slate-800">
                  <span className="text-[9px] text-emerald-500 uppercase block font-bold">Total Payout</span>
                  <span className="text-2xl font-extrabold text-white tracking-tight font-mono">
                    {formatIndianCurrency(totalReturn)}
                  </span>
                </div>
              </div>

              {onInvestSelect && (
                <button
                  onClick={() => onInvestSelect(selectedPlan)}
                  className="w-full bg-[#f0b90b] hover:bg-yellow-500 text-[#070b15] font-black text-xs uppercase tracking-widest py-3 rounded-lg transition-all"
                >
                  Invest Now
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MODAL 1: HIGH FIDELITY BINANCE-STYLE TRADING SHEET */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 text-left overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#121212] w-full max-w-4xl sm:rounded-3xl border border-slate-800 overflow-hidden flex flex-col md:flex-row h-full md:h-[90vh] shadow-2xl relative"
            >
              
              {/* Back button and detail content */}
              <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-5 border-b md:border-b-0 md:border-r border-slate-800">
                {/* Modal Header */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setSelectedAsset(null)}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <h4 className="text-base font-black text-white font-mono tracking-tight">{activeAsset.symbol}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{activeAsset.label} Spot Rate</span>
                  </div>
                  <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-yellow-500 transition-all">
                    <Star className="w-5 h-5 fill-yellow-500" />
                  </button>
                </div>

                {/* Big Price Ticker Block */}
                <div className="flex justify-between items-end bg-[#181a20] p-4 rounded-2xl border border-slate-800/80">
                  <div>
                    <span className={`text-3xl md:text-4xl font-mono font-black ${activeAsset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCryptoPrice(activeAsset.price)}
                    </span>
                    <span className={`text-xs font-mono font-bold ml-2 ${activeAsset.change >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'} px-2 py-0.5 rounded`}>
                      {activeAsset.change >= 0 ? '+' : ''}{activeAsset.change.toFixed(2)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] text-slate-500 text-right">
                    <span>24h High</span>
                    <span className="text-slate-300">{formatCryptoPrice(activeAsset.price * 1.025)}</span>
                    <span>24h Low</span>
                    <span className="text-slate-300">{formatCryptoPrice(activeAsset.price * 0.981)}</span>
                    <span>24h Vol</span>
                    <span className="text-slate-300">{activeAsset.extra}</span>
                  </div>
                </div>

                {/* Chart Options Header */}
                <div className="flex justify-between items-center border-b border-slate-900 pb-2 overflow-x-auto">
                  <div className="flex space-x-3 text-xs font-bold text-slate-500">
                    {(['Time', '15m', '1h', '4h', '1D', 'More'] as const).map(tf => (
                      <button
                        key={tf}
                        onClick={() => setChartTimeframe(tf)}
                        className={`pb-2 px-1 transition-all ${chartTimeframe === tf ? 'text-[#f0b90b] border-b-2 border-[#f0b90b]' : 'hover:text-white'}`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                  <div className="flex space-x-1.5 text-[10px] font-mono text-slate-500">
                    {(['MA', 'EMA', 'BOLL', 'VOL', 'RSI'] as const).map(ind => (
                      <button
                        key={ind}
                        onClick={() => setIndicatorMode(ind as any)}
                        className={`px-1.5 py-0.5 rounded border transition-all ${indicatorMode === ind ? 'bg-slate-800 text-amber-400 border-slate-700' : 'border-transparent hover:text-white'}`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Multi-layer Golden Chart rendering */}
                <div className="relative h-48 md:h-60 bg-[#0d0e12] rounded-2xl border border-slate-900/80 p-3 overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-600 uppercase">
                    MA(5): {formatCryptoPrice(activeAsset.price * 1.002)} | MA(10): {formatCryptoPrice(activeAsset.price * 0.997)} | MA(60): {formatCryptoPrice(activeAsset.price * 1.005)}
                  </div>

                  {/* Golden area chart SVG */}
                  <div className="w-full h-2/3 mt-4 relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="modalGoldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f0b90b" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#f0b90b" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Grid guidelines */}
                      <line x1="0" y1="20" x2="400" y2="20" stroke="#1c1c1e" strokeWidth="1" />
                      <line x1="0" y1="60" x2="400" y2="60" stroke="#1c1c1e" strokeWidth="1" />
                      <line x1="0" y1="100" x2="400" y2="100" stroke="#1c1c1e" strokeWidth="1" />

                      {/* Smooth gold area and line path */}
                      <path d="M 0 80 Q 80 40 160 90 T 320 20 T 400 50 L 400 120 L 0 120 Z" fill="url(#modalGoldGrad)" />
                      <path d="M 0 80 Q 80 40 160 90 T 320 20 T 400 50" fill="none" stroke="#f0b90b" strokeWidth="2.5" />
                      
                      {/* Moving average pink/blue line indicators */}
                      <path d="M 0 90 C 80 60, 160 85, 240 40, 320 50, 400 30" fill="none" stroke="#ec4899" strokeWidth="1" strokeDasharray="2" />
                      <path d="M 0 70 C 100 45, 200 95, 300 30, 400 40" fill="none" stroke="#3b82f6" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* Volume Candle Bar at the bottom */}
                  <div className="w-full h-1/4 flex items-end space-x-1.5 pb-1">
                    {[12, 18, 15, 8, 22, 14, 30, 25, 45, 10, 15, 35, 12, 28, 20].map((v, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm ${i % 3 === 0 ? 'bg-rose-500/40' : 'bg-emerald-500/40'}`}
                        style={{ height: `${v}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Buy / Sell pressure bar */}
                <div className="space-y-1 bg-slate-950 p-3.5 rounded-xl border border-slate-900 text-xs font-mono">
                  <div className="flex justify-between font-bold">
                    <span className="text-emerald-400">Buy Ratio: 76.74%</span>
                    <span className="text-rose-400">Sell Ratio: 23.26%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex border border-slate-900">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: '76.74%' }}></div>
                    <div className="bg-rose-500 h-full transition-all" style={{ width: '23.26%' }}></div>
                  </div>
                </div>

                {/* Sub info tabs Order Book mockup */}
                <div className="space-y-3 bg-[#181a20] p-4 rounded-xl border border-slate-800 text-xs font-mono">
                  <div className="flex justify-between text-slate-500 font-bold border-b border-slate-900 pb-2">
                    <span>Bid Size (USDT)</span>
                    <span className="text-center">Bid / Ask (Price)</span>
                    <span className="text-right">Ask Size (USDT)</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-emerald-400/80">0.0520</span>
                      <span className="text-emerald-400 font-bold">{formatCryptoPrice(activeAsset.price * 1.0001)}</span>
                      <span className="text-slate-500">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-400/60">0.1412</span>
                      <span className="text-emerald-400 font-bold">{formatCryptoPrice(activeAsset.price * 0.9998)}</span>
                      <span className="text-slate-500">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">-</span>
                      <span className="text-rose-400 font-bold">{formatCryptoPrice(activeAsset.price * 1.0005)}</span>
                      <span className="text-rose-400/80">0.0891</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">-</span>
                      <span className="text-rose-400 font-bold">{formatCryptoPrice(activeAsset.price * 1.0012)}</span>
                      <span className="text-rose-400/60">1.4121</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Order Placement Controller Form (Right Side panel) */}
              <div className="w-full md:w-80 bg-[#181a20] p-5 md:p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 font-mono flex items-center justify-between">
                    <span>Position Allocator</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold font-mono">SECURE</span>
                  </h4>

                  {/* Buy / Sell main trigger toggle */}
                  <div className="grid grid-cols-2 bg-[#0d0e12] p-1 rounded-xl border border-slate-900 mb-4">
                    <button
                      type="button"
                      onClick={() => setTradeType('BUY')}
                      className={`py-2.5 text-xs font-black rounded-lg transition-all ${
                        tradeType === 'BUY' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeType('SELL')}
                      className={`py-2.5 text-xs font-black rounded-lg transition-all ${
                        tradeType === 'SELL' ? 'bg-rose-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      SELL
                    </button>
                  </div>

                  {/* Position configuration forms */}
                  <form onSubmit={handleTradeSubmit} className="space-y-4">
                    {/* Order Type */}
                    <div className="text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Order Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['LIMIT', 'MARKET'] as const).map(ot => (
                          <button
                            key={ot}
                            type="button"
                            onClick={() => setOrderType(ot)}
                            className={`py-2 text-[10px] font-bold rounded border transition-all ${
                              orderType === ot 
                                ? 'bg-slate-800 text-white border-slate-700' 
                                : 'bg-[#0d0e12] text-slate-400 border-transparent hover:border-slate-800'
                            }`}
                          >
                            {ot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Limit Price Input if LIMIT selected */}
                    {orderType === 'LIMIT' && (
                      <div className="text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Limit Price</label>
                        <input
                          type="text"
                          value={limitPrice}
                          onChange={(e) => setLimitPrice(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-slate-800 rounded-lg py-2.5 px-3 text-xs text-white font-mono outline-none focus:border-[#f0b90b]"
                        />
                      </div>
                    )}

                    {/* Capital Amount size */}
                    <div className="text-left">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Allocation Size</label>
                        <span className="text-[10px] text-slate-500 font-mono">INR Format</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={tradeAmountInput}
                          onChange={(e) => setTradeAmountInput(e.target.value)}
                          className="w-full bg-[#0d0e12] border border-slate-800 rounded-lg py-2.5 px-3 text-xs text-white font-mono outline-none focus:border-[#f0b90b]"
                        />
                        <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-500">₹</span>
                      </div>

                      {/* Prefill percentage options */}
                      <div className="grid grid-cols-4 gap-1.5 mt-2 font-mono">
                        {['25%', '50%', '75%', '100%'].map(percent => (
                          <button
                            key={percent}
                            type="button"
                            onClick={() => {
                              const avail = (currentUser?.depositWallet || 0) + (currentUser?.profitWallet || 0);
                              const factor = parseInt(percent) / 100;
                              setTradeAmountInput(Math.round(avail * factor || 5000).toString());
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-[9px] text-slate-400 border border-slate-800 py-1 rounded"
                          >
                            {percent}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Trade maturity countdown window choice */}
                    <div className="text-left">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cycle Window Duration</label>
                        <span className="text-[9px] text-amber-500 font-mono font-bold animate-pulse">High Multiplier</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 font-mono">
                        {[
                          { label: '60s', rate: '+85%' },
                          { label: '3m', rate: '+105%' },
                          { label: '5m', rate: '+128%' },
                          { label: '15m', rate: '+195%' },
                          { label: '1h', rate: '+350%' },
                          { label: '1D', rate: '+1450%' }
                        ].map(dur => (
                          <button
                            key={dur.label}
                            type="button"
                            onClick={() => setTargetDuration(dur.label)}
                            className={`py-1.5 rounded flex flex-col items-center justify-center border transition-all ${
                              targetDuration === dur.label
                                ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span className="text-[9px] font-black">{dur.label}</span>
                            <span className="text-[8px] text-slate-500">{dur.rate}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Capital Wallet Summary */}
                    <div className="bg-[#0d0e12] p-3 rounded-xl border border-slate-900 space-y-1.5 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Capital reserves</span>
                        <span className="text-white font-mono font-bold">
                          ₹{((currentUser?.depositWallet || 0) + (currentUser?.profitWallet || 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-1.5">
                        <span>Deduction vault</span>
                        <span>Deposit / Yield Wallet</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                        tradeType === 'BUY'
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-[#0d0e12] shadow-emerald-500/15'
                          : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/15'
                      }`}
                    >
                      {tradeType === 'BUY' ? 'LAUNCH BUY CONTRACT' : 'LAUNCH SELL CONTRACT'}
                    </button>
                  </form>
                </div>

                {/* Secure FMoF Audit handshake logo */}
                <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Verified MoF Audit Security</span>
                </div>

              </div>
              
              <div className="w-80 p-5 md:p-6 overflow-y-auto hidden md:block">
                <OrderBook symbol={activeAsset.symbol} />
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: COPY TRADER DIALOG CONTAINER */}
      <AnimatePresence>
        {selectedTrader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 text-left"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#121212] w-full max-w-md rounded-2xl border border-slate-800 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h4 className="text-base font-black text-white uppercase tracking-tight">Copy Portfolio Setup</h4>
                <button
                  onClick={() => setSelectedTrader(null)}
                  className="p-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-3 bg-[#181a20] p-3 rounded-xl border border-slate-800">
                <div className={`w-10 h-10 ${selectedTrader.color} rounded-full flex items-center justify-center font-bold text-slate-950 uppercase`}>
                  {selectedTrader.name.slice(0, 2)}
                </div>
                <div>
                  <h5 className="text-sm font-black text-white">{selectedTrader.name}</h5>
                  <span className="text-xs text-[#f0b90b] font-mono font-bold">{selectedTrader.roi} Target</span>
                </div>
              </div>

              <form onSubmit={handleCopyTraderAction} className="space-y-4">
                <div className="text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Copy Allocation Capital</label>
                  <input
                    type="number"
                    value={copyAmount}
                    onChange={(e) => setCopyAmount(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-slate-800 rounded-lg py-2.5 px-3 text-xs text-white font-mono outline-none focus:border-[#f0b90b]"
                  />
                  <p className="text-[9px] text-slate-500 mt-1 font-mono">Minimum size ₹5,000 for perfect portfolio synchronization.</p>
                </div>

                <div className="text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Replication Block Window</label>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    {['7 Days', '15 Days', '30 Days'].map(dur => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setCopyDuration(dur)}
                        className={`py-2 rounded border transition-all ${
                          copyDuration === dur
                            ? 'bg-[#f0b90b] text-[#070b15] border-[#f0b90b]'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#f0b90b] hover:bg-yellow-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#f0b90b]/15"
                >
                  START REPLICATING POSITION
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
