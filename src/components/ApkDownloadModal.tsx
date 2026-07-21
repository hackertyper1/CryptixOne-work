import React from 'react';
import { Download, X } from 'lucide-react';

interface ApkDownloadModalProps {
  onClose: () => void;
}

export default function ApkDownloadModal({ onClose }: ApkDownloadModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0c101a] border border-blue-500/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_20px_50px_rgba(37,99,235,0.2)] animate-in fade-in zoom-in duration-300">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-500/30">
            <Download className="w-8 h-8 text-blue-500" />
          </div>
          
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Download App</h3>
          
          <p className="text-sm text-slate-400 font-medium">
            For the best trading experience, faster loading times, and enhanced security, please download our official Android application.
          </p>
          
          <div className="pt-4 space-y-3">
            <button
              onClick={() => {
                // Trigger download or redirect
                window.open('https://example.com/app.apk', '_blank');
                onClose();
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download APK</span>
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all"
            >
              Continue to Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
