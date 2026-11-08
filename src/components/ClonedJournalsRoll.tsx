/**
 * ShodhSetu - Cloned & Predatory Journals Rolling Sidebar
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Runs a continuous vertical live roll of known hijacked, cloned, and predatory journals
 * on the left side of the platform with 1-click instant forensic inspection.
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ExternalLink, 
  Search, 
  AlertTriangle, 
  Pause, 
  Play, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Globe,
  Building2,
  Sparkles
} from 'lucide-react';
import { KNOWN_HIJACKED_REGISTRY, HijackedRecord } from '../services/hijackedRegistry';

interface ClonedJournalsRollProps {
  onSelectJournal: (query: string) => void;
  isEmergencyRedMode?: boolean;
}

export const ClonedJournalsRoll: React.FC<ClonedJournalsRollProps> = ({
  onSelectJournal,
  isEmergencyRedMode = false,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Duplicate items to create seamless infinite vertical loop
  const rollingItems = [...KNOWN_HIJACKED_REGISTRY, ...KNOWN_HIJACKED_REGISTRY];

  if (isCollapsed) {
    return (
      <aside 
        aria-label="Cloned Journals Watchlist Sidebar (Collapsed)"
        className="hidden lg:flex flex-col items-center justify-between w-14 border-r border-slate-200/80 bg-white/90 backdrop-blur-md py-4 z-20 shrink-0 transition-all select-none"
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
          title="Expand Cloned Journals Live Feed"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center gap-4 py-6">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
          <div className="rotate-180 [writing-mode:vertical-lr] text-[11px] font-black uppercase tracking-widest text-rose-700">
            ⛔ CLONED JOURNALS ROLL
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Expand Cloned Journals Feed"
        >
          <ShieldAlert className="w-5 h-5 text-rose-600" />
        </button>
      </aside>
    );
  }

  return (
    <aside 
      aria-label="Cloned & Predatory Journals Feed"
      className={`hidden lg:flex flex-col w-80 border-r shrink-0 z-20 transition-all duration-300 relative select-none ${
        isEmergencyRedMode 
          ? 'bg-red-950/90 border-red-800 text-white shadow-2xl' 
          : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-sm'
      }`}
      style={{ height: 'calc(100vh - 4rem)' }}
    >
      {/* Google Colorful Accent Bar */}
      <div className="h-1 w-full grid grid-cols-4 shrink-0">
        <span className="bg-[#4285F4]"></span>
        <span className="bg-[#EA4335]"></span>
        <span className="bg-[#FBBC05]"></span>
        <span className="bg-[#34A853]"></span>
      </div>

      {/* Sidebar Header */}
      <div className={`p-4 border-b shrink-0 flex items-center justify-between ${
        isEmergencyRedMode ? 'border-red-800 bg-red-900/60' : 'border-slate-100 bg-slate-50/70'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 block" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 absolute inset-0 animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full ${
                isEmergencyRedMode ? 'bg-red-800 text-rose-100' : 'bg-rose-100 text-rose-700'
              }`}>
                Live Threat Watch
              </span>
            </div>
            <h3 className={`text-xs font-black uppercase tracking-tight mt-0.5 ${
              isEmergencyRedMode ? 'text-white' : 'text-slate-900'
            }`}>
              Cloned &amp; Predatory Serials
            </h3>
          </div>
        </div>

        {/* Controls: Play/Pause and Collapse */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsPaused(prev => !prev)}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              isEmergencyRedMode 
                ? 'text-rose-200 hover:text-white hover:bg-red-800' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
            }`}
            title={isPaused ? 'Resume live roll' : 'Pause roll'}
            aria-label={isPaused ? 'Resume roll' : 'Pause roll'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              isEmergencyRedMode 
                ? 'text-rose-200 hover:text-white hover:bg-red-800' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
            }`}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-header instruction banner */}
      <div className={`px-4 py-2 border-b text-[11px] font-medium flex items-center justify-between ${
        isEmergencyRedMode ? 'bg-red-900/30 border-red-800 text-rose-200' : 'bg-rose-50/50 border-rose-100 text-rose-800'
      }`}>
        <span className="flex items-center gap-1 truncate">
          <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          Continuous Registry Roll
        </span>
        <span className="text-[10px] text-slate-400 font-mono">Hover to pause</span>
      </div>

      {/* The Rolling Marquee Container */}
      <div 
        className="flex-1 overflow-hidden relative cursor-pointer group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className={`space-y-3.5 p-3.5 animate-roll-vertical ${isPaused ? '[animation-play-state:paused]' : ''}`}
        >
          {rollingItems.map((record, index) => {
            const hijackedDomain = record.hijackedDomains[0] || 'fraudulent-host.org';
            const fakeTitle = record.hijackedTitleVariants[0] || record.officialTitle;

            return (
              <div
                key={`${record.issn}-${index}`}
                onClick={() => onSelectJournal(hijackedDomain)}
                className={`p-3.5 rounded-2xl border transition-all transform hover:-translate-y-0.5 shadow-2xs group/item ${
                  isEmergencyRedMode
                    ? 'bg-red-900/40 hover:bg-red-900/70 border-red-700/80 hover:border-red-500 text-white'
                    : 'bg-white hover:bg-rose-50/40 border-slate-200/90 hover:border-rose-300 text-slate-900'
                }`}
              >
                {/* Threat Badge & ISSN */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                    <ShieldAlert className="w-2.5 h-2.5" />
                    CLONED / HIJACKED
                  </span>
                  <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300">
                    ISSN {record.issn}
                  </span>
                </div>

                {/* Impersonating Name & Fake Domain */}
                <h4 className="text-xs font-bold leading-snug line-clamp-1 group-hover/item:text-rose-600 transition-colors">
                  {fakeTitle}
                </h4>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-rose-600 font-extrabold truncate mt-1">
                  <Globe className="w-3 h-3 shrink-0" />
                  <span className="truncate">{hijackedDomain}</span>
                </div>

                {/* Authentic Target Spoofed */}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-red-800/60 text-[11px] space-y-0.5">
                  <div className="flex items-center gap-1 text-slate-500 dark:text-rose-300">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">Spoofing: <strong className="text-slate-800 dark:text-white font-semibold">{record.officialTitle}</strong></span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-rose-300/80 line-clamp-2 leading-relaxed">
                    {record.hijackingTactics}
                  </p>
                </div>

                {/* Quick Verify CTA */}
                <div className="mt-2.5 pt-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-[10px] text-slate-400 dark:text-rose-400 font-semibold">
                    Origin: {record.officialCountry}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectJournal(hijackedDomain);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-2xs transition-all active:scale-95"
                    title={`Check forensic profile for ${hijackedDomain}`}
                  >
                    <Search className="w-3 h-3" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer info strip */}
      <div className={`p-3 border-t shrink-0 text-[11px] text-center font-medium ${
        isEmergencyRedMode ? 'border-red-800 bg-red-900/60 text-rose-200' : 'border-slate-100 bg-slate-50 text-slate-500'
      }`}>
        <p className="text-[10px] text-slate-400 leading-tight">
          Concept: <strong className="text-slate-700 dark:text-white">Dr. Rubaid Ashfaq</strong> · Co-creator: <strong className="text-slate-700 dark:text-white">Zeba Nabi</strong> · Retraction Watch Registry
        </p>
      </div>
    </aside>
  );
};
