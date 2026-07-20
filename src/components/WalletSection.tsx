import React, { useState, useEffect } from 'react';
import { User, Transaction, SystemSettings, InvestmentPlan, InvestmentRequest } from '../types';
import { formatIndianCurrency, INVESTMENT_PLANS } from '../data';
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
  User as UserIcon
} from 'lucide-react';

interface WalletSectionProps {
  isLoggedIn: boolean;
  currentUser: User | null;
  systemSettings: SystemSettings;
  transactions: Transaction[];
  onSubmitDeposit: (tx: Omit<Transaction, 'id' | 'userId' | 'username' | 'userPhone' | 'status' | 'date'>) => void;
  onSubmitWithdrawal: (amount: number, details: any) => boolean;
  selectedPlanForInvestment: InvestmentPlan | null;
  setSelectedPlanForInvestment: (plan: InvestmentPlan | null) => void;
  onNavigateToAuth: () => void;
  onNavigateToTrade: () => void;
  onInvestmentRequestSubmit: (req: Omit<InvestmentRequest, 'id' | 'userId' | 'username' | 'status' | 'date'>) => void;
}

export default function WalletSection({
  isLoggedIn,
  currentUser,
  systemSettings,
  transactions,
  onSubmitDeposit,
  onSubmitWithdrawal,
  selectedPlanForInvestment,
  setSelectedPlanForInvestment,
  onNavigateToAuth,
  onNavigateToTrade,
  onInvestmentRequestSubmit
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
    <div className="space-y-10 text-left" id="wallet-section-container">
      {/* Luxury Mobile Wallet Design - Premium Obsidian Theme */}
      <section className="md:hidden bg-[#05070a] border border-white/10 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden mb-6" id="mobile-wallet-modern">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[60px] -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[60px] -ml-16 -mb-16" />

        {/* Header Row */}
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-white/10 flex items-center justify-center p-2.5 shadow-xl">
              <ShieldCheck className="w-full h-full text-amber-500" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-black text-white tracking-tight leading-none mb-1">Secure Vault</h3>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">Nodes Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full shrink-0 backdrop-blur-md">
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Institutional</span>
          </div>
        </div>

        {/* Primary Balance Display - Swapped: Now shows Net Profits as Primary */}
        <div className="mb-10 relative z-10 text-center">
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.3em] block mb-2">Net Profits Earned</span>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-4xl font-black text-emerald-400 tracking-tighter">₹{Math.floor(currentUser?.profitWallet || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8 relative z-10">
          {/* Available Capital */}
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-3xl backdrop-blur-sm">
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Available Capital</span>
            <span className="text-lg font-black text-white">₹{Math.floor(currentUser?.depositWallet || 0).toLocaleString('en-IN')}</span>
            <div className="mt-1 h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/40 w-full" />
            </div>
          </div>

          {/* Total Deployed */}
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-3xl backdrop-blur-sm">
            <span className="text-[8px] text-amber-500 font-bold uppercase tracking-widest block mb-2">In Market</span>
            <span className="text-lg font-black text-amber-400">₹{Math.floor(currentUser?.activeInvestment || 0).toLocaleString('en-IN')}</span>
            <div className="mt-1 h-1 w-full bg-amber-500/10 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-1/2" />
            </div>
          </div>
        </div>

        {/* Bottom Actions and Payout Account */}
        <div className="border-t border-white/5 pt-6 mt-2 space-y-6 relative z-10">
          <div className="flex justify-between items-center px-2">
            <div className="flex flex-col text-left">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Linked Beneficiary</span>
              <span className="text-sm font-black text-white/90">{currentUser?.name}</span>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onNavigateToTrade}
              className="bg-white text-black font-black text-[11px] py-4 rounded-2xl uppercase tracking-widest transition-all shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Invest</span>
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('withdrawal-request-form');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setInternalTab('withdraw');
                }
              }}
              className="bg-transparent border border-white/20 text-white font-black text-[11px] py-4 rounded-2xl uppercase tracking-widest transition-all hover:bg-white/5 flex items-center justify-center space-x-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </section>

      {/* Desktop Wallet Balance Cards Bar - Hidden on mobile */}
      <section className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6" id="wallet-statistics-bar">
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
          onClick={() => { setInternalTab('withdraw'); setWithdrawSuccess(false); }}
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
        !selectedPlanForInvestment ? (
          // NO PLAN SELECTED - Show beautiful Selection prompt with a gorgeous dropdown or slots list
          <section className="bg-[#0b101f] border border-slate-800 rounded-[2.5rem] p-8 md:p-12 space-y-8 text-center relative overflow-hidden" id="deposit-select-plan-first">
            <div className="absolute top-0 left-1/2 w-64 h-64 bg-emerald-500/5 blur-[100px] -translate-x-1/2 -mt-32" />
            
            <div className="flex justify-center relative z-10">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <TrendingUp className="w-10 h-10 animate-pulse" />
              </div>
            </div>
            <div className="space-y-4 max-w-md mx-auto relative z-10">
              <h3 className="text-2xl md:text-4xl font-black text-white font-display uppercase tracking-tight">Institutional <span className="text-emerald-500">Allocation</span></h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Please select a verified trading contract slot from the registry below to initialize the sovereign capital settlement protocol.
              </p>
            </div>
            
            <div className="max-w-md mx-auto relative z-10">
              <label className="text-[9px] uppercase font-mono tracking-[0.2em] text-slate-600 font-black block mb-3 text-left">Registry Identification</label>
              <div className="relative group">
                <select
                  className="w-full bg-[#070b14] border border-slate-800 text-white font-mono font-black py-4 px-5 rounded-2xl text-[11px] outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-inner"
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
          <section className="bg-[#0b101f] border border-slate-800 rounded-[2rem] p-8 md:p-10 space-y-8 relative overflow-hidden" id="custom-investment-gateway">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] -mr-32 -mt-32" />
            
            {/* Header with plan details */}
            <div className="border-b border-slate-800/60 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sovereign Settlement Gateway</span>
                </div>
                <h4 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight font-display">
                  {selectedPlanForInvestment.category} <span className="text-amber-500">PROTOCOL</span>
                </h4>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-black">Audit Framework: HFT-LEDGER-V4</p>
              </div>
              <div className="bg-[#060b17] border border-slate-800/50 p-6 rounded-3xl font-mono text-xs flex items-center justify-between md:space-x-12 shadow-inner">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Deployment Capital</span>
                  <span className="text-xl font-black text-white">₹{selectedPlanForInvestment.amount.toLocaleString()}</span>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[9px] text-amber-500 uppercase font-black tracking-widest block">Projected Yield</span>
                  <span className="text-xl font-black text-emerald-400">₹{selectedPlanForInvestment.estimatedProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* STEP 1: Select Payment Method */}
            {paymentStep === 'select_method' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="text-center space-y-1 py-2">
                  <h5 className="text-sm font-black text-slate-200">Choose your Preferred Payment Method</h5>
                  <p className="text-xs text-slate-400">Select any of the 4 direct UPI processors below to reveal the secure QR code.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Google Pay */}
                  <button
                    onClick={() => {
                      setSelectedPaymentMethod('Google Pay');
                      setPaymentStep('scan_qr');
                    }}
                    className="flex items-center space-x-4 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl text-left transition-all group relative overflow-hidden"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" alt="GPay" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">Google Pay</span>
                      <span className="text-[10px] text-slate-400 leading-none">Instant Secure GPay UPI Router</span>
                    </div>
                  </button>

                  {/* PhonePe */}
                  <button
                    onClick={() => {
                      setSelectedPaymentMethod('Phone Pay');
                      setPaymentStep('scan_qr');
                    }}
                    className="flex items-center space-x-4 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl text-left transition-all group relative overflow-hidden"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                      <img src="https://seeklogo.com/images/P/phonepe-logo-DD3F320342-seeklogo.com.png" alt="PhonePe" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">Phone Pay</span>
                      <span className="text-[10px] text-slate-400 leading-none">Instant Secure PhonePe Protocol</span>
                    </div>
                  </button>

                  {/* Paytm */}
                  <button
                    onClick={() => {
                      setSelectedPaymentMethod('Paytm');
                      setPaymentStep('scan_qr');
                    }}
                    className="flex items-center space-x-4 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl text-left transition-all group relative overflow-hidden"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">Paytm</span>
                      <span className="text-[10px] text-slate-400 leading-none">Direct Paytm Merchant Ingress</span>
                    </div>
                  </button>

                  {/* BHIM UPI */}
                  <button
                    onClick={() => {
                      setSelectedPaymentMethod('Bhim Upi');
                      setPaymentStep('scan_qr');
                    }}
                    className="flex items-center space-x-4 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl text-left transition-all group relative overflow-hidden"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo.png/512px-UPI-Logo.png" alt="BHIM UPI" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">Bhim Upi</span>
                      <span className="text-[10px] text-slate-400 leading-none">National BHIM Interface</span>
                    </div>
                  </button>
                </div>

                <div className="flex justify-center pt-3">
                  <button
                    onClick={() => setSelectedPlanForInvestment(null)}
                    className="text-xs text-slate-400 hover:text-white font-mono flex items-center space-x-1.5 transition-all"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Change Investment Plan</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Scan QR & Validity CountDown */}
            {paymentStep === 'scan_qr' && selectedPaymentMethod && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <button
                    onClick={() => {
                      setPaymentStep('select_method');
                      setSelectedPaymentMethod(null);
                    }}
                    className="text-[11px] font-mono font-bold text-slate-400 hover:text-white flex items-center space-x-1 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Method</span>
                  </button>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    Gateway: <b className="text-white">{selectedPaymentMethod}</b>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left: Dynamic QR with Validity Scanning effect */}
                  <div className="md:col-span-5 flex flex-col items-center space-y-4">
                    <div className="w-48 h-48 bg-white p-2.5 rounded-2xl flex flex-col items-center justify-center shadow-inner relative border border-slate-850">
                      <div className="absolute inset-x-2.5 h-0.5 bg-cyan-500 animate-scan"></div>
                      <img 
                        src={systemSettings.qrCodeImage || systemSettings.qrCodeUrl}
                        alt="Secure Payment QR Scanner"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    <a
                      href={systemSettings.qrCodeImage || systemSettings.qrCodeUrl}
                      download="payment_qr.jpg"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs text-amber-500 hover:text-amber-400 font-mono font-bold transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download QR Code Image</span>
                    </a>
                  </div>

                  {/* Right: Timer details and Copy buttons */}
                  <div className="md:col-span-7 space-y-4 text-left">
                    {/* Countdown Tracker Box */}
                    <div className="bg-[#050812] border border-slate-800 p-4 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                          <Clock className={`w-4 h-4 animate-spin ${timeLeft <= 30 ? 'text-amber-500' : 'text-emerald-400'}`} />
                          <span>QR Code Validity Session</span>
                        </span>
                        <span className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                          timeLeft <= 30 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {timeLeft}s
                        </span>
                      </div>
                      
                      {/* Dynamic visual progress bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            timeLeft <= 30 ? 'bg-amber-500' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${(timeLeft / 60) * 100}%` }}
                        ></div>
                      </div>

                      <p className="text-[10px] text-slate-400 font-mono leading-normal">
                        This verified QR scan code session terminates in <b className="text-white">{timeLeft} seconds</b>. The system will automatically reset if the contract remains unpaid after this window.
                      </p>
                    </div>

                    {/* Copy UPI Address Details */}
                    <div className="bg-[#050812] border border-slate-800 p-3 rounded-xl flex justify-between items-center font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block">Secure UPI Address</span>
                        <span className="text-slate-200 font-black text-[11px]">{systemSettings.upiId}</span>
                      </div>
                      <button
                        onClick={handleCopyUpi}
                        className="p-2 bg-[#090e1c] border border-slate-800 hover:text-white rounded transition-all text-amber-500 flex items-center space-x-1"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[9px] font-bold">{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Secure Flow submission Lock Constraint */}
                <div className="bg-[#060b17] border border-slate-800 p-4 rounded-xl space-y-4">
                  <div className="flex items-start space-x-2.5">
                    <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-400 leading-normal font-mono">
                      <b>REGULATORY COMPLIANCE LOCK:</b> To avoid double-spending or ghost-submissions, the "Proceed to Form" button remains locked for the first 30 seconds of active scanning. You can submit manually once the contract is fully processed.
                    </p>
                  </div>

                  {timeLeft > 30 ? (
                    <button
                      disabled
                      className="w-full bg-slate-800 text-slate-500 font-black text-xs py-3.5 rounded-lg uppercase tracking-wider cursor-not-allowed flex items-center justify-center space-x-2 font-mono"
                    >
                      <Lock className="w-4 h-4 text-slate-600" />
                      <span>Unlocking Manual Submit in {timeLeft - 30}s...</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setPaymentStep('trading_form')}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3.5 rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center space-x-1.5"
                    >
                      <span>Proceed to Trading Form (Payment Complete)</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Basic trading details form */}
            {paymentStep === 'trading_form' && (
              <form onSubmit={handleTradingFormSubmit} className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <button
                    type="button"
                    onClick={() => setPaymentStep('scan_qr')}
                    className="text-[11px] font-mono font-bold text-slate-400 hover:text-white flex items-center space-x-1 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Scanner</span>
                  </button>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Payment Verified</span>
                  </span>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl text-left">
                  <p className="text-[11px] text-slate-400 font-mono leading-normal">
                    Enter your official registration and transaction UTR details. All fields are mandatory and validated strictly for security.
                  </p>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter legal full name"
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-3 rounded-lg text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Email ID</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. contact@domain.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-3 rounded-lg text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-3 rounded-lg text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={formDob}
                      onChange={(e) => setFormDob(e.target.value)}
                      className="w-full bg-[#0d1222] border border-slate-800 text-slate-300 font-mono py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Profession</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Business Analyst"
                      value={formProfession}
                      onChange={(e) => setFormProfession(e.target.value)}
                      className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-3 rounded-lg text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">12-Digit UPI UTR / Transaction Reference No.</label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      placeholder="e.g. 417281923052"
                      value={formUtr}
                      onChange={(e) => setFormUtr(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-3 rounded-lg text-xs outline-none focus:border-amber-500 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">Investment Amount (INR)</label>
                  <input
                    type="text"
                    disabled
                    value={`₹${depositAmount.toLocaleString()}`}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-400 font-mono py-2.5 px-3 rounded-lg text-xs cursor-not-allowed font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3.5 rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 mt-3 flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Submit Trading Application & Redirect to WhatsApp</span>
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
                    onClick={onNavigateToTrade}
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
        )
      )}

      {/* SUB TAB VIEW: WITHDRAW PROFIT */}
      {internalTab === 'withdraw' && (
        <section className="bg-[#0b101f] border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8" id="withdrawal-request-form">
          <div className="border-b border-slate-800 pb-4">
            <h4 className="text-lg font-black text-white uppercase tracking-tight font-display">Withdrawal Center</h4>
            <p className="text-xs text-slate-400">Withdraw matured profits directly to your bank account. Transfers are subject to manual regulatory compliance checks.</p>
          </div>

          {withdrawSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-4 max-w-xl mx-auto" id="withdraw-success-view">
              <div className="w-12 h-12 bg-emerald-500/25 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h5 className="text-base font-black text-white font-sans">Withdrawal Request Registered!</h5>
                <p className="text-xs text-slate-300 leading-normal">
                  Our Indian Finance Ministry Compliance Desk is validating the security coordinates. Funds will reflect in your account post admin verification.
                </p>
                <p className="text-[10px] text-amber-400 font-mono mt-3">Status: Pending Verification (Under review)</p>
              </div>
              <button
                onClick={() => setWithdrawSuccess(false)}
                className="bg-slate-900 border border-slate-800 text-slate-300 font-bold py-2 px-4 rounded-lg text-xs mt-2"
              >
                Log New Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Side: Summary and Withdrawal Method Selection */}
              <div className="lg:col-span-5 bg-[#050914] border border-slate-800 rounded-2xl p-6 space-y-6 text-left">
                <div className="space-y-4">
                  <div className="bg-[#0a0f1d] p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase tracking-widest font-mono font-bold mb-1">Available Settlement Balance</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">{formatIndianCurrency(currentUser?.profitWallet || 0)}</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Select Withdrawal Method</label>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('upi')}
                        className={`py-3 px-4 border rounded-xl text-xs font-bold uppercase font-mono transition-all flex items-center justify-between ${
                          withdrawMethod === 'upi' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-[#0d1222] border-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center">
                          <Smartphone className="w-4 h-4 mr-2" />
                          <span>UPI Transfer</span>
                        </div>
                        {withdrawMethod === 'upi' && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('scanner')}
                        className={`py-3 px-4 border rounded-xl text-xs font-bold uppercase font-mono transition-all flex items-center justify-between ${
                          withdrawMethod === 'scanner' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-[#0d1222] border-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center">
                          <QrCode className="w-4 h-4 mr-2" />
                          <span>QR Scanner Payout</span>
                        </div>
                        {withdrawMethod === 'scanner' && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('bank')}
                        className={`py-3 px-4 border rounded-xl text-xs font-bold uppercase font-mono transition-all flex items-center justify-between ${
                          withdrawMethod === 'bank' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-[#0d1222] border-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center">
                          <Wallet className="w-4 h-4 mr-2" />
                          <span>Bank Account Settlement</span>
                        </div>
                        {withdrawMethod === 'bank' && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form details */}
              <div className="lg:col-span-7 bg-[#070c18] border border-slate-800/80 rounded-2xl p-6">
                <form onSubmit={handleWithdrawalSubmit} className="space-y-4 text-left" id="withdrawal-submission-form">
                  {withdrawError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-center space-x-2 text-xs text-rose-400 font-sans">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{withdrawError}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Select Withdrawal Method</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('upi')}
                          className={`py-2 px-1 border rounded-lg text-[10px] font-bold uppercase font-mono transition-all ${
                            withdrawMethod === 'upi' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-[#0d1222] border-slate-800 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          UPI ID
                        </button>
                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('scanner')}
                          className={`py-2 px-1 border rounded-lg text-[10px] font-bold uppercase font-mono transition-all ${
                            withdrawMethod === 'scanner' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-[#0d1222] border-slate-800 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          Scanner
                        </button>
                        <button
                          type="button"
                          onClick={() => setWithdrawMethod('bank')}
                          className={`py-2 px-1 border rounded-lg text-[10px] font-bold uppercase font-mono transition-all ${
                            withdrawMethod === 'bank' ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-[#0d1222] border-slate-800 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          Bank
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Withdrawal Amount (INR)</label>
                      <input
                        type="number"
                        required
                        min="500"
                        id="withdraw-amount-input"
                        placeholder="e.g. 15000"
                        value={withdrawAmount || ''}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono font-bold py-2.5 px-4 rounded-lg text-sm outline-none focus:border-amber-500"
                      />
                    </div>

                    {withdrawMethod === 'bank' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Bank Name</label>
                          <input
                            type="text"
                            placeholder="State Bank of India (SBI)"
                            id="withdraw-bank-input"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full bg-[#0d1222] border border-slate-800 text-white py-2.5 px-4 rounded-lg text-xs outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Bank Account Number</label>
                            <input
                              type="text"
                              placeholder="31024567210"
                              id="withdraw-account-input"
                              value={accountNo}
                              onChange={(e) => setAccountNo(e.target.value)}
                              className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">IFSC Code</label>
                            <input
                              type="text"
                              placeholder="SBIN0004921"
                              id="withdraw-ifsc-input"
                              value={ifsc}
                              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                              className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {withdrawMethod === 'upi' && (
                      <div className="space-y-1 animate-fadeIn">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">User UPI ID</label>
                        <input
                          type="text"
                          placeholder="username@okaxis"
                          value={userUpiId}
                          onChange={(e) => setUserUpiId(e.target.value)}
                          className="w-full bg-[#0d1222] border border-slate-800 text-white font-mono py-2.5 px-4 rounded-lg text-xs outline-none focus:border-amber-500"
                        />
                      </div>
                    )}

                    {withdrawMethod === 'scanner' && (
                      <div className="space-y-1 animate-fadeIn">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">Upload Payment Scanner QR</label>
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
                            className="w-full bg-[#0d1222] border border-dashed border-slate-700 hover:border-amber-500/50 text-slate-400 font-mono py-8 px-4 rounded-xl text-xs flex flex-col items-center justify-center cursor-pointer transition-all"
                          >
                            {userScannerUrl ? (
                              <div className="flex flex-col items-center space-y-2">
                                <img src={userScannerUrl} alt="Preview" className="w-20 h-20 object-contain rounded border border-slate-700" />
                                <span className="text-emerald-400 font-bold">QR Image Selected</span>
                                <span className="text-[10px] text-slate-500">Click to replace</span>
                              </div>
                            ) : (
                              <>
                                <QrCode className="w-8 h-8 mb-2 opacity-30" />
                                <span>Click to upload QR code image</span>
                                <span className="text-[9px] text-slate-600 mt-1 uppercase">Supports JPG, PNG, WEBP</span>
                              </>
                            )}
                          </label>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-2 italic">Note: Ensure the QR is clear and valid for receiving high-velocity funds.</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="btn-withdraw-submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-3 rounded-lg uppercase tracking-widest transition-all shadow-md shadow-amber-500/10 mt-3"
                  >
                    Request Secure Settlement
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* SUB TAB VIEW: TRANSACTION HISTORY LOGS */}
      {internalTab === 'history' && (
        <section className="bg-[#0b101f] border border-slate-800 rounded-2xl p-6 shadow-xl" id="transaction-history-logs-sub-tab">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h4 className="text-base font-extrabold text-white uppercase tracking-wider font-display">My Transaction Ledger</h4>
            <p className="text-xs text-slate-400 font-sans">Full cryptographic history of your capital allocations, deposits, and withdrawal settlements.</p>
          </div>

          {userTransactions.length === 0 ? (
            <div className="text-center py-10 bg-[#050913] rounded-xl border border-dashed border-slate-800">
              <p className="text-xs text-slate-500 font-mono">No transaction ledger history recorded under your account username yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-slate-400">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-2">TX ID</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2">Amount</th>
                    <th className="py-3 px-2">Tracking / Method</th>
                    <th className="py-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {userTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-2 font-bold text-slate-300">{tx.id}</td>
                      <td className="py-3 px-2 uppercase">
                        {tx.type === 'deposit' ? (
                          <span className="text-cyan-400 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1" /> Ledger Credit</span>
                        ) : (
                          <span className="text-rose-400 flex items-center"><ArrowDownRight className="w-3 h-3 mr-1" /> Payout Request</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-slate-200 font-bold">{formatIndianCurrency(tx.amount)}</td>
                      <td className="py-3 px-2 text-slate-400 font-semibold truncate max-w-[200px]">
                        {tx.type === 'deposit' ? `UTR: ${tx.utr || '—'}` : `VIA: ${(tx.bankDetails?.method || 'BANK').toUpperCase()}`}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.status === 'completed' || tx.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tx.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
