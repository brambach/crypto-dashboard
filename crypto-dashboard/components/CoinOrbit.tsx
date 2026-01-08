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
  const coinColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <group ref={coinRef}>
      {/* Main coin sphere */}
      <Sphere
        args={[0.25, 32, 32]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.15 : 1}
      >
        <meshStandardMaterial
          color={coinColor}
          emissive={coinColor}
          emissiveIntensity={hovered ? 0.4 : 0.2}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>

      {/* Subtle glow effect */}
      {hovered && (
        <Sphere args={[0.32, 32, 32]}>
          <meshBasicMaterial
            color={coinColor}
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </Sphere>
      )}

      {/* Floating label - always faces camera, positioned higher to avoid overlap */}
      <Text
        ref={labelRef}
        position={[0, 0.7, 0]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
        fontWeight={600}
      >
        {coin.symbol}
      </Text>

      {/* Detailed tooltip on hover */}
      {hovered && (
        <Html distanceFactor={10} position={[0, -0.5, 0]}>
          <div className="bg-[#13131a]/95 backdrop-blur-xl border border-[#1f1f28] rounded-lg px-3 py-2 pointer-events-none shadow-xl">
            <p className="text-xs font-medium text-gray-400 mb-1">{coin.name}</p>
            <p className="text-lg font-semibold text-white mb-1">${coin.price.toFixed(2)}</p>
            <p className={`text-xs font-medium ${
              isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
