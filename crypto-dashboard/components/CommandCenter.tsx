'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CryptoData } from '@/types/crypto';
import Globe3D from './Globe3D';
import CoinOrbit from './CoinOrbit';
import Stars from './Stars';
import PriceTicker from './PriceTicker';
import AIChatPanel from './AIChatPanel';

function CameraController({ selectedCoin, onZoomComplete }: { selectedCoin: CryptoData | null; onZoomComplete: () => void }) {
  const { camera } = useThree();
  const zoomedRef = useRef(false);

  useEffect(() => {
    const smoothTransition = (targetPos: [number, number, number], duration: number) => {
      const startPos = [camera.position.x, camera.position.y, camera.position.z];
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth easing function (ease-in-out)
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        camera.position.x = startPos[0] + (targetPos[0] - startPos[0]) * eased;
        camera.position.y = startPos[1] + (targetPos[1] - startPos[1]) * eased;
        camera.position.z = startPos[2] + (targetPos[2] - startPos[2]) * eased;

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    };

    if (selectedCoin && !zoomedRef.current) {
      smoothTransition([5, 2, 5], 800);
      zoomedRef.current = true;
      setTimeout(onZoomComplete, 800);
    } else if (!selectedCoin && zoomedRef.current) {
      smoothTransition([0, 0, 10], 800);
      zoomedRef.current = false;
    }
  }, [selectedCoin, camera, onZoomComplete]);

  return null;
}

export default function CommandCenter() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<CryptoData | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  const fetchCryptoData = async () => {
    try {
      const response = await fetch('/api/crypto');
      if (response.ok) {
        const data = await response.json();
        setCryptoData(data);
      }
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCoinClick = (coin: CryptoData) => {
    setSelectedCoin(coin);
  };

  const handleZoomComplete = () => {
    setShowPanel(true);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
    setTimeout(() => setSelectedCoin(null), 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-cyan-500/20 mx-auto"></div>
          </div>
          <p className="text-cyan-400 font-medium">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  const orbitRadii = [3.5, 4, 4.5, 5, 5.5];
  const orbitSpeeds = [0.005, 0.004, 0.006, 0.003, 0.007];

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Price Ticker */}
      <PriceTicker cryptoData={cryptoData} />

      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        className="w-full h-full cursor-pointer"
        onClick={(e) => {
          // Only close panel if clicking on the background (stars or empty space)
          if (e.eventObject === e.object && showPanel) {
            handleClosePanel();
          }
        }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

        <Stars />
        <Globe3D />

        {cryptoData.map((coin, index) => (
          <CoinOrbit
            key={coin.id}
            coin={coin}
            orbitRadius={orbitRadii[index]}
            orbitSpeed={orbitSpeeds[index]}
            onClick={() => handleCoinClick(coin)}
          />
        ))}

        <CameraController selectedCoin={selectedCoin} onZoomComplete={handleZoomComplete} />

        <OrbitControls
          enableZoom={!selectedCoin}
          enablePan={false}
          minDistance={8}
          maxDistance={15}
          autoRotate={!selectedCoin}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Bottom Overlay - Trading Volume */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-xl pointer-events-none z-40">
        <div className="max-w-4xl mx-auto bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4">GLOBAL TRADING ACTIVITY</h3>
          <div className="flex gap-3 items-end h-20">
            {cryptoData.map((coin) => {
              const isPositive = coin.change24h >= 0;
              const maxVolume = Math.max(...cryptoData.map(c => c.volume24h));
              const heightPercent = (coin.volume24h / maxVolume) * 100;
              const intensity = Math.min((coin.volume24h / maxVolume) * 100, 100);

              return (
                <div key={coin.id} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 animate-pulse"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: isPositive
                        ? `rgba(16, 185, 129, ${intensity / 100})`
                        : `rgba(239, 68, 68, ${intensity / 100})`,
                      boxShadow: isPositive
                        ? `0 0 20px rgba(16, 185, 129, ${intensity / 200})`
                        : `0 0 20px rgba(239, 68, 68, ${intensity / 200})`,
                    }}
                    title={`${coin.symbol}: $${(coin.volume24h / 1000000000).toFixed(2)}B volume`}
                  />
                  <span className="text-xs text-gray-400 font-mono font-medium">{coin.symbol}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel
        isOpen={showPanel}
        selectedCoin={selectedCoin}
        onClose={handleClosePanel}
        cryptoData={cryptoData}
      />

      {/* Title Overlay */}
      {!selectedCoin && (
        <div className="fixed top-20 left-0 right-0 text-center pointer-events-none z-40">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-cyan-400 mb-4 tracking-wider" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}>
            CRYPTO COMMAND
            <br />
            CENTER
          </h1>
          <p className="text-gray-400 text-lg font-medium">Click any orbiting coin for AI analysis</p>
        </div>
      )}
    </div>
  );
}
