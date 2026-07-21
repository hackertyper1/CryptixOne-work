import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, Search, Globe, Award, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface Trader {
  rank: number;
  name: string;
  profit: number;
  country: string;
  flag: string;
}

const TOP_TRADERS_DATA: Trader[] = [
  { rank: 1, name: 'Vikram Singhania', profit: 512402.80, country: 'India', flag: '🇮🇳' },
  { rank: 2, name: 'IDX.PRO', profit: 402785.06, country: 'Chile', flag: '🇨🇱' },
  { rank: 3, name: 'GANANDOO', profit: 250768.34, country: 'Argentina', flag: '🇦🇷' },
  { rank: 4, name: 'JULIAN_TRADER', profit: 151621.90, country: 'Argentina', flag: '🇦🇷' },
  { rank: 5, name: 'Aaditrader', profit: 117466.39, country: 'Nigeria', flag: '🇳🇬' },
  { rank: 6, name: 'TraderBhai', profit: 108221.31, country: 'India', flag: '🇮🇳' },
  { rank: 7, name: 'SONIKATRADER', profit: 55705.80, country: 'India', flag: '🇮🇳' },
  { rank: 8, name: 'BINOMO_TAMIL', profit: 34196.42, country: 'India', flag: '🇮🇳' },
  { rank: 9, name: 'MariaMorales', profit: 25550.00, country: 'Colombia', flag: '🇨🇴' },
  { rank: 10, name: 'TRADINGSHZADI', profit: 22885.64, country: 'India', flag: '🇮🇳' },
  { rank: 11, name: 'Trading_Man', profit: 22658.38, country: 'India', flag: '🇮🇳' },
  { rank: 12, name: 'Melody_Trading', profit: 21370.00, country: 'Colombia', flag: '🇨🇴' },
  { rank: 13, name: 'GIAPROFIT', profit: 19999.00, country: 'Colombia', flag: '🇨🇴' },
  { rank: 14, name: 'Tradinghub9729', profit: 13533.80, country: 'India', flag: '🇮🇳' },
];

export default function TopTradersView({ currentUser, onBack }: { currentUser: User | null, onBack: () => void }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-[#070b15] min-h-screen text-slate-200 font-sans"
    >
      {/* Header */}
      <div className="bg-[#0b101f] border-b border-slate-800 p-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">Top traders</h2>
        </div>
        <div className="flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400" />
          <div className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center">
            <Globe className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Your Daily Profit Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest text-left">Your daily profit</h3>
          <div className="bg-[#121620] border border-slate-800/50 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-inner">
                <span className="text-xl">🇮🇳</span>
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-black text-slate-300 font-mono tracking-tight uppercase">
                    {currentUser?.slCode || 'NOT_ASSIGNED'}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-lg font-black text-[#f0b90b] font-mono">$0.00</span>
          </div>
        </div>

        {/* Binomo top 20 Section */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-end">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Binomo top 20</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Updated at {formattedTime}
            </span>
          </div>

          <div className="bg-[#0b101f] border border-slate-800/40 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex justify-between px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50 bg-slate-900/20">
              <span>Ranking</span>
              <span>Daily profit</span>
            </div>

            <div className="divide-y divide-slate-800/30">
              {TOP_TRADERS_DATA.map((trader) => (
                <div key={trader.rank} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className="w-7 text-center">
                      {trader.rank <= 3 ? (
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shadow-inner ${
                          trader.rank === 1 ? 'bg-[#f0b90b] text-[#070b15]' :
                          trader.rank === 2 ? 'bg-slate-300 text-slate-900' :
                          'bg-amber-700/80 text-white'
                        }`}>
                          {trader.rank}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-500">{trader.rank}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-lg overflow-hidden">
                        {trader.flag}
                      </div>
                      <div className="flex flex-col text-left">
                        <div className="flex items-center space-x-1.5">
                           <Globe className="w-3 h-3 text-slate-500" />
                           <span className="text-[11px] font-black text-white tracking-tight uppercase group-hover:text-[#f0b90b] transition-colors">{trader.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-black text-slate-100 font-mono">
                      ${trader.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Support Footer */}
        <div className="pt-8 pb-12 text-center space-y-3 opacity-40">
           <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">Institutional Verification Handshake v4.2</p>
           <div className="h-0.5 w-12 bg-slate-800 mx-auto rounded-full"></div>
        </div>
      </div>
    </motion.div>
  );
}
