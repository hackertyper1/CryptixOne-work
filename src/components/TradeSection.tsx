import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Coins, 
  Infinity as InfinityIcon, 
  Info, 
  Wallet, 
  Bell, 
  ChevronDown, 
  ArrowLeft, 
  ArrowDown, 
  ArrowUp,
  Search,
  Star,
  ChevronRight,
  PieChart,
  TrendingUp,
  Sliders,
  Copy,
  X,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { User, ActiveTrade, SystemSettings } from '../types';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, limit, doc, updateDoc } from 'firebase/firestore';

interface TradeSectionProps {
  activeTrades: ActiveTrade[];
  isLoggedIn: boolean;
  currentUser: User | null;
  onExecuteTrade?: (amount: number, estimatedProfit: number, assetName: string, durationLabel: string) => void;
  onNavigateToWallet?: (subTab?: 'deposit' | 'withdraw' | 'history') => void;
  onNavigateToHome?: () => void;
  onInvestSelect?: (plan: any) => void;
  systemSettings: SystemSettings;
  onChangeTab?: (tab: string) => void;
  isDemoMode: boolean;
  setIsDemoMode: (isDemo: boolean) => void;
}

type InternalTab = 'home' | 'defi' | 'futures' | 'info';

const DEFI_DATA = [
  // DeFi Tokens
  { symbol: 'LISTA', name: 'Lista', price: 0.0563, change: 3.87, vol: '1.2M', category: 'defi' },
  { symbol: 'BEL', name: 'Bella Protocol', price: 0.1056, change: 3.63, vol: '890K', category: 'defi' },
  { symbol: 'QI', name: 'BENQI', price: 0.001272, change: 3.08, vol: '2.4M', category: 'defi' },
  { symbol: 'AVNT', name: 'Avantis', price: 0.0893, change: 3.00, vol: '150K', category: 'defi' },
  { symbol: 'CFG', name: 'Centrifuge', price: 0.1631, change: 2.84, vol: '450K', category: 'defi' },
  { symbol: 'PENDLE', name: 'Pendle', price: 1.40, change: 2.79, vol: '5.2M', category: 'defi' },
  { symbol: 'MMT', name: 'Momentum', price: 0.2185, change: 26.96, vol: '12M', category: 'defi' },
  { symbol: 'DODO', name: 'DODO', price: 0.02273, change: 13.65, vol: '3.1M', category: 'defi' },
  { symbol: 'DYDX', name: 'dYdX', price: 0.11581, change: 2.20, vol: '8.4M', category: 'defi' },
  { symbol: 'KATANA', name: 'Katana', price: 1.10, change: 1.03, vol: '240K', category: 'defi' },
  { symbol: 'TRB', name: 'Tellor Tributes', price: 13.82, change: 1.02, vol: '1.8M', category: 'defi' },
  { symbol: 'AERO', name: 'Aerodrome', price: 0.437, change: -0.43, vol: '4.2M', category: 'defi' },
  { symbol: 'JUP', name: 'Jupiter', price: 0.1837, change: -0.49, vol: '15M', category: 'defi' },
  { symbol: 'INJ', name: 'Injective', price: 4.38, change: -3.03, vol: '9.2M', category: 'defi' },
  
  // AI Tokens
  { symbol: 'FET', name: 'Fetch.ai', price: 0.89, change: 2.10, vol: '12M', category: 'ai' },
  { symbol: 'AGIX', name: 'SingularityNET', price: 0.52, change: 1.80, vol: '8.4M', category: 'ai' },
  { symbol: 'OCEAN', name: 'Ocean Protocol', price: 0.43, change: 1.20, vol: '3.1M', category: 'ai' },
  { symbol: 'WLD', name: 'Worldcoin', price: 0.306, change: 0.43, vol: '22M', category: 'ai' },
  { symbol: 'PHB', name: 'Phoenix', price: 1.05, change: -0.80, vol: '450K', category: 'ai' },
  
  // Metaverse
  { symbol: 'SAND', name: 'The Sandbox', price: 0.4135, change: 0.05, vol: '5.6M', category: 'metaverse' },
  { symbol: 'MANA', name: 'Decentraland', price: 0.3630, change: 0.68, vol: '4.2M', category: 'metaverse' },
  { symbol: 'AXS', name: 'Axie Infinity', price: 4.89, change: -0.70, vol: '2.8M', category: 'metaverse' },
  { symbol: 'GALA', name: 'Gala', price: 0.018, change: 1.10, vol: '18M', category: 'metaverse' },
  
  // Payments
  { symbol: 'XRP', name: 'XRP', price: 1.0414, change: 0.29, vol: '380M', category: 'payment' },
  { symbol: 'XLM', name: 'Stellar', price: 0.092, change: 0.30, vol: '42M', category: 'payment' },
  { symbol: 'ALGO', name: 'Algorand', price: 0.12, change: -0.20, vol: '15M', category: 'payment' },
  
  // Storage
  { symbol: 'FIL', name: 'Filecoin', price: 4.7155, change: 2.82, vol: '50M', category: 'storage' },
  { symbol: 'AR', name: 'Arweave', price: 18.00, change: -0.28, vol: '12M', category: 'storage' },
  { symbol: 'STORJ', name: 'Storj', price: 0.4504, change: 0.58, vol: '4.1M', category: 'storage' },
];

const FUTURES_DATA = [
  { pair: 'BTC', base: 'BTC', quote: 'USDT', price: 64182.50, change: 2.34, vol: '1.24B', high: 64800, low: 63600, oi: '12.4B' },
  { pair: 'ETH', base: 'ETH', quote: 'USDT', price: 3482.20, change: 1.87, vol: '876M', high: 3520, low: 3440, oi: '8.7B' },
  { pair: 'BNB', base: 'BNB', quote: 'USDT', price: 598.40, change: -0.32, vol: '234M', high: 605, low: 592, oi: '2.1B' },
  { pair: 'SOL', base: 'SOL', quote: 'USDT', price: 187.65, change: 5.13, vol: '567M', high: 192, low: 178, oi: '3.4B' },
  { pair: 'BANK', base: 'BANK', quote: 'USDT', price: 0.03930, change: -4.35, vol: '3.44K', high: 0.041, low: 0.038, oi: '150K' },
  { pair: 'INJ', base: 'INJ', quote: 'USDT', price: 4.3742, change: -2.16, vol: '12.4M', high: 4.5, low: 4.3, oi: '25M' },
  { pair: 'ENA', base: 'ENA', quote: 'USDT', price: 0.09137, change: -3.47, vol: '8.7M', high: 0.095, low: 0.089, oi: '18M' },
  { pair: 'PENDLE', base: 'PENDLE', quote: 'USDT', price: 1.4094, change: 1.09, vol: '5.2M', high: 1.45, low: 1.38, oi: '12M' },
  { pair: 'CRV', base: 'CRV', quote: 'USDT', price: 0.22744, change: 7.95, vol: '3.8M', high: 0.24, low: 0.21, oi: '9M' },
  { pair: 'DYDX', base: 'DYDX', quote: 'USDT', price: 0.11598, change: 1.70, vol: '2.1M', high: 0.12, low: 0.11, oi: '5.4M' },
  { pair: 'CAKE', base: 'CAKE', quote: 'USDT', price: 1.4352, change: 2.56, vol: '1.9M', high: 1.48, low: 1.41, oi: '4.2M' },
  { pair: 'CELO', base: 'CELO', quote: 'USDT', price: 0.06239, change: 0.47, vol: '1.2M', high: 0.064, low: 0.061, oi: '2.8M' },
  { pair: 'RAY', base: 'RAY', quote: 'USDT', price: 0.63762, change: 2.14, vol: '3.4M', high: 0.65, low: 0.62, oi: '6.1M' },
  { pair: 'LQTY', base: 'LQTY', quote: 'USDT', price: 0.18487, change: 1.71, vol: '0.8M', high: 0.19, low: 0.18, oi: '1.5M' },
  { pair: 'KAVA', base: 'KAVA', quote: 'USDT', price: 0.04085, change: 0.39, vol: '0.6M', high: 0.042, low: 0.039, oi: '1.2M' },
  { pair: 'XVS', base: 'XVS', quote: 'USDT', price: 2.7176, change: -0.01, vol: '0.4M', high: 2.8, low: 2.6, oi: '0.8M' },
  { pair: 'XRP', base: 'XRP', quote: 'USDT', price: 0.6214, change: 1.02, vol: '123M', high: 0.63, low: 0.61, oi: '890M' },
  { pair: 'ADA', base: 'ADA', quote: 'USDT', price: 0.4582, change: -1.24, vol: '98M', high: 0.47, low: 0.45, oi: '456M' },
];

const DEPOSIT_METHODS = [
  { id: 'Google Pay', name: 'Google Pay', icon: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-pay-icon.png', label: 'Instant UPI' },
  { id: 'Phone Pay', name: 'Phone Pay', icon: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/phonepe-icon.png', label: 'Auto Scan' },
  { id: 'Paytm', name: 'Paytm', icon: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/paytm-icon.png', label: 'Business' },
  { id: 'Icash', name: 'Icash', icon: 'https://uxwing.com/wp-content/themes/uxwing/download/e-commerce-currency-shopping/credit-card-color-icon.png', label: 'Flexible' },
  { id: 'Binance Pay', name: 'Binance Pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Binance_Logo.svg', label: 'Crypto Web3' },
  { id: 'Ethereum (ETH)', name: 'Ethereum (ETH)', icon: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/ethereum-eth-icon.png', label: 'ETH Node' },
  { id: 'Gate Pay', name: 'Gate Pay', icon: 'https://uxwing.com/wp-content/themes/uxwing/download/e-commerce-currency-shopping/payment-gateway-icon.png', label: 'Gateway' },
];

export default function TradeSection({
  currentUser,
  onExecuteTrade,
  onChangeTab,
  systemSettings,
  isDemoMode,
  setIsDemoMode
}: TradeSectionProps) {
  const [activeTab, setActiveTab] = useState<InternalTab>('home');
  const [demoBalance, setDemoBalance] = useState(80000);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeAmount, setTradeAmount] = useState('100');
  const [tradeTime, setTradeTime] = useState('01:00');
  const [futuresData, setFuturesData] = useState(FUTURES_DATA);
  const [defiData, setDefiData] = useState(DEFI_DATA);

  // DeFi Specific State
  const [activeDeFiView, setActiveDeFiView] = useState('Spot');
  const [activeDeFiCategory, setActiveDeFiCategory] = useState('all');
  const [defiFavorites, setDefiFavorites] = useState<string[]>([]);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFuturesData(prev => prev.map(item => ({
        ...item,
        price: item.price + (Math.random() - 0.5) * (item.price * 0.001)
      })));
      setDefiData(prev => prev.map(item => ({
        ...item,
        price: item.price + (Math.random() - 0.5) * (item.price * 0.001)
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Notifications/Messages from Firestore
  useEffect(() => {
    if (!currentUser) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('userId', '==', currentUser.id),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(msgs);
      setUnreadCount(msgs.filter((m: any) => !m.read).length);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Deposit State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositStep, setDepositStep] = useState(1);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('');
  const [depositUTR, setDepositUTR] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Withdraw State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'UPI' | 'Bank'>('UPI');
  const [withdrawUPI, setWithdrawUPI] = useState('');
  const [withdrawBankDetails, setWithdrawBankDetails] = useState({
    accountNumber: '',
    ifsc: '',
    accountHolder: ''
  });

  const realBalance = (currentUser?.depositWallet || 0) + (currentUser?.profitWallet || 0);
  const currentBalance = isDemoMode ? demoBalance : realBalance;

  const currentAsset = selectedAsset 
    ? [...futuresData, ...DEFI_DATA].find(a => (a.pair || a.name) === (selectedAsset.pair || selectedAsset.name)) || selectedAsset
    : null;

  const topGainers = [...futuresData].sort((a, b) => b.change - a.change).slice(0, 3);
  const topLosers = [...futuresData].sort((a, b) => a.change - b.change).slice(0, 3);

  // --- Chart Drawing Logic ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const drawChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;
      const points = 60;
      const data: number[] = [];
      let p = 100;
      for (let i = 0; i < points; i++) {
        p = p + (Math.random() - 0.5) * 5;
        data.push(p);
      }

      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min;

      ctx.clearRect(0, 0, w, h);
      
      // Grid
      ctx.strokeStyle = 'rgba(132, 142, 156, 0.1)';
      ctx.setLineDash([2, 2]);
      for (let i = 0; i < 5; i++) {
        const y = (h / 4) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.setLineDash([]);

      // Main Line
      ctx.beginPath();
      ctx.strokeStyle = '#f0b90b';
      ctx.lineWidth = 2;
      data.forEach((val, i) => {
        const x = (i / (points - 1)) * w;
        const y = h - ((val - min) / range) * h * 0.8 - h * 0.1;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Area
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(240, 185, 11, 0.1)');
      grad.addColorStop(1, 'transparent');
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fillStyle = grad;
      ctx.fill();
    };

    drawChart();
    const interval = setInterval(drawChart, 3000);
    return () => clearInterval(interval);
  }, [activeTab, selectedAsset]);

  const handleTrade = (type: 'buy' | 'sell') => {
    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    if (type === 'buy' && amount > currentBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (isDemoMode) {
      setDemoBalance(prev => type === 'buy' ? prev - amount : prev + amount);
      toast.success(`${type.toUpperCase()} executed (Demo)`);
    } else {
      if (onExecuteTrade && selectedAsset) {
        onExecuteTrade(amount, amount * 1.82, selectedAsset.pair || selectedAsset.name, '1m');
      }
    }
  };

  const handleDepositSubmit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!depositUTR) {
      toast.error('Please enter UTR number');
      return;
    }
    if (!currentUser) {
      toast.error('Please login to deposit');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.id,
        username: currentUser.username,
        userPhone: currentUser.phone,
        type: 'deposit',
        amount: parseFloat(depositAmount),
        status: 'pending',
        method: depositMethod || 'UPI',
        utr: depositUTR,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
      toast.success('Deposit request submitted! Wait for admin confirmation.');
      setShowDepositModal(false);
      setDepositStep(1);
      setDepositAmount('');
      setDepositUTR('');
    } catch (error) {
      console.error('Deposit Error:', error);
      toast.error('Failed to submit deposit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (parseFloat(withdrawAmount) > realBalance) {
      toast.error('Insufficient balance');
      return;
    }
    if (withdrawMethod === 'UPI' && !withdrawUPI) {
      toast.error('Please enter UPI ID');
      return;
    }
    if (withdrawMethod === 'Bank' && (!withdrawBankDetails.accountNumber || !withdrawBankDetails.ifsc || !withdrawBankDetails.accountHolder)) {
      toast.error('Please enter all bank details');
      return;
    }
    if (!currentUser) {
      toast.error('Please login to withdraw');
      return;
    }

    const address = withdrawMethod === 'UPI' 
      ? `UPI: ${withdrawUPI}` 
      : `Bank: ${withdrawBankDetails.accountNumber}, IFSC: ${withdrawBankDetails.ifsc}, Holder: ${withdrawBankDetails.accountHolder}`;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.id,
        username: currentUser.username,
        userPhone: currentUser.phone,
        type: 'withdraw',
        amount: parseFloat(withdrawAmount),
        status: 'pending',
        method: withdrawMethod,
        utr: '',
        address: address,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
      toast.success('Withdrawal request submitted! Wait for admin confirmation.');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawUPI('');
      setWithdrawBankDetails({ accountNumber: '', ifsc: '', accountHolder: '' });
    } catch (error) {
      console.error('Withdrawal Error:', error);
      toast.error('Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e11] text-[#eaecef] font-sans select-none overflow-hidden" id="full-trade-dashboard">
      {/* App Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#2b3139] bg-[#0b0e11] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => selectedAsset ? setSelectedAsset(null) : onChangeTab?.('plan')}
            className="p-1 text-[#848e9c] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[#f0b90b]">F<span className="text-white">utures</span></span>
            <span className="text-[9px] bg-[#f0b90b] text-black px-2 py-0.5 rounded-full font-bold">PRO</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div 
            onClick={() => {
              setDepositStep(1);
              setShowDepositModal(true);
            }}
            className="flex items-center gap-2 bg-[#1e2329] px-3 py-1.5 rounded-full border border-[#2b3139] cursor-pointer hover:border-[#f0b90b] transition-all"
          >
            <Wallet className="w-4 h-4 text-[#f0b90b]" />
            <span className="text-xs font-bold text-[#0ecb81]">₹{realBalance.toLocaleString()}</span>
          </div>
          <button 
            onClick={() => setShowNotifications(true)}
            className="text-[#848e9c] hover:text-white relative"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#0b0e11]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden bg-[#0b0e11] relative">
        <AnimatePresence mode="wait">
          {selectedAsset ? (
            <motion.div 
              key="trading-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full bg-[#0b0e11] overflow-hidden absolute inset-0"
            >
              {/* Header inside Trading View */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-[#1e232c] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedAsset(null)} className="p-1">
                    <ArrowLeft className="w-6 h-6 text-[#848e9c]" />
                  </button>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-[#848e9c] font-bold">
                        {isDemoMode ? 'Demo account' : 'Live account'}
                      </span>
                      <button 
                        onClick={() => setIsDemoMode(!isDemoMode)}
                        className="p-0.5 hover:bg-white/10 rounded transition-colors active:scale-95"
                      >
                        <ChevronDown className="w-3 h-3 text-[#848e9c]" />
                      </button>
                    </div>
                    <span className="text-xl font-black text-white">₹{currentBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    onClick={() => {
                      setDepositStep(1);
                      setShowDepositModal(true);
                    }}
                    className="bg-[#f0b90b] p-2 rounded-xl shadow-lg shadow-[#f0b90b]/10 cursor-pointer active:scale-95 transition-transform"
                  >
                    <Wallet className="w-5 h-5 text-black" />
                  </div>
                  <div className="w-9 h-9 rounded-full border-2 border-slate-700 p-0.5 overflow-hidden cursor-pointer">
                    <img src="https://i.ibb.co/f4pXh6S/logo.png" alt="Profile" className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Chart Area */}
              <div className="flex-grow relative mt-2 min-h-0">
                <canvas ref={canvasRef} className="w-full h-full" />
                
                {/* Time Labels Bottom */}
                <div className="absolute bottom-2 left-0 w-full px-4 flex justify-between text-[8px] font-bold text-[#5e6673] pointer-events-none">
                  <span>1:05:20 AM</span>
                  <span>1:05:40 AM</span>
                  <span>1:06 AM</span>
                  <span>1:06:20 AM</span>
                </div>

                {/* Floating Tools Toolbar (exactly as in image) */}
                <div className="absolute bottom-10 left-0 w-full flex justify-center">
                  <div className="flex items-center gap-2 bg-[#1e232c]/80 backdrop-blur-md rounded-2xl p-1.5 border border-white/5">
                    <div className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"><PieChart className="w-4 h-4" /></div>
                    <div className="flex flex-col items-center gap-0.5 px-3 py-1 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
                      <span className="text-[10px] font-black text-white">1s</span>
                      <div className="w-1.5 h-1.5 bg-[#f0b90b] rounded-full"></div>
                    </div>
                    <div className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"><TrendingUp className="w-4 h-4" /></div>
                    <div className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"><Sliders className="w-4 h-4" /></div>
                  </div>
                </div>
              </div>

              {/* Action Controls Section */}
              <div className="px-4 pb-6 space-y-3 flex-shrink-0 bg-[#0b0e11]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1e232c] rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[9px] text-[#848e9c] font-bold uppercase tracking-tighter">Amount</span>
                    <input 
                      type="number"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="bg-transparent text-center text-base font-black text-white outline-none w-full"
                    />
                  </div>
                  <div className="bg-[#1e232c] rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[9px] text-[#848e9c] font-bold uppercase tracking-tighter">Time</span>
                    <input 
                      type="text"
                      value={tradeTime}
                      onChange={(e) => setTradeTime(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="bg-transparent text-center text-base font-black text-white outline-none w-full"
                      placeholder="01:00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 h-10">
                  <button
                    onClick={() => handleTrade('buy')}
                    className="bg-[#0ecb81] rounded-xl flex items-center justify-center gap-2 text-white shadow-lg shadow-[#0ecb81]/20 active:scale-95 transition-all py-1 px-3"
                  >
                    <TrendingUp className="w-4 h-4 rotate-[-45deg]" />
                    <span className="text-xs font-black tracking-tight">
                      ₹{currentAsset?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </button>
                  <button
                    onClick={() => handleTrade('sell')}
                    className="bg-[#f6465d] rounded-xl flex items-center justify-center gap-2 text-white shadow-lg shadow-[#f6465d]/20 active:scale-95 transition-all py-1 px-3"
                  >
                    <TrendingUp className="w-4 h-4 rotate-[135deg]" />
                    <span className="text-xs font-black tracking-tight">
                      ₹{currentAsset?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'home' ? (
            <motion.div 
              key="home-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4 h-full overflow-y-auto scrollbar-hide absolute inset-0"
            >
              {/* Account Card */}
              <div 
                className="bg-gradient-to-br from-[#1a1f2a] to-[#0f1219] p-6 rounded-2xl border border-[#2b3139] relative overflow-hidden group hover:border-[#f0b90b]/30 transition-all"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#848e9c] uppercase font-bold tracking-wider">
                      {isDemoMode ? 'Demo Account' : 'Live Account'}
                    </span>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black ${isDemoMode ? 'bg-[#f0b90b] text-black' : 'bg-[#0ecb81] text-white'}`}>
                      {isDemoMode ? 'DEMO' : 'LIVE'}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDemoMode(!isDemoMode);
                    }}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                  >
                    <ChevronDown className="w-5 h-5 text-[#848e9c] hover:text-white" />
                  </button>
                </div>
                <div className="text-3xl font-black">
                  <span className="text-[#848e9c] text-lg font-bold mr-1">₹</span>
                  {currentBalance.toLocaleString()}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="bg-[#1e2329] px-4 py-1 rounded-full border border-[#2b3139] flex items-center gap-2">
                    <span className="text-sm font-black text-[#f0b90b]">82%</span>
                    <span className="text-[10px] text-[#848e9c] font-bold">Crypto IDX</span>
                    <div className="w-12 h-1 bg-[#2b3139] rounded-full overflow-hidden">
                      <div className="h-full bg-[#f0b90b] w-[82%]" />
                    </div>
                  </div>
                  <div className="text-xs font-bold text-[#0ecb81]">
                    <ArrowUp className="w-3 h-3 inline mr-0.5" /> 2.41%
                  </div>
                </div>
              </div>

              {/* Chart Summary */}
              <div className="bg-[#181a20] p-4 rounded-2xl border border-[#2b3139]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold">BTC/USDT <span className="text-[#848e9c] text-[10px]">Perpetual</span></span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">₹64,182.50</span>
                    <span className="text-xs font-bold text-[#0ecb81]">+2.34%</span>
                  </div>
                </div>
                <div className="h-24">
                   <canvas ref={canvasRef} className="w-full h-full" />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setShowDepositModal(true)} className="bg-[#181a20] border border-[#2b3139] p-4 rounded-xl flex flex-col items-center gap-1 hover:border-[#f0b90b] transition-all active:scale-95">
                  <ArrowDown className="text-[#0ecb81]" />
                  <span className="text-[11px] font-bold text-[#848e9c]">Deposit</span>
                </button>
                <button onClick={() => setActiveTab('futures')} className="bg-[#181a20] border border-[#2b3139] p-4 rounded-xl flex flex-col items-center gap-1 hover:border-[#f0b90b] transition-all active:scale-95">
                  <InfinityIcon className="text-[#f0b90b]" />
                  <span className="text-[11px] font-bold text-[#848e9c]">Futures</span>
                </button>
                <button onClick={() => setShowWithdrawModal(true)} className="bg-[#181a20] border border-[#2b3139] p-4 rounded-xl flex flex-col items-center gap-1 hover:border-[#f0b90b] transition-all active:scale-95">
                  <ArrowUp className="text-[#f6465d]" />
                  <span className="text-[11px] font-bold text-[#848e9c]">Withdraw</span>
                </button>
              </div>

              {/* New Dashboard Metrics Section */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#181a20] p-4 rounded-2xl border border-[#2b3139] space-y-1">
                  <span className="text-[9px] text-[#848e9c] font-bold uppercase tracking-wider">Total Balance</span>
                  <div className="text-lg font-black text-[#0ecb81]">₹{currentBalance.toLocaleString()}</div>
                  <div className="text-[10px] text-[#848e9c]">+2.41% today</div>
                </div>
                <div className="bg-[#181a20] p-4 rounded-2xl border border-[#2b3139] space-y-1">
                  <span className="text-[9px] text-[#848e9c] font-bold uppercase tracking-wider">Open P&L</span>
                  <div className="text-lg font-black text-[#f6465d]">-₹342.10</div>
                  <div className="text-[10px] text-[#848e9c]">-2.59%</div>
                </div>
                <div className="bg-[#181a20] p-4 rounded-2xl border border-[#2b3139] space-y-1">
                  <span className="text-[9px] text-[#848e9c] font-bold uppercase tracking-wider">24h Volume</span>
                  <div className="text-lg font-black text-[#f0b90b]">₹2.14B</div>
                  <div className="text-[10px] text-[#848e9c]">+12.3%</div>
                </div>
                <div className="bg-[#181a20] p-4 rounded-2xl border border-[#2b3139] space-y-1">
                  <span className="text-[9px] text-[#848e9c] font-bold uppercase tracking-wider">Active Positions</span>
                  <div className="text-lg font-black text-blue-400">4</div>
                  <div className="text-[10px] text-[#848e9c]">2 long · 2 short</div>
                </div>
              </div>

              {/* Top Gainers */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5 text-[#0ecb81] rotate-[-45deg]" />
                  <span className="text-[#eaecef]">Top Gainers</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {topGainers.map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedAsset(item)}
                      className="bg-[#181a20] border border-[#2b3139] p-3 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#0ecb81]/50 transition-colors"
                    >
                      <span className="text-[10px] font-bold text-[#eaecef]">{item.pair}</span>
                      <span className="text-[10px] font-black text-[#0ecb81]">+{item.change}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Losers */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5 text-[#f6465d] rotate-[135deg]" />
                  <span className="text-[#eaecef]">Top Losers</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {topLosers.map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedAsset(item)}
                      className="bg-[#181a20] border border-[#2b3139] p-3 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#f6465d]/50 transition-colors"
                    >
                      <span className="text-[10px] font-bold text-[#eaecef]">{item.pair}</span>
                      <span className="text-[10px] font-black text-[#f6465d]">{item.change}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explore Futures Bar */}
              <button 
                onClick={() => setActiveTab('futures')}
                className="w-full bg-[#181a20] border border-[#2b3139] px-4 py-3 rounded-xl flex justify-between items-center group hover:border-[#f0b90b] transition-all"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-[#f0b90b]" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Explore Futures</span>
                </div>
                <div className="flex items-center gap-1 text-[#f0b90b] text-xs font-bold">
                  View all <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Watchlist */}
              <div className="bg-[#181a20] rounded-2xl border border-[#2b3139] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#2b3139] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#f0b90b]" />
                    <span className="text-xs font-bold text-[#848e9c]">Watchlist</span>
                  </div>
                  <button onClick={() => setActiveTab('futures')} className="text-[#f0b90b] text-[10px] font-bold">View all</button>
                </div>
                <div className="divide-y divide-[#2b3139]">
                  {futuresData.slice(0, 4).map((s, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedAsset(s)}
                      className="px-4 py-3 flex justify-between items-center hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{s.base} <span className="text-[10px] text-[#848e9c]">/{s.quote}</span></span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">₹{s.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        <div className={`text-[10px] font-bold ${s.change >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                          {s.change >= 0 ? '+' : ''}{s.change}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'defi' ? (
            <motion.div 
              key="defi-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full overflow-hidden absolute inset-0 bg-[#0b0e11]"
            >
              {/* Secondary DeFi Navigation */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-[#1e2329] overflow-x-auto scrollbar-hide shrink-0">
                {['Spot', 'USD-M', 'COIN-M', 'Options'].map((view) => (
                  <button 
                    key={view}
                    onClick={() => setActiveDeFiView(view)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      activeDeFiView === view ? 'bg-[#1e2329] text-[#f0b90b]' : 'text-[#848e9c] hover:text-white'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide shrink-0 bg-[#14171a]">
                {['all', 'new', 'defi', 'metaverse', 'payment', 'pow', 'storage', 'ai'].map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setActiveDeFiCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeDeFiCategory === cat ? 'bg-[#f0b90b] text-black shadow-lg shadow-[#f0b90b]/10' : 'bg-[#1e2329] text-[#5e6673] border border-[#2b3139]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* DeFi Asset List */}
              <div className="flex-grow overflow-y-auto scrollbar-hide">
                <div className="grid grid-cols-[2fr_1.2fr_1fr_0.5fr] px-4 py-3 text-[9px] text-[#5e6673] font-black uppercase tracking-widest border-b border-[#1e2329] sticky top-0 bg-[#0b0e11] z-10">
                  <span>Name / Vol</span>
                  <span className="text-right">Price</span>
                  <span className="text-right">24h Chg</span>
                  <span className="text-right opacity-30"><Star className="w-3 h-3 ml-auto" /></span>
                </div>
                
                <div className="divide-y divide-[#1e2329]">
                  {defiData
                    .filter(d => {
                      const matchesSearch = d.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || d.name.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCategory = activeDeFiCategory === 'all' || d.category === activeDeFiCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .map((d, i) => {
                      const isFav = defiFavorites.includes(d.symbol);
                      return (
                        <div 
                          key={i} 
                          onClick={() => setSelectedAsset(d)}
                          className="grid grid-cols-[2fr_1.2fr_1fr_0.5fr] px-4 py-4 items-center hover:bg-[#1e232c] cursor-pointer transition-colors group"
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-black text-white group-hover:text-[#f0b90b] transition-colors">{d.symbol}</span>
                              <span className="text-[9px] bg-[#1e2329] text-[#848e9c] px-1.5 py-0.5 rounded font-black tracking-tighter">SPOT</span>
                            </div>
                            <span className="text-[10px] text-[#5e6673] font-bold mt-0.5">{d.name} <span className="opacity-50 ml-1">Vol {d.vol}</span></span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-white tracking-tight">₹{d.price.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</div>
                            <div className="text-[10px] text-[#5e6673] font-medium">$ {d.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                          </div>
                          <div className="flex justify-end">
                            <div className={`text-[11px] font-black min-w-[56px] text-center py-1.5 rounded-lg ${
                              d.change >= 0 ? 'text-[#0ecb81] bg-[#0ecb81]/10' : 'text-[#f6465d] bg-[#f6465d]/10'
                            }`}>
                              {d.change >= 0 ? '+' : ''}{d.change}%
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDefiFavorites(prev => prev.includes(d.symbol) ? prev.filter(s => s !== d.symbol) : [...prev, d.symbol]);
                            }}
                            className="flex justify-end pl-2"
                          >
                            <Star className={`w-4 h-4 transition-colors ${isFav ? 'text-[#f0b90b] fill-[#f0b90b]' : 'text-[#2b3139] hover:text-[#f0b90b]'}`} />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'futures' ? (
            <motion.div 
              key="futures-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4 h-full overflow-y-auto scrollbar-hide absolute inset-0"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <InfinityIcon className="w-6 h-6 text-[#f0b90b]" /> Futures Market
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {futuresData.map((s, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedAsset(s)}
                    className="bg-[#181a20] p-4 rounded-xl border border-[#2b3139] cursor-pointer hover:border-[#f0b90b] transition-all active:scale-95 relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold">{s.base} <span className="text-[#848e9c] text-[10px]">/{s.quote}</span></span>
                       </div>
                       <span className="text-[8px] bg-[#2b3139] px-1.5 rounded text-[#848e9c] font-bold">PERP</span>
                    </div>
                    <div className="text-base font-bold">₹{s.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className={`text-xs font-bold ${s.change >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                       {s.change >= 0 ? '+' : ''}{s.change}%
                    </div>
                    <div className="mt-2 text-[10px] text-[#5e6673]">Vol {s.vol}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
             <motion.div 
              key="info-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 h-full overflow-y-auto scrollbar-hide absolute inset-0"
            >
              <div className="bg-[#181a20] rounded-2xl border border-[#2b3139] p-6 space-y-4">
                <h3 className="text-xl font-bold">About Futures Trading</h3>
                <p className="text-sm text-[#848e9c] leading-relaxed">
                  Futures trading allows you to speculate on the price movement of crypto assets without owning the underlying asset. 
                  Trade with leverage, go long or short, and manage your risk with stop-loss and take-profit orders.
                </p>
                <div className="pt-4 border-t border-[#2b3139] space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#0ecb81]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0ecb81]" /> All prices are market real-time
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#0ecb81]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0ecb81]" /> Buy/Sell matched with wallet balance
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex justify-around items-center h-16 border-t border-[#2b3139] bg-[#0b0e11] flex-shrink-0 px-2">
        {[
          { id: 'home', icon: <Home className="w-6 h-6" />, label: 'Home' },
          { id: 'defi', icon: <Coins className="w-6 h-6" />, label: 'DeFi' },
          { id: 'futures', icon: <InfinityIcon className="w-6 h-6" />, label: 'Futures' },
          { id: 'info', icon: <Info className="w-6 h-6" />, label: 'Info' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as InternalTab);
              setSelectedAsset(null);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 transition-all relative ${
              activeTab === tab.id ? 'text-[#f0b90b]' : 'text-[#5e6673] hover:text-[#848e9c]'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-bold">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="nav-dot"
                className="absolute top-1 right-3 w-1.5 h-1.5 bg-[#f0b90b] rounded-full"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#181a20] w-full max-w-lg rounded-3xl border border-[#2b3139] overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-[#2b3139] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-[#f0b90b]" />
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">Notifications</h3>
                </div>
                <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6 text-[#848e9c]" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto scrollbar-hide p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[#5e6673]">
                    <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest">No messages yet</p>
                  </div>
                ) : (
                  notifications.map((msg) => (
                    <div 
                      key={msg.id} 
                      onClick={async () => {
                        if (!msg.read) {
                          const msgRef = doc(db, 'messages', msg.id);
                          await updateDoc(msgRef, { read: true });
                        }
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        msg.read ? 'bg-transparent border-[#2b3139] opacity-70' : 'bg-[#1e232c] border-[#f0b90b]/30 shadow-lg shadow-[#f0b90b]/5'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {msg.type === 'complaint' ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : msg.type === 'system' ? (
                            <CheckCircle2 className="w-4 h-4 text-[#0ecb81]" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-[#f0b90b]" />
                          )}
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#848e9c]">
                            {msg.sender || 'Admin'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-[#5e6673] font-bold uppercase">
                          <Clock className="w-3 h-3" />
                          {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </div>
                      </div>
                      <h4 className="text-sm font-black text-white mb-1">{msg.subject || 'New Message'}</h4>
                      <p className="text-xs text-[#848e9c] leading-relaxed">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-[#2b3139] shrink-0">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="w-full py-3 bg-[#1e232c] text-[#848e9c] font-black uppercase tracking-widest rounded-xl hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-[#181a20] w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#2b3139] overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <ArrowDown className="text-[#0ecb81]" /> Deposit
                  </h3>
                  <button onClick={() => setShowDepositModal(false)} className="p-2 text-[#848e9c]">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {depositStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest block">Enter Amount (₹)</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-[#f0b90b]">₹</div>
                        <input 
                          type="number"
                          placeholder="500"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-[#1e2329] border border-[#2b3139] rounded-2xl py-5 pl-10 pr-4 text-2xl font-black text-white outline-none focus:border-[#f0b90b] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {['500', '1000', '2000', '5000'].map((amt) => (
                        <button 
                          key={amt}
                          onClick={() => setDepositAmount(amt)}
                          className="py-3 bg-[#1e2329] border border-[#2b3139] rounded-xl text-[10px] font-black text-[#848e9c] hover:border-[#f0b90b] hover:text-[#f0b90b] hover:bg-[#f0b90b]/5 transition-all uppercase tracking-widest"
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => setDepositStep(2)}
                      className="w-full bg-[#f0b90b] text-black font-black py-4 rounded-2xl shadow-lg shadow-[#f0b90b]/10 active:scale-95 transition-all uppercase tracking-widest text-xs"
                    >
                      Continue
                    </button>
                  </div>
                )}

                {depositStep === 2 && (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide pr-1">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest block mb-1">Choose Deposit Method</label>
                      <div className="flex flex-col gap-2">
                        {DEPOSIT_METHODS.map((method) => (
                          <button 
                            key={method.id}
                            onClick={() => { setDepositMethod(method.name); setDepositStep(3); }}
                            className="bg-[#1e2329] border border-[#2b3139] p-3 rounded-2xl flex items-center justify-between hover:border-[#f0b90b] transition-all group w-full"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm overflow-hidden shrink-0">
                                <img src={method.icon} alt={method.name} className="w-full h-full object-contain" />
                              </div>
                              <div className="text-left">
                                <span className="text-xs font-black text-white uppercase tracking-widest block">{method.name}</span>
                                <span className="text-[9px] text-[#848e9c] font-medium">{method.label}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#5e6673] group-hover:text-[#f0b90b]" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setDepositStep(1)} className="w-full py-3 text-[#848e9c] text-[10px] font-black uppercase tracking-widest border border-[#2b3139] rounded-xl hover:text-white transition-colors">
                      BACK TO AMOUNT
                    </button>
                  </div>
                )}

                {depositStep === 3 && (
                  <div className="space-y-4">
                    <div className="bg-[#1e2329] p-4 rounded-2xl border border-[#2b3139] space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#848e9c]">UPI ID</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">{systemSettings.upiId || 'payment@upi'}</span>
                          <button onClick={() => { navigator.clipboard.writeText(systemSettings.upiId || 'payment@upi'); toast.success('Copied!'); }}><Copy className="w-4 h-4 text-[#f0b90b]" /></button>
                        </div>
                      </div>
                      <div className="flex flex-col items-center py-2">
                         <div className="bg-white p-2 rounded-lg">
                           <img src={systemSettings.qrCodeUrl || "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=example"} alt="QR" className="w-32 h-32" />
                         </div>
                         <span className="text-[10px] text-[#848e9c] mt-2 font-bold uppercase tracking-widest">Scan and Pay</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#848e9c] uppercase">Enter UTR Number</label>
                      <input 
                        type="text"
                        placeholder="12 digit UTR"
                        value={depositUTR}
                        onChange={(e) => setDepositUTR(e.target.value)}
                        className="w-full bg-[#1e2329] border border-[#2b3139] rounded-2xl p-4 text-base font-black outline-none focus:border-[#f0b90b]"
                      />
                    </div>

                    <button 
                      onClick={handleDepositSubmit}
                      disabled={isSubmitting}
                      className="w-full bg-[#0ecb81] text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'SUBMITTING...' : 'CONFIRM DEPOSIT'}
                    </button>
                    <button onClick={() => setDepositStep(2)} className="w-full text-[#848e9c] text-sm font-bold">BACK</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-[#181a20] w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#2b3139] overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <ArrowUp className="text-[#f6465d]" /> Withdraw
                  </h3>
                  <button onClick={() => setShowWithdrawModal(false)} className="p-2 text-[#848e9c]">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-[#1e2329] p-4 rounded-2xl border border-yellow-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#848e9c]">Available Balance</span>
                    <span className="text-lg font-black text-[#0ecb81]">₹{realBalance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#848e9c] uppercase">Amount to Withdraw (₹)</label>
                    <input 
                      type="number"
                      placeholder="Min 100"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-[#1e2329] border border-[#2b3139] rounded-2xl p-4 text-xl font-black outline-none focus:border-[#f0b90b]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#848e9c] uppercase">Payment Method</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setWithdrawMethod('UPI')}
                        className={`flex-1 py-3 rounded-xl font-bold border ${withdrawMethod === 'UPI' ? 'bg-[#f0b90b] text-black border-[#f0b90b]' : 'bg-[#1e2329] text-[#848e9c] border-[#2b3139]'}`}
                      >
                        UPI
                      </button>
                      <button 
                        onClick={() => setWithdrawMethod('Bank')}
                        className={`flex-1 py-3 rounded-xl font-bold border ${withdrawMethod === 'Bank' ? 'bg-[#f0b90b] text-black border-[#f0b90b]' : 'bg-[#1e2329] text-[#848e9c] border-[#2b3139]'}`}
                      >
                        Bank
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {withdrawMethod === 'UPI' ? (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#848e9c] uppercase">Enter UPI ID</label>
                        <input 
                          type="text"
                          placeholder="example@upi"
                          value={withdrawUPI}
                          onChange={(e) => setWithdrawUPI(e.target.value)}
                          className="w-full bg-[#1e2329] border border-[#2b3139] rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#f0b90b]"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#848e9c] uppercase">Account Number</label>
                          <input 
                            type="text"
                            placeholder="Enter Account Number"
                            value={withdrawBankDetails.accountNumber}
                            onChange={(e) => setWithdrawBankDetails({...withdrawBankDetails, accountNumber: e.target.value})}
                            className="w-full bg-[#1e2329] border border-[#2b3139] rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#f0b90b]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#848e9c] uppercase">IFSC Code</label>
                          <input 
                            type="text"
                            placeholder="Enter IFSC Code"
                            value={withdrawBankDetails.ifsc}
                            onChange={(e) => setWithdrawBankDetails({...withdrawBankDetails, ifsc: e.target.value})}
                            className="w-full bg-[#1e2329] border border-[#2b3139] rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#f0b90b]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#848e9c] uppercase">Account Holder Name</label>
                          <input 
                            type="text"
                            placeholder="Enter Holder Name"
                            value={withdrawBankDetails.accountHolder}
                            onChange={(e) => setWithdrawBankDetails({...withdrawBankDetails, accountHolder: e.target.value})}
                            className="w-full bg-[#1e2329] border border-[#2b3139] rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#f0b90b]"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <button 
                    onClick={handleWithdrawSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-[#f6465d] text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'SUBMITTING...' : 'CONFIRM WITHDRAWAL'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
