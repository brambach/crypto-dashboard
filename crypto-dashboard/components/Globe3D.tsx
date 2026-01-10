'use client';

import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface Globe3DProps {
  isMobile?: boolean;
}

export default function Globe3D({ isMobile = false }: Globe3DProps) {
  const globeRef = useRef<THREE.Group>(null);

  // Load Earth texture from a public CDN
  const earthTexture = useLoader(
    THREE.TextureLoader,
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'
  );

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  // Reduce sphere size and polygon count on mobile for better performance
  const sphereSize = isMobile ? 3.0 : 3.5;
  const sphereDetail = isMobile ? 48 : 64;
  const wireframeDetail = isMobile ? 24 : 32;

  return (
    <group ref={globeRef}>
      {/* Main Earth sphere with texture - reduced size on mobile */}
      <Sphere args={[sphereSize, sphereDetail, sphereDetail]}>
        <meshStandardMaterial
          map={earthTexture}
          metalness={0.1}
          roughness={0.9}
        />
      </Sphere>

      {/* Wireframe grid overlay - subtle white */}
      <Sphere args={[sphereSize + 0.03, wireframeDetail, wireframeDetail]}>
        <meshBasicMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.04}
        />
      </Sphere>
    </group>
  );
}
