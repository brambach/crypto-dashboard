'use client';

import { useEffect, useState } from 'react';
import CryptoCard from './CryptoCard';
import ChatInterface from './ChatInterface';
import { CryptoData } from '@/types/crypto';

export default function CryptoDashboard() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchCryptoData = async () => {
    try {
      const response = await fetch('/api/crypto');
      if (response.ok) {
        const data = await response.json();
        setCryptoData(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();

    const interval = setInterval(() => {
      fetchCryptoData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-primary/20 mx-auto"></div>
          </div>
          <p className="text-foreground/60 font-medium">Loading crypto prices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Crypto Prices */}
      <div className="lg:w-1/2 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-gradient">
              Crypto Dashboard
            </h1>
            <p className="text-foreground/60 text-sm lg:text-base">
              Live cryptocurrency prices powered by CoinGecko
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-foreground/40">
                Last updated: {lastUpdate.toLocaleTimeString()} · Auto-refresh every 10s
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {cryptoData.map((crypto) => (
              <CryptoCard
                key={crypto.id}
                symbol={crypto.symbol}
                name={crypto.name}
                price={crypto.price}
                change24h={crypto.change24h}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>

      {/* Right Side - AI Chat */}
      <div className="lg:w-1/2 h-screen lg:sticky lg:top-0">
        <ChatInterface cryptoData={cryptoData} />
      </div>
    </div>
  );
}
