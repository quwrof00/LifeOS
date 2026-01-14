'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Message } from '@prisma/client';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { debounce } from 'lodash';
import DeleteButton from '../DeleteButton';

interface TaskDetails {
  messageId: string;
  deadline: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  labels: string[];
}

const calculateDaysRemaining = (deadline: string | null) => {
  if (!deadline) return null;

  const deadlineDate = new Date(deadline);
  const currentDate = new Date();

  currentDate.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffMs = deadlineDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

export default function TaskFetcher() {
  const [tasks, setTasks] = useState<Message[]>([]);
  const [taskDetails, setTaskDetails] = useState<Record<string, TaskDetails>>({});
  const [labelInputs, setLabelInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/messages/get?type=TASK');
        const data = await res.json();
        if (data.success) {
          const validTasks = (data.messages || []).filter((msg: Message) => typeof msg.id === 'string');
          setTasks(validTasks);

          const detailsEntries = await Promise.all(
            validTasks.map(async (task: Message) => {
              try {
                const res = await fetch(`/api/task/${task.id}`);
                const data = await res.json();
                if (data.success) {
                  return [
                    task.id,
                    {
                      messageId: task.id,
                      deadline: data.task?.deadline
                        ? new Date(data.task.deadline).toISOString().split('T')[0]
                        : null,
                      priority: data.task?.priority || null,
                      labels: data.task?.labels || [],
                    },
                  ];
                }
              } catch {
                console.warn(`Failed to fetch details for task ${task.id}`);
              }
              return [task.id, null];
            })
          );

          const details = Object.fromEntries(detailsEntries.filter(([, v]) => v));
          const labels = Object.fromEntries(
            Object.entries(details).map(([id, d]) => [id, d?.labels.join(', ') || ''])
          );
          setTaskDetails(details);
          setLabelInputs(labels);
        } else {
          setError(data.error || 'Failed to fetch tasks');
        }
      } catch {
        setError('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const toggleComplete = async (id: string, completed: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
    try {
      await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
    } catch {
      setError('Failed to update task');
    }
  };

  const handleTaskUpdate = useCallback(async (
    messageId: string,
    field: 'deadline' | 'priority' | 'labels',
    value: string | string[] | null
  ) => {
    setSaving(messageId);
    setSaveError((prev) => ({ ...prev, [messageId]: '' }));

    try {
      const payload = field === 'deadline' && value instanceof Date
        ? { [field]: value.toISOString() }
        : { [field]: value };

      const res = await fetch(`/api/task/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setTaskDetails((prev) => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            [field]: value,
          },
        }));
      }
    } catch {
      setSaveError((prev) => ({ ...prev, [messageId]: 'Failed to save' }));
    } finally {
      setSaving(null);
    }
  }, []);

  const debouncedSaveLabels = useMemo(
    () => debounce((messageId: string, labels: string[]) => {
      handleTaskUpdate(messageId, 'labels', labels);
    }, 1000),
    [handleTaskUpdate]
  );

  useEffect(() => {
    return () => {
      debouncedSaveLabels.cancel();
    };
  }, [debouncedSaveLabels]);

  const handleLabelChange = (messageId: string, value: string) => {
    setLabelInputs((prev) => ({ ...prev, [messageId]: value }));
    const labels = value
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l);
    debouncedSaveLabels(messageId, labels);
  };

  return (
    <div className="w-full flex justify-center p-6">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl w-full glass-panel rounded-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-white mb-6 text-center tracking-tight">
          Mission Directives (Tasks)
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
              Syncing Directives...
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
        ) : tasks.length === 0 ? (
          <p className="text-gray-400 text-center font-medium">
            No active directives. Awaiting inputs.
          </p>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => {
              const daysLeft = calculateDaysRemaining(taskDetails[task.id]?.deadline);
              const isUrgent = daysLeft !== null && daysLeft <= 3 && !task.completed && daysLeft >= 0;
              const isOverdue = daysLeft !== null && daysLeft < 0 && !task.completed;

              return (
                <motion.li
                  key={task.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={clsx(
                    "flex flex-col xl:flex-row xl:items-center gap-4 p-4 rounded-xl border transition-all duration-300 relative group",
                    task.completed
                      ? "bg-white/5 border-white/5 opacity-60"
                      : isUrgent
                        ? "bg-yellow-500/10 border-yellow-500/30"
                        : isOverdue
                          ? "bg-red-500/10 border-red-500/30"
                          : "glass-panel border-white/10 hover:border-neon-blue/30"
                  )}
                >
                  {/* Delete Button */}
                  <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DeleteButton messageId={task.id} />
                  </div>

                  {/* Task Content */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={!!task.completed}
                        onChange={() => toggleComplete(task.id, !!task.completed)}
                        className="w-5 h-5 rounded border-gray-500 text-neon-blue focus:ring-neon-blue/50 cursor-pointer bg-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <span
                        className={clsx(
                          'block font-medium text-lg mb-1 transition-colors',
                          task.completed ? 'line-through text-gray-500' : 'text-white'
                        )}
                      >
                        {task.content}
                      </span>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {task.completed && (
                          <span className="text-emerald-400 font-bold tracking-wide uppercase">Completed</span>
                        )}
                        {!task.completed && isOverdue && (
                          <span className="text-red-400 font-bold tracking-wide uppercase">Overdue ({Math.abs(daysLeft!)} days)</span>
                        )}
                        {!task.completed && isUrgent && (
                          <span className="text-yellow-400 font-bold tracking-wide uppercase">{daysLeft} days remaining</span>
                        )}
                        {!task.completed && !isUrgent && !isOverdue && daysLeft !== null && (
                          <span className="text-neon-blue">{daysLeft} days left</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  {taskDetails[task.id] && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-2 xl:pt-0 xl:ml-auto w-full xl:w-auto">
                      <input
                        type="date"
                        value={taskDetails[task.id].deadline || ''}
                        onChange={(e) => handleTaskUpdate(task.id, 'deadline', e.target.value)}
                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-neon-blue/50"
                      />
                      <select
                        value={taskDetails[task.id].priority || ''}
                        onChange={(e) => handleTaskUpdate(task.id, 'priority', e.target.value)}
                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-neon-blue/50"
                      >
                        <option value="" disabled>Priority</option>
                        <option value="HIGH" className="bg-gray-900">High</option>
                        <option value="MEDIUM" className="bg-gray-900">Medium</option>
                        <option value="LOW" className="bg-gray-900">Low</option>
                      </select>
                      <input
                        type="text"
                        value={labelInputs[task.id] || ''}
                        onChange={(e) => handleLabelChange(task.id, e.target.value)}
                        placeholder="Labels..."
                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-neon-blue/50 w-full sm:w-32"
                      />
                    </div>
                  )}

                  {saveError[task.id] && (
                    <div className="absolute bottom-6 right-4 text-[10px] text-neon-red/70 uppercase tracking-wider">
                      {saveError[task.id]}
                    </div>
                  )}

                  {saving === task.id && (
                    <div className="absolute bottom-2 right-4 text-[10px] text-neon-blue/70 animate-pulse uppercase tracking-wider">
                      Saving...
                    </div>
                  )}
                </motion.li>
              );
            })}
          </ul>
        )}
      </motion.div>
    </div>
  );
}