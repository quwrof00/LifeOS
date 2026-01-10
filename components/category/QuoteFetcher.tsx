'use client';

import { useEffect, useState } from 'react';
import { Message } from '@prisma/client';
import { motion, useReducedMotion } from 'framer-motion';
import DeleteButton from '../DeleteButton';

export default function QuoteFetcher() {
  const [quotes, setQuotes] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const res = await fetch('/api/messages/get?type=QUOTE');
        const data = await res.json();
        if (data.success) {
          const validQuotes = (data.messages || []).filter((msg: Message) => {
            if (!msg.id || typeof msg.id !== 'string') {
              console.warn('Invalid message ID detected:', msg);
              return false;
            }
            return true;
          });
          setQuotes(validQuotes);
          if (validQuotes.length < (data.messages || []).length) {
            console.error(
              `Filtered out ${data.messages.length - validQuotes.length} messages due to invalid IDs`
            );
          }
        } else {
          setError(data.error || 'Failed to fetch quotes');
        }
      } catch {
        setError('Failed to fetch quotes');
      } finally {
        setLoading(false);
      }
    }
    fetchQuotes();
  }, []);

  return (
    <div className="w-full flex justify-center p-6">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl w-full glass-panel rounded-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">
          Words of Wisdom
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
              Uncovering Epic Quotes...
            </span>
          </p>
        )}

        {error && (
          <p className="text-neon-red text-center font-medium mb-4">
            {error}
          </p>
        )}

        {!loading && !error && quotes.length === 0 ? (
          <p className="text-gray-400 text-center font-medium">
            No quotes yet. Share your wisdom!
          </p>
        ) : (
          <ul className="space-y-6">
            {quotes.map((quote) => (
              <motion.li
                key={quote.id}
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative p-8 glass-panel border-white/5 bg-white/5 rounded-xl transition-all duration-300 group hover:border-neon-blue/30"
              >
                {/* Delete Button */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <DeleteButton messageId={quote.id} />
                </div>

                <div className="relative z-10 pl-6 pr-6">
                  {/* Quote Icon */}
                  <div className="absolute top-0 left-0 text-neon-blue/20 text-4xl leading-none -mt-2 -ml-2 font-serif">“</div>

                  <p className="text-xl text-white italic font-serif leading-relaxed tracking-wide mb-4 relative z-10">
                    {quote.content}
                  </p>

                  {/* Copy Button */}
                  <div className="absolute bottom-4 right-2 flex items-center gap-2">
                    {copiedId === quote.id && (
                      <span className="text-neon-green text-xs animate-fade-in-up">Copied!</span>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(quote.content);
                        setCopiedId(quote.id);
                        setTimeout(() => {
                          setCopiedId(null);
                        }, 2000);
                      }}
                      className="text-gray-500 hover:text-neon-blue transition-colors"
                      title="Copy Quote"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>

                  <div className="h-px bg-white/10 my-4" />

                  <div className="flex justify-between items-end">
                    <p className="text-sm text-gray-300 font-medium">{quote.summary || 'Unknown Source'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </p>
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
