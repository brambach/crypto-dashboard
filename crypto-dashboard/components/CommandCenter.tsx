'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CryptoData } from '@/types/crypto';
import Globe3D from './Globe3D';
import CoinOrbit from './CoinOrbit';
import Stars from './Stars';
import PriceCards from './PriceCards';
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
      smoothTransition([7, 3, 7], 800);
      zoomedRef.current = true;
      setTimeout(onZoomComplete, 800);
    } else if (!selectedCoin && zoomedRef.current) {
      smoothTransition([0, 0, 12], 800);
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#333333] border-t-[#FFED4E] mx-auto mb-4"></div>
          </div>
          <p className="text-[#a0a0a0] font-medium text-sm">Loading market data...</p>
        </div>
      </div>
    );
  }

  // Increased orbit radii to accommodate larger globe (40% bigger)
  const orbitRadii = [5, 5.5, 6, 6.5, 7];
  const orbitSpeeds = [0.005, 0.004, 0.006, 0.003, 0.007];

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-[#1a0033] via-[#0a0a0a] to-[#1a0a00] overflow-hidden">
      {/* Price Cards */}
      <PriceCards cryptoData={cryptoData} />

      {/* 3D Scene - Adjusted camera for larger globe */}
      <Canvas
        camera={{ position: [0, 0, 12], fov: 75 }}
        className="w-full h-full"
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
          minDistance={10}
          maxDistance={20}
          autoRotate={!selectedCoin}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* AI Chat Panel */}
      <AIChatPanel
        isOpen={showPanel}
        selectedCoin={selectedCoin}
        onClose={handleClosePanel}
        cryptoData={cryptoData}
      />

      {/* Title Overlay - Bryce Digital Style */}
      {!selectedCoin && (
        <div className="fixed top-48 left-0 right-0 text-center pointer-events-none z-40 px-6">
          <h1
            className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight uppercase"
            style={{letterSpacing: '0.05em'}}
          >
            Crypto Command Center
          </h1>
          <p className="text-lg text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed">
            Real-time market data with 3D visualization
          </p>
        </div>
      )}
    </div>
  );
}
