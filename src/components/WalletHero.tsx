import React from 'react';

export default function WalletHero({ onSetUpWallet }: { onSetUpWallet: () => void }) {
  const handleSetUp = () => {
    onSetUpWallet();
    setTimeout(() => {
      const depositEl = document.getElementById('deposit-protocol-section');
      if (depositEl) {
        depositEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="relative p-6 overflow-hidden bg-bg-primary">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/10 to-bg-primary" />
      <div className="relative z-10 flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-3xl font-bold text-text-primary">
          Trade. Earn.<br />Explore <span className="text-accent">On-Chain.</span>
        </h1>
        <button
          onClick={handleSetUp}
          className="px-6 py-3 font-bold text-bg-primary rounded-xl bg-accent hover:bg-accent/90"
        >
          Set Up Wallet
        </button>
      </div>
    </div>
  );
}
