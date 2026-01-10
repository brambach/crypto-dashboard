'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
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
}

export default function CoinOrbit({ coin, orbitRadius, orbitSpeed, onClick, index = 0, globeScale = 1, hideLabels = false, isMobile = false }: CoinOrbitProps) {
  const coinRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
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

  useFrame(({ camera, clock }) => {
    if (coinRef.current) {
      angleRef.current += orbitSpeed;
      coinRef.current.position.x = Math.cos(angleRef.current) * orbitRadius;
      coinRef.current.position.z = Math.sin(angleRef.current) * orbitRadius;
      coinRef.current.position.y = Math.sin(angleRef.current * 2) * 0.5;

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

      if (discriminant > 0) {
        // Ray intersects sphere - check if intersection is between camera and coin
        const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);

        // If the near intersection point is between camera and coin, globe occludes
        const isOccluded = t1 > 0 && t1 < distToCoin;
        setIsBehindGlobe(isOccluded);
      } else {
        setIsBehindGlobe(false);
      }
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
      <Sphere args={[0.38, glowSphereDetail, glowSphereDetail]} ref={glowRef}>
        <primitive object={glowMaterial} attach="material" />
      </Sphere>

      {/* Main coin sphere with enhanced material */}
      <Sphere
        args={[isMobile ? 0.3 : 0.25, sphereDetail, sphereDetail]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => !isMobile && setHovered(true)}
        onPointerOut={() => !isMobile && setHovered(false)}
        scale={hovered ? 1.15 : 1}
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
      <Sphere args={[0.15, coreSphereDetail, coreSphereDetail]}>
        <meshBasicMaterial
          color={coinColor}
          transparent
          opacity={hovered ? 0.4 : 0.2}
        />
      </Sphere>

      {/* Stylized HTML label with effects - hidden when behind globe or when panel is open */}
      {!isBehindGlobe && !hideLabels && (
        <Html
          position={[0, 0.55, 0]}
          center
          distanceFactor={isMobile ? 10 : 8}
          style={{
            transition: 'all 0.3s ease',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <div
            className="select-none pointer-events-none"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: hovered ? '#ffffff' : 'rgba(255,255,255,0.8)',
              textShadow: hovered
                ? `0 0 20px ${coinColor}, 0 0 40px ${coinColor}, 0 0 60px ${coinColor}40`
                : `0 0 10px ${coinColor}60`,
              transition: 'all 0.3s ease',
            }}
          >
            {coin.symbol}
          </div>
        </Html>
      )}

      {/* Tooltip on hover - enhanced design (only when visible and panel not open, disabled on mobile) */}
      {hovered && !isBehindGlobe && !hideLabels && !isMobile && (
        <Html distanceFactor={10} position={[0, -0.6, 0]} center>
          <div
            className="rounded-xl px-5 py-4 pointer-events-none backdrop-blur-md"
            style={{
              background: 'rgba(0,0,0,0.85)',
              border: `1px solid ${coinColor}40`,
              boxShadow: `0 0 30px ${coinColor}20, inset 0 0 20px ${coinColor}10`,
              minWidth: '150px',
            }}
          >
            <p
              className="text-[11px] mb-1.5 tracking-wider uppercase"
              style={{ color: coinColor }}
            >
              {coin.name}
            </p>
            <p className="text-xl font-bold text-white mb-1.5 tracking-tight">
              ${coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p
              className="text-sm font-semibold"
              style={{ color: coinColor }}
            >
              {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
