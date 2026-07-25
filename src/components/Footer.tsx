import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-black py-12 mt-10 text-zinc-400" id="main-footer">
      <div className="container mx-auto px-6">
        {/* Support and Legal Links */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="mailto:support@cryptixone.com" className="hover:text-white">support@cryptixone.com</a></li>
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">API Docs</a></li>
              <li><a href="#" className="hover:text-white">Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-zinc-800 my-8"></div>

        {/* Bottom Section */}
        <div className="text-center text-sm space-y-4">
          <p>&copy; 2026 CryptixOne. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 text-zinc-300">
            <a href="mailto:support@cryptixone.com" className="hover:text-white">support@cryptixone.com</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
          <div className="flex justify-center gap-6 font-medium text-white">
            <span className="flex items-center gap-1">○ Secured</span>
            <span className="flex items-center gap-1">⚡ Fast Execution</span>
          </div>
          <p className="text-zinc-600"></p>
        </div>
      </div>
    </footer>
  );
}
