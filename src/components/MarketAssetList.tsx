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
    <div className="p-4 bg-bg-secondary rounded-t-3xl">
      <div className="flex space-x-6 mb-4 text-text-secondary">
        {['Trending', 'Perps', 'Securities'].map(tab => (
          <button 
            key={tab} 
            className={`font-bold ${activeTab === tab ? 'text-text-primary border-b-2 border-accent' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="space-y-4">
        <AnimatePresence>
          {ASSETS.map((asset, i) => (
            <motion.div 
              key={asset.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-3 bg-bg-card rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-full" />
                <div>
                  <div className="font-bold text-text-primary">{asset.name}</div>
                  <div className="text-xs text-text-secondary">{asset.volume}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-text-primary">{asset.price}</div>
                <div className={`text-xs ${asset.change >= 0 ? 'text-buy' : 'text-sell'}`}>
                  {asset.change}%
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
