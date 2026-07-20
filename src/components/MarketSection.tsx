import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  MessageSquare, 
  Repeat, 
  ThumbsUp, 
  BarChart2, 
  Share2, 
  Search, 
  ShoppingBag, 
  DollarSign, 
  AlertCircle, 
  Layers, 
  Briefcase,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, SystemSettings } from '../types';
import { formatIndianCurrency } from '../data';
import { toast } from 'sonner';

interface MarketSectionProps {
  currentUser: User | null;
  onUpdateWallet: (depositChange: number, profitChange: number) => void;
  addLog: (action: string, username: string) => void;
  systemSettings: SystemSettings;
}

// 12 High Fidelity Mock Posts mimicking the user's uploaded screenshots
interface SocialPost {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string; // Tailwind bg color class
    avatarChar: string;
    verified: boolean;
  };
  time: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  content: string;
  badges: Array<{ label: string; change: number }>;
  metrics: {
    comments: number;
    reposts: number;
    likes: number;
    views: string;
  };
  chartType: 'spacex' | 'pnl_cards' | 'bank_chart' | 'staking' | 'eth_pos' | 'live_stream' | 'trump' | 'useless' | 'long_short';
  chartTitle: string;
  chartDetails: any;
}

const FEED_POSTS: SocialPost[] = [
  {
    id: 'post-new-1',
    author: {
      name: 'Bit Gurly',
      username: 'bit_gurly',
      avatar: 'bg-gradient-to-tr from-purple-600 to-indigo-600',
      avatarChar: 'B',
      verified: true
    },
    time: '1h',
    sentiment: 'Bullish',
    content: '$BTC After each waterfall-like drop, usually it doesn\'t immediately continue with a one-way selloff. Instead, it first enters a period of bottom consolidation ...',
    badges: [{ label: 'BTC', change: 1.13 }],
    metrics: { comments: 3, reposts: 3, likes: 3, views: '4K' },
    chartType: 'spacex',
    chartTitle: 'BTC Market Analysis',
    chartDetails: {
      price: 'Analysis',
      change: '+1.13%',
      timeframe: 'Recent',
      points: [60000, 62000, 61000, 63000, 64000, 65000]
    }
  },
  {
    id: 'post-new-2',
    author: {
      name: 'Black Nova',
      username: 'black_nova',
      avatar: 'bg-gradient-to-tr from-slate-700 to-slate-900',
      avatarChar: 'B',
      verified: true
    },
    time: '13h',
    sentiment: 'Bullish',
    content: '$SIREN Is Ready to Break Out! 🚀 Momentum is quietly building, and the chart is starting to look very interesting. 👀 I\'m holding $SIREN with strong conviction and staying focused on the bigger picture....',
    badges: [{ label: 'SIREN', change: 0 }],
    metrics: { comments: 0, reposts: 0, likes: 0, views: '0' },
    chartType: 'bank_chart',
    chartTitle: '$SIREN Breakout Potential',
    chartDetails: {
      price: '0.03184',
      change: '+9.49%',
      subLabel: 'Momentum Check',
      vol24h: '16.87M',
      points: [0.026, 0.028, 0.030, 0.031, 0.03184]
    }
  },
  {
    id: 'post-new-3',
    author: {
      name: 'Leo524',
      username: 'leo524',
      avatar: 'bg-gradient-to-tr from-sky-600 to-blue-500',
      avatarChar: 'L',
      verified: true
    },
    time: '13h',
    sentiment: 'Bullish',
    content: '$UNI USDT Update (12H) Everyone is looking at the recent pullback, but for me, the bigger picture hasn\'t changed yet. Price is still trading above the main ascending...',
    badges: [{ label: 'UNI', change: 3.70 }],
    metrics: { comments: 2, reposts: 31, likes: 0, views: '17.3K' },
    chartType: 'eth_pos',
    chartTitle: '$UNI USDT Update',
    chartDetails: {
      asset: 'UNI/USDT',
      leverage: '12H',
      direction: 'Analysis',
      pnl: '+3.70%',
      pnlPercent: '+3.70%'
    }
  },
  {
    id: 'post-new-4',
    author: {
      name: 'AI Researcher',
      username: 'ai_researcher',
      avatar: 'bg-gradient-to-tr from-rose-500 to-red-600',
      avatarChar: 'A',
      verified: true
    },
    time: '8h',
    sentiment: 'Bearish',
    content: 'Two hours ago, I told you to short $BANK and gave an SL at $0.28, which got hit 😭 But you already know I usually don\'t use stop losses on trades like this. I only gave that SL for you guys to manage your risk....',
    badges: [{ label: 'BANK', change: -1.27 }],
    metrics: { comments: 0, reposts: 0, likes: 0, views: '0' },
    chartType: 'bank_chart',
    chartTitle: 'BANKUSDT Short Analysis',
    chartDetails: {
      price: '0.2882',
      change: '-1.27%',
      subLabel: 'DeFi Gainer | Binance Square Pro',
      vol24h: '652.05M',
      points: [0.320, 0.310, 0.300, 0.2882]
    }
  },
  {
    id: 'post-1',
    author: {
      name: 'Bit Gurly 📈',
      username: 'bit_gurly',
      avatar: 'bg-gradient-to-tr from-purple-600 to-indigo-600',
      avatarChar: 'B',
      verified: true
    },
    time: '21h',
    sentiment: 'Bearish',
    content: '🚨 $SPCX IS NOW TRADING BELOW ITS IPO PRICE.\n\nJust a month ago, the market was chasing the rally. Now the stock is trading $11 below its IPO price. High volatility expected.',
    badges: [
      { label: 'BZ', change: -2.54 },
      { label: 'SPCX', change: -1.91 }
    ],
    metrics: {
      comments: 3,
      reposts: 7,
      likes: 21,
      views: '24.5K'
    },
    chartType: 'spacex',
    chartTitle: 'Space Exploration Technologies Corp (SpaceX)',
    chartDetails: {
      price: '123.99 USD',
      change: '-7.12 (-5.43%)',
      timeframe: 'At close on Jul 18, 07:59 GMT+8',
      points: [180, 165, 172, 155, 148, 138, 123.99]
    }
  },
  {
    id: 'post-2',
    author: {
      name: 'Mastering Crypto 👑',
      username: 'mastering_crypto',
      avatar: 'bg-gradient-to-tr from-amber-500 to-yellow-600',
      avatarChar: 'M',
      verified: true
    },
    time: 'Jul 19',
    sentiment: 'Bearish',
    content: '💥 Elon Musk Strict Warning to SpaceX ($SPCX) Short Sellers\n\n"The survival probability of firms who maintain a significant short position in SpaceX ($SPCXB) over time is very low." Keep an eye on institutional trends!',
    badges: [
      { label: 'SPCX', change: -1.82 },
      { label: 'SPCXB', change: -1.68 }
    ],
    metrics: {
      comments: 21,
      reposts: 3,
      likes: 118,
      views: '167.9K'
    },
    chartType: 'trump',
    chartTitle: 'SpaceX Market Squeeze & Institutional Warning',
    chartDetails: {
      topic: 'Elon Musk Warning',
      quote: 'The survival probability of firms who maintain a significant short position in SpaceX ($SPCXB) over time is very low.',
      context: 'SpaceX Short Sellers Warning on Public Square'
    }
  },
  {
    id: 'post-3',
    author: {
      name: 'Hamayoon_1 🚀',
      username: 'hamayoon_1',
      avatar: 'bg-gradient-to-tr from-emerald-600 to-teal-500',
      avatarChar: 'H',
      verified: false
    },
    time: '2h',
    sentiment: 'Bullish',
    content: 'I’m waiting for bigger profits. 🚀📈 Riding the wave on multiple perpetual futures indices. High leverage compliance active.',
    badges: [
      { label: 'EVAA', change: 21.57 },
      { label: 'SOXL', change: 9.58 },
      { label: 'CAP', change: 5.98 }
    ],
    metrics: {
      comments: 0,
      reposts: 1,
      likes: 4,
      views: '1.7K'
    },
    chartType: 'pnl_cards',
    chartTitle: 'Binance Perpetual High-Yield PnL Positions',
    chartDetails: [
      { pair: 'CAPUSDT Perpetual', type: 'Long 10x', pnl: '+107.14%', entry: '0.0181300', last: '0.0203100' },
      { pair: 'SOXLUSDT Perpetual', type: 'Long 20x', pnl: '+60.61%', entry: '139.19000', last: '143.54000' },
      { pair: 'EVAUSDT Perpetual', type: 'Long 10x', pnl: '+27.02%', entry: '0.983599', last: '1.010900' }
    ]
  },
  {
    id: 'post-4',
    author: {
      name: 'Crypto PM 📈',
      username: 'crypto_pm',
      avatar: 'bg-gradient-to-tr from-slate-700 to-slate-900',
      avatarChar: 'C',
      verified: true
    },
    time: '22h',
    sentiment: 'Bearish',
    content: 'When $DEXE pumped, I thought it could be the next $LAB, but seems like this $BANK looks like the next LAB.\n\nWhy Not Dexe..? Because it\'s an old project and supply is not concentrated as Bank supply...',
    badges: [
      { label: 'DEXE', change: 1.44 },
      { label: 'BANK', change: 53.50 },
      { label: 'LAB', change: -13.06 }
    ],
    metrics: {
      comments: 9,
      reposts: 12,
      likes: 38,
      views: '60.1K'
    },
    chartType: 'bank_chart',
    chartTitle: 'BANK/USDT Lorenzo Protocol DeFi Gainer',
    chartDetails: {
      price: '0.1917',
      change: '+164.05%',
      subLabel: 'DeFi Gainer | Binance Square Pro',
      vol24h: '555.10M BANK',
      points: [0.04, 0.05, 0.06, 0.05, 0.04, 0.12, 0.1917]
    }
  },
  {
    id: 'post-5',
    author: {
      name: 'crypto analyst king Ansar Alizai 👑',
      username: 'ansar_alizai',
      avatar: 'bg-gradient-to-tr from-blue-600 to-cyan-500',
      avatarChar: 'A',
      verified: true
    },
    time: '22h',
    sentiment: 'Bullish',
    content: '$LUNC - More than 900 Billion coins are currently staked.\n\nThis massive amount shows the tremendous interest for investment of peoples in $LUNC. Lets see how much time it will take to reach major break-out...',
    badges: [
      { label: 'LUNC', change: -1.57 }
    ],
    metrics: {
      comments: 6,
      reposts: 10,
      likes: 64,
      views: '51.4K'
    },
    chartType: 'staking',
    chartTitle: 'LUNA Classic Staking Compliance Metrics',
    chartDetails: {
      staked: '904,223,254,380 LUNC',
      percent: '14.01%',
      label: 'Percent of LUNC Staked'
    }
  },
  {
    id: 'post-6',
    author: {
      name: '穿越牛熊 财源广进 🐂',
      username: 'bull_bear_wealth',
      avatar: 'bg-gradient-to-tr from-red-600 to-orange-500',
      avatarChar: '川',
      verified: false
    },
    time: 'Jul 19',
    sentiment: 'Bullish',
    content: "I'll close the position at 5000 once it hits $ETH . I'm not greedy. Let's make this weekend profitable!",
    badges: [
      { label: 'ETH', change: 0.43 }
    ],
    metrics: {
      comments: 84,
      reposts: 24,
      likes: 50,
      views: '53.5K'
    },
    chartType: 'eth_pos',
    chartTitle: 'ETHUSDT Leverage Margin Trade',
    chartDetails: {
      asset: 'ETH/USDT Perpetual',
      leverage: '100X',
      direction: 'Opening Long',
      pnl: '-9,981.52 USDT',
      pnlPercent: '-14.35%'
    }
  },
  {
    id: 'post-7',
    author: {
      name: 'Next Millionaire 76 💰',
      username: 'next_mill_76',
      avatar: 'bg-gradient-to-tr from-emerald-500 to-green-600',
      avatarChar: 'N',
      verified: false
    },
    time: '1h',
    sentiment: 'Bearish',
    content: '$BANK Fraud Coin ... You took short ...it will Go Long. You Took Long ..It will Go Down 👎 Play safely guys, don\'t fall for local hypes.',
    badges: [
      { label: 'BANK', change: 53.47 }
    ],
    metrics: {
      comments: 1,
      reposts: 0,
      likes: 2,
      views: '449'
    },
    chartType: 'eth_pos',
    chartTitle: 'BANKUSDT Arbitrage Position',
    chartDetails: {
      asset: 'BANK/USDT Perpetual',
      leverage: '50X',
      direction: 'Opening Short',
      pnl: '-222.86 USDT',
      pnlPercent: '-4.12%'
    }
  },
  {
    id: 'post-8',
    author: {
      name: 'Ghost Crypto official 👻',
      username: 'ghost_crypto',
      avatar: 'bg-gradient-to-tr from-slate-800 to-zinc-900',
      avatarChar: 'G',
      verified: false
    },
    time: 'Jul 19',
    sentiment: 'Neutral',
    content: '🇺🇸 LUMMIS: IF THIS FAILS, CRYPTO WAITS UNTIL 2030\n\nThe CLARITY Act is days away from a critical Senate vote. High ranking regulators are demanding full asset disclosures.',
    badges: [
      { label: 'XLM', change: -1.16 },
      { label: 'XRP', change: 0.61 }
    ],
    metrics: {
      comments: 5,
      reposts: 2,
      likes: 12,
      views: '3.2K'
    },
    chartType: 'trump',
    chartTitle: 'U.S. Digital Assets Clarity Act Legislative Docket',
    chartDetails: {
      topic: 'The CLARITY Act',
      quote: 'If this fails, crypto markets wait until 2030 for clean institutional banking guidelines.',
      context: 'United States H.R. Bill for digital assets regulation framework.'
    }
  },
  {
    id: 'post-9',
    author: {
      name: 'Junhao (俊昊) 📈',
      username: 'junhao_trade',
      avatar: 'bg-gradient-to-tr from-sky-600 to-indigo-700',
      avatarChar: '俊',
      verified: false
    },
    time: '11h',
    sentiment: 'Bullish',
    content: "Top traders by profit in 30D. $LAB I'm backing down 😭 Holding on tight is becoming hard.",
    badges: [
      { label: 'LAB', change: -13.07 }
    ],
    metrics: {
      comments: 12,
      reposts: 8,
      likes: 8,
      views: '7.5K'
    },
    chartType: 'eth_pos',
    chartTitle: 'LABUSDT High Leverage Drawdown',
    chartDetails: {
      asset: 'LAB/USDT Perpetual',
      leverage: '5X',
      direction: 'Opening Long',
      pnl: '-37,667.09 USDT',
      pnlPercent: '-13.07%'
    }
  },
  {
    id: 'post-10',
    author: {
      name: 'Tradingguro 💎',
      username: 'tradingguro',
      avatar: 'bg-gradient-to-tr from-fuchsia-600 to-pink-600',
      avatarChar: 'T',
      verified: true
    },
    time: '58m',
    sentiment: 'Bullish',
    content: '$USELESS is showing a strong bounce from major support levels, and buyers are stepping in to initiate a fresh recovery rally.\n\n$USELESS - LONG setups ready!',
    badges: [
      { label: 'USELESS', change: 4.51 }
    ],
    metrics: {
      comments: 0,
      reposts: 0,
      likes: 2,
      views: '161'
    },
    chartType: 'useless',
    chartTitle: 'USELESS/USDT Binance Spot',
    chartDetails: {
      price: '0.06211',
      change: '+5.36%',
      vol24h: '13.11M USELESS',
      points: [0.10, 0.09, 0.08, 0.07, 0.06, 0.06211]
    }
  },
  {
    id: 'post-11',
    author: {
      name: 'Professor Christopher 🎓',
      username: 'prof_christopher',
      avatar: 'bg-gradient-to-tr from-zinc-700 to-neutral-800',
      avatarChar: 'P',
      verified: false
    },
    time: '9m',
    sentiment: 'Bearish',
    content: 'The $LAB squeeze narrative is dead. Retail investors have an average cost basis of 0.02, meaning they can distribute all the way down. Daily token unlocks add constant downward pressure. Insiders are shorting this heavy.',
    badges: [
      { label: 'ACE', change: 109.65 },
      { label: 'BANK', change: 53.41 },
      { label: 'LAB', change: -13.42 }
    ],
    metrics: {
      comments: 2,
      reposts: 1,
      likes: 1,
      views: '222'
    },
    chartType: 'long_short',
    chartTitle: 'Top Traders Long/Short Ratio & Open Interest',
    chartDetails: {
      ratio: '62% Short / 38% Long',
      status: 'Intense shorting pressure on LAB Index',
      openInterest: '121.9M USD High'
    }
  },
  {
    id: 'post-12',
    author: {
      name: 'Doktor profit 🩺',
      username: 'doktor_profit',
      avatar: 'bg-gradient-to-tr from-teal-600 to-emerald-500',
      avatarChar: 'D',
      verified: false
    },
    time: '50m',
    sentiment: 'Bullish',
    content: '$DOGE Bulls Are Gaining Momentum.\n\nTrade Setup:\nEntry: 0.0725 - 0.0728\nTP1: 0.0740\nTP2: 0.0755\nStop Loss: 0.0710. Risk compliance active!',
    badges: [
      { label: 'DOGE', change: 0.40 }
    ],
    metrics: {
      comments: 4,
      reposts: 3,
      likes: 12,
      views: '500'
    },
    chartType: 'spacex',
    chartTitle: 'DOGE/USDT Spot Momentum Analysis',
    chartDetails: {
      price: '0.0729 USD',
      change: '+0.40%',
      timeframe: '5m interval tracking',
      points: [0.071, 0.0715, 0.072, 0.0724, 0.0729]
    }
  }
];

// Available Assets in India & Global Markets for "Market Research" (Live Trading)
interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  category: 'Crypto' | 'Indian Shares' | 'International Stocks';
  basePrice: number;
  currentPrice: number;
  change: number;
  history: number[];
}

const LIVE_NEWS_ITEMS = [
  { id: 'news-1', time: '1 min ago', tag: 'FED RATE', title: 'Federal Reserve officials signal gradual rate cuts as inflation stabilizes near target.', impact: 'High Bullish', symbol: 'BTC', source: 'Bloomberg Terminal' },
  { id: 'news-2', time: '4 mins ago', tag: 'REGULATION', title: 'SEC approves first-ever multi-asset tokenized index ETF for institutional desks.', impact: 'Bullish', symbol: 'HANA', source: 'Reuters Financial' },
  { id: 'news-3', time: '12 mins ago', tag: 'INSTITUTIONAL', title: 'Major global investment bank adds $250M of digital sovereign assets to its reserve balance sheet.', impact: 'High Bullish', symbol: 'NEXO', source: 'Wall Street Journal' },
  { id: 'news-4', time: '28 mins ago', tag: 'BLOCKCHAIN', title: 'Hana Network achieves record-breaking 120,000 TPS under stress testing for cross-border settles.', impact: 'Bullish', symbol: 'HANA', source: 'TechCrunch' },
  { id: 'news-5', time: '41 mins ago', tag: 'STABLECOIN', title: 'Circle announces native compliance integration across multiple European liquid staking pools.', impact: 'Neutral', symbol: 'CRCL', source: 'CoinDesk' },
  { id: 'news-6', time: '1 hour ago', tag: 'SQUEEZE', title: 'Short liquidations top $110M within 30 minutes as BTC spikes back above $94,000.', impact: 'High Bullish', symbol: 'BTC', source: 'Cryptix Market Feed' }
];

export default function MarketSection({ currentUser, onUpdateWallet, addLog, systemSettings }: MarketSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'analyse' | 'research'>('analyse');
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);

  // Live News Carousel State
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isNewsPlaying, setIsNewsPlaying] = useState(true);

  useEffect(() => {
    if (!isNewsPlaying) return;
    const interval = setInterval(() => {
      setCurrentNewsIndex(prev => (prev + 1) % LIVE_NEWS_ITEMS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isNewsPlaying]);

  // Market Research / Live Trading State
  const [assets, setAssets] = useState<MarketAsset[]>([
    { id: 'asset-btc', symbol: 'BTC/INR', name: 'Bitcoin', category: 'Crypto', basePrice: 5850000, currentPrice: 5850000, change: 1.45, history: [5780000, 5810000, 5790000, 5830000, 5840000, 5850000] },
    { id: 'asset-eth', symbol: 'ETH/INR', name: 'Ethereum', category: 'Crypto', basePrice: 312000, currentPrice: 312000, change: 0.85, history: [309000, 311000, 308000, 313000, 310000, 312000] },
    { id: 'asset-sol', symbol: 'SOL/INR', name: 'Solana', category: 'Crypto', basePrice: 14500, currentPrice: 14500, change: 5.67, history: [13800, 14000, 13900, 14200, 14300, 14500] },
    { id: 'asset-doge', symbol: 'DOGE/INR', name: 'Dogecoin', category: 'Crypto', basePrice: 12.45, currentPrice: 12.45, change: -2.34, history: [13.10, 12.90, 12.70, 12.60, 12.50, 12.45] },
    { id: 'asset-ada', symbol: 'ADA/INR', name: 'Cardano', category: 'Crypto', basePrice: 38.20, currentPrice: 38.20, change: 0.98, history: [37.50, 37.80, 37.90, 38.00, 38.10, 38.20] },
    { id: 'asset-xrp', symbol: 'XRP/INR', name: 'XRP', category: 'Crypto', basePrice: 55.60, currentPrice: 55.60, change: -0.45, history: [56.20, 56.00, 55.90, 55.80, 55.70, 55.60] },
    { id: 'asset-spcx', symbol: 'SPCX', name: 'Space Exploration Technologies (SpaceX)', category: 'International Stocks', basePrice: 10412, currentPrice: 10412, change: -1.91, history: [11200, 10900, 10750, 10600, 10550, 10412] },
    { id: 'asset-tata', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', category: 'Indian Shares', basePrice: 985, currentPrice: 985, change: 2.30, history: [945, 955, 968, 972, 980, 985] },
    { id: 'asset-reliance', symbol: 'RELIANCE', name: 'Reliance Industries', category: 'Indian Shares', basePrice: 2945, currentPrice: 2945, change: -0.45, history: [2980, 2965, 2970, 2950, 2938, 2945] },
    { id: 'asset-sbin', symbol: 'SBIN', name: 'State Bank of India', category: 'Indian Shares', basePrice: 842, currentPrice: 842, change: 1.75, history: [820, 828, 831, 835, 839, 842] },
    { id: 'asset-aapl', symbol: 'AAPL', name: 'Apple Inc.', category: 'International Stocks', basePrice: 18450, currentPrice: 18450, change: 1.20, history: [18100, 18300, 18250, 18400, 18350, 18450] }
  ]);

  const [selectedAssetId, setSelectedAssetId] = useState<string>('asset-btc');
  
  // Buy / Sell state
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState<string>('');
  const [tradeError, setTradeError] = useState<string>('');
  const [tradeSuccess, setTradeSuccess] = useState<string>('');

  // User's custom stocks/crypto portfolio tracker synced with local storage
  const [portfolio, setPortfolio] = useState<any[]>([]);

  useEffect(() => {
    const storedPortfolio = localStorage.getItem(`cryptix_portfolio_${currentUser?.username || 'anon'}`);
    if (storedPortfolio) {
      setPortfolio(JSON.parse(storedPortfolio));
    }
  }, [currentUser]);

  const savePortfolio = (updated: any[]) => {
    setPortfolio(updated);
    localStorage.setItem(`cryptix_portfolio_${currentUser?.username || 'anon'}`, JSON.stringify(updated));
  };

  // Live fluctuating prices simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(asset => {
        // Random change between -0.15% and +0.15%
        const randPercent = (Math.random() * 0.3 - 0.15);
        const newPrice = Number((asset.currentPrice * (1 + randPercent / 100)).toFixed(2));
        const newHistory = [...asset.history.slice(1), newPrice];
        const newChange = Number((((newPrice - asset.basePrice) / asset.basePrice) * 100).toFixed(2));
        return {
          ...asset,
          currentPrice: newPrice,
          change: newChange,
          history: newHistory
        };
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    setTradeError('');
    setTradeSuccess('');

    if (!currentUser) {
      setTradeError('Please log in to your premium client account to execute trades.');
      return;
    }

    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) {
      setTradeError('Please enter a valid monetary amount.');
      return;
    }

    // Minimum check: Rs 1000 as per user instruction
    if (amount < 1000) {
      setTradeError('Transaction failed: Minimum purchase or sale limit is ₹1,000.');
      return;
    }

    if (tradeAction === 'buy') {
      // Check if user has sufficient deposit balance
      if (currentUser.depositWallet < amount) {
        setTradeError(`Insufficient funds in deposit ledger. Available balance is ₹${currentUser.depositWallet.toLocaleString()}.`);
        return;
      }

      // Process Buy: deduct balance, add to portfolio
      onUpdateWallet(-amount, 0); // deduct depositWallet

      const sharesBought = amount / selectedAsset.currentPrice;
      const existingAssetIndex = portfolio.findIndex(p => p.symbol === selectedAsset.symbol);

      let updatedPortfolio = [...portfolio];
      if (existingAssetIndex >= 0) {
        const item = updatedPortfolio[existingAssetIndex];
        const newTotalShares = item.shares + sharesBought;
        const newTotalInvestment = item.totalInvestment + amount;
        const newAvgPrice = newTotalInvestment / newTotalShares;
        updatedPortfolio[existingAssetIndex] = {
          ...item,
          shares: newTotalShares,
          totalInvestment: newTotalInvestment,
          avgPrice: newAvgPrice
        };
      } else {
        updatedPortfolio.push({
          symbol: selectedAsset.symbol,
          name: selectedAsset.name,
          category: selectedAsset.category,
          shares: sharesBought,
          totalInvestment: amount,
          avgPrice: selectedAsset.currentPrice
        });
      }

      savePortfolio(updatedPortfolio);
      addLog(`Purchased ₹${amount.toLocaleString()} worth of ${selectedAsset.name} (${selectedAsset.symbol}) @ ₹${selectedAsset.currentPrice.toLocaleString()}/unit`, currentUser.username);
      setTradeSuccess(`Executed successfully: ₹${amount.toLocaleString()} invested in ${selectedAsset.name}.`);
      setTradeAmount('');
    } else {
      // Process Sell
      const existingAsset = portfolio.find(p => p.symbol === selectedAsset.symbol);
      if (!existingAsset || existingAsset.shares <= 0) {
        setTradeError(`Execution error: You do not hold any shares of ${selectedAsset.name} to liquidate.`);
        return;
      }

      const heldValue = existingAsset.shares * selectedAsset.currentPrice;
      // Let's see if selling amount exceeds their holding value
      if (amount > heldValue) {
        setTradeError(`Invalid quantity: Entered amount ₹${amount.toLocaleString()} exceeds your current holding value of ₹${heldValue.toLocaleString()}.`);
        return;
      }

      // Deduct shares proportionally
      const sharesToSell = amount / selectedAsset.currentPrice;
      let updatedPortfolio = portfolio.map(item => {
        if (item.symbol === selectedAsset.symbol) {
          const remainingShares = item.shares - sharesToSell;
          const remainingInvestment = item.totalInvestment * (remainingShares / item.shares);
          return {
            ...item,
            shares: remainingShares,
            totalInvestment: remainingInvestment
          };
        }
        return item;
      }).filter(item => item.shares > 0.0001);

      savePortfolio(updatedPortfolio);
      onUpdateWallet(amount, 0); // refund to depositWallet

      addLog(`Liquidated ₹${amount.toLocaleString()} worth of ${selectedAsset.name} (${selectedAsset.symbol}) @ ₹${selectedAsset.currentPrice.toLocaleString()}/unit`, currentUser.username);
      setTradeSuccess(`Liquidated successfully: ₹${amount.toLocaleString()} credited back to your ledger deposit wallet.`);
      setTradeAmount('');
    }
  };

  const handleSellAll = (heldAsset: any) => {
    if (!currentUser) return;
    
    const assetObj = assets.find(a => a.symbol === heldAsset.symbol);
    const livePrice = assetObj ? assetObj.currentPrice : heldAsset.avgPrice;
    const totalValue = heldAsset.shares * livePrice;

    // Minimum limit check
    if (totalValue < 1000) {
      setTradeError(`Liquidation limit error: Cannot sell. Minimum transaction value must be ₹1,000. Current holding value is ₹${totalValue.toLocaleString()}.`);
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    onUpdateWallet(totalValue, 0); // refund to depositWallet

    const updatedPortfolio = portfolio.filter(p => p.symbol !== heldAsset.symbol);
    savePortfolio(updatedPortfolio);

    addLog(`Liquidated entire holdings (₹${totalValue.toLocaleString()}) of ${heldAsset.name} (${heldAsset.symbol})`, currentUser.username);
    setTradeSuccess(`Fully liquidated: ₹${totalValue.toLocaleString()} credited to your deposit wallet.`);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Helper to render beautiful visual SVGs matching the charts in the screenshots
  const renderSVGChartPreview = (post: SocialPost) => {
    if (post.chartType === 'spacex') {
      const details = post.chartDetails;
      return (
        <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-4 font-sans space-y-3 cursor-pointer hover:border-slate-700 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{details.timeframe}</p>
              <h5 className="text-sm font-black text-white">{post.chartTitle}</h5>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-white">{details.price}</span>
              <p className="text-[10px] text-red-500 font-bold">{details.change}</p>
            </div>
          </div>
          
          {/* Visual line representation */}
          <div className="h-20 w-full relative mt-2 flex items-end">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <path 
                d="M 0 10 L 15 15 L 30 12 L 50 25 L 70 28 L 85 35 L 100 38" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <path 
                d="M 0 10 L 15 15 L 30 12 L 50 25 L 70 28 L 85 35 L 100 38 L 100 40 L 0 40 Z" 
                fill="url(#redGlow)" 
                opacity="0.15"
              />
              <defs>
                <linearGradient id="redGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444"/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between text-[8px] text-slate-500 font-mono pt-1">
            <span>1 Day</span>
            <span>5 Days</span>
            <span>1 Month</span>
            <span>All time</span>
          </div>
        </div>
      );
    }

    if (post.chartType === 'pnl_cards') {
      const cards = post.chartDetails;
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 cursor-pointer">
          {cards.map((card: any, idx: number) => (
            <div key={idx} className="bg-[#0b0e14] border border-white/5 rounded-xl p-3 text-left space-y-1 relative overflow-hidden hover:border-slate-700 transition-all">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl"></div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">{card.pair}</span>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded font-black font-mono">{card.type}</span>
              </div>
              <p className="text-base font-black text-emerald-400 font-mono tracking-tight">{card.pnl}</p>
              <div className="flex justify-between text-[8px] text-slate-500 font-mono border-t border-slate-800/40 pt-1.5 mt-1">
                <span>Entry: {card.entry}</span>
                <span>Last: {card.last}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (post.chartType === 'bank_chart') {
      const details = post.chartDetails;
      return (
        <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-4 font-sans space-y-3 cursor-pointer hover:border-slate-700 transition-all">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{details.subLabel}</span>
              <h5 className="text-sm font-black text-white">{post.chartTitle}</h5>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-emerald-400">{details.price}</span>
              <p className="text-[10px] text-emerald-400 font-mono font-bold">{details.change}</p>
            </div>
          </div>
          
          <div className="h-20 w-full relative mt-2 flex items-end">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <path 
                d="M 0 35 L 20 33 L 40 34 L 60 30 L 80 12 L 100 5" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              <path 
                d="M 0 35 L 20 33 L 40 34 L 60 30 L 80 12 L 100 5 L 100 40 L 0 40 Z" 
                fill="url(#greenGlow)" 
                opacity="0.15"
              />
              <defs>
                <linearGradient id="greenGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between text-[8px] text-slate-500 font-mono">
            <span>24h Vol: {details.vol24h}</span>
            <span>1 Week Timeframe</span>
          </div>
        </div>
      );
    }

    if (post.chartType === 'staking') {
      const details = post.chartDetails;
      return (
        <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-4 font-sans space-y-3 cursor-pointer hover:border-slate-700 transition-all">
          <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">{post.chartTitle}</h5>
          <div className="bg-slate-900/60 p-3.5 rounded-lg border border-white/5 space-y-2 text-center">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{details.label}</p>
            <h4 className="text-lg font-black text-amber-500 font-mono">{details.staked}</h4>
            <div className="inline-block bg-amber-500/10 text-amber-500 font-mono px-3 py-1 rounded-full text-xs font-black border border-amber-500/20">
              Staked Ratio: {details.percent}
            </div>
          </div>
        </div>
      );
    }

    if (post.chartType === 'eth_pos') {
      const details = post.chartDetails;
      const isNegative = details.pnl.includes('-');
      return (
        <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-4 font-sans space-y-3 cursor-pointer hover:border-slate-700 transition-all">
          <div className="flex justify-between items-center">
            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">{post.chartTitle}</h5>
            <span className="text-[8px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">{details.leverage}</span>
          </div>
          <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-lg border border-white/5">
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase">Asset Index</span>
              <p className="text-xs font-bold text-white">{details.asset}</p>
            </div>
            <div className="text-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase">Compliance</span>
              <p className="text-[10px] text-amber-500 font-black uppercase">{details.direction}</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-500 font-bold uppercase">Real PnL</span>
              <p className={`text-xs font-mono font-black ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>{details.pnl}</p>
            </div>
          </div>
        </div>
      );
    }

    if (post.chartType === 'trump') {
      const details = post.chartDetails;
      return (
        <div className="bg-gradient-to-tr from-[#0b0e14] to-[#121824] border border-slate-800 rounded-xl p-4 font-sans space-y-2.5 cursor-pointer hover:border-slate-700 transition-all text-left">
          <span className="text-[8px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider">{details.topic}</span>
          <p className="text-xs italic text-slate-300 leading-relaxed font-serif">"{details.quote}"</p>
          <div className="pt-2 border-t border-slate-800 text-[8.5px] text-slate-500 font-mono uppercase flex justify-between">
            <span>Docket Source: H.R. Clarity Act</span>
            <span>Context ID: Senate Compliance</span>
          </div>
        </div>
      );
    }

    if (post.chartType === 'useless') {
      const details = post.chartDetails;
      return (
        <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-4 font-sans space-y-3 cursor-pointer hover:border-slate-700 transition-all">
          <div className="flex justify-between items-center">
            <div>
              <h5 className="text-xs font-black text-slate-300 uppercase tracking-wider">{post.chartTitle}</h5>
              <p className="text-[8px] text-slate-500 font-mono">Binance Spot Index</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-emerald-400 font-mono">{details.price}</span>
              <p className="text-[10px] text-emerald-500 font-mono font-bold">{details.change}</p>
            </div>
          </div>
          
          <div className="h-16 w-full relative mt-2 flex items-end">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <path 
                d="M 0 38 L 20 30 L 40 32 L 60 25 L 80 18 L 100 8" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <circle cx="100" cy="8" r="2" fill="#10b981" />
            </svg>
          </div>
          <div className="flex justify-between text-[8px] text-slate-500 font-mono">
            <span>24h Vol: {details.vol24h}</span>
            <span>Support Line: Rebounded</span>
          </div>
        </div>
      );
    }

    if (post.chartType === 'long_short') {
      const details = post.chartDetails;
      return (
        <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-4 font-sans space-y-3 cursor-pointer hover:border-slate-700 transition-all text-left">
          <h5 className="text-xs font-black text-slate-300 uppercase tracking-wider">{post.chartTitle}</h5>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-rose-500 font-bold">Short Accounts: 62%</span>
              <span className="text-emerald-500 font-bold">Long Accounts: 38%</span>
            </div>
            {/* Visual ratio bar */}
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
              <div className="h-full bg-rose-500" style={{ width: '62%' }}></div>
              <div className="h-full bg-emerald-500" style={{ width: '38%' }}></div>
            </div>
            <p className="text-[9px] text-slate-500 font-mono uppercase">Open Interest: <span className="text-white font-bold">{details.openInterest}</span></p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-10" id="market-global-section">
      
      {/* 1. SECTION HEADER & PREMIUM SUB-TABS */}
      <div className="relative bg-gradient-to-r from-slate-950 via-[#0a0f1d] to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden" id="market-header-banner">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px]"></div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2.5">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest">Global Market Hub</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight font-display">
              Cryptix<span className="text-amber-500">Market</span> Intelligence
            </h2>
            <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
              Analyze real-time social sentiments from top verified asset managers, perform dynamic research on Indian & international shares, and execute low-latency order matching.
            </p>
          </div>

          {/* Dual sub-tab switcher */}
          <div className="flex bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shrink-0 w-full md:w-auto" id="market-sub-tabs">
            <button
              onClick={() => setActiveSubTab('analyse')}
              className={`flex-1 md:flex-initial flex items-center justify-center space-x-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeSubTab === 'analyse'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Market Analyse</span>
            </button>
            <button
              onClick={() => setActiveSubTab('research')}
              className={`flex-1 md:flex-initial flex items-center justify-center space-x-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeSubTab === 'research'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Market Research</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIVE MARKET NEWS TICKER */}
      <div className="bg-[#070b14]/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col sm:flex-row items-center gap-3" id="live-market-news-ticker">
        {/* Glow accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
        <div className="absolute top-1/2 left-4 w-40 h-40 bg-amber-500/5 -translate-y-1/2 rounded-full blur-2xl pointer-events-none"></div>

        {/* Static Title/Badge */}
        <div className="flex items-center space-x-2 border-r border-slate-800/60 pr-4 shrink-0 self-start sm:self-center">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </div>
          <span className="text-[11px] font-mono font-black text-amber-500 uppercase tracking-wider">Flash News Ticker</span>
        </div>

        {/* Slidable Content */}
        <div className="flex-grow w-full overflow-hidden relative min-h-[36px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNewsIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 cursor-pointer"
              onClick={() => {
                const item = LIVE_NEWS_ITEMS[currentNewsIndex];
                toast(item.title, {
                  description: `Source: ${item.source} • Impact: ${item.impact}`,
                  action: {
                    label: 'Close',
                    onClick: () => {}
                  }
                });
              }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                  LIVE_NEWS_ITEMS[currentNewsIndex].impact.includes('High')
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {LIVE_NEWS_ITEMS[currentNewsIndex].tag}
                </span>
                <p className="text-xs font-semibold text-slate-200 line-clamp-1 hover:text-amber-400 transition-colors">
                  {LIVE_NEWS_ITEMS[currentNewsIndex].title}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <span className="text-[10px] text-slate-500 font-mono shrink-0">{LIVE_NEWS_ITEMS[currentNewsIndex].time}</span>
                <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono">{LIVE_NEWS_ITEMS[currentNewsIndex].symbol}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation / Pause controls */}
        <div className="flex items-center space-x-1.5 shrink-0 border-l border-slate-800/60 pl-3 self-end sm:self-center">
          <button 
            onClick={() => {
              setIsNewsPlaying(false);
              setCurrentNewsIndex(prev => (prev - 1 + LIVE_NEWS_ITEMS.length) % LIVE_NEWS_ITEMS.length);
            }}
            className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded text-slate-400 hover:text-white transition-all text-[9px]"
            title="Previous News"
          >
            ◀
          </button>
          <button 
            onClick={() => setIsNewsPlaying(!isNewsPlaying)}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded text-[9px] font-mono text-slate-400 hover:text-white transition-all uppercase font-bold"
            title={isNewsPlaying ? "Pause Autoplay" : "Resume Autoplay"}
          >
            {isNewsPlaying ? '⏸ PAUSE' : '▶ PLAY'}
          </button>
          <button 
            onClick={() => {
              setIsNewsPlaying(false);
              setCurrentNewsIndex(prev => (prev + 1) % LIVE_NEWS_ITEMS.length);
            }}
            className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded text-slate-400 hover:text-white transition-all text-[9px]"
            title="Next News"
          >
            ▶
          </button>
        </div>
      </div>

      {/* 2. SUB-TAB VIEWPORT */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'analyse' ? (
          <motion.div
            key="market-analyse-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
            id="market-analyse-viewport"
          >
            {/* Sentiment Meter Widget */}
            <div className="bg-[#070b14] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center space-x-3.5 text-left">
                <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 shrink-0">
                  <Layers className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Social Index Sentiment</h4>
                  <p className="text-[11px] text-slate-500 font-mono uppercase">Compiled across 15,200 asset square publications</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 w-full md:w-auto justify-end">
                <div className="text-right">
                  <span className="text-xs text-slate-500 uppercase font-mono tracking-wider block">Bullish Ratio</span>
                  <span className="text-base font-mono font-black text-emerald-400">58.4%</span>
                </div>
                <div className="h-8 w-[1px] bg-slate-800"></div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 uppercase font-mono tracking-wider block">Bearish Ratio</span>
                  <span className="text-base font-mono font-black text-rose-400">31.2%</span>
                </div>
                <div className="h-8 w-[1px] bg-slate-800"></div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 uppercase font-mono tracking-wider block">Compliance Health</span>
                  <span className="text-base font-mono font-black text-white">OPTIMAL</span>
                </div>
              </div>
            </div>

            {/* TWITTER-STYLE CRYPTO FEED (Grid/Scrollable Feed) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="crypto-social-square-feed">
              {FEED_POSTS.map((post) => (
                <div 
                  key={post.id} 
                  className="bg-[#070b14] border border-slate-800/80 hover:border-slate-700/90 rounded-2.5rem p-6 space-y-4 shadow-xl transition-all flex flex-col justify-between text-left relative overflow-hidden"
                  id={`social-post-card-${post.id}`}
                >
                  {/* Top Header details */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white uppercase shrink-0 shadow-inner ${post.author.avatar}`}>
                        {post.author.avatarChar}
                      </div>
                      
                      <div className="text-left leading-tight">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-black text-white uppercase tracking-tight">{post.author.name}</span>
                          {post.author.verified && (
                            <CheckCircle className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10 shrink-0" />
                          )}
                          <span className="text-[10px] text-slate-500 font-mono">• {post.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">@{post.author.username}</p>
                      </div>
                    </div>

                    {/* Sentiment Tag */}
                    <div className="flex items-center space-x-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        post.sentiment === 'Bullish' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : post.sentiment === 'Bearish'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {post.sentiment}
                      </span>
                    </div>
                  </div>

                  {/* Body text */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line font-medium flex-grow">
                    {post.content}
                  </p>

                  {/* Embedded Custom Visual Chart Preview / Clickable area for expanded lightbox */}
                  <div 
                    onClick={() => setSelectedPost(post)}
                    className="relative group rounded-xl overflow-hidden"
                  >
                    {renderSVGChartPreview(post)}
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[1px] rounded-xl">
                      <div className="bg-[#05070a]/90 border border-slate-800 p-2 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 shadow-2xl">
                        <Maximize2 className="w-3 h-3 text-amber-500" />
                        <span>Enlarge Analysis</span>
                      </div>
                    </div>
                  </div>

                  {/* Market index ticker tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.badges.map((b, idx) => (
                      <span 
                        key={idx}
                        className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded border flex items-center space-x-1 ${
                          b.change >= 0 
                            ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' 
                            : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
                        }`}
                      >
                        <span>{b.label}</span>
                        <span className={b.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {b.change >= 0 ? '+' : ''}{b.change}%
                        </span>
                      </span>
                    ))}
                  </div>

                  {/* Interaction bar */}
                  <div className="flex justify-between items-center text-slate-500 border-t border-slate-900/80 pt-3 mt-1.5 text-[11px] font-mono">
                    <button className="flex items-center space-x-1.5 hover:text-white transition-all">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.metrics.comments}</span>
                    </button>
                    <button className="flex items-center space-x-1.5 hover:text-white transition-all">
                      <Repeat className="w-3.5 h-3.5" />
                      <span>{post.metrics.reposts}</span>
                    </button>
                    <button className="flex items-center space-x-1.5 hover:text-white transition-all">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.metrics.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1.5 text-slate-600">
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>{post.metrics.views}</span>
                    </button>
                    <button className="flex items-center hover:text-white transition-all">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="market-research-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8 text-left"
            id="market-research-viewport"
          >
            {/* LIVE TRADING PORTAL VIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Side: Asset list Selector */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-[#070b14] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Live Quotations</h3>
                    <div className="flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-[9px] text-emerald-400 font-mono font-black uppercase">Live stream</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {assets.map((asset) => {
                      const isUp = asset.change >= 0;
                      return (
                        <button
                          key={asset.id}
                          onClick={() => {
                            setSelectedAssetId(asset.id);
                            setTradeError('');
                            setTradeSuccess('');
                          }}
                          className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            selectedAssetId === asset.id
                              ? 'bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/5'
                              : 'bg-slate-950/40 border-slate-900 hover:bg-slate-900/40 hover:border-slate-800'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-bold font-mono">{asset.category}</span>
                            </div>
                            <h4 className="text-xs font-black text-white uppercase tracking-tight">{asset.name}</h4>
                            <p className="text-[9px] text-slate-500 font-mono">{asset.symbol}</p>
                          </div>
                          <div className="text-right space-y-1 shrink-0">
                            <p className="text-xs font-mono font-extrabold text-white">₹{asset.currentPrice.toLocaleString()}</p>
                            <span className={`inline-flex items-center space-x-0.5 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded ${
                              isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                              <span>{isUp ? '+' : ''}{asset.change}%</span>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Center & Right Sides: Asset detail chart & Interactive buy-sell form */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Visual Chart Panel */}
                <div className="bg-[#070b14] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/5 rounded-full blur-[80px]"></div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                    <div>
                      <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">{selectedAsset.category} Index</span>
                      <h3 className="text-2xl font-black text-white tracking-tight mt-2">{selectedAsset.name} ({selectedAsset.symbol})</h3>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-2xl font-mono font-black text-white">₹{selectedAsset.currentPrice.toLocaleString()}</p>
                      <span className={`inline-flex items-center space-x-1 text-xs font-mono font-black px-2.5 py-0.5 rounded-full mt-1 ${
                        selectedAsset.change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {selectedAsset.change >= 0 ? '+' : ''}{selectedAsset.change}% Overall Today
                      </span>
                    </div>
                  </div>

                  {/* Line Chart Representation of fluctuations */}
                  <div className="h-44 w-full relative flex items-end pt-4">
                    <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="selectedChartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path 
                        d={`M 0 ${120 - (selectedAsset.history[0] - selectedAsset.basePrice * 0.95) / (selectedAsset.basePrice * 0.1) * 80} 
                            L 100 ${120 - (selectedAsset.history[1] - selectedAsset.basePrice * 0.95) / (selectedAsset.basePrice * 0.1) * 80} 
                            L 200 ${120 - (selectedAsset.history[2] - selectedAsset.basePrice * 0.95) / (selectedAsset.basePrice * 0.1) * 80} 
                            L 300 ${120 - (selectedAsset.history[3] - selectedAsset.basePrice * 0.95) / (selectedAsset.basePrice * 0.1) * 80} 
                            L 400 ${120 - (selectedAsset.history[4] - selectedAsset.basePrice * 0.95) / (selectedAsset.basePrice * 0.1) * 80} 
                            L 500 ${120 - (selectedAsset.currentPrice - selectedAsset.basePrice * 0.95) / (selectedAsset.basePrice * 0.1) * 80}`} 
                        fill="none" 
                        stroke="#f59e0b" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                      />
                      <path 
                        d={`M 0 ${120 - (selectedAsset.history[0] - selectedAsset.basePrice * 0.95) / (selectedAsset.basePrice * 0.1) * 80} 
                            L 100 ${120 - (selectedAsset.history[1] - selectedAsset.basePrice * 0.95) / (selectedAsset.basePrice * 0.1) * 80} 
                            L 200 ${120 - (selectedAsset.history[2] - selectedAsset.basePrice * 0.95) / (selectedAsset.basePrice * 0.1) * 80} 
                            L 300 ${120 - (selectedAsset.history[3] - selectedAsset.basePrice * 0.95) / (selectedAsset.basePrice * 0.1) * 80} 
                            L 400 ${120 - (selectedAsset.history[4] - selectedAsset.basePrice * 0.95) / (selectedAsset.basePrice * 0.1) * 80} 
                            L 500 ${120 - (selectedAsset.currentPrice - selectedAsset.basePrice * 0.95) / (selectedAsset.basePrice * 0.1) * 80}
                            L 500 120 L 0 120 Z`} 
                        fill="url(#selectedChartGlow)"
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
                    <span>10:00 AM IST</span>
                    <span>12:00 PM IST</span>
                    <span>2:00 PM IST</span>
                    <span>4:00 PM IST</span>
                    <span>6:00 PM IST (LIVE)</span>
                  </div>
                </div>

                {/* Buy / Sell Transaction Drawer */}
                <div className="bg-[#070b14] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative" id="buy-sell-form-wrapper">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Execute Brokerage Orders</h3>
                    <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px] uppercase font-bold tracking-widest">
                      <button 
                        onClick={() => setTradeAction('buy')}
                        className={`px-3 py-1 rounded transition-all ${tradeAction === 'buy' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'}`}
                      >
                        Buy (Kharidein)
                      </button>
                      <button 
                        onClick={() => setTradeAction('sell')}
                        className={`px-3 py-1 rounded transition-all ${tradeAction === 'sell' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'}`}
                      >
                        Sell (Bechein)
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleExecuteTrade} className="space-y-4">
                    
                    {/* User Ledgers Balance Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/40 border border-white/5 rounded-2xl p-4 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500 block uppercase font-bold">Ledger Deposit Balance</span>
                        <p className="text-sm font-black text-white mt-1">₹{currentUser?.depositWallet.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-bold">Held Shares Current Value</span>
                        <p className="text-sm font-black text-emerald-400 mt-1">
                          ₹{portfolio.reduce((acc, p) => {
                            const match = assets.find(a => a.symbol === p.symbol);
                            const price = match ? match.currentPrice : p.avgPrice;
                            return acc + (p.shares * price);
                          }, 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">INR Amount to {tradeAction === 'buy' ? 'Invest' : 'Withdraw & Liquidate'}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold font-mono">₹</span>
                        <input
                          type="number"
                          placeholder="Minimum amount: 1,000"
                          value={tradeAmount}
                          onChange={(e) => setTradeAmount(e.target.value)}
                          className="w-full bg-[#03050a] border border-slate-800 rounded-xl py-3.5 pl-8 pr-4 text-xs font-mono text-white focus:outline-none focus:border-amber-500 transition-all font-black"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">Note: Transaction value must be minimum ₹1,000. Price will be calculated at live rates.</p>
                    </div>

                    {tradeError && (
                      <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl flex items-center space-x-2.5 text-rose-400 text-[11px] font-bold">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{tradeError}</span>
                      </div>
                    )}

                    {tradeSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-center space-x-2.5 text-emerald-400 text-[11px] font-bold">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{tradeSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 ${
                        tradeAction === 'buy'
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
                          : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/10'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{tradeAction === 'buy' ? 'Execute Buy Contract' : 'Execute Sell Contract'}</span>
                    </button>
                  </form>
                </div>

                {/* My Portfolio list (Held Assets) */}
                <div className="bg-[#070b14] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl text-left" id="user-portfolio-details">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">My Portfolio (Mera Portfolio)</h3>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{portfolio.length} Unique Holdings</span>
                  </div>

                  {portfolio.length === 0 ? (
                    <div className="text-center py-8 bg-[#03050a] rounded-2xl border border-slate-850/60 text-slate-500 text-xs font-medium font-sans">
                      <Briefcase className="w-8 h-8 text-slate-700 mx-auto mb-2.5" />
                      No active investments in shares or crypto. Execute a purchase order above.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {portfolio.map((item, idx) => {
                        const liveAsset = assets.find(a => a.symbol === item.symbol);
                        const currentPrice = liveAsset ? liveAsset.currentPrice : item.avgPrice;
                        const currentValue = item.shares * currentPrice;
                        const profitLoss = currentValue - item.totalInvestment;
                        const pnlPercent = (profitLoss / item.totalInvestment) * 100;
                        const isProfit = profitLoss >= 0;

                        return (
                          <div 
                            key={idx}
                            className="bg-[#03050a] border border-slate-850/60 hover:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                          >
                            <div className="space-y-1">
                              <span className="text-[8px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-bold font-mono">{item.category}</span>
                              <h4 className="text-xs font-black text-white uppercase tracking-tight">{item.name} ({item.symbol})</h4>
                              <p className="text-[10px] text-slate-500 font-mono">
                                Shares: {item.shares.toFixed(4)} @ Avg Cost: ₹{item.avgPrice.toLocaleString()}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 md:text-right w-full md:w-auto">
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase block font-mono">Invested</span>
                                <span className="text-xs font-mono font-bold text-white">₹{item.totalInvestment.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase block font-mono">Current Val</span>
                                <span className="text-xs font-mono font-bold text-white">₹{currentValue.toLocaleString()}</span>
                              </div>
                              <div className="col-span-2 md:col-span-1">
                                <span className="text-[9px] text-slate-500 uppercase block font-mono">Unrealized PnL</span>
                                <span className={`text-xs font-mono font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {isProfit ? '+' : ''}₹{profitLoss.toLocaleString()} ({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleSellAll(item)}
                              className="w-full md:w-auto px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                            >
                              Sell All
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. LIGHTBOX EXPANDED PORTRAIT DIALOG MODAL */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            {/* Backdrop close area */}
            <div 
              className="absolute inset-0 cursor-zoom-out"
              onClick={() => setSelectedPost(null)}
            />
            
            {/* Lightbox dialog card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative max-w-2xl w-full bg-[#05070a] border border-slate-800 rounded-3rem p-6 md:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] z-10 text-left"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
              >
                Close (X)
              </button>

              <div className="space-y-4">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-black text-white uppercase ${selectedPost.author.avatar}`}>
                    {selectedPost.author.avatarChar}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">{selectedPost.author.name}</h4>
                      {selectedPost.author.verified && (
                        <CheckCircle className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">@{selectedPost.author.username} • {selectedPost.time}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line font-medium">
                  {selectedPost.content}
                </p>

                {/* Highly structured big display of the SVG Chart */}
                <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-6 space-y-6 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px]"></div>
                  
                  <div className="flex justify-between items-center border-b border-slate-850 pb-4">
                    <div>
                      <span className="text-[8px] bg-amber-500/15 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-black font-mono">ANALYSIS REPORT</span>
                      <h5 className="text-base font-black text-white tracking-tight mt-1">{selectedPost.chartTitle}</h5>
                    </div>
                    <span className="text-xs font-mono font-black text-amber-500 uppercase tracking-widest">Enlarged View</span>
                  </div>

                  {selectedPost.chartType === 'spacex' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-slate-500 font-mono">Latest Market Value</p>
                          <span className="text-2xl font-mono font-black text-white">{selectedPost.chartDetails.price}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-mono">Index Shift</p>
                          <span className="text-base font-mono font-black text-rose-500">{selectedPost.chartDetails.change}</span>
                        </div>
                      </div>
                      <div className="h-40 w-full relative">
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <path 
                            d="M 0 10 L 15 15 L 30 12 L 50 25 L 70 28 L 85 35 L 100 38" 
                            fill="none" 
                            stroke="#ef4444" 
                            strokeWidth="3" 
                            strokeLinecap="round"
                          />
                          <path 
                            d="M 0 10 L 15 15 L 30 12 L 50 25 L 70 28 L 85 35 L 100 38 L 100 40 L 0 40 Z" 
                            fill="url(#redGlowBig)" 
                            opacity="0.2"
                          />
                          <defs>
                            <linearGradient id="redGlowBig" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ef4444"/>
                              <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono uppercase">
                        <span>1 Day</span>
                        <span>5 Days</span>
                        <span>1 Month</span>
                        <span>All time (Low Level)</span>
                      </div>
                    </div>
                  )}

                  {selectedPost.chartType === 'pnl_cards' && (
                    <div className="space-y-3.5">
                      {selectedPost.chartDetails.map((card: any, idx: number) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center text-left">
                          <div className="space-y-1">
                            <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black font-mono">{card.type}</span>
                            <h5 className="text-xs font-black text-slate-200 uppercase tracking-wider mt-1">{card.pair}</h5>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="text-base font-mono font-black text-emerald-400">{card.pnl}</span>
                            <p className="text-[9px] text-slate-500 font-mono">Entry: {card.entry} • Last: {card.last}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedPost.chartType === 'bank_chart' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-slate-500 font-mono">Token Spot Price</p>
                          <span className="text-2xl font-mono font-black text-emerald-400">₹{selectedPost.chartDetails.price}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-mono">24h Gain</p>
                          <span className="text-lg font-mono font-black text-emerald-400">{selectedPost.chartDetails.change}</span>
                        </div>
                      </div>
                      <div className="h-40 w-full relative">
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <path 
                            d="M 0 35 L 20 33 L 40 34 L 60 30 L 80 12 L 100 5" 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="3.5" 
                            strokeLinecap="round"
                          />
                          <path 
                            d="M 0 35 L 20 33 L 40 34 L 60 30 L 80 12 L 100 5 L 100 40 L 0 40 Z" 
                            fill="url(#greenGlowBig)" 
                            opacity="0.2"
                          />
                          <defs>
                            <linearGradient id="greenGlowBig" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981"/>
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Binance Square Hub Tracking</span>
                        <span>Vol: {selectedPost.chartDetails.vol24h}</span>
                      </div>
                    </div>
                  )}

                  {selectedPost.chartType === 'staking' && (
                    <div className="space-y-4 text-center py-4 bg-slate-900 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{selectedPost.chartDetails.label}</span>
                      <h4 className="text-2xl font-mono font-black text-amber-500">{selectedPost.chartDetails.staked}</h4>
                      <p className="text-xs text-slate-400 font-medium font-sans">
                        Approximately <span className="text-amber-500 font-bold">{selectedPost.chartDetails.percent}</span> of circulating supply is held in secure staking nodes.
                      </p>
                    </div>
                  )}

                  {selectedPost.chartType === 'eth_pos' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex justify-between text-xs font-mono uppercase text-slate-400">
                          <span>Margin Asset:</span>
                          <span className="text-white font-bold">{selectedPost.chartDetails.asset}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono uppercase text-slate-400">
                          <span>Compliance Mode:</span>
                          <span className="text-amber-500 font-black">{selectedPost.chartDetails.direction}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono uppercase text-slate-400 border-t border-slate-800 pt-2.5">
                          <span>Leverage Multiplier:</span>
                          <span className="text-white font-bold">{selectedPost.chartDetails.leverage}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono uppercase text-slate-400">
                          <span>Yield Unrealized PnL:</span>
                          <span className={`font-black ${selectedPost.chartDetails.pnl.includes('-') ? 'text-rose-500' : 'text-emerald-500'}`}>{selectedPost.chartDetails.pnl}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPost.chartType === 'trump' && (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 text-left">
                      <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Senate Resolution Reference</p>
                      <blockquote className="border-l-2 border-amber-500 pl-3.5 text-slate-200 italic text-sm font-serif leading-relaxed">
                        "{selectedPost.chartDetails.quote}"
                      </blockquote>
                      <p className="text-[10px] text-slate-500 font-mono mt-2">{selectedPost.chartDetails.context}</p>
                    </div>
                  )}

                  {selectedPost.chartType === 'useless' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center font-mono">
                        <span className="text-slate-400">Trading Vol: {selectedPost.chartDetails.vol24h}</span>
                        <span className="text-emerald-400 font-bold">Price Index: {selectedPost.chartDetails.price}</span>
                      </div>
                      <div className="h-32 w-full">
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <path 
                            d="M 0 38 L 20 30 L 40 32 L 60 25 L 80 18 L 100 8" 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="3.5" 
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  {selectedPost.chartType === 'long_short' && (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex justify-between font-mono text-xs">
                        <span className="text-rose-400">Short Accounts: 62%</span>
                        <span className="text-emerald-400">Long Accounts: 38%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <div className="h-full bg-rose-500" style={{ width: '62%' }}></div>
                        <div className="h-full bg-emerald-500" style={{ width: '38%' }}></div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono uppercase text-center mt-2">{selectedPost.chartDetails.status}</p>
                    </div>
                  )}

                </div>

                {/* Badges footer */}
                <div className="flex flex-wrap gap-2">
                  {selectedPost.badges.map((b, idx) => (
                    <span 
                      key={idx}
                      className={`text-xs font-mono font-black px-3.5 py-1 rounded-full border ${
                        b.change >= 0 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {b.label}: {b.change >= 0 ? '+' : ''}{b.change}%
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-slate-500 text-xs font-mono pt-4 border-t border-slate-900">
                  <span>Views: {selectedPost.metrics.views}</span>
                  <span>Likes: {selectedPost.metrics.likes}</span>
                  <span>Reposts: {selectedPost.metrics.reposts}</span>
                  <span>Comments: {selectedPost.metrics.comments}</span>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
