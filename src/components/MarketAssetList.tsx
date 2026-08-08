import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Asset {
  name: string;
  symbol: string;
  price: number | string;
  change: number;
  volume: string;
  label?: string;
  extra?: string;
}

interface MarketAssetListProps {
  onSelectAsset?: (asset: Asset) => void;
}

const TRENDING_ASSETS: Asset[] = [
  { name: 'Bitcoin', symbol: 'BTC/USDT', price: 94120.00, change: 1.45, volume: '4.1B', label: 'Bitcoin', extra: '4,102,401.90' },
  { name: 'Ethereum', symbol: 'ETH/USDT', price: 3420.00, change: 2.10, volume: '2.9B', label: 'Ethereum', extra: '2,903,412.10' },
  { name: 'Solana', symbol: 'SOL/USDT', price: 165.20, change: 5.67, volume: '1.5B', label: 'Solana', extra: '1,500,412.50' },
  { name: 'Dogecoin', symbol: 'DOGE/USDT', price: 0.14, change: -2.34, volume: '900M', label: 'Dogecoin', extra: '900,412.10' },
];

const PERPS_ASSETS: Asset[] = [
  { name: 'BTC Perp', symbol: 'BTC-PERP', price: 94150.00, change: 1.52, volume: '12.4B', label: 'Bitcoin Perp', extra: '12.4B Vol' },
  { name: 'ETH Perp', symbol: 'ETH-PERP', price: 3425.00, change: 2.15, volume: '8.2B', label: 'Ethereum Perp', extra: '8.2B Vol' },
  { name: 'SOL Perp', symbol: 'SOL-PERP', price: 165.45, change: 5.82, volume: '3.1B', label: 'Solana Perp', extra: '3.1B Vol' },
];

const SECURITIES_ASSETS: Asset[] = [
  { name: 'Apple Inc.', symbol: 'AAPL', price: 324.25, change: -2.80, volume: '357K', label: 'Apple Inc.', extra: '$357k Vol' },
  { name: 'Nvidia Corp.', symbol: 'NVDA', price: 203.95, change: 0.59, volume: '13M', label: 'Nvidia Corp.', extra: '$13.35M Vol' },
  { name: 'Tesla Inc.', symbol: 'TSLA', price: 372.85, change: -2.33, volume: '433K', label: 'Tesla Inc.', extra: '$433.7k Vol' },
];

export default function MarketAssetList({ onSelectAsset }: MarketAssetListProps) {
  const [activeTab, setActiveTab] = useState(() => {
    const stored = localStorage.getItem('market_asset_list_active_tab');
    return stored || 'Trending';
  });

  useEffect(() => {
    localStorage.setItem('market_asset_list_active_tab', activeTab);
  }, [activeTab]);

  const getAssets = () => {
    switch (activeTab) {
      case 'Perps': return PERPS_ASSETS;
      case 'Securities': return SECURITIES_ASSETS;
      default: return TRENDING_ASSETS;
    }
  };

  const assets = getAssets();

  return (
    <div className="bg-[#0b101f] border border-white/5 rounded-[1.5rem] overflow-hidden shadow-2xl">
      <div className="flex border-b border-slate-800/50 bg-[#050914]/50">
        {['Trending', 'Perps', 'Securities'].map(tab => (
          <button 
            key={tab} 
            className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="p-3 space-y-2">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {assets.map((asset) => (
              <div 
                key={asset.symbol}
                onClick={() => onSelectAsset?.(asset)}
                className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800/50 rounded-xl hover:border-amber-500/30 transition-all group cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700/50 group-hover:border-amber-500/50 transition-all">
                    <span className="text-[10px] font-black text-amber-500/80">{asset.symbol[0]}</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white leading-none">{asset.name}</div>
                    <div className="text-[8px] text-slate-500 font-mono mt-0.5 tracking-tighter uppercase">{asset.volume}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-white font-mono tracking-tighter">
                    {typeof asset.price === 'number' ? asset.price.toLocaleString() : asset.price}
                  </div>
                  <div className={`text-[9px] font-bold ${asset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {asset.change >= 0 ? '+' : ''}{asset.change}%
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

