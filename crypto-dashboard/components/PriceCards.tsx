'use client';

import { CryptoData } from '@/types/crypto';

interface PriceCardsProps {
  cryptoData: CryptoData[];
}

export default function PriceCards({ cryptoData }: PriceCardsProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-[#333333]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-5 gap-5">
          {cryptoData.map((crypto) => {
            const isPositive = crypto.change24h >= 0;
            return (
              <div
                key={crypto.id}
                className="rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#a0a0a0] uppercase tracking-wide">
                    {crypto.symbol}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
                    }`}
                  >
                    {isPositive ? '↑' : '↓'} {Math.abs(crypto.change24h).toFixed(2)}%
                  </span>
                </div>
                <div className="text-2xl font-semibold text-white mb-2">
                  ${crypto.price.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-xs text-[#666666]">
                  {crypto.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
