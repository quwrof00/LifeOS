'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Message } from '@prisma/client';
import DeleteButton from '../DeleteButton';
import clsx from 'clsx';

type MediaMessage = Message & {
  title?: string;
  boldness?: 'Cold Take' | 'Mild Take' | 'Hot Take' | 'Nuclear Take';
  boldnessExplanation?: string;
  boldnessConfidence?: number;
};

function chipClasses(level?: MediaMessage['boldness']) {
  const base = 'text-xs font-semibold px-2 py-1 rounded-full';
  switch (level) {
    case 'Cold Take':
      return `${base} bg-blue-700 text-blue-200`;
    case 'Mild Take':
      return `${base} bg-green-700 text-green-200`;
    case 'Hot Take':
      return `${base} bg-yellow-700 text-yellow-100`;
    case 'Nuclear Take':
      return `${base} bg-red-800 text-red-200`;
    default:
      return `${base} bg-gray-600 text-gray-200`;
  }
}

export default function MediaFetcher() {
  const [mediaOpinions, setMediaOpinions] = useState<MediaMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/messages/get?type=MEDIA');
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Fetch failed');
        const cleaned = (data.messages || []).filter(
          (m: MediaMessage) => typeof m.id === 'string' && m.id.length > 0,
        );
        setMediaOpinions(cleaned);
      } catch {
        setError('Failed to fetch media opinions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="w-full flex justify-center p-6">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl w-full glass-panel rounded-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">
          Media Opinions
        </h1>

        {loading && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-neon-blue text-center font-medium"
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-neon-blue"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                  className="opacity-75"
                />
              </svg>
              Accessing Archives...
            </span>
          </motion.p>
        )}

        {error && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-neon-red text-center font-medium"
          >
            {error}
          </motion.p>
        )}

        {!loading && !error && mediaOpinions.length === 0 && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-center font-medium"
          >
            No opinions found. Record your take.
          </motion.p>
        )}

        {!loading && !error && mediaOpinions.length > 0 && (
          <ul className="space-y-4">
            {mediaOpinions.map((op) => (
              <motion.li
                key={op.id}
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative p-6 glass-panel border-white/5 bg-white/5 rounded-xl hover:border-neon-blue/30 transition-all duration-300 group"
              >
                {/* Delete Button */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <DeleteButton messageId={op.id} />
                </div>

                <div className="relative z-10 pr-6">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="text-2xl">🎬</span>
                    {op.boldness && (
                      <div className="flex items-center gap-2">
                        <span className={clsx(chipClasses(op.boldness), "shadow-sm")}>{op.boldness}</span>
                        {typeof op.boldnessConfidence === 'number' && (
                          <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                            {op.boldnessConfidence}% CONFIDENCE
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-lg text-white font-medium mb-3 leading-relaxed">{op.content}</p>

                  {op.boldnessExplanation && (
                    <div className="bg-white/5 p-4 rounded-lg mb-3 border border-white/5">
                      <p className="text-sm text-gray-400 italic">&apos;{op.boldnessExplanation}&apos;</p>
                    </div>
                  )}

                  <p className="text-[10px] text-gray-600 font-mono mt-4 uppercase tracking-wider">
                    Recorded: {new Date(op.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}