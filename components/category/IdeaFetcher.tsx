'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import DeleteButton from '../DeleteButton';
import { Lightbulb } from 'lucide-react';

type Message = {
  id: string;
  content: string;
  summary: string | null;
  createdAt: string;
};

type IdeaDetails = {
  messageId: string;
  why: string | null;
  how: string | null;
  when: string | null;
};

export default function IdeaFetcher() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [ideaDetails, setIdeaDetails] = useState<Record<string, IdeaDetails>>({});
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [why, setWhy] = useState('');
  const [how, setHow] = useState('');
  const [when, setWhen] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState<Record<string, string>>({});
  const prefersReducedMotion = useReducedMotion();

  // Fetch ideas and their details parallely
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const res = await fetch('/api/messages/get?type=IDEA');
        const data = await res.json();

        if (data.success) {
          const validMessages = (data.messages || []).filter((msg: Message) => {
            if (!msg.id || typeof msg.id !== 'string') {
              console.warn('Invalid message ID detected: ', msg);
              return false;
            }
            return true;
          });
          setMessages(validMessages);
          const detailsEntries = await Promise.all(
            validMessages.map(async (msg: Message) => {
              try {
                const ideaRes = await fetch(`/api/idea/${msg.id}`);
                const ideaData = await ideaRes.json();

                if (ideaData.success) {
                  return [
                    msg.id,
                    {
                      messageId: msg.id,
                      why: ideaData.idea?.why || '',
                      how: ideaData.idea?.how || '',
                      when: ideaData.idea?.when || '',
                    } as IdeaDetails
                  ];
                }
              } catch {
                console.warn(`Failed to fetch idea details for message ${msg.id}`)
              }
              return [msg.id, null];
            })
          );

          const details = Object.fromEntries(detailsEntries.filter(entry => entry[1] !== null));
          setIdeaDetails(details);
        } else {
          setError('Failed to fetch ideas');
        }
      } catch {
        setError('Failed to fetch ideas');
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  // Update form fields when an idea is selected
  useEffect(() => {
    if (selectedIdeaId && ideaDetails[selectedIdeaId]) {
      setWhy(ideaDetails[selectedIdeaId].why || '');
      setHow(ideaDetails[selectedIdeaId].how || '');
      setWhen(ideaDetails[selectedIdeaId].when || '');
      setSaveError((prev) => ({ ...prev, [selectedIdeaId]: '' }));
    }
  }, [selectedIdeaId, ideaDetails]);

  const handleSave = async (messageId: string) => {
    setSaving(messageId);
    setSaveError((prev) => ({ ...prev, [messageId]: '' }));
    try {
      const res = await fetch(`/api/idea/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ why, how, when }),
      });
      const data = await res.json();
      if (data.success) {
        setIdeaDetails((prev) => ({
          ...prev,
          [messageId]: { messageId, why, how, when },
        }));
      } else {
        setSaveError((prev) => ({
          ...prev,
          [messageId]: data.error || 'Failed to save',
        }));
      }
    } catch {
      setSaveError((prev) => ({ ...prev, [messageId]: 'Failed to save' }));
    } finally {
      setSaving(null);
    }
  };

  const toggleSidebar = (messageId: string) => {
    setSelectedIdeaId(selectedIdeaId === messageId ? null : messageId);
  };

  return (
    <div className="w-full flex justify-center p-6">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl w-full mx-auto"
      >
        <h1 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">
          Spark of Genius
        </h1>

        {loading && (
          <p className="text-neon-blue text-center font-medium">
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-neon-blue" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Igniting Ideas...
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

        {!loading && !error && messages.length === 0 && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-center font-medium"
          >
            No ideas yet. Light up a spark!
          </motion.p>
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div
                  className={clsx(
                    'p-6 glass-panel rounded-xl transition-all duration-300 cursor-pointer relative group border-white/5 hover:border-neon-blue/30',
                    selectedIdeaId === message.id ? 'ring-1 ring-neon-blue/50' : ''
                  )}
                  onClick={() => toggleSidebar(message.id)}
                >
                  {/* Delete Button */}
                  <DeleteButton
                    messageId={message.id}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  />

                  <div className="relative pl-8 pr-4">
                    <Lightbulb className="absolute top-1 left-0 w-5 h-5 text-neon-yellow/70" />
                    <p className="text-sm text-gray-200 line-clamp-3 mb-3 font-medium">{message.content}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Detail Panel */}
                {selectedIdeaId === message.id && ideaDetails[message.id] && (
                  <motion.div
                    initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-full mt-2 glass-panel rounded-xl p-6 shadow-2xl z-10 w-full"
                  >
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-sm font-bold text-neon-blue uppercase tracking-wide">Refine Idea</h2>
                        <button
                          onClick={() => setSelectedIdeaId(null)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase">Why?</label>
                        <textarea
                          value={why}
                          onChange={(e) => setWhy(e.target.value)}
                          placeholder="Why is this important?"
                          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-neon-blue/50 resize-none transition-colors"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase">How?</label>
                        <textarea
                          value={how}
                          onChange={(e) => setHow(e.target.value)}
                          placeholder="Execution plan..."
                          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-neon-blue/50 resize-none transition-colors"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase">When?</label>
                        <textarea
                          value={when}
                          onChange={(e) => setWhen(e.target.value)}
                          placeholder="Timeline..."
                          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-neon-blue/50 resize-none transition-colors"
                          rows={3}
                        />
                      </div>
                      {saveError[message.id] && (
                        <p className="text-neon-red text-xs">{saveError[message.id]}</p>
                      )}
                      <motion.button
                        onClick={() => handleSave(message.id)}
                        disabled={saving === message.id}
                        className="w-full py-2.5 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border border-neon-blue/30 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                        whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
                      >
                        {saving === message.id ? <span className="animate-spin">⏳</span> : 'Save Details'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}