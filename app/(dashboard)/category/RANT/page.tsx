'use client';

import { useEffect, useState } from 'react';
import { HeatMapChart } from '@/components/HeatMapChart';
import { AnimatedEmoji } from '@/components/AnimatedEmoji';
import { Message } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteButton from '@/components/DeleteButton';

export default function RantPage() {
  const [rants, setRants] = useState<Message[]>([]);
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(false);

  // Enable animations after mount to improve LCP
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 0); // Minimal delay to prioritize initial render
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchRants = async () => {
      try {
        const res = await fetch('/api/messages/get?type=RANT');
        const data = await res.json();
        if (data.success) {
          setRants(data.messages);
        } else {
          throw new Error(data.error || 'Failed to fetch rants');
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchRants();
  }, []);

  const renderContent = () => (
    <>
      <h1 className="text-4xl font-extrabold text-white text-center drop-shadow-lg">
        🔥 Rant Arena 🔥
      </h1>
      <div className="space-y-8">
        {shouldAnimate ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="bg-gray-800/50 border border-neon-blue/30 rounded-xl p-4 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
          >
            <HeatMapChart rants={rants} />
          </motion.div>
        ) : (
          <div className="bg-gray-800/50 border border-neon-blue/30 rounded-xl p-4 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            <HeatMapChart rants={rants} />
          </div>
        )}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {rants.map((rant, index) => (
  <motion.div
    key={rant.id}
    initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
    animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
    exit={shouldAnimate ? { opacity: 0, y: -20 } : {}}
    transition={
      shouldAnimate
        ? { duration: 0.3, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }
        : {}
    }
    className="p-4 bg-gray-800/50 border border-neon-blue/30 rounded-xl shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all duration-300 relative overflow-hidden flex justify-between items-center"
    whileHover={{ scale: 1.02, rotate: 0.5 }}
  >
    <span className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
    {/* Delete Button */}
    <DeleteButton
      messageId={rant.id}
      className="absolute bottom-2 right-2 z-20"
    />
    <p className="text-lg text-white font-medium relative z-10 flex-1 pr-12">{rant.content}</p>
    <div className="relative z-10 pr-10">
      <AnimatedEmoji mood={rant.mood} />
    </div>
  </motion.div>
))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center p-6">
      {shouldAnimate ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
        >
          {renderContent()}
        </motion.div>
      ) : (
        <div className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {renderContent()}
        </div>
      )}
    </div>
  );
}