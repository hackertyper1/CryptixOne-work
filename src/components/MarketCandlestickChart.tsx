import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export interface CandlestickData {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
}

interface MarketCandlestickChartProps {
  data: CandlestickData[];
}

const MarketCandlestickChart: React.FC<MarketCandlestickChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      // Range for the wick
      wick: [d.low, d.high],
      // Range for the body
      body: [d.open, d.close],
      color: d.close >= d.open ? '#10b981' : '#ef4444', // emerald-500 : rose-500
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] text-slate-500 font-mono mb-2 uppercase font-black">{d.time}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-[10px] text-slate-400">Open:</span>
            <span className="text-[10px] text-white font-mono">{d.open.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400">High:</span>
            <span className="text-[10px] text-white font-mono">{d.high.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400">Low:</span>
            <span className="text-[10px] text-white font-mono">{d.low.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400">Close:</span>
            <span className="text-[10px] text-white font-mono font-bold">{d.close.toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-slate-900/20 rounded-xl border border-slate-800">
        <span className="text-slate-500 text-xs font-mono">No market data available</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10 }}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            orientation="right"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickFormatter={(val) => {
              if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
              return val.toString();
            }}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '3 3' }} 
          />
          
          {/* Wick */}
          <Bar dataKey="wick" barSize={1} isAnimationActive={false}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-wick-${index}`} fill={entry.color} />
            ))}
          </Bar>
          
          {/* Body */}
          <Bar dataKey="body" barSize={8} isAnimationActive={false}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-body-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketCandlestickChart;
