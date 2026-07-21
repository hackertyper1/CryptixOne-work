import React from 'react';
import { InvestmentPlan, SystemSettings } from '../types';
import { INVESTMENT_PLANS, formatIndianCurrency } from '../data';
import { 
  Flame, 
  TrendingUp, 
  Award, 
  Sparkles 
} from 'lucide-react';

interface PlanSectionProps {
  onInvestSelect: (plan: InvestmentPlan) => void;
  systemSettings: SystemSettings;
}

export default function PlanSection({
  onInvestSelect,
  systemSettings
}: PlanSectionProps) {
  // Group plans by categories
  const todayPlans = INVESTMENT_PLANS.filter(p => p.category === 'Today');
  const smallPlans = INVESTMENT_PLANS.filter(p => p.category === 'Small');
  const elitePlans = INVESTMENT_PLANS.filter(p => p.category === 'Elite');
  const premiumPlans = INVESTMENT_PLANS.filter(p => p.category === 'Premium');

  return (
    <div className="space-y-16 pb-16" id="plan-section-container">
      {/* Strategic Header */}
      <div className="text-center space-y-4 pt-8" id="plan-section-header">
        <h3 className="text-[28px] font-bold text-white text-center font-sans">
          Strategic Capital Allocation
        </h3>
        <p className="text-slate-400 text-base max-w-2xl mx-auto">
          Choose from institutional-grade portfolios engineered for consistent capital growth.
        </p>
      </div>

      {/* Main Slots Section */}
      <section className="space-y-16" id="plan-slots-grid">
        
        {/* Category A: Today's Slots */}
        <div className="space-y-10" id="category-today-slots">
          <div className="flex items-center space-x-5 text-left">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="text-[18px] leading-[23px] font-bold text-white text-left font-sans">Category A: High-Velocity Entry Allocations</h4>
              <p className="text-sm text-slate-500 font-medium">Exclusive short-term contracts optimized for immediate capital turnover.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {todayPlans.map((plan, index) => {
              const isBullish = index % 2 === 0;
              const colorClass = isBullish ? 'emerald' : 'rose';
              const strokeColor = isBullish ? '#10b981' : '#f43f5e';
              const gradientId = `gradient-${plan.id}`;
              
              return (
                <div 
                  key={plan.id}
                  className={`bg-[#0b1222]/40 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between transition-all hover:bg-[#0b1222]/60 hover:border-${colorClass}-500/30 group relative overflow-hidden`}
                >
                  {/* Miniature Trading Chart Visual */}
                  <div className="absolute bottom-0 right-0 w-32 h-20 opacity-10 pointer-events-none group-hover:opacity-25 transition-opacity">
                    <svg viewBox="0 0 100 40" className="w-full h-full">
                      <path 
                        d={isBullish ? "M0 30 Q 20 25, 40 30 T 70 15 T 100 5" : "M0 10 Q 20 15, 40 10 T 70 25 T 100 35"} 
                        fill="none" 
                        stroke={strokeColor} 
                        strokeWidth="2" 
                        className="animate-pulse"
                      />
                      <path 
                        d={isBullish ? "M0 30 Q 20 25, 40 30 T 70 15 T 100 5 V 40 H 0 Z" : "M0 10 Q 20 15, 40 10 T 70 25 T 100 35 V 40 H 0 Z"} 
                        fill={`url(#${gradientId})`} 
                        opacity="0.2"
                      />
                      <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.5" />
                          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">1-Hour Contract</span>
                      {plan.badge && (
                        <span className={`bg-${colorClass}-500/10 text-${colorClass}-400 text-[9px] font-black px-2 py-1 rounded border border-${colorClass}-500/20 uppercase tracking-tighter`}>
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <h5 className="text-4xl font-black text-white font-display">
                      {formatIndianCurrency(plan.amount)}
                    </h5>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                        <span className="text-xs text-slate-500 font-medium">Contract Duration:</span>
                        <span className="text-xs font-bold text-white">1 Hour</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                        <span className="text-xs text-slate-500 font-medium">Estimated Profit:</span>
                        <span className={`text-xs font-bold text-${colorClass}-400`}>+{formatIndianCurrency(plan.estimatedProfit)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onInvestSelect(plan)}
                    className={`w-full mt-10 bg-[#0d1425] border border-slate-800 hover:bg-${colorClass}-500 hover:text-white hover:border-${colorClass}-500 text-slate-300 font-bold py-3.5 px-6 text-xs rounded-xl transition-all uppercase tracking-widest`}
                  >
                    Invest Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category B: Small Slots */}
        <div className="space-y-10" id="category-small-slots">
          <div className="flex items-center space-x-5 text-left">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <TrendingUp className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <h4 className="text-[18px] leading-[23px] font-bold text-white text-left font-sans">Category B: Retail Growth Portfolios</h4>
              <p className="text-sm text-slate-500 font-medium">Micro-allocation structures designed for steady capital appreciation.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {smallPlans.map((plan, index) => {
              const gradientId = `amberGradient${index}`;
              return (
                <div 
                  key={plan.id}
                  className="bg-[#0b1222]/40 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between transition-all hover:bg-[#0b1222]/60 hover:border-amber-500/30 group relative overflow-hidden"
                >
                  {/* Miniature Trading Chart Visual */}
                  <div className="absolute bottom-0 right-0 w-32 h-20 opacity-10 pointer-events-none group-hover:opacity-25 transition-opacity transform -scale-x-100">
                    <svg viewBox="0 0 100 40" className="w-full h-full">
                      <path 
                        d="M0 35 Q 25 30, 45 35 T 75 20 T 100 15" 
                        fill="none" 
                        stroke="#f59e0b" 
                        strokeWidth="2" 
                        className="animate-pulse"
                      />
                      <path 
                        d="M0 35 Q 25 30, 45 35 T 75 20 T 100 15 L 100 40 L 0 40 Z" 
                        fill={`url(#${gradientId})`} 
                        opacity="0.2"
                      />
                      <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">1-Hour Contract</span>
                      {plan.badge && (
                        <span className="bg-amber-500/10 text-amber-400 text-[9px] font-black px-2 py-1 rounded border border-amber-500/20 uppercase tracking-tighter">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <h5 className="text-4xl font-black text-white font-display">
                      {formatIndianCurrency(plan.amount)}
                    </h5>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                        <span className="text-xs text-slate-500 font-medium">Contract Duration:</span>
                        <span className="text-xs font-bold text-white">1 Hour</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                        <span className="text-xs text-slate-500 font-medium">Estimated Profit:</span>
                        <span className="text-xs font-bold text-amber-400">+{formatIndianCurrency(plan.estimatedProfit)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onInvestSelect(plan)}
                    className="w-full mt-10 bg-[#0d1425] border border-slate-800 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 text-slate-300 font-bold py-3.5 px-6 text-xs rounded-xl transition-all uppercase tracking-widest"
                  >
                    Invest Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Elite & Premium Tiers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8" id="high-tier-sections">
          {/* Category C: Elite */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4 border-l-4 border-yellow-500 pl-4">
              <Award className="w-6 h-6 text-yellow-500" />
              <h4 className="text-xl font-black text-white uppercase tracking-tight font-display">Elite Tier Allocations</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {elitePlans.slice(0, 2).map(plan => (
                <div key={plan.id} className="bg-[#15120d]/50 border border-yellow-500/20 rounded-3xl p-6 flex flex-col justify-between hover:bg-[#15120d]/80 transition-all relative overflow-hidden group">
                  {/* Miniature Trading Chart Visual */}
                  <div className="absolute bottom-0 right-0 w-32 h-20 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
                    <svg viewBox="0 0 100 40" className="w-full h-full">
                      <path 
                        d="M0 35 Q 25 35, 35 25 T 55 20 T 75 10 T 100 5" 
                        fill="none" 
                        stroke="#eab308" 
                        strokeWidth="2" 
                        className="animate-pulse"
                      />
                      <path 
                        d="M0 35 Q 25 35, 35 25 T 55 20 T 75 10 T 100 5 L 100 40 L 0 40 Z" 
                        fill="url(#goldGradient)" 
                        opacity="0.3"
                      />
                      <defs>
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#eab308" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest">VIP Contract</span>
                        <span className="text-[8px] text-slate-500 font-medium">HIGH-GROWTH ASSET</span>
                      </div>
                      {plan.badge && <span className="bg-yellow-500/10 text-yellow-500 text-[8px] font-black px-2 py-0.5 rounded border border-yellow-500/20 uppercase">{plan.badge}</span>}
                    </div>
                    <h5 className="text-3xl font-black text-white font-display">{formatIndianCurrency(plan.amount)}</h5>
                    <div className="flex justify-between items-center border-t border-yellow-500/10 pt-4">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Est. Return</span>
                      <span className="text-sm font-black text-emerald-400">+{formatIndianCurrency(plan.estimatedProfit)}</span>
                    </div>
                  </div>
                  <button onClick={() => onInvestSelect(plan)} className="w-full mt-6 bg-yellow-500 text-slate-950 font-black py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] relative z-10 shadow-lg shadow-yellow-500/20 hover:scale-[1.02] transition-transform">Execute (VIP)</button>
                </div>
              ))}
            </div>
          </div>

          {/* Category D: Premium */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4 border-l-4 border-emerald-500 pl-4">
              <Sparkles className="w-6 h-6 text-emerald-500" />
              <h4 className="text-xl font-black text-white uppercase tracking-tight font-display">Institutional Portfolios</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {premiumPlans.slice(0, 2).map(plan => (
                <div key={plan.id} className="bg-[#0b1222]/50 border border-emerald-500/20 rounded-3xl p-6 flex flex-col justify-between hover:bg-[#0b1222]/80 transition-all relative overflow-hidden group">
                  {/* Miniature Trading Chart Visual */}
                  <div className="absolute bottom-0 left-0 w-32 h-20 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity transform -scale-x-100">
                    <svg viewBox="0 0 100 40" className="w-full h-full">
                      <path 
                        d="M0 35 Q 20 30, 30 35 T 50 20 T 70 15 T 100 10" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="2" 
                        className="animate-pulse"
                      />
                      <path 
                        d="M0 35 Q 20 30, 30 35 T 50 20 T 70 15 T 100 10 L 100 40 L 0 40 Z" 
                        fill="url(#emeraldGradient)" 
                        opacity="0.3"
                      />
                      <defs>
                        <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">HNI Global</span>
                        <span className="text-[8px] text-slate-500 font-medium">INSTITUTIONAL GRADE</span>
                      </div>
                      {plan.badge && <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2 py-0.5 rounded border border-emerald-500/20 uppercase">{plan.badge}</span>}
                    </div>
                    <h5 className="text-3xl font-black text-white font-display">{formatIndianCurrency(plan.amount)}</h5>
                    <div className="flex justify-between items-center border-t border-emerald-500/10 pt-4">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Est. Return</span>
                      <span className="text-sm font-black text-emerald-400">+{formatIndianCurrency(plan.estimatedProfit)}</span>
                    </div>
                  </div>
                  <button onClick={() => onInvestSelect(plan)} className="w-full mt-6 bg-emerald-500 text-slate-950 font-black py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] relative z-10 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">Secure Allocation</button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
