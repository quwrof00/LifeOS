'use client';

import { useEffect, useState } from 'react';
import { Message } from '@prisma/client';
import { motion, useReducedMotion } from 'framer-motion';
import DeleteButton from '../DeleteButton';

export default function RantFetcher() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch('/api/messages/get?type=RANT');
        const data = await res.json();
        if (data.success) {
          const validMessages = (data.messages || []).filter((msg: Message) => {
            if (!msg.id || typeof msg.id !== 'string') {
              console.warn('Invalid message ID detected:', msg);
              return false;
            }
            return true;
          });
          setMessages(validMessages);
        } else {
          setError(data.error || 'Failed to fetch rants');
        }
      } catch {
        setError('Failed to fetch rants');
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  return (
    <div className="w-full flex justify-center p-6">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl w-full glass-panel rounded-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-white mb-6 text-center tracking-tight">
          The Venting Void
        </h1>

        {loading && (
          <p className="text-neon-red text-center font-medium">
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-neon-red"
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
              Opening Vent...
            </span>
          </p>
        )}

        {error && (
          <p className="text-neon-red text-center font-medium mb-4">
            {error}
          </p>
        )}

        {!loading && !error && messages.length === 0 && (
          <p className="text-gray-400 text-center font-medium">
            Silence in the void. Scream something into it!
          </p>
        )}

        {!loading && !error && messages.length > 0 && (
          <ul className="grid grid-cols-1 gap-4">
            {messages.map((message) => (
              <motion.li
                key={message.id}
                initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="relative p-6 glass-panel border-red-500/10 bg-red-900/5 rounded-xl hover:border-neon-red/40 transition-all duration-300 group"
              >
                {/* Delete Button */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <DeleteButton messageId={message.id} />
                </div>

                <div className="relative z-10 pr-6">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl mt-1">🤬</span>
                    <div>
                      <p className="text-white font-medium text-lg mb-2 leading-relaxed font-sans">
                        {message.content}
                      </p>
                      <p className="text-xs text-red-400 font-mono uppercase tracking-wider">
                        Ranted on {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}