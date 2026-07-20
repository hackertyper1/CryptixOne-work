import { InvestmentPlan, StockTicker, SystemSettings } from './types';

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  // Category A: Today's Investment Slots
  { id: 't1', amount: 1000, duration: '1 Hour', estimatedProfit: 14999, category: 'Today', badge: 'Hot Deal' },
  { id: 't2', amount: 2499, duration: '1 Hour', estimatedProfit: 29999, category: 'Today', badge: 'Popular' },
  { id: 't3', amount: 5000, duration: '1 Hour', estimatedProfit: 45499, category: 'Today', badge: 'Super Yield' },

  // Category B: Small Investment Slots
  { id: 's1', amount: 1499, duration: '1 Hour', estimatedProfit: 17999, category: 'Small' },
  { id: 's2', amount: 2999, duration: '1 Hour', estimatedProfit: 38473, category: 'Small' },
  { id: 's3', amount: 6999, duration: '1 Hour', estimatedProfit: 79249, category: 'Small' },

  // Category C: Elite Investment Slots (VIP Gold borders/badges)
  { id: 'e1', amount: 10000, duration: '1 Hour', estimatedProfit: 138000, category: 'Elite', badge: 'High Yield', isVip: true },
  { id: 'e2', amount: 24999, duration: '1 Hour', estimatedProfit: 385279, category: 'Elite', badge: 'Elite Circle', isVip: true },
  { id: 'e3', amount: 49499, duration: '1 Hour', estimatedProfit: 850689, category: 'Elite', badge: 'Platinum Pro', isVip: true },

  // Category D: Premium Investment Slots (VIP Diamond/Gold borders/badges)
  { id: 'p1', amount: 100000, duration: '1 Hour', estimatedProfit: 1647696, category: 'Premium', badge: 'VIP Wealth', isVip: true },
  { id: 'p2', amount: 237975, duration: '1 Hour', estimatedProfit: 4257752, category: 'Premium', badge: 'Supreme Gold', isVip: true },
  { id: 'p3', amount: 500865, duration: '1 Hour', estimatedProfit: 7020757, category: 'Premium', badge: 'Imperial VIP', isVip: true }
];

export const INITIAL_TICKERS: StockTicker[] = [
  { symbol: 'SBI-IN', name: 'State Bank of India', price: 843.50, change: 1.45, trend: 'up', logo: 'https://logo.clearbit.com/sbi.co.in' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2452.10, change: -0.65, trend: 'down', logo: 'https://logo.clearbit.com/ril.com' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3824.75, change: 2.10, trend: 'up', logo: 'https://logo.clearbit.com/tcs.com' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1642.30, change: 0.85, trend: 'up', logo: 'https://logo.clearbit.com/hdfcbank.com' },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 1489.15, change: -1.20, trend: 'down', logo: 'https://logo.clearbit.com/infosys.com' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1124.90, change: 1.95, trend: 'up', logo: 'https://logo.clearbit.com/icicibank.com' },
  { symbol: 'NIFTY 50', name: 'Nifty Index', price: 23512.40, change: 0.72, trend: 'up', logo: 'https://logo.clearbit.com/nseindia.com' },
  { symbol: 'SENSEX', name: 'BSE Sensex', price: 77215.10, change: 0.68, trend: 'up', logo: 'https://logo.clearbit.com/bseindia.com' },
  { symbol: 'BTC-INR', name: 'Bitcoin', price: 5412980, change: 3.42, trend: 'up', logo: 'https://logo.clearbit.com/bitcoin.org' },
  { symbol: 'ETH-INR', name: 'Ethereum', price: 284150, change: -1.15, trend: 'down', logo: 'https://logo.clearbit.com/ethereum.org' },
  { symbol: 'SOL-INR', name: 'Solana', price: 14500, change: 5.67, trend: 'up', logo: 'https://logo.clearbit.com/solana.com' },
  { symbol: 'DOGE-INR', name: 'Dogecoin', price: 12.45, change: -2.34, trend: 'down', logo: 'https://logo.clearbit.com/dogecoin.com' },
  { symbol: 'ADA-INR', name: 'Cardano', price: 38.20, change: 0.98, trend: 'up', logo: 'https://logo.clearbit.com/cardano.org' },
  { symbol: 'XRP-INR', name: 'XRP', price: 55.60, change: -0.45, trend: 'down', logo: 'https://logo.clearbit.com/ripple.com' },
  // Adding more stocks to reach 140+
  ...Array.from({ length: 130 }, (_, i) => ({
    symbol: `STK${i + 1}`,
    name: `Company ${i + 15}`,
    price: Math.random() * 1000 + 100,
    change: Math.random() * 10 - 5,
    trend: (Math.random() > 0.5 ? 'up' : 'down') as 'up' | 'down',
    logo: `https://logo.clearbit.com/example${i + 15}.com`
  }))
];

export const DEFAULT_SETTINGS: SystemSettings = {
  qrCodeUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600', // high quality placeholder or generated visual
  upiId: 'cryptixone.sbi@ybl',
  supportWhatsApp: '8696860548',
  supportPhone: '8696860548',
  companyEmail: 'support@CryptixOne.com',
  scannerUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
  qrCodeImage: ''
};

// Simulated encryption helper (just base64 encoding with salt + standard AES mock string for visual representation)
export function encryptPayload(payload: object): string {
  const str = JSON.stringify(payload);
  const encoded = btoa(unescape(encodeURIComponent(str)));
  return `AES-256-GCM::${encoded.slice(0, 15)}...${encoded.slice(-15)}`;
}

export function formatIndianCurrency(num: number): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
  return formatter.format(num);
}
