import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Copy, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentVerificationProps {
  method: string;
  amount: number;
  upiId?: string;
  address?: string;
  isCrypto?: boolean;
  onVerify: (utr: string) => void;
  onCancel: () => void;
}

export default function PaymentVerification({ method, amount, upiId, address, isCrypto, onVerify, onCancel }: PaymentVerificationProps) {
  const [utr, setUtr] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Standard UTR validation: 12 digits for UPI, or generic length for Crypto Transaction Hash
  const validateInput = (val: string) => {
    if (isCrypto) {
      return val.length >= 16; // Simple hash length check
    }
    return /^[0-9]{12}$/.test(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput(utr)) {
      setError(isCrypto ? 'Please enter a valid Transaction Hash / TXID' : 'Please enter a valid 12-digit UTR number');
      return;
    }
    onVerify(utr);
  };

  const handleCopy = () => {
    const textToCopy = isCrypto ? address : upiId;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Dynamic QR Generation for UPI
  const qrUrl = upiId ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${upiId}&pn=Cryptixo%20Trade&am=${amount}&cu=INR` : null;

  const getMethodIcon = () => {
    if (method.includes('GATE')) return "https://uxwing.com/wp-content/themes/uxwing/download/e-commerce-currency-shopping/payment-gateway-icon.png";
    if (method.includes('Phone')) return "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/phonepe-icon.png";
    if (method.includes('Paytm')) return "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/paytm-icon.png";
    if (method.includes('Icash')) return "https://uxwing.com/wp-content/themes/uxwing/download/e-commerce-currency-shopping/credit-card-color-icon.png";
    if (method.includes('Binance')) return "https://upload.wikimedia.org/wikipedia/commons/e/e8/Binance_Logo.svg";
    return null;
  };

  const methodIcon = getMethodIcon();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 relative z-10 pt-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol: {method}</span>
        </div>
        <button 
          onClick={onCancel}
          className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-tight flex items-center space-x-1"
        >
          <span>← Back</span>
        </button>
      </div>

      <div className="bg-[#0b101f] border border-white/5 rounded-[2rem] p-6 sm:p-8 flex flex-col items-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 w-48 h-48 bg-emerald-500/5 blur-[80px] -translate-x-1/2 -mt-24" />
        
        <div className="text-center space-y-2 relative z-10">
          {methodIcon && (
            <div className="w-12 h-12 mx-auto mb-2 bg-white/5 rounded-xl p-2.5 flex items-center justify-center">
              <img src={methodIcon} alt={method} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
          )}
          <h4 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
            Complete your <span className="text-emerald-500">Deposit</span>
          </h4>
          <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em] font-black">Ref: CT-{Math.random().toString(36).substring(7).toUpperCase()}</p>
        </div>

        {!isCrypto && qrUrl && (
          <div className="relative group z-10">
            <div className="absolute -inset-6 bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/15 transition-all rounded-full" />
            <div className="relative bg-white p-5 rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-900">
              <img 
                src={qrUrl} 
                alt="Payment QR" 
                className="w-48 h-48 sm:w-60 sm:h-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 h-0.5 bg-emerald-500 animate-scan top-0 opacity-50" />
            </div>
          </div>
        )}

        <div className="w-full space-y-3 relative z-10">
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Required Amount</span>
              <span className="text-xl font-black text-white font-mono tracking-tight">₹{amount.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="text-[8px] text-emerald-500 uppercase font-black tracking-widest block mb-0.5">System Status</span>
              <div className="flex items-center space-x-1.5 justify-end">
                <span className="text-[10px] font-black text-emerald-400">SYNCED</span>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between group shadow-inner">
            <div className="flex flex-col min-w-0 pr-4">
              <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-0.5">
                {isCrypto ? 'Deposit Address' : 'Merchant VPA'}
              </span>
              <span className="text-[11px] font-black text-slate-300 truncate font-mono select-all">
                {isCrypto ? address : upiId}
              </span>
            </div>
            <button 
              onClick={handleCopy}
              className="p-2.5 bg-slate-900 border border-white/5 hover:border-emerald-500/40 rounded-xl text-slate-400 hover:text-emerald-400 transition-all shrink-0"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 animate-fadeInUp">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block ml-1">
            {isCrypto ? 'ENTER TRANSACTION HASH (TXID)' : 'SUBMIT 12-DIGIT TRANSACTION UTR'}
          </label>
          <div className="relative">
            <input 
              type="text"
              value={utr}
              onChange={(e) => {
                const val = isCrypto ? e.target.value : e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                setUtr(val);
                setError('');
              }}
              className={`w-full bg-[#060b17] border-2 ${error ? 'border-rose-500/50' : 'border-slate-800 focus:border-emerald-500'} rounded-[1.5rem] py-5 px-6 text-white font-black tracking-[0.25em] outline-none transition-all placeholder:text-slate-800 text-center text-xl shadow-lg`}
              placeholder={isCrypto ? "HASH VALUE" : "0000 0000 0000"}
            />
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 text-center"
                >
                  <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full">
                    {error}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-start space-x-3 shadow-inner">
          <Info className="w-5 h-5 text-emerald-500/60 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-tight">
            Verification is processed by our <span className="text-white font-bold">HFT nodes</span>. Please ensure the {isCrypto ? 'TXID' : 'UTR'} is correct to avoid deployment delays.
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-[1.5rem] uppercase tracking-[0.4em] transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] transform active:scale-[0.98] relative overflow-hidden group"
        >
          <span className="relative z-10">Initiate Verification</span>
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
        </button>
      </form>
    </motion.div>

  );
}
