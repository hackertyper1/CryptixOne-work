import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Shield, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatIndianCurrency } from '../data';

export default function LiveMarketChart() {
  const [activeSubTab, setActiveSubTab] = useState<'Trending' | 'Perps' | 'Securities'>('Trending');
  const [marketData, setMarketData] = useState<any[]>([]);

  const trendingData = [
    { symbol: 'BTC/INR', price: 5420102, change: +2.4, volume: '2.4B', trend: 'up' },
    { symbol: 'ETH/INR', price: 210200, change: -1.2, volume: '1.1B', trend: 'down' },
    { symbol: 'SOL/INR', price: 12400, change: +5.8, volume: '800M', trend: 'up' },
    { symbol: 'PEPE/INR', price: 0.00082, change: +12.4, volume: '400M', trend: 'up' },
  ];

  const perpsData = [
    { symbol: 'BTC-PERP', price: 64201, change: +0.4, funding: '0.01%', trend: 'up' },
    { symbol: 'ETH-PERP', price: 2402, change: -0.2, funding: '0.005%', trend: 'down' },
    { symbol: 'XRP-PERP', price: 0.52, change: +1.8, funding: '0.02%', trend: 'up' },
  ];

  const securitiesData = [
    { symbol: 'Reliance', price: 2940, change: +0.8, cap: '19.8T', trend: 'up' },
    { symbol: 'HDFC Bank', price: 1650, change: -0.4, cap: '12.5T', trend: 'down' },
    { symbol: 'TCS', price: 3820, change: +1.2, cap: '14.1T', trend: 'up' },
  ];

  useEffect(() => {
    const data = activeSubTab === 'Trending' ? trendingData : activeSubTab === 'Perps' ? perpsData : securitiesData;
    setMarketData(data);
  }, [activeSubTab]);

  return (
    <div className="bg-[#0b101f] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl animate-fadeIn">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800/50">
        {(['Trending', 'Perps', 'Securities'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeSubTab === tab 
                ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Live Chart Placeholder / Design */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">Live Execution Engine</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-mono text-emerald-500 uppercase font-black">Secure Node</span>
          </div>
        </div>

        <div className="space-y-3">
          {marketData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800/50 rounded-xl hover:border-slate-700/50 transition-all group">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {item.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">{item.symbol}</h4>
                  <p className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-widest">
                    {activeSubTab === 'Trending' ? `Vol: ${item.volume}` : activeSubTab === 'Perps' ? `Fund: ${item.funding}` : `Cap: ${item.cap}`}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-mono font-black text-white">
                  {activeSubTab === 'Securities' || activeSubTab === 'Trending' ? `₹${item.price.toLocaleString()}` : `$${item.price.toLocaleString()}`}
                </p>
                <p className={`text-[9px] font-black ${item.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.trend === 'up' ? '+' : ''}{item.change}%
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-3 h-3 text-amber-500" />
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Institutional Yield Audit</span>
            </div>
            <span className="text-[9px] font-mono text-amber-500 font-bold">VERIFIED-HFT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
