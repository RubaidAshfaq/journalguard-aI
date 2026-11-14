/**
 * Shodh Setu AI - Top Navigation Bar (Material 3 & Google Colorful Theme inspired)
 * Academic Concept & Direction: Dr. Rubaid Ashfaq · Co-creator: Zeba Nabi
 * 
 * Features Google 4-color accent stripe, live counters (visitors & journals examined),
 * dark mode toggle on the body element, and the Delisted Repository tab.
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  Key, 
  Trash2, 
  Library, 
  BookOpen, 
  CheckSquare, 
  Search, 
  Compass, 
  Globe, 
  Share2,
  ShieldAlert,
  Moon,
  Sun,
  Users,
  Activity,
  Sparkles,
  Download
} from 'lucide-react';
import { ResearcherProfile, PlatformStats, CfpNotificationItem } from '../types';
import { CfpNotificationsDropdown } from './CfpNotificationsDropdown';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  profile: ResearcherProfile;
  stats?: PlatformStats;
  notifications?: CfpNotificationItem[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onOpenProfile: () => void;
  onOpenApiSettings: () => void;
  onOpenPrivacy: () => void;
  onOpenOnlineAccess?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  profile,
  stats,
  notifications = [],
  onMarkNotificationRead = () => {},
  onMarkAllNotificationsRead = () => {},
  onOpenProfile,
  onOpenApiSettings,
  onOpenPrivacy,
  onOpenOnlineAccess,
}) => {
  // Dark mode state: syncs with document.body and localStorage
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.body.classList.contains('dark') || 
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('shodhsetu_theme') === 'dark';
    }
    return false;
  });

  // Apply dark mode on initial load
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('shodhsetu_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('shodhsetu_theme', 'light');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Google Colorful 4-Color Brand Stripe */}
      <div className="h-1 w-full grid grid-cols-4">
        <span className="bg-[#4285F4]"></span>
        <span className="bg-[#EA4335]"></span>
        <span className="bg-[#FBBC05]"></span>
        <span className="bg-[#34A853]"></span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform relative overflow-hidden">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                {/* 4 Google color corner dots */}
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#EA4335]" />
                <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-[#34A853]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent whitespace-nowrap">
                    Shodh Setu AI
                  </span>
                  <div className="flex items-center gap-0.5" title="Google-themed colorful integrity indicator">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC05]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase whitespace-nowrap -mt-0.5">
                  Research Integrity &amp; Journal Bridge
                </span>
              </div>
            </button>
            <span className="hidden 2xl:inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              Created by Dr. Rubaid Ashfaq · Co-creator: Zeba Nabi
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'home'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              Verify Journal
            </button>
            <button
              onClick={() => setCurrentTab('intelligence')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'intelligence'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                  : 'hover:text-slate-900 hover:bg-slate-100/70 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Research Intelligence</span>
            </button>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('delisted')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'delisted'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800'
                  : 'hover:text-rose-700 hover:bg-rose-50/50 dark:hover:text-rose-300 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Delisted Repository</span>
            </button>
            <button
              onClick={() => setCurrentTab('finder')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'finder'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Find Journals
            </button>
            <button
              onClick={() => setCurrentTab('cfp')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'cfp'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800'
                  : 'hover:text-slate-900 hover:bg-slate-100/70 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Call for Papers</span>
            </button>
            <button
              onClick={() => setCurrentTab('library')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'library'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              Watchlist
            </button>
            <button
              onClick={() => setCurrentTab('papers')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'papers'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Paper Downloads
            </button>
            <button
              onClick={() => setCurrentTab('checklist')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'checklist'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Checklist
            </button>
            <button
              onClick={() => setCurrentTab('academy')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'academy'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100/70 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Academy
            </button>
          </nav>

          {/* Zone 3: Live Counters, Dark Mode Toggle & Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Live Analytics Badge: Visitors & Journals Examined */}
            {stats && (
              <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-[11px] font-mono shadow-2xs">
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold" title="Total unique researchers visited">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <Users className="w-3 h-3 text-emerald-600" />
                  <span>{stats.visitors.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 font-sans">Visitors</span>
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold" title="Total journals examined across open scholarly registries">
                  <Search className="w-3 h-3 text-blue-600" />
                  <span>{stats.journalsExamined.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 font-sans">Examined</span>
                </span>
              </div>
            )}

            {/* Call for Papers Notifications Bell */}
            <CfpNotificationsDropdown
              notifications={notifications}
              onMarkRead={onMarkNotificationRead}
              onMarkAllRead={onMarkAllNotificationsRead}
              onNavigateCfp={() => setCurrentTab('cfp')}
            />

            {/* Admin / API Integration Diagnostics Trigger */}
            <button
              type="button"
              onClick={onOpenApiSettings}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="Admin / API Status & Diagnostics (Scopus, WoS, Metrics)"
              aria-label="Admin and API diagnostics"
            >
              <Key className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </button>

            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Online Web App Button (Zero Installation & No Login Needed) */}
            <button
              onClick={onOpenOnlineAccess}
              title="Online Web App · No Gmail login or app install needed"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Online App</span>
            </button>

            {/* Researcher Profile Button (Saved Locally · No Sign-In) */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all text-xs text-slate-800 dark:text-slate-200 font-medium group cursor-pointer"
              title="Researcher Profile (Saved Locally · No Gmail Login Required)"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] uppercase shadow-sm group-hover:scale-105 transition-transform">
                {profile.fullName && profile.fullName.trim() ? profile.fullName.trim().charAt(0) : <User className="w-3 h-3" />}
              </div>
              <span className="max-w-[100px] truncate">
                {(profile.fullName && profile.fullName.trim()) || 'Profile'}
              </span>
            </button>

            {/* Delete / Reset Data Trigger */}
            <button
              onClick={onOpenPrivacy}
              title="Privacy & Delete My Data"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Privacy settings and data deletion"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
