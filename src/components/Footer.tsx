import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 py-16 mt-20" id="main-footer">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-zinc-400">
        <div className="space-y-4">
          <h3 className="text-white font-bold text-lg">About Us</h3>
          <p className="text-sm leading-relaxed text-zinc-400">
            CryptixOne is a modern trading platform designed to provide users with a secure, reliable, and user-friendly trading experience. Our mission is to make online trading accessible while maintaining high standards of security, transparency, and customer support.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-white font-bold text-lg">Terms & Conditions</h3>
          <ul className="text-sm space-y-2 text-zinc-400">
            <li>Must be at least 18 years of age.</li>
            <li>Trading involves risk.</li>
            <li>Users are responsible for account security.</li>
            <li>Not liable for market losses.</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-white font-bold text-lg">Privacy Policy</h3>
          <p className="text-sm leading-relaxed text-zinc-400">
            We collect basic information for security and service provision. We do not sell or rent personal information to third parties.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-white font-bold text-lg">Contact Us</h3>
          <ul className="text-sm space-y-2 text-zinc-400">
            <li>Email: support@cryptixone.com</li>
            <li>Phone: +91 800024109</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-12 pt-8 text-center text-zinc-600 text-sm">
        &copy; 2026 CryptixOne | All Rights Reserved
      </div>
    </footer>
  );
}
