'use client';

import { CryptoData } from '@/types/crypto';
import { useState, useEffect } from 'react';

interface PriceCardsProps {
  cryptoData: CryptoData[];
}

export default function PriceCards({ cryptoData }: PriceCardsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-8 py-4">
          <div className="grid grid-cols-5 gap-4">
            {cryptoData.map((crypto, index) => {
              const isPositive = crypto.change24h >= 0;

              return (
                <div
                  key={crypto.id}
                  className="rounded-lg p-4 transition-all duration-300 hover:bg-white/[0.02]"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(-8px)',
                    transition: `all 0.4s ease ${index * 0.05}s`,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
                      {crypto.symbol}
                    </span>
                    <span
                      className={`text-[11px] font-medium ${
                        isPositive ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}{crypto.change24h.toFixed(2)}%
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-xl font-semibold text-white mb-1">
                    ${crypto.price.toLocaleString('en-US', {
                      minimumFractionDigits: crypto.price < 10 ? 2 : 0,
                      maximumFractionDigits: crypto.price < 10 ? 2 : 0,
                    })}
                  </div>

                  {/* Name */}
                  <div className="text-[11px] text-white/30">
                    {crypto.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
