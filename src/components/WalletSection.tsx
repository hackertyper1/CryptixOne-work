import React, { useState, useEffect } from 'react';
import { User, Transaction, SystemSettings, InvestmentPlan, InvestmentRequest, ActiveTrade } from '../types';
import { formatIndianCurrency, INVESTMENT_PLANS } from '../data';
import WalletHero from './WalletHero';
import LiveMarketChart from './LiveMarketChart';
import MarketAssetList from './MarketAssetList';
import PaymentVerification from './PaymentVerification';
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
  const [formAddress, setFormAddress] = useState('');
  const [formPaymentApp, setFormPaymentApp] = useState('');
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
      // Ensure form starts blank as per user request
      setFormFullName('');
      setFormEmail('');
      setFormPhone('');
      setFormAddress('');
      setFormPaymentApp('');
      setFormProfession('');
      setFormDob('');
      setFormUtr('');
    }
  }, [selectedPlanForInvestment]);

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
      address: formAddress,
      paymentApp: formPaymentApp,
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
      `• *Residential Address:* ${formAddress}\n` +
      `• *Payment App Used:* ${formPaymentApp}\n` +
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
                  <img src="/logo.png" alt="Wallet Protected" className="w-16 h-16 mb-4 grayscale opacity-50" />
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

  // ISOATED VIEW FOR PAYMENT FLOW (Plans and Manual Deposits)
  // When a plan is chosen or manual continue to pay is clicked, show ONLY the payment section
  if (selectedPlanForInvestment || (isManualMode && showManualMethods)) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-[#0b101f] border border-white/5 rounded-[2rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32" />
          
          {/* STEP 1: Select Payment Method */}
          {paymentStep === 'select_method' && (
            <div className="space-y-8 animate-fadeIn relative z-10 text-left">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight font-display">
                    Choose <span className="text-emerald-500">Deposit Method</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] font-black">
                    {selectedPlanForInvestment ? `${selectedPlanForInvestment.category} Allocation` : `Custom Principal: ₹${depositAmount.toLocaleString()}`}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedPlanForInvestment(null);
                    setIsManualMode(false);
                    setShowManualMethods(false);
                    setPaymentStep('select_method');
                  }}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. GATE PAY */}
                <button
                  onClick={() => { setSelectedPaymentMethod('GATE PAY'); setPaymentStep('scan_qr'); }}
                  className="flex items-center justify-between p-4 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1.5 shadow-sm">
                      <img src="https://uxwing.com/wp-content/themes/uxwing/download/e-commerce-currency-shopping/payment-gateway-icon.png" alt="GATE" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">GATE PAY</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono font-black uppercase group-hover:text-emerald-400">Secure</span>
                </button>

                {/* 2. Phone Pay */}
                <button
                  onClick={() => { setSelectedPaymentMethod('Phone Pay'); setPaymentStep('scan_qr'); }}
                  className="flex items-center justify-between p-4 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1.5 shadow-sm">
                      <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/phonepe-icon.png" alt="Phone Pay" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">Phone Pay</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono font-black uppercase group-hover:text-emerald-400">Instant</span>
                </button>

                {/* 3. Paytm */}
                <button
                  onClick={() => { setSelectedPaymentMethod('Paytm'); setPaymentStep('scan_qr'); }}
                  className="flex items-center justify-between p-4 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1.5 shadow-sm">
                      <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/paytm-icon.png" alt="Paytm" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">Paytm</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono font-black uppercase group-hover:text-emerald-400">Business</span>
                </button>

                {/* 4. UPI */}
                <button
                  onClick={() => { setSelectedPaymentMethod('UPI'); setPaymentStep('scan_qr'); }}
                  className="flex items-center justify-between p-4 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1.5 shadow-sm">
                      <img src="https://uxwing.com/wp-content/themes/uxwing/download/e-commerce-currency-shopping/credit-card-color-icon.png" alt="Icash" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">Icash.one</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono font-black uppercase group-hover:text-emerald-400">Flexible</span>
                </button>

                {/* 5. Binance Pay */}
                <button
                  onClick={() => { setSelectedPaymentMethod('Binance Pay'); setPaymentStep('scan_qr'); }}
                  className="flex items-center justify-between p-4 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-[#f3ba2f]/10 border border-[#f3ba2f]/20 rounded-xl flex items-center justify-center p-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Binance_Logo.svg" alt="Binance" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">Binance Pay</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono font-black uppercase group-hover:text-emerald-400">Crypto</span>
                </button>

                {/* 6. iCash.One */}
                <button
                  onClick={() => { setSelectedPaymentMethod('iCash.One'); setPaymentStep('scan_qr'); }}
                  className="flex items-center justify-between p-4 bg-[#070b14] hover:bg-[#0c1425] border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-600/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                       <div className="text-[12px] font-black text-emerald-500 font-mono">iC</div>
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">iCash.One</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono font-black uppercase group-hover:text-emerald-400">Node Pay</span>
                </button>
              </div>
              
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500/60 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-tight">
                  You are depositing <span className="text-white font-bold">₹{depositAmount.toLocaleString()}</span> into your trading balance. Verification is automated via SBI institutional nodes.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Verification (QR & UTR) */}
          {paymentStep === 'scan_qr' && selectedPaymentMethod && (
            <PaymentVerification 
              method={selectedPaymentMethod}
              amount={depositAmount}
              upiId={systemSettings.upiId}
              isCrypto={selectedPaymentMethod === 'Binance Pay'}
              address={systemSettings.binanceAddress}
              onCancel={() => setPaymentStep('select_method')}
              onVerify={(utr) => {
                if (isManualMode) {
                  onSubmitDeposit({
                    type: 'deposit',
                    amount: depositAmount,
                    utr: utr,
                    detailsForm: {
                      name: currentUser?.name || 'Manual Trader',
                      phone: currentUser?.phone || '',
                      email: currentUser?.email || '',
                      whatsapp: currentUser?.whatsapp || '',
                      profession: 'Trader',
                      dob: '1995-01-01'
                    }
                  });
                  const message = `*MANUAL DEPOSIT VERIFICATION*\n\n` +
                    `• *Amount:* ₹${depositAmount.toLocaleString()}\n` +
                    `• *UTR:* ${utr}\n\n` +
                    `Please verify my manual deposit.`;
                  const waLink = `https://wa.me/91${systemSettings.supportWhatsApp}?text=${encodeURIComponent(message)}`;
                  setLastSubmittedMsg(waLink);
                  setPaymentStep('success');
                  window.open(waLink, '_blank');
                } else {
                  // Plan investment moves to blank trading form, but keeps the UTR
                  setFormUtr(utr);
                  setPaymentStep('trading_form');
                }
              }}
            />
          )}

          {/* STEP 3: Crypto Trading Form */}
          {paymentStep === 'trading_form' && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight font-display">
                    Crypto <span className="text-emerald-500">Trading Form</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] font-black">
                    Finalize your {selectedPlanForInvestment?.category} investment profile
                  </p>
                </div>
              </div>

              <form onSubmit={handleTradingFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left block">Name</label>
                    <input 
                      type="text" required value={formFullName} onChange={(e) => setFormFullName(e.target.value)}
                      className="w-full bg-[#060b17] border border-slate-800 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-emerald-500"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left block">Number</label>
                    <input 
                      type="tel" required value={formPhone} onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-[#060b17] border border-slate-800 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-emerald-500"
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left block">Email</label>
                    <input 
                      type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-[#060b17] border border-slate-800 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-emerald-500"
                      placeholder="name@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left block">Profession</label>
                    <input 
                      type="text" required value={formProfession} onChange={(e) => setFormProfession(e.target.value)}
                      className="w-full bg-[#060b17] border border-slate-800 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-emerald-500"
                      placeholder="e.g. Self Employed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left block">DOB</label>
                    <input 
                      type="date" required value={formDob} onChange={(e) => setFormDob(e.target.value)}
                      className="w-full bg-[#060b17] border border-slate-800 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left block">Addresss</label>
                    <input 
                      type="text" required value={formAddress} onChange={(e) => setFormAddress(e.target.value)}
                      className="w-full bg-[#060b17] border border-slate-800 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-emerald-500"
                      placeholder="City, State"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left block">Payment App</label>
                    <input 
                      type="text" required value={formPaymentApp} onChange={(e) => setFormPaymentApp(e.target.value)}
                      className="w-full bg-[#060b17] border border-slate-800 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-emerald-500"
                      placeholder="e.g. PhonePe, GPay"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left block">Amount Invested (Auto Fill)</label>
                    <input 
                      type="text" disabled value={`₹${depositAmount.toLocaleString()}`}
                      className="w-full bg-[#060b17]/50 border border-slate-800/50 rounded-xl py-3 px-4 text-slate-400 font-bold outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">UTR Reference (Auto Fill)</span>
                  <span className="text-[10px] font-mono text-emerald-500 font-black">{formUtr}</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl uppercase tracking-[0.3em] transition-all shadow-xl shadow-emerald-500/20"
                >
                  Activate Trading Plan
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: Success State */}
          {paymentStep === 'success' && (
            <div className="py-10 text-center space-y-6 animate-fadeIn">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Deposit Initiated</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Your transaction is being verified by our institutional nodes. Verification usually completes within 5-10 minutes.
                </p>
              </div>
              <div className="flex flex-col space-y-3">
                <a 
                  href={lastSubmittedMsg} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] rounded-xl uppercase tracking-widest transition-all flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contact Support on WhatsApp</span>
                </a>
                <button
                  onClick={() => {
                    setSelectedPlanForInvestment(null);
                    setIsManualMode(false);
                    setShowManualMethods(false);
                    setPaymentStep('select_method');
                  }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] rounded-xl uppercase tracking-widest transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
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
            {/* If no plan is selected and not in manual payment mode, show the selection dropdown */}
            {!selectedPlanForInvestment && !isManualMode && (
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
            )}

            {/* If in manual mode but haven't clicked continue, show amount input */}
            {isManualMode && !showManualMethods && (
              <section className="bg-[#0b101f] border border-white/5 rounded-[1.5rem] p-6 space-y-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1 text-left">
                    <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight font-display">
                      Custom Deposit <span className="text-emerald-500">PROTOCOL</span>
                    </h4>
                    <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-black">Audit: HFT-LEDGER-V4</p>
                  </div>
                  
                  <div className="bg-[#060b17] border border-slate-800/50 p-4 rounded-2xl font-mono text-xs flex flex-col space-y-3 shadow-inner min-w-[200px] text-left">
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest block">Manual Allocation Amount</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                      <input 
                        type="number"
                        min="1000"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-7 pr-3 text-white font-black outline-none focus:border-emerald-500 transition-colors"
                        placeholder="1000"
                      />
                    </div>
                    {depositAmount < 1000 && (
                      <span className="text-[8px] text-rose-500 font-bold uppercase tracking-tight">Min amount: ₹1,000</span>
                    )}
                    <button
                      onClick={() => setShowManualMethods(true)}
                      disabled={depositAmount < 1000}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-[9px] rounded-xl uppercase tracking-widest transition-all"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB VIEW: WITHDRAW PROFIT */}
      {internalTab === 'withdraw' && (
        <section className="bg-[#0b101f] border border-white/5 rounded-[1.5rem] p-5 space-y-5 relative overflow-hidden" id="withdrawal-request-form">
          {/* Withdrawal Lock Overlay */}
          {currentUser?.isWithdrawalLocked && (
            <div className="absolute inset-0 z-50 backdrop-blur-xl bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center border-4 border-red-500/30 rounded-[1.5rem] animate-fadeIn transition-all duration-700">
              <div className="absolute inset-0 bg-red-950/20 mix-blend-overlay" />
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-6 border-2 border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.4)] relative z-10">
                <Lock className="w-10 h-10 animate-pulse" />
              </div>
              <h4 className="text-2xl font-black text-white uppercase tracking-tighter font-display mb-3 relative z-10">Account Restricted</h4>
              <p className="text-xs text-slate-300 max-w-sm font-bold leading-relaxed uppercase tracking-[0.15em] mb-8 relative z-10">
                Your withdrawal channel has been secured by the regulatory desk.
              </p>
              
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl space-y-4 relative z-10 w-full max-w-xs">
                <div className="bg-red-500 text-slate-950 py-3 rounded-xl font-black text-xs uppercase tracking-widest animate-pulse shadow-lg shadow-red-500/20">
                  Kindly contact to your trader
                </div>
                
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{currentUser?.traderName || systemSettings.traderName || 'Vikram Singhania'}</p>
                  <p className="text-xs font-black text-emerald-400 font-mono tracking-tighter">
                    WhatsApp: +91 {currentUser?.traderPhone || systemSettings.traderWhatsApp || '800324109'}
                  </p>
                </div>
              </div>
              
              <p className="mt-8 text-[10px] text-red-500/60 font-mono uppercase font-black tracking-widest relative z-10">Error Code: COMPLIANCE-LOCK-729</p>
            </div>
          )}

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
                  {currentUser?.isWithdrawalLocked ? (
                    <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl space-y-3 text-center animate-pulse">
                      <div className="flex justify-center">
                        <div className="p-3 bg-red-500/20 rounded-full border border-red-500/30 text-red-500">
                          <Lock className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-red-500 uppercase tracking-widest">Withdrawal Restricted</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                          Your withdrawal capability has been temporarily restricted by the audit department.
                        </p>
                      </div>
                      {currentUser?.restrictionReason && (
                        <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/10">
                          <p className="text-[11px] text-white font-bold italic">" {currentUser.restrictionReason} "</p>
                        </div>
                      )}
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Please contact your senior trader for resolution</p>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
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
                      tx.type === 'deposit' || tx.type === 'profit'
                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' 
                        : tx.type === 'withdrawal' || tx.type === 'investment' || tx.type === 'trade' || tx.type === 'loss'
                        ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                        : 'bg-slate-500/5 text-slate-400 border-slate-500/10'
                    }`}>
                      {tx.type === 'deposit' || tx.type === 'profit' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="min-w-0 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-slate-200">
                          {tx.type === 'deposit' ? 'Ledger Credit' : 
                           tx.type === 'withdrawal' ? 'Withdrawal Payout' :
                           tx.type === 'investment' ? 'Capital Allocation' :
                           tx.type === 'trade' ? 'Trade Execution' :
                           tx.type === 'profit' ? 'Yield Settlement' :
                           tx.type === 'loss' ? 'Trade Deficit' : 'Transaction'}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-slate-500">
                          #{tx.id}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 truncate block">
                        {tx.description || (tx.type === 'deposit' 
                          ? `Ref: ${tx.utr || 'Direct Transfer'}` 
                          : `Channel: ${(tx.bankDetails?.method || 'UPI/BANK').toUpperCase()}`)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 border-slate-800/40 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className={`text-xs font-mono font-black block ${
                        tx.type === 'deposit' || tx.type === 'profit' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'profit' ? '+' : '-'} {formatIndianCurrency(tx.amount)}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500 block uppercase">
                        {tx.type === 'profit' ? 'Yield Profit' : tx.type === 'loss' ? 'Trade Loss' : 'INR Value Settlement'}
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
