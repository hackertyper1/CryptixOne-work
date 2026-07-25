import React, { useState } from 'react';

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      title: 'About Us',
      content: <p className="text-sm leading-relaxed text-zinc-400">CryptixOne is a modern trading platform designed to provide users with a secure, reliable, and user-friendly trading experience. Our mission is to make online trading accessible while maintaining high standards of security, transparency, and customer support.</p>
    },
    {
      title: 'Terms & Conditions',
      content: <ul className="text-sm space-y-2 text-zinc-400">
        <li>Must be at least 18 years of age.</li>
        <li>Trading involves risk.</li>
        <li>Users are responsible for account security.</li>
        <li>Not liable for market losses.</li>
      </ul>
    },
    {
      title: 'Privacy Policy',
      content: <p className="text-sm leading-relaxed text-zinc-400">We collect basic information for security and service provision. We do not sell or rent personal information to third parties.</p>
    },
    {
      title: 'Contact Us',
      content: <ul className="text-sm space-y-2 text-zinc-400">
        <li>Email: support@cryptixone.com</li>
        <li>Phone: +91 800024109</li>
      </ul>
    }
  ];

  return (
    <footer className="bg-black border-t border-white/5 py-8 mt-10" id="main-footer">
      <div className="container mx-auto px-6 space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="border-b border-white/5 last:border-b-0">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full text-left py-4 flex justify-between items-center text-white font-bold text-lg"
            >
              {section.title}
              <span className="text-zinc-500">{openSection === section.title ? '−' : '+'}</span>
            </button>
            {openSection === section.title && (
              <div className="pb-4 pt-1">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="container mx-auto px-6 mt-8 pt-4 text-center text-zinc-600 text-sm">
        &copy; 2026 CryptixOne | All Rights Reserved
      </div>
    </footer>
  );
}
