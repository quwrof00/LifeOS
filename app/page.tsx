'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Page() {
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(false);

  // Enable animations after mount to improve LCP
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);



  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background circuit effect */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g className="glow-pulse">
            {/* Existing circuit paths */}
            <path d="M100 200 L300 200 L300 400 L500 400" stroke="#00f0ff" strokeWidth="3" />
            <path d="M600 300 L600 500 L800 500" stroke="#cc00ff" strokeWidth="3" />
            <circle cx="300" cy="200" r="6" fill="#00f0ff" />
            <circle cx="600" cy="500" r="6" fill="#cc00ff" />
            <circle cx="500" cy="400" r="6" fill="#00ff85" />
            {/* Additional circuit paths */}
            <path d="M150 300 L150 600 L350 600 L350 800" stroke="#00ff85" strokeWidth="2.5" />
            <path d="M700 100 L900 100 L900 300" stroke="#00f0ff" strokeWidth="2.5" />
            <path d="M200 500 L400 500 L400 700" stroke="#cc00ff" strokeWidth="2.5" />
            <circle cx="150" cy="600" r="5" fill="#00ff85" />
            <circle cx="900" cy="300" r="5" fill="#00f0ff" />
            <circle cx="400" cy="700" r="5" fill="#cc00ff" />
            {/* New full-screen circuit paths */}
            <path d="M50 50 L200 50 L200 250 L400 250" stroke="#ff4d4d" strokeWidth="2.5" />
            <path d="M950 950 L800 950 L800 750 L600 750" stroke="#00f0ff" strokeWidth="2.5" />
            <path d="M100 900 L300 900 L300 650 L500 650" stroke="#cc00ff" strokeWidth="2.5" />
            <path d="M900 50 L700 50 L700 200" stroke="#00ff85" strokeWidth="2.5" />
            <circle cx="200" cy="50" r="5" fill="#ff4d4d" />
            <circle cx="800" cy="950" r="5" fill="#00f0ff" />
            <circle cx="300" cy="900" r="5" fill="#cc00ff" />
            <circle cx="700" cy="200" r="5" fill="#00ff85" />
            {/* Hex grid pattern */}
            <pattern id="hex-grid" x="0" y="0" width="40" height="69.28" patternUnits="userSpaceOnUse">
              <path
                d="M20 0 L10 17.32 L30 17.32 L40 34.64 L30 51.96 L10 51.96 L0 34.64 L10 17.32"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="0.7"
                className="hex-pulse"
              />
            </pattern>
            <rect x="0" y="0" width="1000" height="1000" fill="url(#hex-grid)" />
          </g>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Subtle scanlines */}
      <div className="absolute inset-0 opacity-08 pointer-events-none scanline-bg glow-pulse"></div>

      {/* Glowing nodes */}
      <motion.div
        className="absolute w-3 h-3 bg-neon-blue rounded-full"
        animate={shouldAnimate ? { opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] } : {}}
        transition={shouldAnimate ? { duration: 2, repeat: Infinity, repeatType: 'reverse' } : {}}
        style={{ top: '20%', left: '30%' }}
      />
      <motion.div
        className="absolute w-2 h-2 bg-neon-purple rounded-full"
        animate={shouldAnimate ? { opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] } : {}}
        transition={shouldAnimate ? { duration: 2.5, repeat: Infinity, repeatType: 'reverse' } : {}}
        style={{ top: '60%', right: '25%' }}
      />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        className="text-center z-10"
      >
        <h1 className="text-6xl sm:text-8xl font-extrabold text-neon-blue mb-6 drop-shadow-[0_0_15px_rgba(0,240,255,0.7)] tracking-tight">
          LifeOS
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-lg mx-auto"
        >
          Your ultimate system to track, plan, and master your life.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <Link href="/write">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(0, 240, 255, 0.8)' }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-neon-blue/20 text-neon-blue text-2xl font-bold rounded-2xl border-2 border-neon-blue/50 backdrop-blur-lg shadow-xl hover:bg-neon-blue/30 transition-all duration-300"
            >
              Note Your Life
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}