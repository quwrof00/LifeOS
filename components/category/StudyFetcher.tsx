'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import DeleteButton from '../DeleteButton';

type Message = {
  id: string;
  content: string;
  createdAt: string;
};

export default function StudyFetcher() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch('/api/messages/get?type=STUDY');
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
          setError(data.error || 'Something went wrong');
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
    <div className="w-full flex items-center justify-center p-6">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl w-full glass-panel rounded-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-white mb-6 text-center tracking-tight">
          Knowledge Base (Study)
        </h1>

        {loading ? (
          <div className="text-neon-blue text-center font-medium">
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
              Retrieving Data...
            </span>
          </div>
        ) : error ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-neon-red text-center font-medium mb-4"
          >
            {error}
          </motion.p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400 text-center font-medium">
            No knowledge entries found. Begin your research.
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((msg) => (
              <motion.li
                key={msg.id}
                initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition-all duration-300 relative group"
                whileHover={prefersReducedMotion ? {} : { x: 4 }}
              >
                <Link href={`/category/STUDY/${msg.id}`} passHref>
                  <div className="relative pr-10">
                    <p className="text-neon-blue font-medium line-clamp-2 group-hover:text-white transition-colors">
                      {msg.content}
                    </p>
                  </div>
                </Link>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
                {/* Delete Button */}
                <DeleteButton
                  messageId={msg.id}
                  className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}