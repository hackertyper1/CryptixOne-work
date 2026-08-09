import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function GoogleAd() {
  const adRef = React.useRef<HTMLModElement>(null);
  const initialized = React.useRef(false);

  useEffect(() => {
    // Small delay to ensure DOM is painted and AdSense script is ready
    const timer = setTimeout(() => {
      if (initialized.current) return;
      
      try {
        const ads = window.adsbygoogle || [];
        // Check if the specific ins element in this component is already filled
        if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
          ads.push({});
          initialized.current = true;
        }
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="my-6 overflow-hidden rounded-xl bg-slate-900/50 border border-slate-800 p-2">
      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 text-center font-bold">Sponsored</p>
      {/* CryptixOne Ad Unit */}
      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5440020610317921"
        data-ad-slot="2447197335"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
