/**
 * ShodhSetu - Research Intelligence & Verified Journal Discovery Module
 * Academic Concept & Direction: Dr. Rubaid Ashfaq · Co-creator: Zeba Nabi
 * 
 * Master container uniting all 10 sub-modules:
 * 1. Research Dashboard (Ecosystem stats, dynamic 12,845 baseline, filters)
 * 2. Multi-Database Journal Finder ("Find the Right Journal")
 * 3. Dedicated Scopus Database
 * 4. Dedicated Web of Science Database
 * 5. Dedicated ABDC Journal List
 * 6. AI-Based Journal Recommendation & Keyword Matcher
 * 7. Journal Authenticity & Predatory / Cloned Check
 * 8. Personalized Research Feed & Follow Alerts
 * 9. Journal Comparison Tool
 * 10. Alerts Log & Admin Control Panel
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  Search, 
  Award, 
  Sparkles, 
  ShieldAlert, 
  Rss, 
  Scale, 
  Bell, 
  Sliders, 
  BookOpen, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  ResearchIntelligenceSubTab, 
  IntelligenceJournal, 
  ResearcherProfile 
} from '../../types';
import { ResearchEcosystemDashboard } from './ResearchEcosystemDashboard';
import { MultiDatabaseJournalFinder } from './MultiDatabaseJournalFinder';
import { ScopusJournalView } from './ScopusJournalView';
import { WosJournalView } from './WosJournalView';
import { AbdcJournalView } from './AbdcJournalView';
import { AiJournalRecommendationView } from './AiJournalRecommendationView';
import { JournalVerificationView } from './JournalVerificationView';
import { PersonalizedFeedView } from './PersonalizedFeedView';
import { JournalComparisonView } from './JournalComparisonView';
import { AlertsLogView } from './AlertsLogView';
import { AdminControlPanelView } from './AdminControlPanelView';
import { JournalProfileModal } from './JournalProfileModal';

interface ResearchIntelligenceViewProps {
  profile: ResearcherProfile;
  onVerifyJournal: (query: string) => void;
  onSaveToWatchlist?: (journal: any) => void;
}

export const ResearchIntelligenceView: React.FC<ResearchIntelligenceViewProps> = ({
  profile,
  onVerifyJournal,
  onSaveToWatchlist,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ResearchIntelligenceSubTab>('dashboard');
  const [selectedJournal, setSelectedJournal] = useState<IntelligenceJournal | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [compareList, setCompareList] = useState<IntelligenceJournal[]>([]);

  const handleOpenDossier = (journal: IntelligenceJournal) => {
    setSelectedJournal(journal);
    setIsDossierOpen(true);
  };

  const handleAddToCompare = (journal: IntelligenceJournal) => {
    if (compareList.some(item => item.id === journal.id)) return;
    if (compareList.length >= 4) {
      alert('You can compare up to 4 journals simultaneously.');
      return;
    }
    setCompareList([...compareList, journal]);
    setActiveSubTab('compare');
  };

  const handleRemoveFromCompare = (id: string) => {
    setCompareList(compareList.filter(item => item.id !== id));
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  const subTabs = [
    { id: 'dashboard' as const, label: 'Ecosystem Dashboard', icon: BarChart3 },
    { id: 'finder' as const, label: 'Find Journal', icon: Search },
    { id: 'scopus' as const, label: 'Scopus DB', icon: Award },
    { id: 'wos' as const, label: 'Web of Science', icon: BookOpen },
    { id: 'abdc' as const, label: 'ABDC List', icon: Award },
    { id: 'recommend' as const, label: 'AI Recommendation', icon: Sparkles },
    { id: 'authenticity' as const, label: 'Predatory & Cloned Check', icon: ShieldAlert },
    { id: 'feed' as const, label: 'My Research Feed', icon: Rss },
    { 
      id: 'compare' as const, 
      label: `Compare (${compareList.length})`, 
      icon: Scale, 
      badge: compareList.length > 0 ? compareList.length : undefined 
    },
    { id: 'alerts' as const, label: 'Alerts', icon: Bell },
    { id: 'admin' as const, label: 'Admin & Connectors', icon: Sliders },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Primary Module Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔎</span>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Research Intelligence &amp; Verified Journal Discovery
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              "Verify Before You Submit. Publish With Confidence." · Concept &amp; Academic Direction: <span className="font-semibold text-slate-800 dark:text-slate-200">Dr. Rubaid Ashfaq</span> · Co-creator: <span className="font-semibold text-slate-800 dark:text-slate-200">Zeba Nabi</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Registry Live</span>
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500 dark:text-slate-400">Scopus · WoS · ABDC · DOAJ</span>
          </div>
        </div>

        {/* Sub-Navigation Ribbon (Single-line scrolling tabs with zero-pill discipline) */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-blue-600 font-bold' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Sub-Tab Views */}
      <div className="transition-all">
        {activeSubTab === 'dashboard' && (
          <ResearchEcosystemDashboard
            profile={profile}
            onNavigateSubTab={(tab) => setActiveSubTab(tab)}
            onVerifyJournal={onVerifyJournal}
          />
        )}

        {activeSubTab === 'finder' && (
          <MultiDatabaseJournalFinder
            profile={profile}
            onOpenDossier={handleOpenDossier}
            onVerifyJournal={onVerifyJournal}
            onAddToCompare={handleAddToCompare}
            compareList={compareList}
          />
        )}

        {activeSubTab === 'scopus' && (
          <ScopusJournalView
            onOpenDossier={handleOpenDossier}
            onVerifyJournal={onVerifyJournal}
          />
        )}

        {activeSubTab === 'wos' && (
          <WosJournalView
            onOpenDossier={handleOpenDossier}
            onVerifyJournal={onVerifyJournal}
          />
        )}

        {activeSubTab === 'abdc' && (
          <AbdcJournalView
            onOpenDossier={handleOpenDossier}
            onVerifyJournal={onVerifyJournal}
          />
        )}

        {activeSubTab === 'recommend' && (
          <AiJournalRecommendationView
            profile={profile}
            onOpenDossier={handleOpenDossier}
            onVerifyJournal={onVerifyJournal}
            onAddToCompare={handleAddToCompare}
          />
        )}

        {activeSubTab === 'authenticity' && (
          <JournalVerificationView
            onVerifyJournal={onVerifyJournal}
            onOpenDossier={handleOpenDossier}
          />
        )}

        {activeSubTab === 'feed' && (
          <PersonalizedFeedView
            profile={profile}
            onOpenDossier={handleOpenDossier}
            onVerifyJournal={onVerifyJournal}
          />
        )}

        {activeSubTab === 'compare' && (
          <JournalComparisonView
            compareList={compareList}
            onRemoveFromCompare={handleRemoveFromCompare}
            onClearCompare={handleClearCompare}
            onOpenDossier={handleOpenDossier}
            onVerifyJournal={onVerifyJournal}
            onNavigateToFinder={() => setActiveSubTab('finder')}
          />
        )}

        {activeSubTab === 'alerts' && (
          <AlertsLogView onVerifyJournal={onVerifyJournal} />
        )}

        {activeSubTab === 'admin' && (
          <AdminControlPanelView />
        )}
      </div>

      {/* Complete Journal Profile Dossier Modal */}
      <JournalProfileModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        journal={selectedJournal}
        onVerifyNow={(query) => {
          setIsDossierOpen(false);
          onVerifyJournal(query);
        }}
        onSaveToWatchlist={onSaveToWatchlist}
      />
    </div>
  );
};
