/**
 * SHODH SETU AI - Material 3 Hero & Instant Search Component
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Supports both Single Quick Query & Advanced Real-Time Domain/ISSN Inconsistency Cross-Check
 */

import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  CopyCheck, 
  Compass, 
  LayoutDashboard, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert,
  SlidersHorizontal,
  Globe,
  BookMarked
} from 'lucide-react';
import { DEMO_PRESET_JOURNALS } from '../services/demoData';
import { VerificationInputOptions, PlatformStats } from '../types';

interface HeroSectionProps {
  onVerify: (query: string | VerificationInputOptions) => void;
  onNavigateTab: (tab: string) => void;
  isLoading: boolean;
  onOpenOnlineAccess?: () => void;
  stats?: PlatformStats;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onVerify,
  onNavigateTab,
  isLoading,
  onOpenOnlineAccess,
  stats,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  
  // Advanced fields
  const [advUrl, setAdvUrl] = useState('');
  const [advIssn, setAdvIssn] = useState('');
  const [advTitle, setAdvTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdvancedMode) {
      if (advUrl.trim() || advIssn.trim() || advTitle.trim()) {
        onVerify({
          query: advUrl.trim() || advTitle.trim() || advIssn.trim(),
          claimedUrl: advUrl.trim(),
          claimedIssn: advIssn.trim(),
          claimedTitle: advTitle.trim(),
        });
      }
    } else {
      if (searchInput.trim()) {
        onVerify(searchInput.trim());
      }
    }
  };

  const handleSelectPreset = (presetInput: string) => {
    setSearchInput(presetInput);
    if (presetInput.includes('revistadecineforum.com')) {
      setAdvUrl('https://revistadecineforum.com/index.php/cf');
      setAdvIssn('0009-7039');
      setAdvTitle('Revista de Cineforum');
    } else if (presetInput.includes('cineforum.it')) {
      setAdvUrl('https://cineforum.it/');
      setAdvIssn('0009-7039');
      setAdvTitle('Cineforum');
    }
    onVerify(presetInput);
  };

  return (
    <div className="relative overflow-hidden pt-8 pb-14 lg:pt-14 lg:pb-20">
      {/* Decorative Material 3 soft ambient gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 -z-10 pointer-events-none opacity-60">
        <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute top-32 left-1/2 w-64 h-64 rounded-full bg-emerald-400/15 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Academic Direction & Online Web App Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/60 text-blue-800 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Created by <strong className="font-bold text-blue-900">Dr. Rubaid Ashfaq</strong> · Co-creator <strong className="font-bold text-blue-900">Zeba Nabi</strong></span>
          </div>

          <button
            type="button"
            onClick={onOpenOnlineAccess}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs"
            title="100% Online Web Application · Use via URL link without installation or Gmail login"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Free Online Web Tool · No Gmail Login or App Install Needed</span>
          </button>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-4">
          Before You Submit.{' '}
          <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Verify Your Journal.
          </span>
        </h1>

        {/* Supporting description */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-6 font-normal leading-relaxed">
          Check indexing, journal identity, publisher information, cloning risks, and predatory-risk indicators before submitting your research.
        </p>

        {/* Google-Themed Live Statistics Strip (Visitors & Journals Examined) */}
        {stats && (
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
            {/* Google Blue: Users Visited */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#4285F4] animate-pulse" />
              <span>👥 <strong className="font-extrabold text-blue-700 dark:text-blue-300">{stats.visitors.toLocaleString()}+</strong> Users Visited</span>
            </div>

            {/* Google Green: Journals Examined */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#34A853]" />
              <span>🔍 <strong className="font-extrabold text-emerald-700 dark:text-emerald-300">{stats.journalsExamined.toLocaleString()}+</strong> Journals Examined</span>
            </div>

            {/* Google Red: Cloned / Predatory Tracked */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
              <span>⛔ <strong className="font-extrabold text-rose-700 dark:text-rose-300">{stats.clonesTracked.toLocaleString()}+</strong> Known Clones Tracked</span>
            </div>

            {/* Google Yellow: Delisted Repository */}
            <button
              type="button"
              onClick={() => onNavigateTab('delisted')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs group"
              title="Browse & Share Delisted Journals Repository"
            >
              <span className="w-2 h-2 rounded-full bg-[#FBBC05]" />
              <span>📋 <strong className="font-extrabold text-amber-800 dark:text-amber-300">{stats.delistedRecorded.toLocaleString()}+</strong> Delisted Serials</span>
              <ArrowRight className="w-3 h-3 text-amber-700 dark:text-amber-300 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}

        {/* Mode Toggle Tab */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setIsAdvancedMode(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              !isAdvancedMode
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Quick Smart Search
          </button>
          <button
            type="button"
            onClick={() => setIsAdvancedMode(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAdvancedMode
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Dual Domain &amp; ISSN Cross-Check</span>
          </button>
        </div>

        {/* Central Search Form */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-6">
          {!isAdvancedMode ? (
            /* Single Quick Input */
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
              <div className="relative flex-1 flex items-center pl-3">
                <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Paste Journal URL, ISSN, DOI or Journal Name..."
                  className="w-full py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none text-sm sm:text-base bg-transparent font-medium"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !searchInput.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Cross-Checking...</span>
                  </>
                ) : (
                  <>
                    <span>VERIFY JOURNAL</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Advanced Dual-Field Cross-Check Form */
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-purple-200 p-4 sm:p-5 text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  Real-Time Domain &amp; ISSN Inconsistency Inspector
                </span>
                <span className="text-[11px] text-slate-500">
                  Cross-checks submitted website against canonical ISSN registry
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>Journal Website URL / Domain</span>
                  </label>
                  <input
                    type="text"
                    value={advUrl}
                    onChange={(e) => setAdvUrl(e.target.value)}
                    placeholder="e.g. https://revistadecineforum.com/index.php/cf"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <BookMarked className="w-3.5 h-3.5 text-purple-600" />
                    <span>Claimed ISSN on Website</span>
                  </label>
                  <input
                    type="text"
                    value={advIssn}
                    onChange={(e) => setAdvIssn(e.target.value)}
                    placeholder="e.g. 0009-7039"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Claimed Journal Title (Optional)
                </label>
                <input
                  type="text"
                  value={advTitle}
                  onChange={(e) => setAdvTitle(e.target.value)}
                  placeholder="e.g. Revista de Cineforum or Cineforum"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading || (!advUrl.trim() && !advIssn.trim())}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Cross-Checking Canonical Database...</span>
                    </>
                  ) : (
                    <>
                      <span>CHECK DOMAIN &amp; ISSN CONSISTENCY</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Fast Demo Archetype Selection Chips */}
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-2 mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Instant Empirical Test Cases:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {DEMO_PRESET_JOURNALS.map((preset) => {
              let badgeColor = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
              let Icon = CheckCircle2;

              if (preset.type === 'verified') {
                badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
                Icon = ShieldCheck;
              } else if (preset.type === 'cloned') {
                badgeColor = 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100';
                Icon = CopyCheck;
              } else if (preset.type === 'suspicious') {
                badgeColor = 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
                Icon = ShieldAlert;
              } else if (preset.type === 'non_indexed') {
                badgeColor = 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100';
                Icon = AlertTriangle;
              }

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.input)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${badgeColor}`}
                  title={preset.description}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{preset.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            onClick={() => onNavigateTab('finder')}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors flex items-center gap-2 border border-slate-200/80 shadow-2xs"
          >
            <Compass className="w-4 h-4 text-blue-600" />
            <span>FIND JOURNALS FOR MY RESEARCH</span>
          </button>
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors flex items-center gap-2 border border-slate-200/80 shadow-2xs"
          >
            <LayoutDashboard className="w-4 h-4 text-purple-600" />
            <span>MY RESEARCHER DASHBOARD</span>
          </button>
        </div>

        {/* One Search. Multiple Checks. Strip */}
        <div className="pt-8 border-t border-slate-200/70">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            One Search. Multiple Checks.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 max-w-4xl mx-auto">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
              <span className="text-lg mb-1">🛡</span>
              <span className="text-xs font-semibold text-slate-800">Authenticity</span>
              <span className="text-[11px] text-slate-500">7-factor model</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
              <span className="text-lg mb-1">📚</span>
              <span className="text-xs font-semibold text-slate-800">Indexing</span>
              <span className="text-[11px] text-slate-500">Crossref / DOAJ</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
              <span className="text-lg mb-1">🔎</span>
              <span className="text-xs font-semibold text-slate-800">ISSN Evidence</span>
              <span className="text-[11px] text-slate-500">Print &amp; eISSN</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
              <span className="text-lg mb-1">🌐</span>
              <span className="text-xs font-semibold text-slate-800">Website Host</span>
              <span className="text-[11px] text-slate-500">Domain matching</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
              <span className="text-lg mb-1">🧬</span>
              <span className="text-xs font-semibold text-slate-800">Clone Guard</span>
              <span className="text-[11px] text-slate-500">Hijacking detector</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center">
              <span className="text-lg mb-1">⚠</span>
              <span className="text-xs font-semibold text-slate-800">Predatory Risk</span>
              <span className="text-[11px] text-slate-500">14 warning flags</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center col-span-2 sm:col-span-1">
              <span className="text-lg mb-1">🎯</span>
              <span className="text-xs font-semibold text-slate-800">Research Fit</span>
              <span className="text-[11px] text-slate-500">Profile keywords</span>
            </div>
          </div>
        </div>

        {/* Web-First Zero-Install Showcase Card */}
        <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-left shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                100% Online Web Application
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                No Gmail Account or Login Needed
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Use Anywhere via Web Link — No Gmail Login, No App Downloads, No Passwords
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Share the direct URL link with your co-authors, academic colleagues, or students. Open access for researchers worldwide without signing in with Google or creating accounts.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
            {onOpenOnlineAccess && (
              <button
                type="button"
                onClick={onOpenOnlineAccess}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shadow-blue-500/25 w-full sm:w-auto"
              >
                <Globe className="w-4 h-4" />
                <span>Get Shareable Web Link</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
