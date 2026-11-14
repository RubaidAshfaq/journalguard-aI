/**
 * Shodh Setu AI
 * Academic Research Bridge, Journal Authenticity & Research Integrity Intelligence
 * Concept & Academic Direction: Dr. Rubaid Ashfaq
 * Tagline: Verify Before You Submit. Publish With Confidence.
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { VerificationResultView } from './components/VerificationResultView';
import { DashboardView } from './components/DashboardView';
import { LibraryView } from './components/LibraryView';
import { JournalFinderView } from './components/JournalFinderView';
import { ChecklistView } from './components/ChecklistView';
import { AcademyView } from './components/AcademyView';
import { ResearcherProfileModal } from './components/ResearcherProfileModal';
import { JournalCompareModal } from './components/JournalCompareModal';
import { ReportModal } from './components/ReportModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { PrivacyModal } from './components/PrivacyModal';
import { Footer } from './components/Footer';
import { DomainMismatchAlertBanner } from './components/DomainMismatchAlertBanner';
import { OnlineAccessModal } from './components/OnlineAccessModal';
import { EditorAlertModal } from './components/EditorAlertModal';
import { ClonedJournalsRoll } from './components/ClonedJournalsRoll';
import { DelistedRepositoryView } from './components/DelistedRepositoryView';
import { CfpDiscoveryView } from './components/CfpDiscoveryView';
import { ResearchIntelligenceView } from './components/research_intelligence/ResearchIntelligenceView';
import { ResearchPaperDownloadsView } from './components/ResearchPaperDownloadsView';
import { AlertOctagon, ShieldAlert, ArrowRight, Mail } from 'lucide-react';

import { 
  ResearcherProfile, 
  VerificationResult, 
  SavedJournalEntry,
  VerificationInputOptions,
  DomainMismatchAlert,
  DelistedJournal,
  PlatformStats,
  CfpNotificationItem
} from './types';
import { 
  getStoredProfile, 
  saveStoredProfile, 
  getSavedJournals, 
  saveSavedJournals,
  addSavedJournal,
  updateSavedJournal,
  removeSavedJournal,
  getStoredHistory,
  addHistoryResult,
  clearAllUserData,
  getPlatformStats,
  recordPlatformVisit,
  recordJournalExamined,
  getStoredDelistedJournals,
  addDelistedJournal,
  addDelistedJournalsBatch,
  getStoredCfpNotifications,
  saveCfpNotifications,
  markCfpNotificationAsRead,
  markAllCfpNotificationsAsRead
} from './services/storage';
import { generateCfpNotificationsForProfile } from './services/cfpService';
import { verifyJournal } from './services/verificationEngine';
import { triggerDomainMismatchAlert, onDomainMismatchAlert } from './services/domainComparator';
import { DEMO_RESEARCHER_DEFAULT } from './services/demoData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'intelligence' | 'dashboard' | 'finder' | 'cfp' | 'library' | 'papers' | 'checklist' | 'academy' | 'delisted'>('home');
  const [profile, setProfile] = useState<ResearcherProfile>(getStoredProfile);
  const [savedJournals, setSavedJournals] = useState<SavedJournalEntry[]>(getSavedJournals);
  const [history, setHistory] = useState<VerificationResult[]>(getStoredHistory);
  const [delistedJournals, setDelistedJournals] = useState<DelistedJournal[]>(getStoredDelistedJournals);
  const [stats, setStats] = useState<PlatformStats>(getPlatformStats);
  const [currentResult, setCurrentResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cfpNotifications, setCfpNotifications] = useState<CfpNotificationItem[]>(getStoredCfpNotifications);

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isOnlineAccessOpen, setIsOnlineAccessOpen] = useState(false);
  const [isEditorAlertOpen, setIsEditorAlertOpen] = useState(false);
  const [compareList, setCompareList] = useState<SavedJournalEntry[]>([]);

  // Automatically check for new verified Call for Papers matching researcher profile interests
  useEffect(() => {
    if (profile) {
      const stored = getStoredCfpNotifications();
      const updated = generateCfpNotificationsForProfile(profile, stored);
      setCfpNotifications(updated);
      saveCfpNotifications(updated);
    }
  }, [profile]);

  const handleMarkNotificationRead = (id: string) => {
    const updated = markCfpNotificationAsRead(id);
    setCfpNotifications(updated);
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = markAllCfpNotificationsAsRead();
    setCfpNotifications(updated);
  };

  // Real-time Domain Mismatch UI Alert state
  const [activeDomainAlert, setActiveDomainAlert] = useState<DomainMismatchAlert | null>(null);

  // Record platform visit on initial mount & update live stats
  useEffect(() => {
    recordPlatformVisit();
    setStats(getPlatformStats());
  }, []);

  // Subscribe to real-time domain alert notifications
  useEffect(() => {
    const unsubscribe = onDomainMismatchAlert((alert) => {
      setActiveDomainAlert(alert);
    });
    return unsubscribe;
  }, []);

  // Verification Search Handler
  const handleVerify = async (query: string | VerificationInputOptions) => {
    setIsVerifying(true);
    setCurrentTab('home');
    setActiveDomainAlert(null); // Clear previous alert on new verification

    try {
      const res = await verifyJournal(query, profile);
      setCurrentResult(res);
      addHistoryResult(res);
      setHistory(getStoredHistory());

      // Increment live platform journals examined counter
      recordJournalExamined();
      setStats(getPlatformStats());

      // Upon verification, check and trigger UI alert if hostname of provided journal URL does not match canonical domain
      triggerDomainMismatchAlert(res, (alertData) => {
        setActiveDomainAlert(alertData);
      });
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Re-verify current journal
  const handleRecheckCurrent = () => {
    if (currentResult) {
      handleVerify(currentResult.searchQuery || currentResult.journal.issn || currentResult.journal.title);
    }
  };

  // Save journal to Watchlist
  const handleSaveToWatchlist = (res: VerificationResult) => {
    const newSaved = addSavedJournal({
      journalName: res.journal.title,
      publisher: res.journal.publisher,
      issn: res.journal.issn,
      scopusStatus: res.sources.scopus.status,
      wosStatus: res.sources.wos.status,
      doajStatus: res.sources.doaj.status,
      authenticityScore: res.authenticityScore.total,
      riskScore: res.riskAnalysis.riskScore,
      riskTier: res.riskAnalysis.riskTier,
      lastChecked: new Date().toISOString().split('T')[0],
      status: 'Saved',
      notes: `Audited on ${new Date().toLocaleDateString()}. Recommendation: ${res.recommendation.status}`,
      tags: ['Verified', 'Watchlist'],
      isWatched: true,
    });
    setSavedJournals(getSavedJournals());
  };

  // Add new Delisted Journal to repository
  const handleAddDelisted = (item: DelistedJournal) => {
    addDelistedJournal(item);
    setDelistedJournals(getStoredDelistedJournals());
    setStats(getPlatformStats());
  };

  // Add multiple Delisted Journals in batch (e.g. from Excel / CSV upload)
  const handleAddBatchDelisted = (items: DelistedJournal[]) => {
    addDelistedJournalsBatch(items);
    setDelistedJournals(getStoredDelistedJournals());
    setStats(getPlatformStats());
  };

  // Profile Save
  const handleSaveProfile = (updated: ResearcherProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  // Library Updates
  const handleUpdateLibraryEntry = (id: string, updates: Partial<SavedJournalEntry>) => {
    updateSavedJournal(id, updates);
    setSavedJournals(getSavedJournals());
  };

  const handleRemoveLibraryEntry = (id: string) => {
    removeSavedJournal(id);
    setSavedJournals(getSavedJournals());
  };

  // Open Compare Modal
  const handleOpenCompare = (selected: SavedJournalEntry[]) => {
    setCompareList(selected);
    setIsCompareModalOpen(true);
  };

  // Privacy: Delete My Data
  const handleDeleteMyData = () => {
    clearAllUserData();
    setProfile(DEMO_RESEARCHER_DEFAULT);
    setSavedJournals(getSavedJournals());
    setHistory([]);
    setCurrentResult(null);
  };

  const isCurrentSaved = currentResult ? savedJournals.some(j => j.issn === currentResult.journal.issn || j.journalName === currentResult.journal.title) : false;

  // Emergency Red Mode Detection:
  // "red means don't go for publish whole backgraougd tuens red when journal looks like cloned or predatory"
  const isPredatoryOrClone = Boolean(
    currentResult && (
      currentResult.cloneGuard.isPossibleClone ||
      currentResult.cloneGuard.hasDomainInconsistency ||
      currentResult.cloneGuard.hasIssnMismatch ||
      currentResult.riskAnalysis.riskTier === 'CRITICAL' ||
      currentResult.riskAnalysis.riskTier === 'HIGH'
    )
  );

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-700 ${
        isPredatoryOrClone
          ? 'bg-gradient-to-b from-[#5c0a0a] via-[#7f1d1d] to-[#450a0a] text-white selection:bg-rose-500 selection:text-white'
          : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900'
      }`}
    >
      
      {/* Top Navbar with Google theme stripe, counters & dark mode */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab as any);
          if (tab !== 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        profile={profile}
        stats={stats}
        notifications={cfpNotifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenOnlineAccess={() => setIsOnlineAccessOpen(true)}
      />

      {/* Emergency Red Alert Bar: Flashing Warning When Cloned or Predatory Serial is Identified */}
      {isPredatoryOrClone && (
        <aside 
          role="alert"
          aria-label="Critical warning"
          className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 sm:px-6 py-3.5 shadow-xl border-b-2 border-red-400 sticky top-16 z-30 flex flex-col md:flex-row items-center justify-between gap-3 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 shrink-0">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black tracking-wide uppercase flex items-center gap-1.5">
                <span>⛔ RED ALERT: DO NOT PUBLISH HERE!</span>
                <span className="bg-white text-red-700 px-2 py-0.5 rounded-md text-[10px] font-extrabold">CLONED / PREDATORY DETECTED</span>
              </p>
              <p className="text-xs text-red-100 font-medium">
                The examined publication shows severe identity hijacking, domain impersonation, or predatory APC solicitation. Do not submit manuscripts or pay any fees.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsEditorAlertOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white text-red-700 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Warn Real Editor</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('verification-result');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-1.5 rounded-xl bg-red-900/80 hover:bg-red-900 text-white text-xs font-semibold border border-red-400/50 transition-colors cursor-pointer"
            >
              View Audit Breakdown
            </button>
          </div>
        </aside>
      )}

      {/* Main Container with Left-Side Rolling Cloned Journals Feed + Main Views */}
      <div className="flex-1 flex w-full min-h-0">
        
        {/* Left Side: Continuous Rolling Marquee Feed of Cloned & Predatory Journals */}
        <ClonedJournalsRoll
          onSelectJournal={(query) => handleVerify(query)}
          isEmergencyRedMode={isPredatoryOrClone}
        />

        {/* Right Side: Main Content Area */}
        <main className="flex-1 min-w-0 transition-colors duration-500">
          {currentTab === 'home' && (
            <div className="space-y-4">
              <HeroSection
                onVerify={handleVerify}
                onNavigateTab={(tab) => setCurrentTab(tab as any)}
                isLoading={isVerifying}
                onOpenOnlineAccess={() => setIsOnlineAccessOpen(true)}
                stats={stats}
              />

              {/* Results Panel */}
              {currentResult && (
                <div id="verification-result">
                  <VerificationResultView
                    result={currentResult}
                    profile={profile}
                    onSaveToWatchlist={handleSaveToWatchlist}
                    onOpenReport={() => setIsReportModalOpen(true)}
                    onOpenChecklist={() => setCurrentTab('checklist')}
                    onRecheck={handleRecheckCurrent}
                    isSaved={isCurrentSaved}
                  />
                </div>
              )}
            </div>
          )}

          {currentTab === 'intelligence' && (
            <ResearchIntelligenceView
              profile={profile}
              onVerifyJournal={(q) => handleVerify(q)}
              onSaveToWatchlist={handleSaveToWatchlist}
            />
          )}

          {currentTab === 'delisted' && (
            <DelistedRepositoryView
              journals={delistedJournals}
              onAddJournal={handleAddDelisted}
              onAddBatchJournals={handleAddBatchDelisted}
              onVerifyJournal={(q) => handleVerify(q)}
              profile={profile}
            />
          )}

          {currentTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              savedJournals={savedJournals}
              history={history}
              onNavigateTab={(tab) => setCurrentTab(tab as any)}
              onSelectJournalToVerify={(q) => handleVerify(q)}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              onOpenOnlineAccess={() => setIsOnlineAccessOpen(true)}
            />
          )}

          {currentTab === 'finder' && (
            <JournalFinderView
              profile={profile}
              onVerifyJournal={(q) => handleVerify(q)}
              onNavigateCfp={() => setCurrentTab('cfp')}
            />
          )}

          {currentTab === 'cfp' && (
            <CfpDiscoveryView
              profile={profile}
              onVerifyJournal={(q) => handleVerify(q)}
            />
          )}

          {currentTab === 'library' && (
            <LibraryView
              entries={savedJournals}
              onUpdateEntry={handleUpdateLibraryEntry}
              onRemoveEntry={handleRemoveLibraryEntry}
              onRecheckJournal={(q) => handleVerify(q)}
              onOpenCompare={handleOpenCompare}
            />
          )}

          {currentTab === 'papers' && (
            <ResearchPaperDownloadsView />
          )}

          {currentTab === 'checklist' && (
            <ChecklistView />
          )}

          {currentTab === 'academy' && (
            <AcademyView />
          )}

          {/* Real-Time Domain Mismatch UI Alert Banner (Rendered at the bottom / last of content) */}
          {activeDomainAlert && (
            <div className="pt-2 pb-6">
              <DomainMismatchAlertBanner
                alert={activeDomainAlert}
                onDismiss={() => setActiveDomainAlert(null)}
                onOpenEditorAlert={() => setIsEditorAlertOpen(true)}
                onScrollToDetails={() => {
                  setCurrentTab('home');
                  setTimeout(() => {
                    const el = document.getElementById('verification-result');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* Academic Footer */}
      <Footer
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onNavigateTab={(tab) => setCurrentTab(tab as any)}
      />

      {/* Researcher Profile Modal */}
      <ResearcherProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* API / Institutional Mode Settings Modal */}
      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
      />

      {/* Compare Modal */}
      <JournalCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        journals={compareList}
      />

      {/* Formal Audit Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        result={currentResult}
        profile={profile}
      />

      {/* Privacy / Delete My Data Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onConfirmDelete={handleDeleteMyData}
      />

      {/* Online Web App / Zero-Install Share Modal */}
      <OnlineAccessModal
        isOpen={isOnlineAccessOpen}
        onClose={() => setIsOnlineAccessOpen(false)}
      />

      {/* Real Journal Editors Urgent Forensic Alert Modal */}
      <EditorAlertModal
        isOpen={isEditorAlertOpen}
        onClose={() => setIsEditorAlertOpen(false)}
        result={currentResult}
        profile={profile}
      />

    </div>
  );
}
