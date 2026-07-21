import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const ASSETS = [
  { name: 'Jimothy', symbol: 'JIM', price: 0.01507, change: -7.49, volume: '1.31M' },
  { name: 'ANSEM', symbol: 'ANSEM', price: 0.21153, change: -7.49, volume: '932.01K' },
  { name: 'PUMP', symbol: 'PUMP', price: 0.0020099, change: -7.49, volume: '932.01K' },
];

export default function MarketAssetList() {
  const [activeTab, setActiveTab] = useState('Trending');

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
            {ASSETS.map((asset, i) => (
              <div 
                key={asset.symbol}
                className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800/50 rounded-xl hover:border-slate-700/50 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700/50 group-hover:border-amber-500/30 transition-all">
                    <span className="text-[10px] font-black text-amber-500/80">{asset.symbol[0]}</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white leading-none">{asset.name}</div>
                    <div className="text-[8px] text-slate-500 font-mono mt-0.5 tracking-tighter uppercase">{asset.volume}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-white font-mono tracking-tighter">{asset.price}</div>
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
