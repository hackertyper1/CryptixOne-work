import React from 'react';
import { 
  BookOpen, 
  Target, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Clock, 
  LineChart,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function EducationSection() {
  const strategies = [
    {
      title: "Fundamental Intelligence",
      icon: <Target className="w-5 h-5 text-amber-500" />,
      description: "Analyze macro-economic catalysts and sovereign policy shifts to identify high-probability directional trends.",
      points: ["Economic Indicator Correlation", "Interest Rate Trajectory Analysis", "Geopolitical Impact Assessment"]
    },
    {
      title: "Technical Precision",
      icon: <LineChart className="w-5 h-5 text-amber-500" />,
      description: "Utilize algorithmic price action patterns and institutional volume profiles to determine optimal entry vectors.",
      points: ["High-Frequency Volume Analysis", "Multi-Timeframe Trend Confluence", "Sovereign Liquidity Zones"]
    },
    {
      title: "Intraday Allocations",
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      description: "Execute high-velocity short-term contracts designed for rapid capital turnover and daily yield settlement.",
      points: ["Scalping Execution Protocols", "Intraday Momentum Tracking", "Algorithmic Exit Optimization"]
    },
    {
      title: "Risk Mitigation Architecture",
      icon: <ShieldCheck className="w-5 h-5 text-amber-500" />,
      description: "Advanced capital preservation protocols engineered to neutralize volatility and ensure long-term portfolio stability.",
      points: ["Dynamic Position Sizing", "Diversification Algorithms", "Automated Stop-Loss Guardians"]
    }
  ];

  return (
    <section className="space-y-20 py-16" id="trading-intelligence-intelligence">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-3 bg-amber-500/10 text-amber-500 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-amber-500/20">
          <BookOpen className="w-4 h-4" />
          <span>Strategic Trading Intelligence</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter font-sans leading-tight">
          Mastering the <span className="text-amber-500">Institutional</span> <br />
          Capital Markets
        </h2>
        <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
          Our proprietary methodologies bridge the gap between retail trading and sovereign-grade capital management, 
          leveraging advanced analytics to ensure consistent portfolio growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {strategies.map((strategy, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/[0.01] backdrop-blur-sm border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden group hover:bg-white/[0.03] hover:border-amber-500/20 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-[100px] rounded-full -mr-24 -mt-24 group-hover:bg-amber-500/10 transition-colors" />
            
            <div className="space-y-8 relative">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-500">
                {strategy.icon}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-normal text-white font-sans tracking-tight">
                  {strategy.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {strategy.description}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                {strategy.points.map((point, pIdx) => (
                  <div key={pIdx} className="flex items-center text-[10px] text-amber-500 font-black uppercase tracking-[0.2em]">
                    <ArrowRight className="w-3 h-3 mr-3 opacity-40" />
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modern Horizontal Highlight */}
      <div className="bg-black border border-white/5 rounded-[2.5rem] p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
        <div className="space-y-3 text-left relative z-10">
          <h4 className="text-2xl font-bold text-white font-sans tracking-tight">
            Institutional Tooling & Platforms
          </h4>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">
            Direct Access to Global Liquidity Nodes
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center md:justify-end relative z-10">
          {['Real-Time Market Data', 'Automated Trade Alerts', 'Advanced Analytical Dashboards'].map((tool, tIdx) => (
            <div key={tIdx} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] text-white font-black uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-default">
              {tool}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
