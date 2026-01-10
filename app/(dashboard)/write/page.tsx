'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function WritePage() {
  const { user } = useCurrentUser();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/messages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setContent('');
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Error:', err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!user?.id) return;

    setSummaryLoading(true);
    try {
      const res = await fetch('/api/summary');
      const data = await res.json();

      if (res.ok) {
        setSummary(data.summary);
        setShowSummaryModal(true);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setStatus('error');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-4">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full glass-panel rounded-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-white mb-6 text-center tracking-tight">
          Unleash Your Thoughts
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl focus:ring-1 focus:ring-neon-blue focus:border-neon-blue focus:outline-none placeholder-gray-500 transition-all duration-300 resize-none"
            placeholder="Type your epic message here..."
            whileFocus={prefersReducedMotion ? {} : { scale: 1.01 }}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              type="submit"
              className="flex-1 py-3 px-6 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border border-neon-blue/50 font-semibold rounded-xl transition-all duration-300 relative overflow-hidden group"
              disabled={loading}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="absolute inset-0 bg-neon-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"></span>
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
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
                  Saving...
                </span>
              ) : (
                'Launch Message'
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={handleGenerateSummary}
              className="flex-1 py-3 px-6 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-semibold rounded-xl transition-all duration-300 relative overflow-hidden group"
              disabled={summaryLoading}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"></span>
              {summaryLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
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
                  Generating...
                </span>
              ) : (
                'Generate Weekly Summary'
              )}
            </motion.button>
          </div>
        </form>

        <AnimatePresence>
          {status === 'success' && (
            <motion.p
              key="success"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-neon-green mt-6 text-center font-medium"
            >
              Message saved and categorized! 🎉
            </motion.p>
          )}
          {status === 'error' && (
            <motion.p
              key="error"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-neon-red mt-6 text-center font-medium"
            >
              Oops, something went wrong. 😕
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummaryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowSummaryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowSummaryModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-2xl font-bold text-teal-400 mb-4">Your Summary 📊</h2>
              {summary ? (
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-line text-gray-300">{summary}</p>
                </div>
              ) : (
                <p className="text-gray-400">No summary available</p>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="px-4 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 border border-teal-500/50 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}