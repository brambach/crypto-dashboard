'use client';

import { useState } from 'react';

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: '▦', active: true },
    { name: 'Markets', icon: '☰', active: false },
    { name: 'Staking', icon: '↗', active: false },
    { name: 'Trade', icon: '⇅', active: false },
    { name: 'Activities', icon: '◉', active: false, badge: 2 },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`
              w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300
              ${item.active
                ? 'bg-[#FF6B4A] text-white shadow-lg shadow-[#FF6B4A]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </div>
            {item.badge && (
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#FF6B4A] text-white text-xs font-bold">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Log out button */}
      <div className="p-4 border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300">
          <span className="text-xl">⎋</span>
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-6 left-6 z-[60] w-12 h-12 flex items-center justify-center rounded-xl bg-[#1a1517] border border-[#FF6B4A]/20 text-[#FF6B4A] shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: Always visible, Mobile: Slide-in overlay */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-[#1a1517] border-r border-white/10 z-50 transition-transform duration-300
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B4A] to-[#FF4A8D] bg-clip-text text-transparent">
            Trade Net
          </h2>
          <p className="text-sm text-gray-500">Staking assets</p>
        </div>

        <SidebarContent />
      </aside>

      {/* Spacer for desktop to prevent content from going under sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0" />
    </>
  );
}
