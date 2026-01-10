'use client';

import { useEffect, useState } from 'react';
import { Message } from '@prisma/client';
import { motion, useReducedMotion } from 'framer-motion';
import DeleteButton from '../DeleteButton';

export default function OtherFetcher() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch('/api/messages/get?type=OTHER');
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
          if (validMessages.length < (data.messages || []).length) {
            console.error(
              `Filtered out ${data.messages.length - validMessages.length} messages due to invalid IDs`
            );
          }
        } else {
          setError(data.error || 'Failed to fetch messages');
        }
      } catch {
        setError('Failed to fetch messages');
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
          Miscellaneous
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
              Scanning Archives...
            </span>
          </p>
        )}

        {error && (
          <p className="text-neon-red text-center font-medium mb-4">
            {error}
          </p>
        )}

        {!loading && !error && messages.length === 0 ? (
          <p className="text-gray-400 text-center font-medium">
            No messages found.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {messages.map((message) => (
              <motion.li
                key={message.id}
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative p-6 glass-panel border-white/5 bg-white/5 rounded-xl hover:border-neon-blue/30 transition-all duration-300 group"
              >
                {/* Delete Button */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <DeleteButton messageId={message.id} />
                </div>

                <div className="relative z-10 pr-6">
                  <p className="text-white font-medium text-sm line-clamp-4 mb-3 leading-relaxed">
                    {message.content}
                  </p>
                  <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <p className="text-xs text-gray-500 font-mono">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                    <span className="text-[10px] text-neon-blue font-semibold uppercase tracking-wider bg-neon-blue/10 px-2 py-0.5 rounded">
                      {message.type}
                    </span>
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