'use client';

import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function Globe3D() {
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

  return (
    <group ref={globeRef}>
      {/* Main Earth sphere with texture - 40% larger */}
      <Sphere args={[3.5, 64, 64]}>
        <meshStandardMaterial
          map={earthTexture}
          metalness={0.1}
          roughness={0.9}
        />
      </Sphere>

      {/* Wireframe grid overlay - subtle white */}
      <Sphere args={[3.53, 32, 32]}>
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
