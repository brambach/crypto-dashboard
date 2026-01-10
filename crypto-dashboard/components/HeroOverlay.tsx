'use client';

import { useState, useEffect } from 'react';
import { motion, MotionValue, useTransform, useMotionValue, animate } from 'framer-motion';

interface HeroOverlayProps {
  scrollProgress: MotionValue<number>;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // Professional easing curve
    },
  },
};

const subtitleVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export default function HeroOverlay({ scrollProgress }: HeroOverlayProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Initialize motion values with explicit starting values
  const containerOpacity = useMotionValue(1);
  const containerY = useMotionValue(0);
  const scrollIndicatorOpacity = useMotionValue(0); // Start hidden
  const scrollIndicatorY = useMotionValue(-10);

  useEffect(() => {
    setIsMounted(true);

    // Animate scroll indicator entrance with smooth spring after delay
    const timer = setTimeout(() => {
      animate(scrollIndicatorOpacity, 1, {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      });
      animate(scrollIndicatorY, 0, {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [scrollIndicatorOpacity, scrollIndicatorY]);

  // Only apply scroll transforms after mount
  useEffect(() => {
    if (!isMounted) return;

    const unsubscribe = scrollProgress.on('change', (latest) => {
      // Opacity: 1 at 0%, 0 at 25%
      const opacityValue = Math.max(0, Math.min(1, 1 - (latest / 0.25)));
      containerOpacity.set(opacityValue);

      // Y position: 0 at 0%, -60 at 30%
      const yValue = -(latest / 0.3) * 60;
      containerY.set(yValue);

      // Scroll indicator opacity: fade out by 15% scroll
      const indicatorOpacity = Math.max(0, Math.min(1, 1 - (latest / 0.15)));
      scrollIndicatorOpacity.set(indicatorOpacity);
    });

    return () => unsubscribe();
  }, [isMounted, scrollProgress, containerOpacity, containerY, scrollIndicatorOpacity]);

  return (
    <motion.div
      className="fixed left-0 right-0 text-center pointer-events-none z-40 px-4 sm:px-6"
      initial={{ opacity: 1, y: 0 }}
      style={{
        top: '20vh',
        opacity: containerOpacity,
        y: containerY,
      }}
    >
      {/* Title with staggered animations */}
      <motion.h1
        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none mb-4 sm:mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          className="block text-white"
          variants={wordVariants}
          style={{
            letterSpacing: '-0.02em',
            textShadow: '0 4px 30px rgba(255,255,255,0.1), 0 0 80px rgba(255,255,255,0.05)',
          }}
        >
          CRYPTO
        </motion.span>
        <motion.span
          className="block text-[#FFED4E]"
          variants={wordVariants}
          style={{
            letterSpacing: '-0.02em',
            textShadow: '0 4px 30px rgba(255,237,78,0.25), 0 0 60px rgba(255,237,78,0.15)',
          }}
        >
          COMMAND CENTER
        </motion.span>
      </motion.h1>

      {/* Subtitle with fade in */}
      <motion.p
        className="text-white/40 text-sm sm:text-base font-light tracking-wide"
        variants={subtitleVariants}
        initial="hidden"
        animate="visible"
      >
        Real-time market analytics
      </motion.p>

      {/* Scroll indicator with entrance animation */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 sm:gap-3"
        style={{
          bottom: '-25vh',
          opacity: scrollIndicatorOpacity,
          y: scrollIndicatorY,
        }}
      >
        <span className="text-white/30 text-[10px] sm:text-xs tracking-widest uppercase">
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
