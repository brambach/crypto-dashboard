'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const STAR_COUNT = 15000;

export default function Stars() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, sizes, twinkleOffsets } = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    const twinkleOffsets = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      // Random position in a large sphere
      const x = (Math.random() - 0.5) * 150;
      const y = (Math.random() - 0.5) * 150;
      const z = (Math.random() - 0.5) * 150;
      positions.set([x, y, z], i * 3);

      // Varied star sizes (small, medium, large)
      const sizeCategory = Math.random();
      if (sizeCategory < 0.7) {
        sizes[i] = 0.03 + Math.random() * 0.05; // Small stars
      } else if (sizeCategory < 0.95) {
        sizes[i] = 0.08 + Math.random() * 0.1; // Medium stars
      } else {
        sizes[i] = 0.18 + Math.random() * 0.15; // Large bright stars
      }

      // Random phase offset for twinkling
      twinkleOffsets[i] = Math.random() * Math.PI * 2;
    }

    return { positions, sizes, twinkleOffsets };
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // Slow rotation
      pointsRef.current.rotation.y += 0.0001;

      // Twinkling effect
      const material = pointsRef.current.material as THREE.PointsMaterial;
      const time = clock.getElapsedTime();

      // Animate opacity for twinkling
      const geometry = pointsRef.current.geometry;
      const sizesAttr = geometry.attributes.size as THREE.BufferAttribute;

      for (let i = 0; i < STAR_COUNT; i++) {
        const baseSize = sizes[i];
        const twinkle = Math.sin(time * 2 + twinkleOffsets[i]) * 0.3 + 0.7;
        sizesAttr.array[i] = baseSize * twinkle;
      }
      sizesAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        vertexColors={false}
      />
    </points>
  );
}
