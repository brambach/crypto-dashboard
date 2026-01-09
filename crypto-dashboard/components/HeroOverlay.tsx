'use client';

import { motion, MotionValue, useTransform } from 'framer-motion';

interface HeroOverlayProps {
  scrollProgress: MotionValue<number>;
}

export default function HeroOverlay({ scrollProgress }: HeroOverlayProps) {
  const opacity = useTransform(scrollProgress, [0, 0.25], [1, 0]);
  const y = useTransform(scrollProgress, [0, 0.3], [0, -60]);
  const scrollIndicatorOpacity = useTransform(scrollProgress, [0, 0.15], [1, 0]);

  return (
    <motion.div
      className="fixed left-0 right-0 text-center pointer-events-none z-40 px-6"
      initial={{ opacity: 1, y: 0 }}
      style={{
        top: '28vh',
        opacity,
        y,
      }}
    >
      {/* Title - clean and confident with subtle depth */}
      <h1 className="text-7xl md:text-8xl font-bold tracking-tight leading-none mb-6">
        <span
          className="block text-white"
          style={{
            letterSpacing: '-0.02em',
            textShadow: '0 4px 30px rgba(255,255,255,0.1), 0 0 80px rgba(255,255,255,0.05)'
          }}
        >
          CRYPTO
        </span>
        <span
          className="block text-[#FFED4E]"
          style={{
            letterSpacing: '-0.02em',
            textShadow: '0 4px 30px rgba(255,237,78,0.25), 0 0 60px rgba(255,237,78,0.15)'
          }}
        >
          COMMAND CENTER
        </span>
      </h1>

      {/* Subtitle - minimal */}
      <p className="text-white/40 text-base font-light tracking-wide">
        Real-time market analytics
      </p>

      {/* Scroll indicator - simple */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        initial={{ opacity: 1 }}
        style={{
          bottom: '-32vh',
          opacity: scrollIndicatorOpacity,
        }}
      >
        <span className="text-white/30 text-xs tracking-widest uppercase">
          Scroll
        </span>
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="text-white/30"
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <path
            d="M19 14l-7 7-7-7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}
