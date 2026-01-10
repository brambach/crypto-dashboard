'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

interface CoinOrbitProps {
  coin: {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change24h: number;
  };
  orbitRadius: number;
  orbitSpeed: number;
  onClick: () => void;
  index?: number;
  globeScale?: number;
  hideLabels?: boolean;
  isMobile?: boolean;
  heroVisible?: boolean;
}

export default function CoinOrbit({ coin, orbitRadius, orbitSpeed, onClick, index = 0, globeScale = 1, hideLabels = false, isMobile = false, heroVisible = false }: CoinOrbitProps) {
  const coinRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<[number, number, number]>([1.5, 0.3, 0]);
  const [currentScale, setCurrentScale] = useState(1);
  const targetScaleRef = useRef(1);
  const baseAngle = index * (Math.PI * 2 / 5);
  const angleRef = useRef(baseAngle + (Math.random() * 0.4 - 0.2));
  const pulseRef = useRef(0);

  // Create glow shader material
  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color('#22c55e') },
        intensity: { value: 0.5 },
        falloff: { value: 2.0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float intensity;
        uniform float falloff;
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
          float glow = pow(1.0 - abs(dot(vNormal, vPositionNormal)), falloff);
          gl_FragColor = vec4(glowColor, glow * intensity);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  const [isBehindGlobe, setIsBehindGlobe] = useState(false);
  const GLOBE_BASE_RADIUS = isMobile ? 3.0 : 3.5; // Match the globe radius from Globe3D

  // Reduce polygon count on mobile for better performance
  const sphereDetail = isMobile ? 24 : 32;
  const glowSphereDetail = isMobile ? 20 : 32;
  const coreSphereDetail = isMobile ? 12 : 16;

  // Update target scale when hover state changes
  useEffect(() => {
    targetScaleRef.current = hovered ? 2.5 : 1;
  }, [hovered]);

  useFrame(({ camera, clock }) => {
    if (coinRef.current) {
      // Smoothly animate scale towards target
      const lerpSpeed = 0.15; // Adjust for faster/slower animation
      setCurrentScale((prev) => {
        const diff = targetScaleRef.current - prev;
        if (Math.abs(diff) < 0.001) return targetScaleRef.current;
        return prev + diff * lerpSpeed;
      });
      // Check if coin is occluded by the globe using ray-sphere intersection
      const coinWorldPos = new THREE.Vector3();
      coinRef.current.getWorldPosition(coinWorldPos);

      // Ray from camera to coin
      const rayOrigin = camera.position.clone();
      const rayDir = coinWorldPos.clone().sub(rayOrigin).normalize();

      // Sphere intersection test (globe at origin with scaled radius)
      // Using the quadratic formula for ray-sphere intersection
      const scaledGlobeRadius = GLOBE_BASE_RADIUS * globeScale;
      const oc = rayOrigin.clone(); // Origin to center (center is at 0,0,0)
      const a = rayDir.dot(rayDir);
      const b = 2.0 * oc.dot(rayDir);
      const c = oc.dot(oc) - scaledGlobeRadius * scaledGlobeRadius;
      const discriminant = b * b - 4 * a * c;

      // Distance from camera to coin
      const distToCoin = coinWorldPos.distanceTo(rayOrigin);

      let isOccluded = false;
      if (discriminant > 0) {
        // Ray intersects sphere - check if intersection is between camera and coin
        const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);

        // If the near intersection point is between camera and coin, globe occludes
        isOccluded = t1 > 0 && t1 < distToCoin;
      }
      setIsBehindGlobe(isOccluded);

      // Reset hover state if coin goes behind globe or labels are hidden (prevents stuck slow speed)
      if ((isOccluded || hideLabels) && hovered) {
        setHovered(false);
      }

      // Slow down orbit speed significantly when hovered (10% speed)
      const currentSpeed = hovered ? orbitSpeed * 0.1 : orbitSpeed;
      angleRef.current += currentSpeed;
      coinRef.current.position.x = Math.cos(angleRef.current) * orbitRadius;
      coinRef.current.position.z = Math.sin(angleRef.current) * orbitRadius;
      coinRef.current.position.y = Math.sin(angleRef.current * 2) * 0.5;

      // Update tooltip position based on actual screen position
      // Project coin's world position to normalized device coordinates (NDC)
      const coinScreenPos = new THREE.Vector3();
      coinRef.current.getWorldPosition(coinScreenPos);

      // Project to screen space
      const projected = coinScreenPos.clone().project(camera);

      // projected.x ranges from -1 (left) to +1 (right)
      // projected.y ranges from -1 (bottom) to +1 (top)
      let newPos: [number, number, number];

      // Determine tooltip position based on where coin appears on screen
      const screenX = projected.x;
      const screenY = projected.y;

      // Left side of screen: tooltip to RIGHT
      if (screenX < -0.3) {
        newPos = [1.5, 0.3, 0];
      }
      // Right side of screen: tooltip to LEFT
      else if (screenX > 0.3) {
        newPos = [-1.5, 0.3, 0];
      }
      // Center horizontally, check vertical position
      else {
        // Top of screen: tooltip BELOW
        if (screenY > 0.3) {
          newPos = [0, -1.5, 0];
        }
        // Bottom of screen: tooltip ABOVE
        else {
          newPos = [0, 1.5, 0];
        }
      }

      setTooltipPos(newPos);
    }

    // Animate glow intensity
    pulseRef.current = clock.getElapsedTime();
    if (glowMaterial.uniforms) {
      const baseIntensity = hovered ? 1.2 : 0.4;
      const pulse = Math.sin(pulseRef.current * 3) * 0.15;
      glowMaterial.uniforms.intensity.value = baseIntensity + (hovered ? pulse : 0);

      // Update glow color based on price change
      const isPositive = coin.change24h >= 0;
      glowMaterial.uniforms.glowColor.value.set(isPositive ? '#22c55e' : '#ef4444');
    }
  });

  const isPositive = coin.change24h >= 0;
  const coinColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <group ref={coinRef}>
      {/* Outer glow sphere */}
      <Sphere
        args={[0.38, glowSphereDetail, glowSphereDetail]}
        ref={glowRef}
        scale={currentScale}
      >
        <primitive object={glowMaterial} attach="material" />
      </Sphere>

      {/* Main coin sphere with enhanced material */}
      <Sphere
        args={[isMobile ? 0.3 : 0.25, sphereDetail, sphereDetail]}
        onClick={(e) => {
          if (heroVisible) return;  // Ignore clicks before entry
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => !isMobile && !heroVisible && setHovered(true)}
        onPointerOut={() => !isMobile && setHovered(false)}
        scale={currentScale}
      >
        <meshStandardMaterial
          color={coinColor}
          emissive={coinColor}
          emissiveIntensity={hovered ? 0.6 : 0.25}
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1.5}
        />
      </Sphere>

      {/* Inner bright core for extra shine */}
      <Sphere
        args={[0.15, coreSphereDetail, coreSphereDetail]}
        scale={currentScale}
      >
        <meshBasicMaterial
          color={coinColor}
          transparent
          opacity={hovered ? 0.4 : 0.2}
        />
      </Sphere>

      {/* Always-on symbol badge - camera facing */}
      {!heroVisible && !hideLabels && (
        <Html
          position={[0, 0.5, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="px-2 py-1 rounded-md text-xs font-bold tracking-wider"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: `1px solid ${coinColor}30`,
              color: coinColor,
              backdropFilter: 'blur(4px)',
              opacity: isBehindGlobe ? 0 : 0.7,
              transition: 'opacity 0.2s',
            }}
          >
            {coin.symbol}
          </div>
        </Html>
      )}

      {/* Detailed hover overlay - only when hovered */}
      <Html
        position={tooltipPos}
        center
        style={{ pointerEvents: 'none' }}
      >
        <AnimatePresence mode="wait">
          {hovered && !isMobile && !heroVisible && !hideLabels && (
            <motion.div
            key="tooltip"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                type: 'spring',
                damping: 20,
                stiffness: 300
              }
            }}
            exit={{
              opacity: 0,
              scale: 0.6,
              y: -10,
              filter: 'blur(4px)',
              transition: {
                duration: 0.25,
                ease: 'easeIn'
              }
            }}
            className="rounded-xl px-6 py-4 min-w-[240px]"
            style={{
              background: 'rgba(0,0,0,0.9)',
              border: `2px solid ${coinColor}60`,
              boxShadow: `0 0 30px ${coinColor}30, inset 0 0 20px ${coinColor}10`,
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Coin name */}
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
              {coin.name}
            </p>

            {/* Price */}
            <p className="text-white text-2xl font-bold mb-2">
              ${coin.price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>

            {/* 24h change */}
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: coinColor }}
            >
              {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}% 24h
            </p>

            {/* CTA */}
            <div className="pt-3 border-t" style={{ borderColor: `${coinColor}30` }}>
              <p className="text-white/50 text-xs text-center">
                Click to analyze
              </p>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </Html>

    </group>
  );
}
