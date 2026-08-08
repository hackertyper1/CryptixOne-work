import React, { useState, useEffect, useMemo } from 'react';
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
  Maximize2,
  RefreshCcw,
  LayoutGrid,
  List,
  Zap,
  ShieldCheck,
  Globe,
  Flame,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PostInput from './PostInput';
import PostFeed from './PostFeed';
import MarketCandlestickChart from './MarketCandlestickChart';
import { Post, User, SystemSettings } from '../types';
import { formatIndianCurrency } from '../data';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, orderBy } from 'firebase/firestore';

interface ExploreSectionProps {
  currentUser: User | null;
  onUpdateWallet: (depositChange: number, profitChange: number) => void;
  addLog: (action: string, username: string) => void;
  systemSettings: SystemSettings;
}

interface SocialPost {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
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
  }
];

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
  { id: 'news-4', time: '28 mins ago', tag: 'BLOCKCHAIN', title: 'Hana Network achieves record-breaking 120,000 TPS under stress testing for cross-border settles.', impact: 'Bullish', symbol: 'HANA', source: 'TechCrunch' }
];

export default function ExploreSection({ currentUser, onUpdateWallet, addLog, systemSettings }: ExploreSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'analyse' | 'research'>('analyse');
  const [shuffledPosts, setShuffledPosts] = useState<SocialPost[]>([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    setShuffledPosts([...FEED_POSTS].sort(() => Math.random() - 0.5));
    const interval = setInterval(() => {
      setCurrentNewsIndex(prev => (prev + 1) % LIVE_NEWS_ITEMS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-widest">Global Explorer</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight font-geist">Explore Global Markets</h1>
          <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
            Real-time market insights, social sentiment analysis, and professional-grade research tools at your fingertips.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-4 border-b border-slate-800 pb-px">
        {(['analyse', 'research'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${
              activeSubTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'analyse' ? 'Market Analyse' : 'Market Research'}
            {activeSubTab === tab && (
              <motion.div layoutId="explore-tab-bar" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f0b90b]" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'analyse' ? (
          <motion.div
            key="analyse"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              <PostInput currentUser={currentUser} onPostSubmit={() => {}} />
              <div className="space-y-4">
                {shuffledPosts.map(post => (
                  <div key={post.id} className="bg-[#121212] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${post.author.avatar} rounded-xl flex items-center justify-center font-bold text-white uppercase`}>
                          {post.author.avatarChar}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-black text-white">{post.author.name}</span>
                            {post.author.verified && <CheckCircle className="w-3 h-3 text-amber-500" />}
                          </div>
                          <span className="text-[10px] text-slate-500">@{post.author.username} • {post.time}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        post.sentiment === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {post.sentiment}
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{post.content}</p>
                    <div className="flex items-center space-x-6 pt-4 border-t border-slate-900">
                      <button className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-xs font-bold">{post.metrics.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs font-bold">{post.metrics.comments}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors">
                        <Repeat className="w-4 h-4" />
                        <span className="text-xs font-bold">{post.metrics.reposts}</span>
                      </button>
                      <div className="flex items-center space-x-2 text-slate-500 ml-auto">
                        <BarChart2 className="w-4 h-4" />
                        <span className="text-xs font-bold">{post.metrics.views}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#121212] border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Live News Feed</h3>
                <div className="space-y-4">
                  {LIVE_NEWS_ITEMS.map((news, idx) => (
                    <div key={news.id} className={`p-4 rounded-2xl border transition-all ${idx === currentNewsIndex ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/50 border-slate-800'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase">{news.tag}</span>
                        <span className="text-[10px] font-mono text-slate-600">{news.time}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-2 leading-relaxed">{news.title}</h4>
                      <div className="flex justify-between items-center">
                        <span className={`text-[9px] font-black uppercase ${news.impact.includes('Bullish') ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {news.impact}
                        </span>
                        <span className="text-[9px] text-slate-600 font-mono">{news.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="research"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
               <MarketCandlestickChart symbol="BTC/INR" data={[]} />
            </div>
            <div className="space-y-6">
              <div className="bg-[#121212] border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Trending Assets</h3>
                <div className="space-y-3">
                  {['BTC/INR', 'ETH/INR', 'SOL/INR', 'TATAMOTORS', 'RELIANCE'].map(symbol => (
                    <div key={symbol} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer border border-transparent hover:border-slate-800">
                      <span className="text-xs font-bold text-white font-mono">{symbol}</span>
                      <span className="text-xs font-bold text-emerald-400">+2.45%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
