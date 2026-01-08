'use client';

import { motion } from 'framer-motion';
import { CryptoData } from '@/types/crypto';

interface PriceTickerProps {
  cryptoData: CryptoData[];
}

export default function PriceTicker({ cryptoData }: PriceTickerProps) {
  // Duplicate array for seamless loop
  const tickerData = [...cryptoData, ...cryptoData];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-cyan-500/30 overflow-hidden">
      <motion.div
        className="flex gap-8 py-3"
        animate={{
          x: [0, -50 * cryptoData.length],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 20,
            ease: 'linear',
          },
        }}
      >
        {tickerData.map((crypto, index) => {
          const isPositive = crypto.change24h >= 0;
          return (
            <div
              key={`${crypto.id}-${index}`}
              className="flex items-center gap-3 px-4 whitespace-nowrap"
            >
              <span className="text-sm font-bold text-cyan-400">
                {crypto.symbol}
              </span>
              <span className="text-sm text-gray-300 font-medium">
                ${crypto.price.toFixed(2)}
              </span>
              <span
                className={`text-xs font-semibold ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isPositive ? '↑' : '↓'} {Math.abs(crypto.change24h).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
