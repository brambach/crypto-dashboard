'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { CryptoData } from '@/types/crypto';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import Globe3D from './Globe3D';
import CoinOrbit from './CoinOrbit';
import Stars from './Stars';
import PriceCards from './PriceCards';
import AIChatPanel from './AIChatPanel';
import HeroOverlay from './HeroOverlay';
import InteractionOverlay from './InteractionOverlay';

// Scroll-driven camera that responds to page scroll
function ScrollCamera({ scrollProgress, selectedCoin, orbitControlsRef, isMobile, heroVisible }: {
  scrollProgress: number;
  selectedCoin: CryptoData | null;
  orbitControlsRef: React.RefObject<OrbitControlsImpl | null>;
  isMobile: boolean;
  heroVisible: boolean;
}) {
  const { camera } = useThree();
  const targetRef = useRef({ y: 1.5, z: 12 });
  const initializedRef = useRef(false);
  // Start at Math.PI/2 so breathing starts at maximum zoom (sin(π/2) = 1)
  const timeRef = useRef(Math.PI / 2);
  const lastDistanceRef = useRef(12);
  const mobileEnteredRef = useRef(false);

  useFrame((state, delta) => {
    if (!selectedCoin) {
      // Desktop: Calculate base position from scroll
      const baseY = 1.5 - (scrollProgress * 0.7);  // 1.5 → 0.8
      const baseZ = isMobile ? 14 : (12 - (scrollProgress * 2));      // Mobile: 14, Desktop: 12 → 10

      // Calculate current distance from origin
      const currentDistance = Math.sqrt(
        camera.position.x ** 2 +
        camera.position.y ** 2 +
        camera.position.z ** 2
      );

      // Check if user is actively dragging (distance changed significantly)
      const distanceChanged = Math.abs(currentDistance - lastDistanceRef.current) > 0.1;

      if (!distanceChanged) {
        // Only apply breathing animation when user is not interacting
        timeRef.current += delta;

        // Subtle breathing: ~6 second cycle, ±0.3 units
        const breathingOffset = Math.sin(timeRef.current * 0.3) * 0.3;

        // Calculate target distance with breathing
        const targetDistance = baseZ + breathingOffset;

        // On first frame, set position immediately
        if (!initializedRef.current) {
          camera.position.y = baseY;
          camera.position.z = baseZ + breathingOffset;
          initializedRef.current = true;
          lastDistanceRef.current = baseZ + breathingOffset;
        } else {
          // Only lerp Y position (up/down with scroll)
          camera.position.y += (baseY - camera.position.y) * 0.05;

          // Apply breathing by adjusting distance from origin (keeping direction)
          const newDistance = currentDistance + (targetDistance - currentDistance) * 0.03;
          if (currentDistance > 0) {
            camera.position.multiplyScalar(newDistance / currentDistance);
          }
          lastDistanceRef.current = newDistance;
        }
      } else {
        // User is interacting, just update Y for scroll
        camera.position.y += (baseY - camera.position.y) * 0.05;
        lastDistanceRef.current = currentDistance;
        // Reset time to prevent sudden jump when breathing resumes
        const clampedRatio = Math.min(1, Math.max(-1, (currentDistance - baseZ) / 0.3));
        timeRef.current = Math.asin(clampedRatio);
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
  const [isMobile, setIsMobile] = useState(false);
  const [mobileScale, setMobileScale] = useState(1);
  const [heroVisible, setHeroVisible] = useState(true); // Track hero visibility
  const [currentScale, setCurrentScale] = useState(1); // Current scale for zoom animation
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);

  // Scroll tracking
  const { scrollYProgress } = useScroll();

  // Update scroll value for Three.js components
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setScrollValue(latest);
  });

  // Fixed globe scale - no zoom animation on desktop, animated on mobile
  const currentGlobeScale = 1.0;

  // Use animated scale on mobile, fixed scale on desktop
  const activeScale = isMobile ? currentScale : currentGlobeScale;

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

  // Detect mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width < 768);

      // Calculate mobile scale based on screen size
      if (width < 768) {
        // Scale factor based on screen width
        // 320px (iPhone SE) = 0.5, 375px = 0.6, 414px = 0.7, etc.
        const widthScale = Math.min(1, width / 600);
        // Also consider height for very tall/short screens
        const heightScale = Math.min(1, height / 800);
        // Use the smaller of the two to ensure it fits
        const baseScale = Math.min(widthScale, heightScale) * 0.85;
        setMobileScale(baseScale);
        setCurrentScale(baseScale); // Initialize current scale
      } else {
        setMobileScale(1);
        setCurrentScale(1);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    setHeroVisible(false);
  };

  const handleDismissHero = () => {
    if (isMobile && heroVisible) {
      setHeroVisible(false);
      // Animate scale increase on mobile for "entering" effect
      const startScale = mobileScale;
      const targetScale = mobileScale * 1.4; // Increase scale by 40%
      const duration = 800; // 800ms animation
      const startTime = Date.now();

      const animateScale = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);

        setCurrentScale(startScale + (targetScale - startScale) * eased);

        if (progress < 1) {
          requestAnimationFrame(animateScale);
        }
      };

      animateScale();
    }
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

  // Orbit configuration - adjusted for mobile
  const orbitRadii = isMobile ? [3.5, 4.0, 4.5, 5.0, 5.5] : [4.2, 4.8, 5.4, 6.0, 6.6];
  const orbitSpeeds = [0.003, 0.0045, 0.004, 0.005, 0.0035];

  // Slow down auto-rotation as user scrolls (easier to click coins)
  const autoRotateSpeed = 0.5 - (scrollValue * 0.4);

  // Disable OrbitControls during hero phase (let page scroll work)
  // Enable after scrolling past ~30% (when title has faded)
  // On mobile, enable immediately for touch controls
  const orbitControlsEnabled = isMobile ? true : scrollValue > 0.3;

  return (
    <div className="relative bg-[#0a0a0a]">
      {/* Scrollable height trigger - creates the scroll distance (desktop only) */}
      {!isMobile && <div className="h-[250vh]" />}

      {/* Fixed viewport container */}
      <div className="fixed inset-0 overflow-hidden" onClick={handleDismissHero}>
        {/* Price Cards - stays at top */}
        <PriceCards cryptoData={cryptoData} />

        {/* 3D Scene */}
        <Canvas
          camera={{
            position: isMobile ? [0, 1.5, 14] : [0, 1.5, 12],
            fov: isMobile ? 60 : 75
          }}
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
          <group scale={activeScale}>
            <Globe3D isMobile={isMobile} />
            {cryptoData.map((coin, index) => (
              <CoinOrbit
                key={coin.id}
                coin={coin}
                orbitRadius={orbitRadii[index]}
                orbitSpeed={orbitSpeeds[index]}
                onClick={() => handleCoinClick(coin)}
                index={index}
                globeScale={activeScale}
                hideLabels={showPanel}
                isMobile={isMobile}
              />
            ))}
          </group>

          {/* Scroll-driven camera */}
          <ScrollCamera
            scrollProgress={scrollValue}
            selectedCoin={selectedCoin}
            orbitControlsRef={orbitControlsRef}
            isMobile={isMobile}
            heroVisible={heroVisible}
          />

          {/* Coin selection zoom camera */}
          <CoinZoomCamera selectedCoin={selectedCoin} onZoomComplete={handleZoomComplete} />

          <OrbitControls
            ref={orbitControlsRef}
            target={[0, 0, 0]}
            enableZoom={false}
            enableRotate={orbitControlsEnabled && !selectedCoin}
            enablePan={false}
            autoRotate={!selectedCoin}
            autoRotateSpeed={autoRotateSpeed}
            minDistance={isMobile ? 10 : 9}
            maxDistance={isMobile ? 18 : 15}
            rotateSpeed={isMobile ? 0.5 : 1}
            touches={{
              ONE: 0,  // 0 = ROTATE (one finger rotates the globe)
              TWO: 0   // 0 = ROTATE (two fingers also rotate)
            }}
          />
        </Canvas>

        {/* Hero Overlay - fades out on scroll (desktop) or tap (mobile) */}
        {!selectedCoin && !hasInteracted && heroVisible && (
          <HeroOverlay scrollProgress={scrollYProgress} isMobile={isMobile} />
        )}

        {/* Interaction Overlay - fades in on scroll (desktop only) */}
        {!selectedCoin && !isMobile && <InteractionOverlay scrollProgress={scrollYProgress} />}

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
