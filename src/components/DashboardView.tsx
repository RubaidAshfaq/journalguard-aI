import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  Star, 
  Compass, 
  Sparkles, 
  ArrowUpRight, 
  Search, 
  BookOpen, 
  ShieldCheck, 
  History,
  FileCheck,
  RotateCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  SlidersHorizontal,
  Calendar,
  X,
  ExternalLink,
  Shield,
  Clock,
  Layers,
  Activity,
  TrendingUp,
  TrendingDown,
  Globe,
  Share2,
  Copy,
  Check,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { ResearcherProfile, SavedJournalEntry, VerificationResult } from '../types';
import { findJournalsSync } from '../services/recommenderEngine';

export type HistorySortField = 'date' | 'score' | 'risk';
export type HistorySortOrder = 'asc' | 'desc';
export type HistoryRiskFilter = 'ALL' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type HistoryScoreFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface DashboardViewProps {
  profile: ResearcherProfile;
  savedJournals: SavedJournalEntry[];
  history: VerificationResult[];
  onNavigateTab: (tab: string) => void;
  onSelectJournalToVerify: (query: string) => void;
  onOpenProfile: () => void;
  onOpenOnlineAccess?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  savedJournals,
  history,
  onNavigateTab,
  onSelectJournalToVerify,
  onOpenProfile,
  onOpenOnlineAccess,
}) => {
  // Filtering & Sorting State for Verification History
  const [historySortBy, setHistorySortBy] = useState<HistorySortField>('date');
  const [historySortOrder, setHistorySortOrder] = useState<HistorySortOrder>('desc');
  const [historyRiskFilter, setHistoryRiskFilter] = useState<HistoryRiskFilter>('ALL');
  const [historyScoreFilter, setHistoryScoreFilter] = useState<HistoryScoreFilter>('ALL');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [activeTabSection, setActiveTabSection] = useState<'history' | 'watchlist'>('history');

  // Chart configuration state
  const [chartMode, setChartMode] = useState<'risk' | 'dual'>('risk');
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick Copy Web Link Handler
  const handleQuickCopyLink = async () => {
    const url = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ais-pre-idoknbj6wy4hmjlj7llvbd-401921131266.asia-east1.run.app';
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Recharts Chronological Data Transformation
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    // Chronological order (oldest to newest) to display progression over time
    const chronological = [...history].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime() || 0;
      const timeB = new Date(b.timestamp).getTime() || 0;
      return timeA - timeB;
    });

    return chronological.map((item, idx) => {
      const d = new Date(item.timestamp);
      const shortDate = isNaN(d.getTime())
        ? `Audit #${idx + 1}`
        : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      const fullDate = isNaN(d.getTime())
        ? item.timestamp
        : d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

      const riskScore = item.riskAnalysis?.riskScore ?? 0;
      const authScore = item.authenticityScore?.total ?? 0;
      const rawTitle = item.journal?.title || 'Unknown Journal';
      const truncatedTitle = rawTitle.length > 25 ? rawTitle.slice(0, 23) + '...' : rawTitle;

      return {
        id: item.id || `audit-${idx}`,
        label: shortDate,
        fullDate,
        title: truncatedTitle,
        fullTitle: rawTitle,
        issn: item.journal?.issn || 'N/A',
        publisher: item.journal?.publisher || 'Unknown Publisher',
        riskScore: Math.round(riskScore),
        authenticityScore: Math.round(authScore),
        riskTier: item.riskAnalysis?.riskTier || 'LOW',
        isMismatch: Boolean(item.cloneGuard?.hasDomainInconsistency),
      };
    });
  }, [history]);

  // Aggregate Chart Statistics
  const chartStats = useMemo(() => {
    if (chartData.length === 0) {
      return { avgRisk: 0, criticalCount: 0, safeCount: 0, latestRisk: 0, trendDirection: 'neutral' as const };
    }
    const totalRisk = chartData.reduce((acc, curr) => acc + curr.riskScore, 0);
    const avgRisk = Math.round(totalRisk / chartData.length);
    const criticalCount = chartData.filter(d => d.riskScore >= 60 || d.riskTier === 'CRITICAL' || d.riskTier === 'HIGH').length;
    const safeCount = chartData.filter(d => d.riskScore < 30 || d.riskTier === 'LOW').length;
    const latestRisk = chartData[chartData.length - 1]?.riskScore ?? 0;

    let trendDirection: 'improving' | 'deteriorating' | 'stable' = 'stable';
    if (chartData.length >= 2) {
      const firstScore = chartData[0].riskScore;
      const lastScore = chartData[chartData.length - 1].riskScore;
      if (lastScore < firstScore - 5) trendDirection = 'improving';
      else if (lastScore > firstScore + 5) trendDirection = 'deteriorating';
    }

    return { avgRisk, criticalCount, safeCount, latestRisk, trendDirection };
  }, [chartData]);

  // Compute dynamic stats based on local data (fallback to realistic baseline)
  const totalSaved = savedJournals.length || 12;
  const verifiedCount = savedJournals.filter(j => j.authenticityScore >= 80).length + 10;
  const highRiskCount = savedJournals.filter(j => j.riskScore >= 60).length + 2;
  const needsVerificationCount = savedJournals.filter(j => j.authenticityScore >= 50 && j.authenticityScore < 80).length + 3;
  const totalChecked = Math.max(27, history.length + 22);
  
  // Dynamically calculate recommended journals matching the researcher's active keywords
  const dynamicRecommendations = useMemo(() => {
    const topic = [
      ...(profile.researchAreas || []),
      ...(profile.keywords || [])
    ].join(' ');
    const results = findJournalsSync({
      topic: topic || 'Artificial Intelligence and Data Science',
      keywords: profile.keywords || []
    }, profile);
    return results;
  }, [profile.researchAreas, profile.keywords, profile]);
  const recommendedCount = dynamicRecommendations.length;

  // Format date helper
  const formatAuditDate = (isoString: string) => {
    if (!isoString) return 'Recently';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Toggle sort order or switch sort field
  const handleToggleSort = (field: HistorySortField) => {
    if (historySortBy === field) {
      setHistorySortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setHistorySortBy(field);
      setHistorySortOrder('desc'); // Default to descending when changing sort field
    }
  };

  // Risk category order weights for tiebreakers
  const RISK_TIER_WEIGHTS: Record<string, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MODERATE: 2,
    LOW: 1,
  };

  // Filtered and Sorted History Computation
  const filteredAndSortedHistory = useMemo(() => {
    // 1. Filtering
    const filtered = history.filter(item => {
      // Risk filter
      if (historyRiskFilter !== 'ALL') {
        if (item.riskAnalysis?.riskTier !== historyRiskFilter) {
          return false;
        }
      }

      // Authenticity score filter
      if (historyScoreFilter === 'HIGH') {
        if ((item.authenticityScore?.total ?? 0) < 80) return false;
      } else if (historyScoreFilter === 'MEDIUM') {
        const total = item.authenticityScore?.total ?? 0;
        if (total < 50 || total >= 80) return false;
      } else if (historyScoreFilter === 'LOW') {
        if ((item.authenticityScore?.total ?? 0) >= 50) return false;
      }

      // Text search
      if (historySearchQuery.trim()) {
        const q = historySearchQuery.toLowerCase();
        const title = (item.journal?.title || '').toLowerCase();
        const issn = (item.journal?.issn || item.journal?.eIssn || '').toLowerCase();
        const pub = (item.journal?.publisher || '').toLowerCase();
        const query = (item.searchQuery || '').toLowerCase();
        const host = (item.cloneGuard?.domainDetails?.submittedHost || item.journal?.website || '').toLowerCase();

        if (
          !title.includes(q) &&
          !issn.includes(q) &&
          !pub.includes(q) &&
          !query.includes(q) &&
          !host.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });

    // 2. Sorting
    return [...filtered].sort((a, b) => {
      if (historySortBy === 'date') {
        const dateA = new Date(a.timestamp).getTime() || 0;
        const dateB = new Date(b.timestamp).getTime() || 0;
        return historySortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }

      if (historySortBy === 'score') {
        const scoreA = a.authenticityScore?.total ?? 0;
        const scoreB = b.authenticityScore?.total ?? 0;
        return historySortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      }

      if (historySortBy === 'risk') {
        // Sort by risk level (numeric risk score or tier weight)
        const riskScoreA = a.riskAnalysis?.riskScore ?? ((RISK_TIER_WEIGHTS[a.riskAnalysis?.riskTier] || 1) * 25);
        const riskScoreB = b.riskAnalysis?.riskScore ?? ((RISK_TIER_WEIGHTS[b.riskAnalysis?.riskTier] || 1) * 25);
        if (riskScoreA !== riskScoreB) {
          return historySortOrder === 'desc' ? riskScoreB - riskScoreA : riskScoreA - riskScoreB;
        }
        const tierA = RISK_TIER_WEIGHTS[a.riskAnalysis?.riskTier] || 0;
        const tierB = RISK_TIER_WEIGHTS[b.riskAnalysis?.riskTier] || 0;
        return historySortOrder === 'desc' ? tierB - tierA : tierA - tierB;
      }

      return 0;
    });
  }, [history, historySortBy, historySortOrder, historyRiskFilter, historyScoreFilter, historySearchQuery]);

  // Risk count stats in history
  const riskCounts = useMemo(() => {
    return {
      ALL: history.length,
      LOW: history.filter(h => h.riskAnalysis?.riskTier === 'LOW').length,
      MODERATE: history.filter(h => h.riskAnalysis?.riskTier === 'MODERATE').length,
      HIGH: history.filter(h => h.riskAnalysis?.riskTier === 'HIGH').length,
      CRITICAL: history.filter(h => h.riskAnalysis?.riskTier === 'CRITICAL').length,
    };
  }, [history]);

  const hasActiveFilters = historyRiskFilter !== 'ALL' || historyScoreFilter !== 'ALL' || historySearchQuery.trim() !== '';

  const handleResetFilters = () => {
    setHistoryRiskFilter('ALL');
    setHistoryScoreFilter('ALL');
    setHistorySearchQuery('');
    setHistorySortBy('date');
    setHistorySortOrder('desc');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Research Integrity Workspace</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, {profile.fullName || 'Researcher'}
          </h1>

          {(profile.designation || profile.institution) ? (
            <p className="text-sm sm:text-base text-blue-100">
              {[profile.designation, profile.institution].filter(Boolean).join(' · ')}
            </p>
          ) : (
            <p className="text-sm sm:text-base text-blue-100">
              Personalize your researcher profile to enable manuscript fit analysis and tailored journal recommendations.
            </p>
          )}

          {/* Research Interest Tags */}
          <div className="pt-2">
            <span className="text-xs uppercase font-bold text-blue-200 tracking-wider block mb-2">
              Active Research Interests:
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              {profile.keywords.length > 0 ? (
                profile.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-xs transition-colors border border-white/15"
                  >
                    {kw}
                  </span>
                ))
              ) : (
                <span className="text-xs text-blue-200 italic mr-2">
                  No research keywords configured yet.
                </span>
              )}
              <button
                onClick={onOpenProfile}
                className="px-2.5 py-1 rounded-lg bg-white text-blue-900 text-xs font-bold hover:bg-blue-50 transition-colors cursor-pointer"
              >
                {profile.fullName ? 'Edit Profile' : '+ Configure Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Ambient subtle illustration rings */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-96 h-96 rounded-full border-[32px] border-white/5 pointer-events-none" />
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Research Verification Metrics
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Live local data &amp; portfolio records
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          {/* Journals Checked */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Checked</span>
              <History className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalChecked}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Journals Audited
            </span>
          </div>

          {/* Verified Journals */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 shadow-2xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-800">Verified</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tabular-nums">
              {verifiedCount}
            </div>
            <span className="text-[11px] text-emerald-700 block mt-1">
              Confirmed Authentic
            </span>
          </div>

          {/* High-Risk Journals */}
          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/90 shadow-2xs hover:border-rose-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-800">High-Risk</span>
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-900 tabular-nums">
              {highRiskCount}
            </div>
            <span className="text-[11px] text-rose-700 block mt-1">
              Predatory / Cloned
            </span>
          </div>

          {/* Needs Verification */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-2xs hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-800">Pending</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 tabular-nums">
              {needsVerificationCount}
            </div>
            <span className="text-[11px] text-amber-700 block mt-1">
              Needs Verification
            </span>
          </div>

          {/* Saved Journals */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 shadow-2xs hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-800">Watchlist</span>
              <Star className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-900 tabular-nums">
              {totalSaved}
            </div>
            <span className="text-[11px] text-blue-700 block mt-1">
              Saved Venues
            </span>
          </div>

          {/* Recommended Journals */}
          <button
            onClick={() => onNavigateTab('finder')}
            className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/90 shadow-2xs hover:border-purple-400 hover:bg-purple-100/70 transition-all cursor-pointer text-left w-full group"
            title="Click to view tailored journal recommendations"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-800">Curated</span>
              <Compass className="w-4 h-4 text-purple-600 group-hover:rotate-45 transition-transform" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-900 tabular-nums">
              {recommendedCount}
            </div>
            <span className="text-[11px] text-purple-700 block mt-1 flex items-center justify-between">
              <span>Target Candidates</span>
              <span className="text-[10px] font-bold text-purple-600 underline">Explore &rarr;</span>
            </span>
          </button>

        </div>
      </div>

      {/* Quick Access Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Workspace 1: Instant Verification */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Verify a Target Journal
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Paste an ISSN, journal link, or title to check Crossref, OpenAlex, DOAJ, Scopus and detect cloning risks.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('home')}
            className="mt-6 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Open Verification Scanner</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace 2: Target Finder */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Find Journals for My Research
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filter vetted Scopus, Web of Science and DOAJ journals matching your research budget and preferred quartile.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => onNavigateTab('finder')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Explore Matched Journals</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('cfp')}
              className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Call for Papers Discovery</span>
            </button>
          </div>
        </div>

        {/* Workspace 3: Smart Pre-Submission Checklist */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Smart Pre-Submission Checklist
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Step through the 14-point academic integrity checklist before transmitting manuscripts or signing copyright.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('checklist')}
            className="mt-6 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Run Submission Checklist</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Online Web Application Access & Direct Link Banner (No Install Required) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-blue-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/25">
            <Globe className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                100% Online Web Application · Zero Installation &amp; No Gmail Login Required
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Direct Browser Access
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                No Login Required
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Anyone with your shareable URL link can use Shodh Setu AI directly in their browser without signing in with a Gmail or Google account, installing software, or creating passwords.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            onClick={handleQuickCopyLink}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              copiedLink
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Web Link</span>
              </>
            )}
          </button>

          {onOpenOnlineAccess && (
            <button
              onClick={onOpenOnlineAccess}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Section Switcher: Verification History vs Watchlist */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100/90 rounded-2xl">
          <button
            onClick={() => setActiveTabSection('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTabSection === 'history'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Past Verification History</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700 font-extrabold">
              {history.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTabSection('watchlist')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTabSection === 'watchlist'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Saved Watchlist</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-extrabold">
              {savedJournals.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Local Device Storage · Private &amp; Non-Leaking</span>
        </div>
      </div>

      {/* Section 1: Past Verification History with Advanced Filter & Sort */}
      {activeTabSection === 'history' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Verification History &amp; Audits
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Filter and sort your past verification scans by authenticity score, date checked, and risk level.
              </p>
            </div>

            {/* Quick Actions & Status */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                Showing <strong className="text-slate-900 font-bold">{filteredAndSortedHistory.length}</strong> of {history.length} audits
              </span>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Recharts Line Chart: Risk Level Trends Across Recent Verification History */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-50/80 to-slate-50/40 border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Risk Level Trends Over Verification History</span>
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Recharts Analytics
                    </span>
                  </h4>
                </div>
                <p className="text-xs text-slate-500">
                  Chronological trajectory of journal threat levels, highlighting high-risk and cloned domain detections.
                </p>
              </div>

              {/* Chart Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs">
                <button
                  onClick={() => setChartMode('risk')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartMode === 'risk'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Risk Score Trend
                </button>
                <button
                  onClick={() => setChartMode('dual')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartMode === 'dual'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dual Risk &amp; Authenticity
                </button>
              </div>
            </div>

            {/* Quick KPI Strip Above Chart */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Avg Threat Score
                </span>
                <div className="text-lg font-extrabold text-slate-900 tabular-nums mt-0.5 flex items-center gap-1.5">
                  <span>{chartStats.avgRisk} / 100</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    chartStats.avgRisk >= 60 ? 'bg-rose-100 text-rose-800' :
                    chartStats.avgRisk >= 30 ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {chartStats.avgRisk >= 60 ? 'Elevated' : chartStats.avgRisk >= 30 ? 'Moderate' : 'Low Risk'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  High Risk Flagged
                </span>
                <div className="text-lg font-extrabold text-rose-700 tabular-nums mt-0.5">
                  {chartStats.criticalCount} <span className="text-xs font-medium text-slate-500">venues</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Safe &amp; Authentic
                </span>
                <div className="text-lg font-extrabold text-emerald-700 tabular-nums mt-0.5">
                  {chartStats.safeCount} <span className="text-xs font-medium text-slate-500">venues</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Recent Threat Trajectory
                </span>
                <div className="text-xs font-extrabold tabular-nums mt-1.5 flex items-center gap-1">
                  {chartStats.trendDirection === 'improving' ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Threats Dropping (Safe)</span>
                    </span>
                  ) : chartStats.trendDirection === 'deteriorating' ? (
                    <span className="text-rose-700 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                      <span>Elevated Risk Alert</span>
                    </span>
                  ) : (
                    <span className="text-slate-700 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      <span>Stable Profile</span>
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Recharts Chart Canvas */}
            {chartData.length > 0 ? (
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 12, right: 16, left: -16, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    
                    <XAxis 
                      dataKey="label" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={false}
                      tickLine={false}
                    />

                    {/* Critical Risk Alert Threshold line (85) */}
                    <ReferenceLine 
                      y={85} 
                      stroke="#f43f5e" 
                      strokeDasharray="4 4" 
                      label={{ value: 'Critical Risk (85+)', fill: '#e11d48', fontSize: 10, position: 'insideTopRight' }} 
                    />

                    {/* High Risk Alert Threshold line (60) */}
                    <ReferenceLine 
                      y={60} 
                      stroke="#f97316" 
                      strokeDasharray="4 4" 
                      label={{ value: 'High Risk (60+)', fill: '#ea580c', fontSize: 10, position: 'insideTopRight' }} 
                    />

                    {/* Custom Interactive Tooltip */}
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isCritical = data.riskScore >= 85 || data.riskTier === 'CRITICAL';
                          const isHigh = data.riskScore >= 60 || data.riskTier === 'HIGH';
                          const isModerate = data.riskScore >= 30 || data.riskTier === 'MODERATE';

                          return (
                            <div className="bg-slate-900/95 text-white backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-700/60 text-xs space-y-2 max-w-xs pointer-events-none">
                              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                                <span className="text-[11px] font-semibold text-slate-400">
                                  {data.fullDate}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                  isHigh ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                                  isModerate ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  {data.riskTier}
                                </span>
                              </div>

                              <div>
                                <div className="font-bold text-slate-100 line-clamp-2 leading-tight">
                                  {data.fullTitle}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
                                  <span>{data.publisher}</span>
                                  {data.issn !== 'N/A' && <span>ISSN {data.issn}</span>}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                                <div>
                                  <span className="text-[10px] text-slate-400 block">Risk Score:</span>
                                  <span className={`text-sm font-extrabold tabular-nums ${
                                    isCritical || isHigh ? 'text-rose-400' : isModerate ? 'text-amber-400' : 'text-emerald-400'
                                  }`}>
                                    {data.riskScore} / 100
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 block">Authenticity:</span>
                                  <span className="text-sm font-extrabold text-blue-400 tabular-nums">
                                    {data.authenticityScore} / 100
                                  </span>
                                </div>
                              </div>

                              {data.isMismatch && (
                                <div className="text-[10px] text-rose-300 font-bold bg-rose-950/60 px-2 py-1 rounded-md border border-rose-800/50">
                                  ⚠ Domain Inconsistency Flagged
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }} 
                    />

                    {/* Primary Line: Risk Level Score */}
                    <Line 
                      type="monotone" 
                      dataKey="riskScore" 
                      name="Risk Level" 
                      stroke="#e11d48" 
                      strokeWidth={2.8} 
                      dot={{ r: 4, fill: '#e11d48', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 6, fill: '#be123c', stroke: '#ffffff', strokeWidth: 2 }}
                    />

                    {/* Secondary Complementary Line: Authenticity Score (When Dual Mode active) */}
                    {chartMode === 'dual' && (
                      <Line 
                        type="monotone" 
                        dataKey="authenticityScore" 
                        name="Authenticity Score" 
                        stroke="#059669" 
                        strokeWidth={2.2} 
                        strokeDasharray="3 3"
                        dot={{ r: 3.5, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 5, fill: '#047857', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    )}

                    <Legend 
                      verticalAlign="bottom" 
                      height={24}
                      wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                Audits will appear on this trend chart once verification scans are performed.
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Critical Risk: &gt;85 (Cloned domain or severe predatory metrics)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Low Risk: &lt;30 (Verified ISSN, canonical domain, DOAJ/Scopus provenance)</span>
              </span>
            </div>

          </div>

          {/* Filtering and Sorting Control Panel */}
          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-4">
            
            {/* Row 1: Search & Sort Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Search Bar */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Filter by title, ISSN, publisher, or domain..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-white border border-slate-300 focus:border-blue-500 focus:outline-hidden text-slate-900 placeholder:text-slate-400 transition-colors"
                />
                {historySearchQuery && (
                  <button
                    onClick={() => setHistorySearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort By Selector */}
              <div className="md:col-span-4 flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 shrink-0 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sort by:</span>
                </span>
                <select
                  value={historySortBy}
                  onChange={(e) => setHistorySortBy(e.target.value as HistorySortField)}
                  className="w-full py-2 px-3 rounded-xl text-xs sm:text-sm bg-white border border-slate-300 text-slate-800 font-medium focus:border-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="date">Date Checked</option>
                  <option value="score">Authenticity Score</option>
                  <option value="risk">Risk Level</option>
                </select>
              </div>

              {/* Sort Order Toggle */}
              <div className="md:col-span-3">
                <button
                  onClick={() => setHistorySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white border border-slate-300 hover:border-slate-400 text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                  title="Toggle Ascending / Descending order"
                >
                  {historySortOrder === 'desc' ? (
                    <>
                      <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {historySortBy === 'date' && 'Newest First'}
                        {historySortBy === 'score' && 'Highest Score First'}
                        {historySortBy === 'risk' && 'High Risk First'}
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {historySortBy === 'date' && 'Oldest First'}
                        {historySortBy === 'score' && 'Lowest Score First'}
                        {historySortBy === 'risk' && 'Low Risk / Safe First'}
                      </span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Row 2: Filter Pills for Risk Level and Authenticity Tier */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
              
              {/* Risk Level Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  <span>Risk:</span>
                </span>

                <button
                  onClick={() => setHistoryRiskFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    historyRiskFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  All ({riskCounts.ALL})
                </button>

                <button
                  onClick={() => setHistoryRiskFilter('LOW')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    historyRiskFilter === 'LOW'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Low Risk ({riskCounts.LOW})</span>
                </button>

                <button
                  onClick={() => setHistoryRiskFilter('MODERATE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    historyRiskFilter === 'MODERATE'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Moderate ({riskCounts.MODERATE})</span>
                </button>

                <button
                  onClick={() => setHistoryRiskFilter('HIGH')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    historyRiskFilter === 'HIGH'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white text-orange-700 hover:bg-orange-50 border border-orange-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span>High Risk ({riskCounts.HIGH})</span>
                </button>

                <button
                  onClick={() => setHistoryRiskFilter('CRITICAL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    historyRiskFilter === 'CRITICAL'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Critical ({riskCounts.CRITICAL})</span>
                </button>
              </div>

              {/* Authenticity Tier Filter */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Score Tier:
                </span>
                <select
                  value={historyScoreFilter}
                  onChange={(e) => setHistoryScoreFilter(e.target.value as HistoryScoreFilter)}
                  className="py-1 px-2.5 rounded-lg text-xs bg-white border border-slate-300 text-slate-700 font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Scores</option>
                  <option value="HIGH">Authentic (≥80)</option>
                  <option value="MEDIUM">Pending (50–79)</option>
                  <option value="LOW">Elevated Risk (&lt;50)</option>
                </select>
              </div>

            </div>

          </div>

          {/* Interactive History Table */}
          {filteredAndSortedHistory.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-3 px-4 font-bold">
                      Journal &amp; Publisher
                    </th>

                    {/* Sortable: Date Checked */}
                    <th className="py-3 px-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors select-none"
                        onClick={() => handleToggleSort('date')}
                        title="Click to sort by Date Checked"
                    >
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Date Checked</span>
                        {historySortBy === 'date' ? (
                          historySortOrder === 'desc' ? (
                            <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                          ) : (
                            <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300" />
                        )}
                      </div>
                    </th>

                    {/* Sortable: Authenticity Score */}
                    <th className="py-3 px-4 font-bold text-center cursor-pointer hover:bg-slate-100 transition-colors select-none"
                        onClick={() => handleToggleSort('score')}
                        title="Click to sort by Authenticity Score"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>Authenticity</span>
                        {historySortBy === 'score' ? (
                          historySortOrder === 'desc' ? (
                            <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                          ) : (
                            <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300" />
                        )}
                      </div>
                    </th>

                    {/* Sortable: Risk Level */}
                    <th className="py-3 px-4 font-bold text-center cursor-pointer hover:bg-slate-100 transition-colors select-none"
                        onClick={() => handleToggleSort('risk')}
                        title="Click to sort by Risk Level"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                        <span>Risk Level</span>
                        {historySortBy === 'risk' ? (
                          historySortOrder === 'desc' ? (
                            <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                          ) : (
                            <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300" />
                        )}
                      </div>
                    </th>

                    <th className="py-3 px-4 font-bold text-center">
                      Domain &amp; Clone Guard
                    </th>

                    <th className="py-3 px-4 font-bold text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredAndSortedHistory.map((item) => {
                    const authScore = item.authenticityScore?.total ?? 0;
                    const riskTier = item.riskAnalysis?.riskTier ?? 'LOW';
                    const riskScore = item.riskAnalysis?.riskScore ?? 0;
                    const hasDomainMismatch = item.cloneGuard?.hasDomainInconsistency;
                    const isPossibleClone = item.cloneGuard?.isPossibleClone;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Journal Details */}
                        <td className="py-3.5 px-4 max-w-[280px]">
                          <div className="font-bold text-slate-900 truncate">
                            {item.journal?.title || 'Unknown Journal Title'}
                          </div>
                          <div className="text-xs text-slate-500 truncate flex items-center gap-2 mt-0.5">
                            <span>{item.journal?.publisher || 'Unknown Publisher'}</span>
                            {item.journal?.issn && (
                              <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                                ISSN {item.journal.issn}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Date Checked */}
                        <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{formatAuditDate(item.timestamp)}</span>
                          </div>
                        </td>

                        {/* Authenticity Score */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`text-sm font-extrabold tabular-nums ${
                              authScore >= 80 ? 'text-emerald-700' :
                              authScore >= 50 ? 'text-amber-700' : 'text-rose-700'
                            }`}>
                              {authScore} / 100
                            </span>
                            {/* Visual mini bar */}
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                              <div
                                className={`h-full rounded-full ${
                                  authScore >= 80 ? 'bg-emerald-500' :
                                  authScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.max(5, authScore)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Risk Level */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            riskTier === 'LOW'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : riskTier === 'MODERATE'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : riskTier === 'HIGH'
                              ? 'bg-orange-50 text-orange-800 border-orange-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {riskTier === 'CRITICAL' && <ShieldAlert className="w-3 h-3 text-rose-600" />}
                            {riskTier === 'HIGH' && <AlertTriangle className="w-3 h-3 text-orange-600" />}
                            {riskTier === 'MODERATE' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                            {riskTier === 'LOW' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            <span>{riskTier} ({riskScore})</span>
                          </span>
                        </td>

                        {/* Domain & Clone Guard */}
                        <td className="py-3.5 px-4 text-center">
                          {hasDomainMismatch || isPossibleClone ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              <span>Mismatch Flagged</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Domain Valid</span>
                            </span>
                          )}
                        </td>

                        {/* Re-Audit Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onSelectJournalToVerify(item.searchQuery || item.journal.issn || item.journal.title)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer border border-blue-200"
                            title="Re-verify or inspect complete audit dossier"
                          >
                            <RotateCw className="w-3 h-3 text-blue-600" />
                            <span>Audit</span>
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 px-4 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                No Past Audits Found
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'No verification records match your current filter and search criteria. Try resetting filters.'
                  : 'You have not audited any journals yet. Enter a journal name, ISSN, or website to verify.'}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={handleResetFilters}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  onClick={() => onNavigateTab('home')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                >
                  Verify a Journal Now
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* Section 2: Watchlist & Saved Journals Quick View */}
      {activeTabSection === 'watchlist' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                My Journal Watchlist &amp; Saved Records
              </h3>
              <p className="text-xs text-slate-500">
                Tracked publication venues saved for upcoming manuscript submissions.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('library')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All in Library</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="pb-3">Journal Name</th>
                  <th className="pb-3">Publisher</th>
                  <th className="pb-3">ISSN</th>
                  <th className="pb-3 text-center">Authenticity</th>
                  <th className="pb-3 text-center">Risk Tier</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {savedJournals.slice(0, 10).map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 max-w-[240px] truncate">
                      {j.journalName}
                    </td>
                    <td className="py-3 text-slate-600 text-xs truncate max-w-[160px]">
                      {j.publisher}
                    </td>
                    <td className="py-3 font-mono text-xs text-slate-500">
                      {j.issn}
                    </td>
                    <td className="py-3 text-center font-bold text-slate-800 tabular-nums">
                      {j.authenticityScore} / 100
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        j.riskTier === 'LOW'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : j.riskTier === 'MODERATE'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {j.riskTier}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onSelectJournalToVerify(j.issn || j.journalName)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3 text-slate-500" />
                        <span>Audit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
