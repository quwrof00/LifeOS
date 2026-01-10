'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { LayoutDashboard, Lightbulb, MessageSquare, CheckSquare, FileText, Film, Quote, Folder } from 'lucide-react';

const categories = [
  { id: 'STUDY', label: 'Knowledge Base', icon: FileText },
  { id: 'IDEA', label: 'Innovation', icon: Lightbulb },
  { id: 'RANT', label: 'Vent Log', icon: MessageSquare },
  { id: 'TASK', label: 'Directives', icon: CheckSquare },
  { id: 'LOG', label: 'Daily Logs', icon: LayoutDashboard },
  { id: 'MEDIA', label: 'Archives', icon: Film },
  { id: 'QUOTE', label: 'Wisdom', icon: Quote },
  { id: 'OTHER', label: 'Miscellaneous', icon: Folder },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  // Simplified render logic
  return (
    <aside className="w-72 hidden md:flex flex-col border-r border-white/5 bg-gray-950/20 backdrop-blur-2xl relative z-40 h-[calc(100vh-4rem)]">

      {/* Header */}
      <div className="p-6 pb-2">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-3">
          Control Grid
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {categories.map((cat) => {
          const href = `/category/${cat.id}`;
          const isActive = pathname === href;
          const Icon = cat.icon;

          return (
            <Link
              key={cat.id}
              href={href}
              onMouseEnter={() => setHovered(cat.id)}
              onMouseLeave={() => setHovered(null)}
              className={clsx(
                'relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group',
                isActive
                  ? 'text-white bg-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
              )}
            >
              {/* Active Indicator Glow */}
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-blue/10 to-transparent opacity-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}

              {/* Left Accent Bar for Active State */}
              <div
                className={clsx(
                  "absolute left-0 w-1 rounded-r-full h-6 transition-all duration-300",
                  isActive ? "bg-neon-blue shadow-[0_0_10px_#22d3ee]" : "bg-transparent group-hover:bg-gray-700"
                )}
              />

              <Icon
                size={18}
                className={clsx(
                  "mr-3 transition-colors duration-300",
                  isActive ? "text-neon-blue" : "text-gray-500 group-hover:text-gray-300"
                )}
              />

              <span className="relative z-10 font-medium tracking-wide text-sm">
                {cat.label}
              </span>

              {/* Subtle hover glow */}
              {hovered === cat.id && !isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-white/5"
                  layoutId="hover-nav"
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-xs font-medium text-gray-400 tracking-wider">SYSTEM ONLINE</span>
        </div>
      </div>
    </aside>
  );
}