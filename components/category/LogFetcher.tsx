'use client';

import { useEffect, useState } from 'react';
import { Message } from '@prisma/client';
import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedEmoji } from '../AnimatedEmoji';
import DeleteButton from '../DeleteButton';

interface ExtendedMessage extends Message {
  log?: { mood: string | null };
}

export function LogFetcher() {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/messages/get?type=LOG');
        const data = await res.json();
        if (data.success) {
          const validMessages = (data.messages || []).filter((msg: ExtendedMessage) => {
            if (!msg.id || typeof msg.id !== 'string') {
              console.warn('Invalid message ID detected:', msg);
              return false;
            }
            return true;
          });
          setMessages(validMessages);
        } else {
          setError(data.error || 'Failed to fetch logs');
        }
      } catch {
        setError('Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = []; //if its the first msg for the day, make a new array
    acc[date].push(msg); //push the msg into the day's array
    return acc;
  }, {} as Record<string, ExtendedMessage[]>);

  return (
    <div className="w-full flex justify-center p-6">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="max-w-4xl w-full glass-panel rounded-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-white mb-6 text-center tracking-tight">
          Captain&apos;s Log
        </h1>

        {loading && (
          <p className="text-neon-blue text-center font-medium">
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-neon-blue"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Retrieving Archives...
            </span>
          </p>
        )}

        {error && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-neon-red text-center font-medium mb-4"
          >
            {error}
          </motion.p>
        )}

        {!loading && !error && Object.keys(groupedMessages).length === 0 && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-center font-medium"
          >
            Log is empty. Submit your first entry.
          </motion.p>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="mb-8 relative pl-6 border-l border-white/10 ml-2">

            {/* Timeline Dot */}
            <div className="absolute -left-[5px] top-3 w-2.5 h-2.5 bg-neon-blue rounded-full shadow-[0_0_8px_rgba(0,240,255,0.6)]" />

            <h2 className="text-sm font-semibold text-neon-blue mb-4 uppercase tracking-wider backdrop-blur-sm py-1 sticky top-0 bg-transparent">
              {date}
            </h2>

            <ul className="space-y-3">
              {msgs.map((message) => (
                <motion.li
                  key={message.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-5 glass-panel border-white/5 bg-white/5 rounded-xl hover:border-neon-blue/30 transition-all duration-300 relative group"
                >
                  {/* Delete Button */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <DeleteButton messageId={message.id} />
                  </div>

                  <div className="relative z-10 flex flex-col gap-2">
                    <p className="text-gray-200 text-base leading-relaxed">{message.content}</p>

                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                        <span>{new Date(message.createdAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                        })}</span>
                      </div>

                      {message.mood && (
                        <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Mood Status</span>
                          <div className="scale-75 origin-right">
                            <AnimatedEmoji mood={message.mood} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </motion.div>
    </div>
  );
}