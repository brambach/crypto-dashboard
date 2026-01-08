'use client';

import { CryptoData } from '@/types/crypto';

interface PriceCardsProps {
  cryptoData: CryptoData[];
}

export default function PriceCards({ cryptoData }: PriceCardsProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#1f1f28]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-5 gap-4">
          {cryptoData.map((crypto) => {
            const isPositive = crypto.change24h >= 0;
            return (
              <div
                key={crypto.id}
                className="bg-[#13131a] rounded-lg border border-[#1f1f28] p-4 hover:border-[#2a2a35] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {crypto.symbol}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {isPositive ? '+' : ''}{crypto.change24h.toFixed(2)}%
                  </span>
                </div>
                <div className="text-2xl font-semibold text-white mb-1">
                  ${crypto.price.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-xs text-gray-500">
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
