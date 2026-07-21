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
        <WalletHero onSetUpWallet={onNavigateToPlans} />
      </div>

      {/* Wallet Balance Cards Bar - Visible on all devices */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6" id="wallet-statistics-bar">
        {/* Profit Wallet */}
        <div className="bg-[#0b101f] border-2 border-emerald-500/40 rounded-3xl p-6 flex items-center justify-center shadow-2xl relative overflow-hidden group hover:border-emerald-500/60 transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
          <div className="flex flex-col items-center text-center space-y-1 relative z-10">
            <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider mb-1">Profit Wallet</span>
            <p className="text-3xl font-black text-emerald-400 tabular-nums">{formatIndianCurrency(currentUser?.profitWallet || 0)}</p>
            <div className="flex items-center space-x-1.5 text-emerald-400 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Available to Withdraw</span>
            </div>
          </div>
        </div>

        {/* Deposit Wallet */}
        <div className="bg-[#0b101f] border border-slate-800 rounded-3xl p-6 flex items-center justify-center shadow-2xl group hover:border-emerald-500/30 transition-all duration-500">
          <div className="flex flex-col items-center text-center space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Trading Wallet</span>
            <p className="text-3xl font-black text-white tabular-nums">{formatIndianCurrency(currentUser?.depositWallet || 0)}</p>
            <div className="flex items-center space-x-1.5 text-emerald-500 mt-1">
              <Wallet className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Main Principal</span>
            </div>
          </div>
        </div>

        {/* Active Investment */}
        <div className="bg-[#0b101f] border border-slate-800 rounded-3xl p-6 flex items-center justify-center shadow-2xl group hover:border-cyan-500/30 transition-all duration-500">
          <div className="flex flex-col items-center text-center space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Running Trades</span>
            <p className="text-3xl font-black text-white tabular-nums">{formatIndianCurrency(currentUser?.activeInvestment || 0)}</p>
            <div className="flex items-center space-x-1.5 text-cyan-400 mt-1">
              <FileText className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Active Investment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Navigation Sub-Bar */}
      <div className="flex bg-[#050914] p-1.5 rounded-2xl border border-slate-800 space-x-1.5 font-bold text-[10px] uppercase tracking-wider max-w-xl shadow-inner">
        <button
          id="btn-sub-deposit"
          onClick={() => { setInternalTab('deposit'); setDepositSuccess(false); }}
          className={`flex-1 py-3 rounded-xl transition-all ${
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
          className={`flex-1 py-3 rounded-xl transition-all ${
            internalTab === 'withdraw' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'
          }`}
        >
          Withdraw Profit
        </button>
        <button
          onClick={() => setInternalTab('history')}
          className={`flex-1 py-3 rounded-xl transition-all ${
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
          {!selectedPlanForInvestment ? (
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
                  {selectedPlanForInvestment.category} <span className="text-emerald-500">PROTOCOL</span>
                </h4>
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-black">Audit: HFT-LEDGER-V4</p>
              </div>
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

            {/* STEP 1: Select Payment Method - Now at the bottom */}
            {paymentStep === 'select_method' && (
              <div className="space-y-5 animate-fadeIn relative z-10 pt-4 border-t border-slate-800/60">
                <div className="text-center space-y-1">
                  <h5 className="text-xs font-black text-slate-200 uppercase tracking-widest">Select Payment Processor</h5>
                  <p className="text-[10px] text-slate-500 font-medium">Secure instant routing via verified UPI nodes</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Google Pay */}
                  <button
                    onClick={() => {
                      setSelectedPaymentMethod('Google Pay');
                      setPaymentStep('scan_qr');
                    }}
                    className="flex flex-col items-center justify-center space-y-3 bg-[#0c1425] hover:bg-[#121b33] border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl transition-all group relative"
                  >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2.5 shadow-lg group-hover:scale-110 transition-transform">
                      <img src="https://www.gstatic.com/images/branding/product/2x/gpay_96dp.png" alt="GPay" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">Google Pay</span>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    </div>
                  </button>

                  {/* PhonePe */}
                  <button
                    onClick={() => {
                      setSelectedPaymentMethod('Phone Pay');
                      setPaymentStep('scan_qr');
                    }}
                    className="flex flex-col items-center justify-center space-y-3 bg-[#0c1425] hover:bg-[#121b33] border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl transition-all group relative"
                  >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-lg group-hover:scale-110 transition-transform">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ_C9I_x9z_B0H_B9u0C9z1G9z2E9S2T2R2Q&s" alt="PhonePe" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">Phone Pay</span>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    </div>
                  </button>

                  {/* Paytm */}
                  <button
                    onClick={() => {
                      setSelectedPaymentMethod('Paytm');
                      setPaymentStep('scan_qr');
                    }}
                    className="flex flex-col items-center justify-center space-y-3 bg-[#0c1425] hover:bg-[#121b33] border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl transition-all group relative"
                  >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-lg group-hover:scale-110 transition-transform">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-M9S9Z9P9_B0H_B9u0C9z1G9z2E9S2T2R2Q&s" alt="Paytm" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">Paytm</span>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    </div>
                  </button>

                  {/* BHIM UPI */}
                  <button
                    onClick={() => {
                      setSelectedPaymentMethod('Bhim Upi');
                      setPaymentStep('scan_qr');
                    }}
                    className="flex flex-col items-center justify-center space-y-3 bg-[#0c1425] hover:bg-[#121b33] border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl transition-all group relative"
                  >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2.5 shadow-lg group-hover:scale-110 transition-transform">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR61z-oK7X7H-V6W2qR1fD8eL4eE9W2e3Y2eA&s" alt="BHIM UPI" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">BHIM UPI</span>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    </div>
                  </button>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setSelectedPlanForInvestment(null)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-mono font-bold flex items-center space-x-1.5 transition-all uppercase tracking-tighter"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Change Allocation Slot</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Scan QR & Validity CountDown */}
            {paymentStep === 'scan_qr' && selectedPaymentMethod && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-2.5">
                  <button
                    onClick={() => {
                      setPaymentStep('select_method');
                      setSelectedPaymentMethod(null);
                    }}
                    className="text-[10px] font-mono font-bold text-slate-400 hover:text-white flex items-center space-x-1 transition-all"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Change Method</span>
                  </button>
                  <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                    Gateway: <b className="text-amber-400 font-black">{selectedPaymentMethod}</b>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#060a15]/60 border border-white/[0.03] p-4 rounded-xl">
                  {/* Left: Dynamic QR with Validity Scanning effect */}
                  <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                    <div className="w-32 h-32 bg-white p-1.5 rounded-xl flex flex-col items-center justify-center shadow-lg relative border border-amber-500/30">
                      <div className="absolute inset-x-1.5 h-0.5 bg-amber-500 animate-scan"></div>
                      <img 
                        src={systemSettings.qrCodeImage || systemSettings.qrCodeUrl}
                        alt="Secure Payment QR Scanner"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    <a
                      href={systemSettings.qrCodeImage || systemSettings.qrCodeUrl}
                      download="payment_qr.jpg"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-[9px] text-amber-500 hover:text-amber-400 font-mono font-black transition-all"
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
                      <div className="min-w-0">
                        <span className="text-[8px] text-slate-500 uppercase block tracking-wider">Secure UPI Address</span>
                        <span className="text-slate-300 font-black text-[10px] truncate block allow-copy">{systemSettings.upiId}</span>
                      </div>
                      <button
                        onClick={handleCopyUpi}
                        className="p-1.5 bg-[#090e1c] border border-slate-800 hover:text-white rounded transition-all text-amber-500 flex items-center space-x-1 flex-shrink-0 ml-2"
                      >
                        {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span className="text-[8px] font-black uppercase">{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

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
                      onClick={() => setPaymentStep('trading_form')}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] py-2.5 rounded-lg uppercase tracking-widest transition-all shadow-md shadow-amber-500/10 flex items-center justify-center space-x-1.5"
                    >
                      <span>Proceed to Trading Form</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            )}

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
