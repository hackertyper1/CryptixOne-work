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
  logoUrl?: string;
}

export default function PaymentVerification({ method, amount, upiId, address, isCrypto, onVerify, onCancel, logoUrl }: PaymentVerificationProps) {
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
    if (method.includes('Google')) return "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-pay-icon.png";
    if (method.includes('Phone')) return "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/phonepe-icon.png";
    if (method.includes('Paytm')) return "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/paytm-icon.png";
    if (method.includes('Icash') || method.includes('icash')) return "https://uxwing.com/wp-content/themes/uxwing/download/e-commerce-currency-shopping/credit-card-color-icon.png";
    if (method.includes('Binance')) return "https://upload.wikimedia.org/wikipedia/commons/e/e8/Binance_Logo.svg";
    if (method.includes('Ethereum') || method.includes('ETH')) return "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/ethereum-eth-icon.png";
    if (method.includes('GATE') || method.includes('Gate')) return "https://uxwing.com/wp-content/themes/uxwing/download/e-commerce-currency-shopping/payment-gateway-icon.png";
    return logoUrl || "/logo.png";
  };

  const methodIcon = getMethodIcon();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto space-y-3 relative z-10 py-1 overflow-hidden select-none"
    >
      {/* Top Bar: Back & Method */}
      <div className="flex items-center justify-between px-1">
        <button 
          onClick={onCancel}
          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-[11px] font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 active:scale-95"
        >
          <span>← Back</span>
        </button>
        <div className="flex items-center gap-2 bg-[#0b101f] border border-white/10 px-3 py-1 rounded-full">
          {methodIcon && (
            <img src={methodIcon} alt={method} className="w-3.5 h-3.5 object-contain" referrerPolicy="no-referrer" />
          )}
          <span className="text-[11px] font-black text-white uppercase tracking-wider">{method} Deposit</span>
        </div>
      </div>

      {/* Main Single Page Card */}
      <div className="bg-[#0b101f] border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center space-y-3 shadow-xl relative overflow-hidden">
        
        {/* Amount Banner */}
        <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-emerald-400/80 uppercase font-bold tracking-widest">Required Amount</span>
            <span className="text-xl font-black text-emerald-400 font-mono">₹{amount.toLocaleString()}</span>
          </div>
          <div className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase px-2 py-1 rounded-md border border-emerald-500/30">
            Instant UPI
          </div>
        </div>

        {/* QR Scanner */}
        {!isCrypto && qrUrl && (
          <div className="flex flex-col items-center space-y-1 my-0.5">
            <div className="relative bg-white p-2.5 rounded-2xl shadow-lg border-2 border-slate-800">
              <img 
                src={qrUrl} 
                alt="Payment QR" 
                className="w-32 h-32 sm:w-36 sm:h-36 object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 h-0.5 bg-emerald-500 animate-scan top-0 opacity-70" />
            </div>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Scan QR Code to Pay</span>
          </div>
        )}

        {/* Merchant VPA / UPI ID or Crypto Address */}
        <div className="w-full bg-slate-950/80 border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">
              {isCrypto ? 'Deposit Address' : 'Merchant VPA / UPI ID'}
            </span>
            <span className="text-xs font-black text-amber-400 truncate font-mono select-all">
              {isCrypto ? address : upiId}
            </span>
          </div>
          <button 
            onClick={handleCopy}
            className="p-2 bg-slate-900 border border-white/10 hover:border-emerald-500/50 rounded-lg text-slate-300 hover:text-emerald-400 transition-all shrink-0 active:scale-95 flex items-center gap-1 text-[10px] font-bold"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* UTR Input Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-2.5 pt-1">
          <div className="space-y-1 text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-0.5">
              {isCrypto ? 'Transaction Hash (TXID)' : 'Enter 12-Digit UTR Number'}
            </label>
            <input 
              type="text"
              value={utr}
              onChange={(e) => {
                const val = isCrypto ? e.target.value : e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                setUtr(val);
                setError('');
              }}
              className={`w-full bg-[#060b17] border-2 ${error ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'} rounded-xl py-2.5 px-3 text-white font-black tracking-widest outline-none transition-all placeholder:text-slate-700 text-center text-base font-mono`}
              placeholder={isCrypto ? "HASH VALUE" : "Enter 12 Digit UTR Number"}
            />
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center pt-0.5"
                >
                  <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded">
                    {error}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>Submit Payment UTR</span>
          </button>
        </form>

      </div>
    </motion.div>

  );
}
