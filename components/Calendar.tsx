'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

export default function Calendar() {
  const router = useRouter();
  const [selected, setSelected] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async (date: Date | undefined) => {
    if (!date || isNaN(date.getTime())) {
      return; // Invalid dates are handled by DayPicker
    }

    setSelected(date);
    setIsLoading(true);

    try {
      await router.push(`/timeline/${format(date, 'yyyy-MM-dd')}`);
    } catch (error) {
      console.error('Navigation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative p-6 bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-md">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm rounded-xl z-10"
          aria-live="assertive"
          aria-busy={isLoading}
        >
          <motion.div
            className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            aria-label="Loading calendar"
          />
        </motion.div>
      )}

      <h1 className="text-white text-sm font-bold mb-3 text-center">🗓️ By Date</h1>

      <DayPicker
        mode="single"
        selected={selected}
        onSelect={handleSelect}
        showOutsideDays
        disabled={isLoading}
        className="rdp-custom"
        modifiersClassNames={{
          selected: 'rdp-selected',
          today: 'rdp-today',
        }}
        labels={{
          labelNext: () => 'Next Month',
          labelPrevious: () => 'Previous Month',
        }}
      />
    </div>
  );
}