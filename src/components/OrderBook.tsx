import React, { useState, useEffect } from 'react';

interface Order {
  type: 'buy' | 'sell';
  price: number;
  size: number;
}

export default function OrderBook({ symbol }: { symbol: string }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Initial generation
    const generateOrders = () => {
      const newOrders: Order[] = [];
      const basePrice = 0.66;
      for (let i = 0; i < 10; i++) {
        newOrders.push({
          type: 'sell',
          price: basePrice + Math.random() * 0.01,
          size: Math.random() * 50
        });
        newOrders.push({
          type: 'buy',
          price: basePrice - Math.random() * 0.01,
          size: Math.random() * 50
        });
      }
      return newOrders.sort((a, b) => b.price - a.price);
    };

    setOrders(generateOrders());

    const interval = setInterval(() => {
      setOrders(generateOrders());
    }, 2000);

    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-4 font-mono text-[10px] h-full">
      <h4 className="text-text-secondary font-black uppercase tracking-widest mb-3">Order Book</h4>
      <div className="space-y-1">
        {orders.map((order, i) => (
          <div key={i} className="flex justify-between items-center px-2 py-0.5 rounded" style={{
            background: order.type === 'buy' ? 'rgba(0, 192, 135, 0.1)' : 'rgba(246, 70, 93, 0.1)'
          }}>
            <span className={order.type === 'buy' ? 'text-buy' : 'text-sell'}>{order.price.toFixed(4)}</span>
            <span className="text-text-primary">{order.size.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
