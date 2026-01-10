'use client';

import { motion, MotionValue, useTransform } from 'framer-motion';

interface InteractionOverlayProps {
  scrollProgress: MotionValue<number>;
}

export default function InteractionOverlay({ scrollProgress }: InteractionOverlayProps) {
  const opacity = useTransform(scrollProgress, [0.5, 0.7], [0, 1]);
  const y = useTransform(scrollProgress, [0.5, 0.7], [20, 0]);

  return (
    <motion.div
      className="fixed left-0 right-0 text-center pointer-events-none z-40 px-4"
      style={{
        bottom: '10vh',
        opacity,
        y,
      }}
    >
      <p className="text-white/40 text-xs sm:text-sm tracking-wide">
        <span className="hidden sm:inline">Select a coin for analysis</span>
        <span className="sm:hidden">Tap a coin</span>
      </p>
    </motion.div>
  );
}
