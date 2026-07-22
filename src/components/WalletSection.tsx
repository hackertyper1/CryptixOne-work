import React, { useState, useEffect } from 'react';
import { User, Transaction, SystemSettings, InvestmentPlan, InvestmentRequest, ActiveTrade } from '../types';
import { formatIndianCurrency, INVESTMENT_PLANS } from '../data';
import WalletHero from './WalletHero';
import LiveMarketChart from './LiveMarketChart';
import MarketAssetList from './MarketAssetList';
import { 
  Wallet, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  MessageSquare, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Lock,
  Clock,
  ArrowLeft,
  Smartphone,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
  Activity,
  Award
} from 'lucide-react';

export function LiveTradeTrackerCard({ trade }: { trade: ActiveTrade; key?: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const total = trade.endTime - trade.startTime;
  const elapsed = Math.max(0, now - trade.startTime);
  const remaining = Math.max(0, trade.endTime - now);
  const progress = Math.min(1, elapsed / total);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Real-time ticking profit matching elapsed progress
  const currentProfit = Math.round(trade.estimatedProfit * progress);

  return (
    <div className="bg-[#111625] border border-emerald-500/20 p-5 rounded-2xl space-y-4 shadow-xl relative overflow-hidden text-left" id={`trade-tracker-card-${trade.id}`}>
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <div>
            <p className="text-[11px] font-black text-white uppercase tracking-wider">{trade.planName}</p>
            <p className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-widest">REAL-TIME PORTFOLIO</p>
          </div>
        </div>
        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
          LIVE STATUS
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Countdown */}
        <div className="bg-[#070b14] border border-white/5 p-3 rounded-xl flex flex-col justify-center">
          <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block mb-0.5">Time Remaining</span>
          <span className="text-sm font-black text-amber-500 font-mono tracking-wider">{timeString}</span>
        </div>

        {/* Live Net Profit */}
        <div className="bg-[#070b14] border border-white/5 p-3 rounded-xl flex flex-col justify-center">
          <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block mb-0.5">Live Net Profit</span>
          <span className="text-sm font-black text-emerald-400 font-mono">₹{currentProfit.toLocaleString()}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider">
          <span>Progress</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="w-full bg-[#070b14] h-2 rounded-full overflow-hidden border border-white/5">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000 ease-linear" 
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono border-t border-slate-800/50 pt-2.5">
        <span>Allocation: ₹{trade.amount.toLocaleString()}</span>
        <span>Contract: {trade.id}</span>
      </div>
    </div>
  );
}

interface WalletSectionProps {
  isLoggedIn: boolean;
  currentUser: User | null;
  systemSettings: SystemSettings;
  transactions: Transaction[];
  activeTrades: ActiveTrade[];
  investmentRequests: InvestmentRequest[];
  onSubmitDeposit: (tx: Omit<Transaction, 'id' | 'userId' | 'username' | 'userPhone' | 'status' | 'date'>) => void;
  onSubmitWithdrawal: (amount: number, details: any) => boolean;
  selectedPlanForInvestment: InvestmentPlan | null;
  setSelectedPlanForInvestment: (plan: InvestmentPlan | null) => void;
  onNavigateToAuth: () => void;
  onNavigateToTrade: () => void;
  onNavigateToPlans: () => void;
  onInvestmentRequestSubmit: (req: Omit<InvestmentRequest, 'id' | 'userId' | 'username' | 'status' | 'date'>) => void;
  isApk?: boolean;
}

export default function WalletSection({
  isLoggedIn,
  currentUser,
  systemSettings,
  transactions,
  activeTrades,
  investmentRequests,
  onSubmitDeposit,
  onSubmitWithdrawal,
  selectedPlanForInvestment,
  setSelectedPlanForInvestment,
  onNavigateToAuth,
  onNavigateToTrade,
  onNavigateToPlans,
  onInvestmentRequestSubmit,
  isApk = false
}: WalletSectionProps) {
  // Navigation internal state: 'deposit' | 'withdraw' | 'history'
  const [internalTab, setInternalTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [isManualMode, setIsManualMode] = useState(false);
  const [showManualMethods, setShowManualMethods] = useState(false);

  // Custom Investment Payment Flow States
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select_method' | 'scan_qr' | 'trading_form' | 'success'>('select_method');
  const [timeLeft, setTimeLeft] = useState(60);

  // Trading Form details
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formProfession, setFormProfession] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formUtr, setFormUtr] = useState('');

  // Standard Deposit form details (if fallback needed)
  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [utrNumber, setUtrNumber] = useState('');
  const [dob, setDob] = useState('');
  const [profession, setProfession] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [lastSubmittedMsg, setLastSubmittedMsg] = useState('');

  // Withdrawal form details
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [withdrawMethod, setWithdrawMethod] = useState<'upi' | 'bank' | 'scanner'>('upi');
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [userUpiId, setUserUpiId] = useState('');
  const [userScannerUrl, setUserScannerUrl] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Sync selected investment plan if available
  useEffect(() => {
    if (selectedPlanForInvestment) {
      setIsManualMode(false);
      setDepositAmount(selectedPlanForInvestment.amount);
      setInternalTab('deposit');
      setPaymentStep('select_method');
      setSelectedPaymentMethod(null);
      setFormFullName(currentUser?.name || '');
      setFormEmail(currentUser?.email || '');
      setFormPhone(currentUser?.phone || '');
      setFormProfession(currentUser?.profession || '');
      setFormDob(currentUser?.dob || '');
      setFormUtr('');
    }
  }, [selectedPlanForInvestment, currentUser]);

  // Countdown timer effect
  useEffect(() => {
    if (paymentStep !== 'scan_qr') return;
    
    setTimeLeft(60);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          alert('Session expired. QR code is only valid for 60 seconds. Please select the payment method again.');
          setPaymentStep('select_method');
          setSelectedPaymentMethod(null);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentStep]);

  // Copy UPI ID helper
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(systemSettings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Copy general text helper
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Submit handles
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.length < 8) {
      alert('Please enter a valid 12-digit UTR/UPI Transaction Reference number.');
      return;
    }
    
    onSubmitDeposit({
      type: 'deposit',
      amount: Number(depositAmount),
      utr: utrNumber,
      detailsForm: {
        name: currentUser?.name || '',
        phone: currentUser?.phone || '',
        email: currentUser?.email || '',
        whatsapp: currentUser?.whatsapp || '',
        profession: profession || 'Trader',
        dob: dob || '1995-01-01'
      }
    });

    const message = `*CRYPTIXONE TRADING INVESTMENT FORM*\n\n` +
      `• *Client Name:* ${currentUser?.name}\n` +
      `• *Phone:* ${currentUser?.phone}\n` +
      `• *Email:* ${currentUser?.email}\n` +
      `• *WhatsApp:* ${currentUser?.whatsapp}\n` +
      `• *Investment Amount:* ₹${Number(depositAmount).toLocaleString('en-IN')}\n` +
      `• *UTR / Ref Number:* ${utrNumber}\n` +
      `• *Date of Birth:* ${dob || 'Not specified'}\n` +
      `• *Profession:* ${profession || 'Trader'}\n` +
      `• *Status:* Pending Manual Verification\n\n` +
      `Please verify my payment of ₹${Number(depositAmount).toLocaleString('en-IN')} and connect me with my designated senior trader.`;

    const encodedText = encodeURIComponent(message);
    const waLink = `https://wa.me/91${systemSettings.supportWhatsApp}?text=${encodedText}`;

    setLastSubmittedMsg(waLink);
    setDepositSuccess(true);
    setSelectedPlanForInvestment(null);
  };

  const handleTradingFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUtr || formUtr.length < 8) {
      alert('Please enter a valid UPI/UTR transaction reference number.');
      return;
    }

    onInvestmentRequestSubmit({
      fullName: formFullName,
      email: formEmail,
      phone: formPhone,
      amount: depositAmount,
      utr: formUtr,
      profession: formProfession || 'Trader',
      dob: formDob || '1995-01-01',
      planId: selectedPlanForInvestment?.id || '',
      planCategory: selectedPlanForInvestment?.category || 'Custom'
    });

    const message = `*TRADING INVESTMENT APPLICATION*\n` +
      `------------------------------------\n` +
      `• *Full Name:* ${formFullName}\n` +
      `• *Email ID:* ${formEmail}\n` +
      `• *Phone Number:* ${formPhone}\n` +
      `• *Investment Amount:* ₹${Number(depositAmount).toLocaleString('en-IN')}\n` +
      `• *UTR Number:* ${formUtr}\n` +
      `• *Profession:* ${formProfession || 'Trader'}\n` +
      `• *Date of Birth:* ${formDob || 'Not specified'}\n` +
      `• *Plan Selected:* ${selectedPlanForInvestment?.category || 'Custom'} (₹${depositAmount})\n` +
      `------------------------------------\n` +
      `Please verify and activate my trading slot.`;

    const encodedText = encodeURIComponent(message);
    const waLink = `https://wa.me/91${systemSettings.supportWhatsApp}?text=${encodedText}`;

    setLastSubmittedMsg(waLink);
    setPaymentStep('success');
    
    // Open WhatsApp
    window.open(waLink, '_blank');
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess(false);

    if (withdrawAmount < 500) {
      setWithdrawError('Minimum withdrawal amount is ₹500.');
      return;
    }

    let details: any = { method: withdrawMethod };
    
    if (withdrawMethod === 'bank') {
      if (!bankName || !accountNo || !ifsc) {
        setWithdrawError('Please fill in complete bank account particulars.');
        return;
      }
      details = { ...details, bankName, accountNo, ifsc };
    } else if (withdrawMethod === 'upi') {
      if (!userUpiId) {
        setWithdrawError('Please enter your valid UPI ID.');
        return;
      }
      details = { ...details, upiId: userUpiId };
    } else if (withdrawMethod === 'scanner') {
      if (!userScannerUrl) {
        setWithdrawError('Please provide your payment scanner QR image URL.');
        return;
      }
      details = { ...details, scannerImg: userScannerUrl };
    }

    const isSufficient = onSubmitWithdrawal(withdrawAmount, details);

    if (isSufficient) {
      setWithdrawSuccess(true);
      setWithdrawAmount(0);
      setBankName('');
      setAccountNo('');
      setIfsc('');
      setUserUpiId('');
      setUserScannerUrl('');
    } else {
      setWithdrawError('Insufficient balance in your Profit Wallet to complete this withdrawal.');
    }
  };

  // Filter user transactions
  const userTransactions = transactions.filter(tx => tx.username === currentUser?.username);

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-center space-y-6" id="wallet-auth-required">
        <div className="flex justify-center">
          <div className="p-3.5 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500">
            <Lock className="w-6 h-6" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-black text-white font-display">Wallet Protected</h3>
          <p className="text-xs text-slate-400">Please sign in or create an account to access, deposit, or withdraw funds.</p>
        </div>
        <button
          onClick={onNavigateToAuth}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-3 rounded-lg uppercase tracking-wider transition-all"
        >
          Go to Login / Registration
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left bg-trading-animated" id="wallet-section-container">
      <div className="scale-95 origin-top md:scale-100">
        <WalletHero onSetUpWallet={() => {
          setIsManualMode(true);
          setShowManualMethods(false);
          setInternalTab('deposit');
          setSelectedPaymentMethod(null);
          setPaymentStep('select_method');
          setDepositAmount(1000);
        }} />
      </div>

      {/* Wallet Balance Cards Bar - Visible on all devices */}
      <section className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6 items-center" id="wallet-statistics-bar">
        {/* Deposit/Trading Wallet */}
        <div className="bg-[#0b101f] border border-slate-800 rounded-xl sm:rounded-3xl p-2 sm:p-4 md:p-6 flex items-center justify-center shadow-xl group hover:border-emerald-500/30 transition-all duration-500 h-full">
          <div className="flex flex-col items-center text-center space-y-0.5 sm:space-y-1">
            <span className="text-[7px] xs:text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5 sm:mb-1">Trading Wallet</span>
            <p className="text-xs xs:text-sm sm:text-2xl md:text-3xl font-black text-white tabular-nums">{formatIndianCurrency(currentUser?.depositWallet || 0)}</p>
            <div className="flex items-center space-x-0.5 sm:space-x-1.5 text-emerald-500 mt-0.5 sm:mt-1">
              <Wallet className="w-2 sm:w-3.5 h-2 sm:h-3.5" />
              <span className="text-[6px] xs:text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Main Principal</span>
            </div>
          </div>
        </div>

        {/* Profit Wallet - Premium Highlighted Card (Thoda Bada type Mai) */}
        <div className="bg-[#0b101f] border-2 border-emerald-500 rounded-xl sm:rounded-[2rem] p-3 sm:p-6 md:p-8 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.25)] relative overflow-hidden group hover:border-emerald-400 transition-all duration-500 transform scale-102 sm:scale-105 z-10 h-full">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-emerald-500/5 blur-2xl sm:blur-3xl rounded-full" />
          <div className="flex flex-col items-center text-center space-y-0.5 sm:space-y-1 relative z-10">
            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded-full text-[5px] xs:text-[7px] sm:text-[8px] font-black uppercase tracking-widest mb-0.5 sm:mb-1 animate-pulse">
              ⭐ Premium
            </div>
            <span className="text-[8px] xs:text-[10px] sm:text-[11px] text-emerald-400 uppercase font-black tracking-widest">Profit Wallet</span>
            <p className="text-sm xs:text-base sm:text-3xl md:text-4xl font-black text-emerald-400 tabular-nums leading-none">{formatIndianCurrency(currentUser?.profitWallet || 0)}</p>
            <div className="flex items-center space-x-0.5 sm:space-x-1.5 text-emerald-400 mt-0.5 sm:mt-1">
              <TrendingUp className="w-2.5 sm:w-4 h-2.5 sm:h-4 animate-bounce" />
              <span className="text-[6px] xs:text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Withdrawal Active</span>
            </div>
          </div>
        </div>

        {/* Active Investment / Running Trades (INR symbol removed, displays only the number) */}
        <div className="bg-[#0b101f] border border-slate-800 rounded-xl sm:rounded-3xl p-2 sm:p-4 md:p-6 flex items-center justify-center shadow-xl group hover:border-cyan-500/30 transition-all duration-500 h-full">
          <div className="flex flex-col items-center text-center space-y-0.5 sm:space-y-1">
            <span className="text-[7px] xs:text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5 sm:mb-1">Running Trades</span>
            <p className="text-xs xs:text-sm sm:text-2xl md:text-3xl font-black text-white tabular-nums">
              {activeTrades.filter(t => t.userId === currentUser?.id && t.status === 'active').length}
            </p>
            <div className="flex items-center space-x-0.5 sm:space-x-1.5 text-cyan-400 mt-0.5 sm:mt-1">
              <FileText className="w-2 sm:w-3.5 h-2 sm:h-3.5" />
              <span className="text-[6px] xs:text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Running Trades</span>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Navigation Sub-Bar */}
      <div className="flex bg-[#050914] p-1 sm:p-1.5 rounded-2xl border border-slate-800 space-x-1 sm:space-x-1.5 font-bold text-[8px] xs:text-[9px] sm:text-[10px] uppercase tracking-wider max-w-xl shadow-inner w-full">
        <button
          id="btn-sub-deposit"
          onClick={() => { setInternalTab('deposit'); setDepositSuccess(false); }}
          className={`flex-1 py-2.5 sm:py-3 rounded-xl transition-all ${
            internalTab === 'deposit' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'
          }`}
        >
          Add Money
        </button>
        <button
          id="btn-sub-withdraw"
          onClick={() => {
            setInternalTab('withdraw');
            setWithdrawSuccess(false);
            setTimeout(() => {
              const element = document.getElementById('withdrawal-request-form');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'end' });
              } else {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }
            }, 100);
          }}
          className={`flex-1 py-2.5 sm:py-3 rounded-xl transition-all ${
            internalTab === 'withdraw' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'
          }`}
        >
          Withdraw Profit
        </button>
        <button
          onClick={() => setInternalTab('history')}
          className={`flex-1 py-2.5 sm:py-3 rounded-xl transition-all ${
            internalTab === 'history' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'
          }`}
        >
          History
        </button>
      </div>

      {/* SUB TAB VIEW: DEPOSIT FUNDS */}
      {internalTab === 'deposit' && (
        <div className="space-y-6">
          {/* 1. Active & Pending Trades Tracker - ALWAYS SHOW ABOVE SELECTION */}
          <section className="bg-[#0b101f] border border-white/5 rounded-[1.5rem] p-6 space-y-4" id="active-trades-tracker">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">Active Trades Tracker</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">Live Audit</span>
            </div>

            {/* List of active and pending trades */}
            <div className="space-y-3">
              {/* Active Trades */}
              {activeTrades.filter(t => t.userId === currentUser?.id && t.status === 'active').map(trade => (
                <LiveTradeTrackerCard key={trade.id} trade={trade} />
              ))}

              {/* Pending Transactions */}
              {transactions.filter(tx => tx.userId === currentUser?.id && tx.status === 'pending' && tx.type === 'deposit').map(tx => (
                <div key={tx.id} className="bg-slate-900/40 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between opacity-80">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-white uppercase">Inbound Deposit</p>
                      <p className="text-[9px] text-amber-500 font-mono font-bold uppercase tracking-widest">Status: PENDING APPROVAL</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-white">₹{tx.amount.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-500 font-mono">Ref: {tx.utr || tx.id}</p>
                  </div>
                </div>
              ))}

              {/* Pending Investment Requests */}
              {investmentRequests.filter(req => req.userId === currentUser?.id && req.status === 'pending').map(req => (
                <div key={req.id} className="bg-slate-900/40 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between opacity-80">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
                      <Smartphone className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-white uppercase">{req.planCategory} Request</p>
                      <p className="text-[9px] text-amber-500 font-mono font-bold uppercase tracking-widest">Status: PENDING AUDIT</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-white">₹{req.amount.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-500 font-mono">Audit: {req.id}</p>
                  </div>
                </div>
              ))}

              {activeTrades.filter(t => t.userId === currentUser?.id && t.status === 'active').length === 0 &&
               transactions.filter(tx => tx.userId === currentUser?.id && tx.status === 'pending' && tx.type === 'deposit').length === 0 &&
               investmentRequests.filter(req => req.userId === currentUser?.id && req.status === 'pending').length === 0 && (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 bg-slate-800/30 rounded-2xl flex items-center justify-center text-slate-600 mx-auto border border-slate-800/50">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-black">No active or pending allocations found</p>
                </div>
              )}
            </div>
          </section>

          {/* 2. Institutional Allocation Section */}
          <div id="deposit-protocol-section">
            {(!selectedPlanForInvestment && !isManualMode) ? (
            // NO PLAN SELECTED - Show compact Selection prompt with a gorgeous dropdown or slots list
            <section className="bg-[#0b101f] border border-white/5 rounded-[1.5rem] p-6 space-y-6 text-center relative overflow-hidden" id="deposit-select-plan-first">
            <div className="absolute top-0 left-1/2 w-48 h-48 bg-emerald-500/5 blur-[80px] -translate-x-1/2 -mt-24" />
            
            <div className="flex justify-center relative z-10">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <TrendingUp className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2 max-w-md mx-auto relative z-10">
              <h3 className="text-lg md:text-xl font-black text-white font-display uppercase tracking-tight">Institutional <span className="text-emerald-500">Allocation</span></h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Please select a verified trading contract slot from the registry below to initialize the sovereign capital settlement protocol.
              </p>
            </div>
            
            <div className="max-w-md mx-auto relative z-10">
              <label className="text-[8px] uppercase font-mono tracking-[0.2em] text-slate-500 font-black block mb-2 text-left">Registry Identification</label>
              <div className="relative group">
                <select
                  className="w-full bg-[#070b14]/80 border border-slate-800 text-slate-250 font-mono font-bold py-3 px-4 rounded-xl text-[11px] outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-inner"
                  onChange={(e) => {
                    const matched = INVESTMENT_PLANS.find(p => p.id === e.target.value);
                    if (matched) {
                      setSelectedPlanForInvestment(matched);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>IDENTIFY TRADING CONTRACT SLOT...</option>
                  {INVESTMENT_PLANS.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#0b101f]">
                      [{p.category}] PRINCIPAL: ₹{p.amount.toLocaleString()} | YIELD: ₹{p.estimatedProfit.toLocaleString()}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-emerald-500">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </section>
        ) : (
          // PLAN SELECTED - Show multi-step secure payment flow
          <section className="bg-[#0b101f] border border-white/5 rounded-[1.5rem] p-6 space-y-6 relative overflow-hidden" id="custom-investment-gateway">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-[80px] -mr-24 -mt-24" />
            
            {/* Header with plan details */}
            <div className="border-b border-slate-800/60 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Sovereign Settlement Gateway</span>
                </div>
                <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight font-display">
                  {isManualMode ? 'Custom Deposit' : selectedPlanForInvestment?.category} <span className="text-emerald-500">PROTOCOL</span>
                </h4>
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-black">Audit: HFT-LEDGER-V4</p>
              </div>
              
              {isManualMode ? (
                <div className="bg-[#060b17] border border-slate-800/50 p-4 rounded-2xl font-mono text-xs flex flex-col space-y-3 shadow-inner min-w-[200px]">
                  <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block">Manual Allocation Amount</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                    <input 
                      type="number"
                      min="1000"
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(Number(e.target.value));
                        setShowManualMethods(false);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-7 pr-3 text-white font-black outline-none focus:border-emerald-500 transition-colors"
                      placeholder="1000"
                    />
                  </div>
                  {depositAmount < 1000 && (
                    <span className="text-[8px] text-rose-500 font-bold uppercase tracking-tight">Min amount: ₹1,000</span>
                  )}
                  {!showManualMethods && (
                    <button
                      onClick={() => setShowManualMethods(true)}
                      disabled={depositAmount < 1000}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-[9px] rounded-xl uppercase tracking-widest transition-all"
                    >
                      Continue to Payment
                    </button>
                  )}
                </div>
              ) : selectedPlanForInvestment && (
                <div className="bg-[#060b17] border border-slate-800/50 p-4 rounded-2xl font-mono text-xs flex items-center justify-between md:space-x-8 shadow-inner">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block">Deployment Capital</span>
                    <span className="text-base font-black text-white">₹{selectedPlanForInvestment.amount.toLocaleString()}</span>
                  </div>
                  <div className="space-y-0.5 text-right pl-4 border-l border-slate-800/50">
                    <span className="text-[8px] text-emerald-500 uppercase font-black tracking-widest block">Projected Yield</span>
                    <span className="text-base font-black text-emerald-400">₹{selectedPlanForInvestment.estimatedProfit.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Verification and Protocol Info - Added to push payment methods down */}
            <div className="bg-[#040813]/60 border border-slate-800/40 p-4 rounded-xl space-y-3 relative z-10">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <ShieldAlert className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <h6 className="text-xs font-black text-slate-200 uppercase tracking-wider">Audit & Compliance verification</h6>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    This allocation is monitored by the Ministry of Finance digital asset protocols. Your capital is secured via SBI Finance institutional yield buffers.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/50">
                  <span className="text-[8px] text-slate-500 uppercase font-black block mb-0.5">Node Priority</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">HIGH-SPEED-V8</span>
                </div>
                <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/50">
                  <span className="text-[8px] text-slate-500 uppercase font-black block mb-0.5">Liquidity Lock</span>
                  <span className="text-[10px] text-amber-500 font-mono font-bold">60 MINUTE CYCLE</span>
                </div>
              </div>
            </div>

            {/* STEP 1: Select Payment Method - Custom "Choose deposit method" Layout */}
            {paymentStep === 'select_method' && (selectedPlanForInvestment || (isManualMode && showManualMethods)) && (
              <div className="space-y-6 animate-fadeIn relative z-10 pt-4 border-t border-slate-800/60 text-left">
                {/* Header line with close button */}
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-black text-white uppercase tracking-wider font-display">Choose Deposit Method</h5>
                  <button 
                    onClick={() => {
                      setSelectedPlanForInvestment(null);
                      setIsManualMode(false);
                    }}
                    className="p-1 bg-slate-900/60 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all"
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Subheader Banner */}
                <div className="bg-emerald-500/10 border border-emerald-500/15 p-3 rounded-2xl flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wide">Trusted by 1.2 million users</p>
                    <p className="text-[9px] text-slate-400 leading-tight">Your funds available 24/7, manage them whenever it suits you</p>
                  </div>
                </div>

                {/* Decorative secure asset allocation card */}
                <div className="bg-gradient-to-br from-emerald-950/40 via-[#0e2124]/40 to-slate-950 border border-emerald-500/10 p-4 rounded-2xl flex justify-between items-center relative overflow-hidden shadow-inner">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
                  <div className="space-y-1 relative z-10">
                    <p className="text-[8px] uppercase tracking-widest text-slate-500 font-mono font-black">Secure Ledger Allocation Node</p>
                    <h6 className="text-[13px] font-black text-white uppercase">INSTANT ROUTING GATEWAY</h6>
                    <p className="text-[9px] font-mono text-emerald-400/85">SBI • HFT • NODE_V8_ACTIVE</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg relative z-10 flex-shrink-0">
                    <span className="text-slate-950 text-[14px] font-black font-mono">₿</span>
                  </div>
                </div>

                {/* POPULAR SECTION */}
                <div className="space-y-2.5">
                  <h6 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block">⭐ Popular</h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Upi */}
                    <button
                      type="button"
                      disabled={depositAmount < 1000}
                      onClick={() => {
                        setSelectedPaymentMethod('Upi');
                        setPaymentStep('scan_qr');
                      }}
                      className={`flex items-center justify-between p-3.5 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-emerald-500/40 rounded-xl transition-all group text-left w-full ${depositAmount < 1000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-600/15 border border-purple-500/20 rounded-lg flex items-center justify-center font-black font-mono text-[9px] text-purple-400">
                          UPI
                        </div>
                        <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">Upi</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase group-hover:text-emerald-400 transition-colors">Instant</span>
                    </button>

                    {/* Upi QR */}
                    <button
                      type="button"
                      disabled={depositAmount < 1000}
                      onClick={() => {
                        setSelectedPaymentMethod('Upi QR');
                        setPaymentStep('scan_qr');
                      }}
                      className={`flex items-center justify-between p-3.5 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-emerald-500/40 rounded-xl transition-all group text-left w-full ${depositAmount < 1000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600/15 border border-blue-500/20 rounded-lg flex items-center justify-center font-black font-mono text-[9px] text-blue-400">
                          QR
                        </div>
                        <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">Upi QR</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase group-hover:text-emerald-400 transition-colors">Scan QR</span>
                    </button>

                    {/* Paytm by UPI */}
                    <button
                      type="button"
                      disabled={depositAmount < 1000}
                      onClick={() => {
                        setSelectedPaymentMethod('Paytm by UPI');
                        setPaymentStep('scan_qr');
                      }}
                      className={`flex items-center justify-between p-3.5 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-emerald-500/40 rounded-xl transition-all group text-left w-full ${depositAmount < 1000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-cyan-600/15 border border-cyan-500/20 rounded-lg flex items-center justify-center font-black font-mono text-[9px] text-cyan-400">
                          Paytm
                        </div>
                        <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">Paytm by UPI</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase group-hover:text-emerald-400 transition-colors">Upi node</span>
                    </button>

                    {/* Google Pay by UPI */}
                    <button
                      type="button"
                      disabled={depositAmount < 1000}
                      onClick={() => {
                        setSelectedPaymentMethod('Google Pay by UPI');
                        setPaymentStep('scan_qr');
                      }}
                      className={`flex items-center justify-between p-3.5 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-emerald-500/40 rounded-xl transition-all group text-left w-full ${depositAmount < 1000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1.5 shadow-sm">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Google_Pay_%28GPay%29_Logo_%282020%29.svg" alt="GPay" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">Google Pay (GPay)</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase group-hover:text-emerald-400 transition-colors">G-pay</span>
                    </button>

                    {/* Phone Pay by UPI */}
                    <button
                      type="button"
                      disabled={depositAmount < 1000}
                      onClick={() => {
                        setSelectedPaymentMethod('Phone Pay by UPI');
                        setPaymentStep('scan_qr');
                      }}
                      className={`flex items-center justify-between p-3.5 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-emerald-500/40 rounded-xl transition-all group text-left w-full ${depositAmount < 1000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#5f259f] border border-indigo-500/20 rounded-lg flex items-center justify-center p-1.5">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="w-full h-full object-contain brightness-0 invert" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">Phone Pay by UPI</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase group-hover:text-emerald-400 transition-colors">PhonePe</span>
                    </button>

                    {/* Paytm Business */}
                    <button
                      type="button"
                      disabled={depositAmount < 1000}
                      onClick={() => {
                        setSelectedPaymentMethod('Paytm Business');
                        setPaymentStep('scan_qr');
                      }}
                      className={`flex items-center justify-between p-3.5 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-emerald-500/40 rounded-xl transition-all group text-left w-full ${depositAmount < 1000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 shadow-sm">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo.svg" alt="Paytm" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">Paytm Business</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase group-hover:text-emerald-400 transition-colors">Paytm</span>
                    </button>

                    {/* Binance Pay */}
                    <button
                      type="button"
                      disabled={depositAmount < 1000}
                      onClick={() => {
                        setSelectedPaymentMethod('Binance Pay');
                        setPaymentStep('scan_qr');
                      }}
                      className={`flex items-center justify-between p-3.5 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-emerald-500/40 rounded-xl transition-all group text-left w-full ${depositAmount < 1000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-amber-600/15 border border-amber-500/20 rounded-lg flex items-center justify-center font-black font-mono text-[9px] text-amber-400">
                          Binance
                        </div>
                        <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">Binance Pay</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase group-hover:text-emerald-400 transition-colors">Crypto</span>
                    </button>

                    {/* iCash.One */}
                    <button
                      type="button"
                      disabled={depositAmount < 1000}
                      onClick={() => {
                        setSelectedPaymentMethod('iCash.One');
                        setPaymentStep('scan_qr');
                      }}
                      className={`flex items-center justify-between p-3.5 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-emerald-500/40 rounded-xl transition-all group text-left w-full ${depositAmount < 1000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-600/15 border border-slate-500/20 rounded-lg flex items-center justify-center font-black font-mono text-[9px] text-slate-350">
                          iCash
                        </div>
                        <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">iCash.One</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase group-hover:text-emerald-400 transition-colors">Instant</span>
                    </button>
                  </div>
                </div>

                {/* CRYPTO WALLETS SECTION */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h6 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                      <span>🌐 Crypto wallets</span>
                    </h6>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-[8px] uppercase rounded font-mono tracking-wider animate-pulse">
                      + PAYBACK 5%
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-tight bg-slate-950/40 p-2.5 rounded-lg border border-orange-500/5 font-mono">
                    Deposit in crypto and get 5% payback instantly - straight to your profit account balance.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Gate Pay */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentMethod('Gate Pay');
                        setPaymentStep('scan_qr');
                      }}
                      className="flex items-center justify-between p-3 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-orange-500/30 rounded-xl transition-all group text-left w-full"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 bg-red-600/10 border border-red-500/15 rounded-lg flex items-center justify-center font-black font-mono text-[8px] text-red-400">
                          Gate
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Gate Pay</span>
                      </div>
                    </button>

                    {/* Tonkeeper Pay (USDT) */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentMethod('Tonkeeper Pay (USDT)');
                        setPaymentStep('scan_qr');
                      }}
                      className="flex items-center justify-between p-3 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-orange-500/30 rounded-xl transition-all group text-left w-full"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 bg-blue-600/10 border border-blue-500/15 rounded-lg flex items-center justify-center font-black font-mono text-[8px] text-blue-400">
                          TON
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Tonkeeper USDT</span>
                      </div>
                    </button>

                    {/* Other cryptocurrencies */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentMethod('Other cryptocurrencies');
                        setPaymentStep('scan_qr');
                      }}
                      className="flex items-center justify-between p-3 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-orange-500/30 rounded-xl transition-all group text-left w-full"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 bg-amber-600/10 border border-amber-500/15 rounded-lg flex items-center justify-center font-black font-mono text-[8px] text-amber-400">
                          CRYP
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Other Crypto</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* INTERNET BANKING SECTION */}
                <div className="space-y-2.5">
                  <h6 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block">🏛️ Internet banking</h6>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Upi */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentMethod('Upi');
                        setPaymentStep('scan_qr');
                      }}
                      className="flex items-center justify-between p-3 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/60 rounded-xl transition-all hover:border-emerald-500/30 text-left w-full"
                    >
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Upi Fast-settlement</span>
                    </button>

                    {/* Upi QR */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentMethod('Upi QR');
                        setPaymentStep('scan_qr');
                      }}
                      className="flex items-center justify-between p-3 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/60 rounded-xl transition-all hover:border-emerald-500/30 text-left w-full"
                    >
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Upi QR Scan banking</span>
                    </button>
                  </div>
                </div>

                {/* OTHER SECTION */}
                <div className="space-y-2.5">
                  <h6 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block">📁 Other</h6>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaymentMethod('iCash.One');
                      setPaymentStep('scan_qr');
                    }}
                    className="flex items-center justify-between p-3 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/60 rounded-xl transition-all hover:border-emerald-500/30 text-left w-full"
                  >
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">iCash.One Settlement Node</span>
                  </button>
                </div>

                {/* TRUST BADGES FOOTER */}
                <div className="pt-4 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-3 text-[9px] font-mono font-bold text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-emerald-500 font-extrabold">🔒 SECURED</span>
                    <span>PCI DSS COMPLIANT</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>3D SECURE</span>
                    <span>€ CERTIFIED</span>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForInvestment(null)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-mono font-bold flex items-center space-x-1.5 transition-all uppercase tracking-tighter"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Change Allocation Slot</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Scan QR or Address View with Validity CountDown */}
            {paymentStep === 'scan_qr' && selectedPaymentMethod && (() => {
              // Helper to resolve specific dynamic fields for chosen method
              const defaultQr = systemSettings.qrCodeImage || systemSettings.qrCodeUrl;
              const defaultUpi = systemSettings.upiId;

              const getDetails = (name: string) => {
                switch (name) {
                  case 'Upi':
                    return {
                      upiId: systemSettings.upiUpiId || defaultUpi,
                      qrUrl: systemSettings.upiQrCode || defaultQr,
                      isCrypto: false
                    };
                  case 'Upi QR':
                    return {
                      upiId: systemSettings.upiQrUpiId || defaultUpi,
                      qrUrl: systemSettings.upiQrQrCode || defaultQr,
                      isCrypto: false
                    };
                  case 'Paytm':
                  case 'Paytm by UPI':
                    return {
                      upiId: systemSettings.paytmUpiId || defaultUpi,
                      qrUrl: systemSettings.paytmQrCode || defaultQr,
                      isCrypto: false
                    };
                  case 'Google Pay':
                  case 'Google Pay by UPI':
                    return {
                      upiId: systemSettings.gpayUpiId || defaultUpi,
                      qrUrl: systemSettings.gpayQrCode || defaultQr,
                      isCrypto: false
                    };
                  case 'Phone Pay':
                  case 'Phone Pay by UPI':
                    return {
                      upiId: systemSettings.phonepeUpiId || defaultUpi,
                      qrUrl: systemSettings.phonepeQrCode || defaultQr,
                      isCrypto: false
                    };
                  case 'iCash.One':
                    return {
                      upiId: systemSettings.icashUpiId || defaultUpi,
                      qrUrl: systemSettings.icashQrCode || defaultQr,
                      isCrypto: false
                    };
                  case 'Gate Pay':
                    return {
                      upiId: systemSettings.gatepayUpiId || defaultUpi,
                      qrUrl: systemSettings.gatepayQrCode || defaultQr,
                      isCrypto: false
                    };
                  case 'Binance Pay':
                    return {
                      address: systemSettings.binanceAddress || 'binance-pay-id-872910291',
                      isCrypto: true
                    };
                  case 'Tonkeeper Pay (USDT)':
                    return {
                      address: systemSettings.tonkeeperAddress || 'UQCd3v0pP4H8A_UpxX5Wv8G9F_uS0qP9K3d2A1m7S8r5N6tY',
                      isCrypto: true
                    };
                  case 'Other cryptocurrencies':
                    return {
                      address: systemSettings.otherCryptoAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
                      isCrypto: true
                    };
                  default:
                    return {
                      upiId: defaultUpi,
                      qrUrl: defaultQr,
                      isCrypto: false
                    };
                }
              };

              const details = getDetails(selectedPaymentMethod);

              return (
                <div className="space-y-4 animate-fadeIn text-left">
                  <div className="flex items-center justify-between border-b border-slate-800/40 pb-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentStep('select_method');
                        setSelectedPaymentMethod(null);
                      }}
                      className="text-[10px] font-mono font-bold text-slate-400 hover:text-white flex items-center space-x-1 transition-all uppercase tracking-wider"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Choose Method</span>
                    </button>
                    <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                      Protocol: <b className="text-amber-500 font-black">{selectedPaymentMethod}</b>
                    </span>
                  </div>

                  {details.isCrypto ? (
                    // CRYPTOCURRENCY LAYOUT: NO QR CODE, ONLY WRITTEN ADDRESS & COPY OPTION
                    <div className="space-y-3.5">
                      <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/15 p-4 rounded-xl space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                          <h6 className="text-[11px] font-black text-amber-500 uppercase tracking-wider">Crypto Settlement Active</h6>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal font-medium">
                          Please deposit your allocation capital using the custom wallet address credentials below. Copy the address and submit the hash transaction id in the final step.
                        </p>
                      </div>

                      {/* Large Address copy box */}
                      <div className="bg-[#03060c] border border-slate-850 p-4 rounded-xl space-y-3 font-mono">
                        <div className="space-y-1">
                          <span className="text-[8px] text-slate-500 uppercase font-black block tracking-widest">Network Wallet Address</span>
                          <div className="bg-[#060a14] border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-2 overflow-hidden">
                            <span className="text-slate-200 font-black text-[11px] select-all break-all pr-2 font-mono">
                              {details.address}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(details.address || '')}
                              className="p-2 bg-[#0c1425] hover:bg-slate-800 border border-slate-750 hover:text-white rounded-lg transition-all text-amber-500 flex items-center space-x-1 flex-shrink-0"
                            >
                              {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span className="text-[9px] font-black uppercase">{copiedText ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        <p className="text-[9px] text-slate-500 font-mono leading-tight">
                          💡 Ensure you send the exact transaction amount of <b className="text-slate-300">₹{depositAmount.toLocaleString()}</b> on the correct chain protocol.
                        </p>
                      </div>

                      {/* Progress Session validity countdown */}
                      <div className="bg-[#03060c] border border-slate-850 p-3.5 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-450 flex items-center space-x-1.5">
                            <Clock className={`w-4 h-4 animate-spin ${timeLeft <= 30 ? 'text-amber-500' : 'text-emerald-400'}`} />
                            <span>Address Validity Session</span>
                          </span>
                          <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                            timeLeft <= 30 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {timeLeft}s
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              timeLeft <= 30 ? 'bg-amber-500' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${(timeLeft / 60) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // UPI / QR SYSTEM LAYOUT: SCANNER SHOWN, DOWNLOAD BUTTON, UPI ID AND COPY BUTTONS
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#060a15]/60 border border-white/[0.03] p-4 rounded-xl">
                      {/* Left: Dynamic QR with Validity Scanning effect */}
                      <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                        <div className="w-32 h-32 bg-white p-1.5 rounded-xl flex flex-col items-center justify-center shadow-lg relative border border-amber-500/30">
                          <div className="absolute inset-x-1.5 h-0.5 bg-amber-500 animate-scan"></div>
                          <img 
                            src={details.qrUrl}
                            alt="Secure Payment QR Scanner"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>

                        <a
                          href={details.qrUrl}
                          download={`${selectedPaymentMethod}_qr.jpg`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-[9px] text-amber-500 hover:text-amber-400 font-mono font-black transition-all uppercase tracking-wider"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download QR</span>
                        </a>
                      </div>

                      {/* Right: Timer details and Copy buttons */}
                      <div className="flex-grow w-full space-y-3 text-left">
                        {/* Countdown Tracker Box */}
                        <div className="bg-[#03060c] border border-slate-850 p-3 rounded-lg space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center space-x-1">
                              <Clock className={`w-3.5 h-3.5 animate-spin ${timeLeft <= 30 ? 'text-amber-500' : 'text-emerald-400'}`} />
                              <span>QR Validity Session</span>
                            </span>
                            <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                              timeLeft <= 30 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {timeLeft}s
                            </span>
                          </div>
                          
                          {/* Dynamic visual progress bar */}
                          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                timeLeft <= 30 ? 'bg-amber-500' : 'bg-emerald-400'
                              }`}
                              style={{ width: `${(timeLeft / 60) * 100}%` }}
                            ></div>
                          </div>

                          <p className="text-[9px] text-slate-500 font-mono leading-tight">
                            Terminates in <b className="text-slate-300">{timeLeft} seconds</b>. The system resets if unpaid after this window.
                          </p>
                        </div>

                        {/* Copy UPI Address Details */}
                        <div className="bg-[#03060c] border border-slate-850 p-2.5 rounded-lg flex justify-between items-center font-mono">
                          <div className="min-w-0 pr-2">
                            <span className="text-[8px] text-slate-500 uppercase block tracking-wider">Secure UPI Address</span>
                            <span className="text-slate-300 font-black text-[10px] truncate block allow-copy font-mono select-all">{details.upiId}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyText(details.upiId || '')}
                            className="p-1.5 bg-[#090e1c] border border-slate-800 hover:text-white rounded transition-all text-amber-500 flex items-center space-x-1 flex-shrink-0 ml-2"
                          >
                            {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span className="text-[8px] font-black uppercase">{copiedText ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Secure Flow submission Lock Constraint */}
                  <div className="bg-[#040813]/40 border border-slate-800/60 p-3 rounded-xl space-y-3">
                    <div className="flex items-start space-x-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[9px] text-slate-400 leading-normal font-mono">
                        <b>DOUBLE-SPEND LOCK:</b> "Proceed" unlocks after 30 seconds for manual validation of transaction coordinates.
                      </p>
                    </div>

                    {timeLeft > 30 ? (
                      <button
                        disabled
                        className="w-full bg-slate-800/50 text-slate-500 font-black text-[10px] py-2.5 rounded-lg uppercase tracking-wider cursor-not-allowed flex items-center justify-center space-x-1.5 font-mono"
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                        <span>Unlocking Form in {timeLeft - 30}s...</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPaymentStep('trading_form')}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] py-2.5 rounded-lg uppercase tracking-widest transition-all shadow-md shadow-amber-500/10 flex items-center justify-center space-x-1.5"
                      >
                        <span>Proceed to Trading Form</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* STEP 3: Basic trading details form */}
            {paymentStep === 'trading_form' && (
              <form onSubmit={handleTradingFormSubmit} className="space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentStep('scan_qr')}
                    className="text-[10px] font-mono font-bold text-slate-400 hover:text-white flex items-center space-x-1 transition-all"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back to Scanner</span>
                  </button>
                  <span className="text-[9px] font-mono text-emerald-400 font-black uppercase flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Payment Verified</span>
                  </span>
                </div>

                <div className="bg-[#040813]/40 border border-slate-800/60 px-3 py-2 rounded-lg text-left">
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                    Complete verification with official registration details. Fields are validated for security.
                  </p>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter legal full name"
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      className="w-full bg-[#060a13]/80 border border-slate-800 text-white font-mono py-2 px-3 rounded-lg text-[11px] outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/10 placeholder-slate-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Email ID</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. contact@domain.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-[#060a13]/80 border border-slate-800 text-white font-mono py-2 px-3 rounded-lg text-[11px] outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/10 placeholder-slate-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-[#060a13]/80 border border-slate-800 text-white font-mono py-2 px-3 rounded-lg text-[11px] outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/10 placeholder-slate-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={formDob}
                      onChange={(e) => setFormDob(e.target.value)}
                      className="w-full bg-[#060a13]/80 border border-slate-800 text-slate-300 font-mono py-1.5 px-3 rounded-lg text-[11px] outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Profession</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Business Analyst"
                      value={formProfession}
                      onChange={(e) => setFormProfession(e.target.value)}
                      className="w-full bg-[#060a13]/80 border border-slate-800 text-white font-mono py-2 px-3 rounded-lg text-[11px] outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/10 placeholder-slate-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500/80 font-bold block">12-Digit UPI UTR No.</label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      placeholder="e.g. 417281923052"
                      value={formUtr}
                      onChange={(e) => setFormUtr(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-[#060a13]/80 border border-amber-500/30 text-amber-400 font-mono py-2 px-3 rounded-lg text-[11px] outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-bold placeholder-amber-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[8px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Investment Amount (INR)</label>
                  <input
                    type="text"
                    disabled
                    value={`₹${depositAmount.toLocaleString()}`}
                    className="w-full bg-[#03060c] border border-slate-900 text-slate-400 font-mono py-2 px-3 rounded-lg text-[11px] cursor-not-allowed font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] py-2.5 rounded-lg uppercase tracking-widest transition-all shadow-md shadow-emerald-500/10 mt-2 flex items-center justify-center space-x-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Submit Application via WhatsApp</span>
                </button>
              </form>
            )}

            {/* STEP 4: Success with WhatsApp action */}
            {paymentStep === 'success' && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-5 max-w-xl mx-auto animate-fadeIn" id="investment-success-view">
                <div className="w-12 h-12 bg-emerald-500/25 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h5 className="text-xl font-black text-white font-display uppercase tracking-tight">Deposit Successfully Submitted!</h5>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto font-medium">
                    Your investment of <b className="text-emerald-400 font-mono">₹{depositAmount.toLocaleString()}</b> is now under high-priority audit. Your trade will activate within 15-30 minutes.
                  </p>
                  <div className="bg-[#050914] p-3.5 rounded-xl border border-slate-800 text-[11px] text-amber-400 font-mono text-left space-y-1 mt-4">
                    <p className="font-bold uppercase mb-1 flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                      Critical Next Step:
                    </p>
                    <p>If WhatsApp didn't open automatically, please click the button below. You must send the formatted message to our compliance desk to finalize your UTR verification.</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <a
                    href={lastSubmittedMsg}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-lg text-xs tracking-wider uppercase transition-all shadow-md shadow-emerald-500/20"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      setPaymentStep('select_method');
                      setSelectedPaymentMethod(null);
                      setSelectedPlanForInvestment(null);
                      setIsManualMode(false);
                      setInternalTab('deposit');
                      // Scroll to tracker
                      setTimeout(() => {
                        const element = document.getElementById('active-trades-tracker');
                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="inline-flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-lg text-xs tracking-wider uppercase transition-all shadow-md shadow-amber-500/20"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Go Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setPaymentStep('select_method');
                      setSelectedPaymentMethod(null);
                    }}
                    className="bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 font-bold px-6 py-3.5 rounded-lg text-xs"
                  >
                    New Slot
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
        </div>
      </div>
    )}

      {/* SUB TAB VIEW: WITHDRAW PROFIT */}
      {internalTab === 'withdraw' && (
        <section className="bg-[#0b101f] border border-white/5 rounded-[1.5rem] p-5 space-y-5" id="withdrawal-request-form">
          <div className="border-b border-slate-800/60 pb-3">
            <h4 className="text-base font-black text-white uppercase tracking-tight font-display">Withdrawal Center</h4>
            <p className="text-[10px] text-slate-400">Withdraw matured profits directly to your bank account. Transfers are subject to security checks.</p>
          </div>

          {withdrawSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl text-center space-y-3 max-w-xl mx-auto" id="withdraw-success-view">
              <div className="w-10 h-10 bg-emerald-500/25 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-white font-sans">Withdrawal Request Registered!</h5>
                <p className="text-[10px] text-slate-300 leading-normal">
                  Our Indian Finance Ministry Compliance Desk is validating the security coordinates. Funds will reflect in your account post admin verification.
                </p>
                <p className="text-[9px] text-amber-400 font-mono mt-2">Status: Pending Verification</p>
              </div>
              <button
                onClick={() => setWithdrawSuccess(false)}
                className="bg-slate-900 border border-slate-800 text-slate-300 font-black py-1.5 px-3 rounded-md text-[10px] tracking-wider uppercase mt-1"
              >
                Log New Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Side: Summary and Withdrawal Method Selection */}
              <div className="lg:col-span-5 bg-[#050914] border border-slate-850 rounded-xl p-4 space-y-4 text-left">
                <div className="space-y-3">
                  <div className="bg-[#03060c] p-3 rounded-lg border border-slate-850">
                    <span className="text-[8px] text-slate-500 block uppercase tracking-widest font-mono font-bold mb-0.5">Settlement Balance</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">{formatIndianCurrency(currentUser?.profitWallet || 0)}</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Method</label>
                    <div className="grid grid-cols-1 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('upi')}
                        className={`py-2 px-3 border rounded-lg text-[10px] font-bold uppercase font-mono transition-all flex items-center justify-between ${
                          withdrawMethod === 'upi' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-[#0d1222] border-slate-850 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <Smartphone className="w-3.5 h-3.5 mr-1.5" />
                          <span>UPI Transfer</span>
                        </div>
                        {withdrawMethod === 'upi' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('scanner')}
                        className={`py-2 px-3 border rounded-lg text-[10px] font-bold uppercase font-mono transition-all flex items-center justify-between ${
                          withdrawMethod === 'scanner' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-[#0d1222] border-slate-850 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <QrCode className="w-3.5 h-3.5 mr-1.5" />
                          <span>QR Scanner Payout</span>
                        </div>
                        {withdrawMethod === 'scanner' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('bank')}
                        className={`py-2 px-3 border rounded-lg text-[10px] font-bold uppercase font-mono transition-all flex items-center justify-between ${
                          withdrawMethod === 'bank' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-[#0d1222] border-slate-850 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <Wallet className="w-3.5 h-3.5 mr-1.5" />
                          <span>Bank Account Settlement</span>
                        </div>
                        {withdrawMethod === 'bank' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form details */}
              <div className="lg:col-span-7 bg-[#070c18]/80 border border-slate-850 rounded-xl p-4">
                <form onSubmit={handleWithdrawalSubmit} className="space-y-3.5 text-left" id="withdrawal-submission-form">
                  {withdrawError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg flex items-center space-x-2 text-[10px] text-rose-400 font-sans">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{withdrawError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Method Selected</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('upi')}
                          className={`py-1.5 px-1 border rounded-lg text-[9px] font-bold uppercase font-mono transition-all ${
                            withdrawMethod === 'upi' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-[#0d1222] border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          UPI ID
                        </button>
                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('scanner')}
                          className={`py-1.5 px-1 border rounded-lg text-[9px] font-bold uppercase font-mono transition-all ${
                            withdrawMethod === 'scanner' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-[#0d1222] border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          Scanner
                        </button>
                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('bank')}
                          className={`py-1.5 px-1 border rounded-lg text-[9px] font-bold uppercase font-mono transition-all ${
                            withdrawMethod === 'bank' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-[#0d1222] border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          Bank
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Withdrawal Amount (INR)</label>
                      <input
                        type="number"
                        required
                        min="500"
                        id="withdraw-amount-input"
                        placeholder="e.g. 15000"
                        value={withdrawAmount || ''}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        className="w-full bg-[#060a13]/80 border border-slate-800 text-white font-mono font-bold py-2 px-3 rounded-lg text-[11px] outline-none focus:border-amber-500 placeholder-slate-650"
                      />
                    </div>

                    {withdrawMethod === 'bank' && (
                      <div className="space-y-3 animate-fadeIn">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Bank Name</label>
                          <input
                            type="text"
                            placeholder="State Bank of India"
                            id="withdraw-bank-input"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full bg-[#060a13]/80 border border-slate-800 text-white py-2 px-3 rounded-lg text-[11px] outline-none focus:border-amber-500 placeholder-slate-650"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Account Number</label>
                            <input
                              type="text"
                              placeholder="31024567210"
                              id="withdraw-account-input"
                              value={accountNo}
                              onChange={(e) => setAccountNo(e.target.value)}
                              className="w-full bg-[#060a13]/80 border border-slate-800 text-white font-mono py-2 px-3 rounded-lg text-[11px] outline-none focus:border-amber-500 placeholder-slate-650"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">IFSC Code</label>
                            <input
                              type="text"
                              placeholder="SBIN0004921"
                              id="withdraw-ifsc-input"
                              value={ifsc}
                              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                              className="w-full bg-[#060a13]/80 border border-slate-800 text-white font-mono py-2 px-3 rounded-lg text-[11px] outline-none focus:border-amber-500 placeholder-slate-650"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {withdrawMethod === 'upi' && (
                      <div className="space-y-1 animate-fadeIn">
                        <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">User UPI ID</label>
                        <input
                          type="text"
                          placeholder="username@okaxis"
                          value={userUpiId}
                          onChange={(e) => setUserUpiId(e.target.value)}
                          className="w-full bg-[#060a13]/80 border border-slate-800 text-white font-mono py-2 px-3 rounded-lg text-[11px] outline-none focus:border-amber-500 placeholder-slate-650"
                        />
                      </div>
                    )}

                    {withdrawMethod === 'scanner' && (
                      <div className="space-y-1 animate-fadeIn">
                        <label className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Upload Payment QR</label>
                        <div className="relative group">
                          <input
                            type="file"
                            accept="image/*"
                            id="withdraw-qr-upload"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setUserScannerUrl(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                          <label 
                            htmlFor="withdraw-qr-upload"
                            className="w-full bg-[#060a13]/80 border border-dashed border-slate-800 hover:border-amber-500/40 text-slate-400 font-mono py-5 px-3 rounded-xl text-[10px] flex flex-col items-center justify-center cursor-pointer transition-all"
                          >
                            {userScannerUrl ? (
                              <div className="flex flex-col items-center space-y-1">
                                <img src={userScannerUrl} alt="Preview" className="w-14 h-14 object-contain rounded border border-slate-700" />
                                <span className="text-emerald-400 font-bold">QR Selected</span>
                                <span className="text-[9px] text-slate-500">Click to replace</span>
                              </div>
                            ) : (
                              <>
                                <QrCode className="w-6 h-6 mb-1 opacity-30 text-slate-400" />
                                <span>Click to upload QR code image</span>
                                <span className="text-[8px] text-slate-600 tracking-wider">JPG, PNG, WEBP</span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="btn-withdraw-submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] py-2 px-3 rounded-lg uppercase tracking-widest transition-all shadow-md shadow-amber-500/10 mt-2 flex items-center justify-center space-x-1"
                  >
                    <span>Request Settlement</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* SUB TAB VIEW: TRANSACTION HISTORY LOGS */}
      {internalTab === 'history' && (
        <section className="bg-[#0b101f] border border-white/5 rounded-[1.5rem] p-5 shadow-xl" id="transaction-history-logs-sub-tab">
          {/* Small Profit Dashboard */}
          <div className="grid grid-cols-2 gap-3 mb-6 bg-[#040813]/60 p-4 rounded-2xl border border-slate-800/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
            <div className="space-y-1">
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block">Available Profits</span>
              <span className="text-sm font-black text-white">{formatIndianCurrency(currentUser?.profitWallet || 0)}</span>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-tight">+0.00% Today</span>
              </div>
            </div>
            <div className="space-y-1 pl-3 border-l border-slate-800/50">
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block">Active Capital</span>
              <span className="text-sm font-black text-white">{formatIndianCurrency(currentUser?.depositWallet || 0)}</span>
              <div className="flex items-center space-x-1">
                <Activity className="w-2.5 h-2.5 text-amber-500" />
                <span className="text-[8px] text-amber-500 font-bold uppercase tracking-tight">V8-Audit Active</span>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-800/60 pb-3 mb-4">
            <h4 className="text-base font-extrabold text-white uppercase tracking-wider font-display">My Transaction Ledger</h4>
            <p className="text-[10px] text-slate-400 font-sans">Full cryptographic history of your capital allocations, deposits, and withdrawal settlements.</p>
          </div>

          {userTransactions.length === 0 ? (
            <div className="text-center py-8 bg-[#050913] rounded-xl border border-dashed border-slate-800">
              <p className="text-[10px] text-slate-500 font-mono">No transaction ledger history recorded under your account yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {userTransactions.map(tx => (
                <div 
                  key={tx.id} 
                  className="bg-[#050914]/80 border border-slate-850 hover:border-slate-800/80 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all animate-fadeIn"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      tx.type === 'deposit' 
                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' 
                        : 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                    }`}>
                      {tx.type === 'deposit' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="min-w-0 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-slate-200">
                          {tx.type === 'deposit' ? 'Ledger Credit' : 'Withdrawal Payout'}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-slate-500">
                          #{tx.id}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 truncate block">
                        {tx.type === 'deposit' 
                          ? `Ref: ${tx.utr || 'Direct Transfer'}` 
                          : `Channel: ${(tx.bankDetails?.method || 'UPI/BANK').toUpperCase()}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 border-slate-800/40 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-mono font-black text-white block">
                        {tx.type === 'deposit' ? '+' : '-'} {formatIndianCurrency(tx.amount)}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500 block uppercase">
                        INR Value Settlement
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                      tx.status === 'completed' || tx.status === 'approved'
                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                        : tx.status === 'pending'
                        ? 'bg-amber-500/5 text-amber-400 border-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.05)]'
                        : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
