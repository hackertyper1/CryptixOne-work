import React from 'react';

interface Props {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const HeaderButton: React.FC<Props> = ({ text, onClick, variant = 'primary' }) => {
  if (variant === 'primary') {
    return (
      <button
        onClick={onClick}
        className="group inline-flex items-center gap-3 transition-colors duration-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 text-white/90 bg-black rounded-3xl pt-1 pr-1 pb-1 pl-1 relative"
        aria-label={text}
      >
        <span className="pointer-events-none absolute -inset-1 rounded-full opacity-0 blur-xl transition duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(60% 60% at 50% 50%, rgba(56,189,248,.55), rgba(56,189,248,0) 70%)' }} aria-hidden="true"></span>
        <span className="isolate inline-flex items-center gap-3 bg-gradient-to-br from-white/10 to-white/0 rounded-3xl pt-3 pr-6 pb-3 pl-6 relative">
          <span className="pointer-events-none absolute inset-0 rounded-[999px] opacity-70 [box-shadow:inset_0_1px_0_rgba(255,255,255,.08),inset_0_-6px_20px_rgba(0,0,0,.5)]" aria-hidden="true"></span>
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[999px]" aria-hidden="true">
            <span className="sparkle left-4 top-2"></span>
            <span className="sparkle left-10 top-6" style={{ animationDelay: '0.2s' }}></span>
            <span className="sparkle left-20 top-3" style={{ animationDelay: '0.4s' }}></span>
            <span className="sparkle left-28 top-7" style={{ animationDelay: '0.1s' }}></span>
            <span className="sparkle right-8 top-4" style={{ animationDelay: '0.5s' }}></span>
            <span className="sparkle right-16 top-8" style={{ animationDelay: '0.3s' }}></span>
          </span>
          <span className="relative z-10 font-medium tracking-[-0.01em]">{text}</span>
          <svg className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M11.293 3.293a1 1 0 011.414 0l5.0 5.0a1 1 0 010 1.414l-5.0 5.0a1 1 0 01-1.414-1.414L14.586 11H2a1 1 0 110-2h12.586l-3.293-3.293a1 1 0 010-1.414z" />
          </svg>
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 hover:bg-white/10 transition text-sm font-medium text-white/90 bg-white/5 rounded-3xl pt-2 pr-8 pb-2 pl-8 backdrop-blur-md"
      style={{ position: 'relative' }}
    >
      {text}
    </button>
  );
};
