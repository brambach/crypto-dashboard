'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html, Text } from '@react-three/drei';
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
}

export default function CoinOrbit({ coin, orbitRadius, orbitSpeed, onClick }: CoinOrbitProps) {
  const coinRef = useRef<THREE.Group>(null);
  const labelRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame(({ camera }) => {
    if (coinRef.current) {
      angleRef.current += orbitSpeed;
      coinRef.current.position.x = Math.cos(angleRef.current) * orbitRadius;
      coinRef.current.position.z = Math.sin(angleRef.current) * orbitRadius;
      coinRef.current.position.y = Math.sin(angleRef.current * 2) * 0.5;
    }

    // Make label face camera
    if (labelRef.current) {
      labelRef.current.quaternion.copy(camera.quaternion);
    }
  });

  const isPositive = coin.change24h >= 0;
  const glowColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <group ref={coinRef}>
      {/* Main coin sphere */}
      <Sphere
        args={[0.3, 32, 32]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={hovered ? 1.2 : 0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      {/* Enhanced multi-layer glow effect */}
      <Sphere args={[0.38, 32, 32]}>
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={hovered ? 0.4 : 0.25}
          side={THREE.BackSide}
        />
      </Sphere>

      <Sphere args={[0.5, 32, 32]}>
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={hovered ? 0.2 : 0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Floating label - always faces camera */}
      <Text
        ref={labelRef}
        position={[0, 0.6, 0]}
        fontSize={0.25}
        color={glowColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {coin.symbol}
      </Text>

      {/* Detailed tooltip on hover */}
      {hovered && (
        <Html distanceFactor={10} position={[0, -0.6, 0]}>
          <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl px-4 py-3 pointer-events-none shadow-lg">
            <p className="text-xs font-bold text-slate-900 mb-1">{coin.name}</p>
            <p className="text-lg font-bold text-slate-900 mb-1">${coin.price.toFixed(2)}</p>
            <p className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${
              isPositive
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                : 'text-red-700 bg-red-50 border border-red-100'
            }`}>
              {isPositive ? '↑' : '↓'} {Math.abs(coin.change24h).toFixed(2)}%
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
