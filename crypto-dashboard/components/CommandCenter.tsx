'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { CryptoData } from '@/types/crypto';
import Globe3D from './Globe3D';
import CoinOrbit from './CoinOrbit';
import Stars from './Stars';
import PriceCards from './PriceCards';
import AIChatPanel from './AIChatPanel';
import HeroOverlay from './HeroOverlay';
import InteractionOverlay from './InteractionOverlay';

// Scroll-driven camera that responds to page scroll
function ScrollCamera({ scrollProgress, selectedCoin }: { scrollProgress: number; selectedCoin: CryptoData | null }) {
  const { camera } = useThree();
  const targetRef = useRef({ y: 2.5, z: 14 });
  const initializedRef = useRef(false);

  useFrame(() => {
    if (!selectedCoin) {
      // Interpolate camera based on scroll progress
      // Hero phase: camera higher and farther (more dramatic)
      // Interaction phase: camera closer and level with globe
      targetRef.current.y = 2.5 - (scrollProgress * 1.5);  // 2.5 → 1
      targetRef.current.z = 14 - (scrollProgress * 4);      // 14 → 10

      // On first frame, set camera position immediately (no lerp)
      if (!initializedRef.current) {
        camera.position.y = targetRef.current.y;
        camera.position.z = targetRef.current.z;
        initializedRef.current = true;
      } else {
        // Smooth lerp to target
        camera.position.y += (targetRef.current.y - camera.position.y) * 0.05;
        camera.position.z += (targetRef.current.z - camera.position.z) * 0.05;
      }
    }
  });

  return null;
}

// Camera controller for coin selection zoom
function CoinZoomCamera({ selectedCoin, onZoomComplete }: { selectedCoin: CryptoData | null; onZoomComplete: () => void }) {
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
      // Return to scroll-based position will be handled by ScrollCamera
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
  const [scrollValue, setScrollValue] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false); // Track if user has clicked a coin

  // Scroll tracking
  const { scrollYProgress } = useScroll();

  // Update scroll value for Three.js components
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setScrollValue(latest);
  });

  // Globe scale based on scroll (1.0 at start, scales up to 1.25 as you scroll)
  const globeScale = useTransform(scrollYProgress, [0, 0.5], [1.0, 1.25]);
  const [currentGlobeScale, setCurrentGlobeScale] = useState(1.0);

  // Initialize globe scale immediately on mount
  useEffect(() => {
    setCurrentGlobeScale(globeScale.get());
  }, [globeScale]);

  useMotionValueEvent(globeScale, 'change', (latest) => {
    setCurrentGlobeScale(latest);
  });

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

  // Reset scroll to top on mount and initialize scroll value
  useEffect(() => {
    window.scrollTo(0, 0);
    // Ensure scroll value is initialized to 0 on mount
    setScrollValue(0);
  }, []);

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCoinClick = (coin: CryptoData) => {
    setSelectedCoin(coin);
    setHasInteracted(true); // Mark that user has interacted - hides hero permanently
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
          {/* Minimal loading spinner */}
          <div className="w-8 h-8 mx-auto mb-6 border border-white/20 border-t-white/60 rounded-full animate-spin"></div>
          <p className="text-white/40 text-sm tracking-wide">Loading</p>
        </div>
      </div>
    );
  }

  // Orbit configuration
  const orbitRadii = [4.2, 4.8, 5.4, 6.0, 6.6];
  const orbitSpeeds = [0.003, 0.0045, 0.004, 0.005, 0.0035];

  // Slow down auto-rotation as user scrolls (easier to click coins)
  const autoRotateSpeed = 0.5 - (scrollValue * 0.4);

  // Disable OrbitControls during hero phase (let page scroll work)
  // Enable after scrolling past ~30% (when title has faded)
  const orbitControlsEnabled = scrollValue > 0.3;

  return (
    <div className="relative bg-[#0a0a0a]">
      {/* Scrollable height trigger - creates the scroll distance */}
      <div className="h-[250vh]" />

      {/* Fixed viewport container */}
      <div className="fixed inset-0 overflow-hidden">
        {/* Price Cards - stays at top */}
        <PriceCards cryptoData={cryptoData} />

        {/* 3D Scene */}
        <Canvas
          camera={{ position: [0, 2.5, 14], fov: 75 }}
          className="w-full h-full"
          onPointerMissed={() => {
            if (showPanel) {
              handleClosePanel();
            }
          }}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ffffff" />

          <Stars />

          {/* Globe and coins together - scale as one unit */}
          <group scale={currentGlobeScale}>
            <Globe3D />
            {cryptoData.map((coin, index) => (
              <CoinOrbit
                key={coin.id}
                coin={coin}
                orbitRadius={orbitRadii[index]}
                orbitSpeed={orbitSpeeds[index]}
                onClick={() => handleCoinClick(coin)}
                index={index}
                globeScale={currentGlobeScale}
              />
            ))}
          </group>

          {/* Scroll-driven camera */}
          <ScrollCamera scrollProgress={scrollValue} selectedCoin={selectedCoin} />

          {/* Coin selection zoom camera */}
          <CoinZoomCamera selectedCoin={selectedCoin} onZoomComplete={handleZoomComplete} />

          <OrbitControls
            enableZoom={false}
            enableRotate={orbitControlsEnabled && !selectedCoin}
            enablePan={false}
            autoRotate={!selectedCoin}
            autoRotateSpeed={autoRotateSpeed}
          />
        </Canvas>

        {/* Hero Overlay - fades out on scroll, hidden permanently after interacting with coin */}
        {!selectedCoin && !hasInteracted && <HeroOverlay scrollProgress={scrollYProgress} />}

        {/* Interaction Overlay - fades in on scroll */}
        {!selectedCoin && <InteractionOverlay scrollProgress={scrollYProgress} />}

        {/* AI Chat Panel */}
        <AIChatPanel
          isOpen={showPanel}
          selectedCoin={selectedCoin}
          onClose={handleClosePanel}
          cryptoData={cryptoData}
        />

        {/* Background dim when panel is open */}
        {showPanel && (
          <div
            className="fixed inset-0 bg-black/30 pointer-events-none z-30 transition-opacity duration-500"
            style={{ opacity: showPanel ? 1 : 0 }}
          />
        )}
      </div>
    </div>
  );
}
