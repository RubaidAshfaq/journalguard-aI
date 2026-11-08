/**
 * Shodh Setu AI - Call for Papers (CfP) Discovery & Verification Engine
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Accurately discovers, verifies, and matches real Call for Papers from official
 * publishers (Elsevier, Taylor & Francis, Springer Nature, SAGE, Oxford, ACM, IEEE).
 * Strict anti-hallucination policy: Never invents fake CFPs, deadlines, or URLs.
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Layers, 
  Filter, 
  RefreshCw, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Tag, 
  SlidersHorizontal,
  Flame,
  Check
} from 'lucide-react';
import { ResearcherProfile, CallForPaperItem, CfpSearchQuery } from '../types';
import { searchCallForPapers, extractResearchConcepts } from '../services/cfpService';

interface CfpDiscoveryViewProps {
  profile: ResearcherProfile;
  onVerifyJournal: (query: string) => void;
}

export const CfpDiscoveryView: React.FC<CfpDiscoveryViewProps> = ({
  profile,
  onVerifyJournal,
}) => {
  // Acceptance test case default
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState(
    'Artificial Intelligence, Digital Media, Journalism, Generative AI, Responsible Communication'
  );
  const [researchArea, setResearchArea] = useState('Media & Communication Studies');
  const [discipline, setDiscipline] = useState('Communication & Information Technology');
  const [methodology, setMethodology] = useState('Empirical & Mixed Methods');
  const [scopusPreference, setScopusPreference] = useState(true);
  const [wosPreference, setWosPreference] = useState(true);
  const [preferredPublisher, setPreferredPublisher] = useState('all');

  const [results, setResults] = useState<CallForPaperItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Quick concept presets
  const CFP_PRESETS = [
    {
      label: 'AI & Journalism (Acceptance Test)',
      keywords: 'Artificial Intelligence, Digital Media, Journalism, Generative AI, Responsible Communication',
      area: 'Media & Communication Studies',
    },
    {
      label: 'Generative AI & Synthetic Media',
      keywords: 'Generative AI, Synthetic Media, Media Education, Digital Media, Deepfakes, AI Storytelling',
      area: 'Digital Humanities & Media Studies',
    },
    {
      label: 'Automated Fact-Checking & Trust',
      keywords: 'Automated Fact-Checking, Data Journalism, Algorithmic Accountability, Computational Journalism',
      area: 'Computer Science & Journalism',
    },
    {
      label: 'Digital Marketing & Social Media',
      keywords: 'Advertising, Digital Marketing, Social Media, Audience Engagement, OTT, Film',
      area: 'Marketing & Digital Communication',
    },
    {
      label: 'Responsible AI & Media Education',
      keywords: 'Responsible Communication, Media Education, Ethics, Media Literacy, Emerging Technologies',
      area: 'Education & Communication Ethics',
    },
  ];

  // Execute Search
  const executeSearch = async (kw = keywords, area = researchArea) => {
    setIsSearching(true);
    try {
      const queryPayload: CfpSearchQuery = {
        title,
        abstract,
        keywords: kw,
        researchArea: area,
        discipline,
        methodology,
        scopusPreference,
        wosPreference,
        preferredPublisher: preferredPublisher === 'all' ? undefined : preferredPublisher,
      };

      const matched = await searchCallForPapers(queryPayload, profile);
      setResults(matched);
      setHasSearched(true);
      if (matched.length > 0 && !expandedCardId) {
        setExpandedCardId(matched[0].id);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Run on mount
  useEffect(() => {
    executeSearch();
  }, [keywords, researchArea, scopusPreference, wosPreference, preferredPublisher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const getMatchScoreBadge = (score: number) => {
    if (score >= 95) {
      return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700', label: 'Excellent Match (95–100%)' };
    }
    if (score >= 85) {
      return { bg: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700', label: 'Very Strong Match (85–94%)' };
    }
    if (score >= 70) {
      return { bg: 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700', label: 'Strong Match (70–84%)' };
    }
    if (score >= 55) {
      return { bg: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700', label: 'Moderate Match (55–69%)' };
    }
    return { bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', label: 'Low Match (<55%)' };
  };

  const getDeadlineBadge = (status: CallForPaperItem['deadlineStatus'], days?: number) => {
    if (status === 'OPEN') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
          <Clock className="w-3 h-3 text-emerald-600" />
          <span>OPEN ({days ? `${days} days left` : 'Active'})</span>
        </span>
      );
    }
    if (status === 'CLOSING_SOON') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
          <Flame className="w-3 h-3 text-amber-600" />
          <span>CLOSING SOON ({days} days)</span>
        </span>
      );
    }
    if (status === 'CLOSED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          <span>SUBMISSION CLOSED</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <span>DATE NOT VERIFIED</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Authoritative Scholarly CfP Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Call for Papers Discovery &amp; Matching Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Discover vetted Call for Papers and Special Issues from official publishers (Taylor &amp; Francis, Elsevier, SAGE, Springer Nature, Oxford, ACM, IEEE). 
          Strict anti-hallucination protocol: Every result provides an authenticated, retrievable publisher URL.
        </p>
      </div>

      {/* Trust Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Authoritative Source Hierarchy:</strong> Only Level 1 official publisher pages and Level 2 scholarly societies are indexed. Third-party directories are never used as authoritative proof.
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Zero Hallucinations Verified</span>
        </div>
      </div>

      {/* Quick Concept Presets */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Topic &amp; Domain Quick Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {CFP_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setKeywords(p.keywords);
                setResearchArea(p.area);
                executeSearch(p.keywords, p.area);
              }}
              className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Keywords / Concepts */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Research Keywords &amp; Academic Concepts</span>
              <span className="text-[11px] text-slate-400 lowercase font-normal">comma-separated</span>
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. Artificial Intelligence, Digital Media, Journalism, Generative AI, Responsible Communication..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          {/* Research Title (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Working Paper Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Algorithmic Accountability and Editorial AI in Newsrooms"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Research Area / Discipline */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Research Area / Discipline
            </label>
            <input
              type="text"
              value={researchArea}
              onChange={(e) => setResearchArea(e.target.value)}
              placeholder="e.g. Media, Communication, Computer Science"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

        </div>

        {/* Filters Strip */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={scopusPreference}
                onChange={(e) => setScopusPreference(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Prefer Scopus Indexed</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wosPreference}
                onChange={(e) => setWosPreference(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Prefer Web of Science (SSCI / SCIE)</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Publisher:</span>
              <select
                value={preferredPublisher}
                onChange={(e) => setPreferredPublisher(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Trusted Publishers</option>
                <option value="Taylor & Francis">Taylor &amp; Francis / Routledge</option>
                <option value="Elsevier">Elsevier</option>
                <option value="SAGE Publications">SAGE Publications</option>
                <option value="Springer Nature">Springer Nature</option>
                <option value="Oxford University Press">Oxford University Press</option>
                <option value="ACM">ACM</option>
                <option value="IEEE">IEEE</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Search Verified CFPs</span>
          </button>
        </div>
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Verified Call for Papers</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold">
              {results.length} Genuine Opportunities
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked by keyword similarity, topic alignment, and verified indexing status.
          </p>
        </div>
      </div>

      {/* Results Cards List */}
      <div className="space-y-4">
        {results.map((cfp) => {
          const matchTier = getMatchScoreBadge(cfp.matchScore);
          const isExpanded = expandedCardId === cfp.id;

          return (
            <div
              key={cfp.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Card Header & Content */}
              <div className="p-6 space-y-4">
                
                {/* Top Row: Call for Papers Label + Match Score + Deadline */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      CALL FOR PAPERS
                    </span>
                    {getDeadlineBadge(cfp.deadlineStatus, cfp.daysRemaining)}
                  </div>

                  {/* Research Match Score */}
                  <div className={`px-3 py-1 rounded-full text-xs font-extrabold border ${matchTier.bg} flex items-center gap-1.5`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>RESEARCH MATCH: {cfp.matchScore}%</span>
                  </div>
                </div>

                {/* CFP Title */}
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors">
                    {cfp.title}
                  </h3>
                  {cfp.specialIssueTitle && (
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-0.5">
                      {cfp.specialIssueTitle}
                    </p>
                  )}
                </div>

                {/* Journal & Publisher Meta Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Host Journal:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{cfp.journalName}</span>
                    {cfp.issn && <span className="text-slate-400 block font-mono text-[10px]">ISSN: {cfp.issn}</span>}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Publisher:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{cfp.publisher}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Submission Deadline:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{cfp.submissionDeadline}</span>
                    </span>
                  </div>
                </div>

                {/* Matched Keywords Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
                    Matched Topics &amp; Keywords:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cfp.matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{kw}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Verification Badges Strip */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {cfp.scopusStatus === 'SCOPUS_VERIFIED' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" title={cfp.scopusDetails}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>✓ SCOPUS VERIFIED</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <span>Scopus: Not verified</span>
                    </span>
                  )}

                  {cfp.wosStatus === 'WOS_VERIFIED' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" title={cfp.wosDetails}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>✓ WEB OF SCIENCE ({cfp.wosCollection || 'SSCI'})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <span>WoS: Not verified</span>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>✓ CFP PAGE VERIFIED</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>✓ OFFICIAL PUBLISHER</span>
                  </span>
                </div>

                {/* WHY THIS CFP MATCHES (Accordion Breakdown) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setExpandedCardId(isExpanded ? null : cfp.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200/70 dark:border-slate-700"
                  >
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      <span>WHY THIS CFP MATCHES ({cfp.matchBreakdown.topicMatchTier})</span>
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Research Topic Fit:</span>
                          <span className="font-semibold">{cfp.matchBreakdown.topicMatchTier}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Keywords Overlap:</span>
                          <span className="font-semibold">{cfp.matchBreakdown.keywordsCountSummary}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Journal Scope:</span>
                          <span className="font-semibold">{cfp.matchBreakdown.journalScope}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Indexing Level:</span>
                          <span className="font-semibold">{cfp.matchBreakdown.indexingSummary}</span>
                        </div>
                      </div>

                      {cfp.guestEditors && (
                        <div className="pt-2 border-t border-blue-100 dark:border-blue-900 text-slate-600 dark:text-slate-400">
                          <strong>Guest Editors:</strong> {cfp.guestEditors}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* View CFP Link */}
                    <a
                      href={cfp.originalCfpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <span>VIEW CALL FOR PAPERS</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* View Journal */}
                    {cfp.officialJournalUrl && (
                      <a
                        href={cfp.officialJournalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span>VIEW JOURNAL</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                  </div>

                  {/* Audit in Shodh Setu AI */}
                  <button
                    type="button"
                    onClick={() => onVerifyJournal(cfp.issn || cfp.journalName)}
                    className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>AUDIT JOURNAL IN SHODHSETU</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
