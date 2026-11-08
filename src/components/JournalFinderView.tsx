/**
 * Shodh Setu AI - Find Journals For My Research
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Accurately searches and suggests verified academic venues matching
 * researcher keywords, research areas, and indexing constraints across disciplines.
 * Strict academic integrity: Never invents fake quartiles or metrics.
 */

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  Filter, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  RotateCw, 
  ShieldCheck, 
  Layers,
  ArrowRight,
  Tag,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { ResearcherProfile } from '../types';
import { 
  findJournalsForResearch, 
  JournalSearchFilter, 
  MatchedJournalResult 
} from '../services/recommenderEngine';

interface JournalFinderViewProps {
  profile: ResearcherProfile;
  onVerifyJournal: (query: string) => void;
  onNavigateCfp?: () => void;
}

export const JournalFinderView: React.FC<JournalFinderViewProps> = ({
  profile,
  onVerifyJournal,
  onNavigateCfp,
}) => {
  const getInitialTopic = () => {
    if (profile?.researchAreas && profile.researchAreas.length > 0) {
      return profile.researchAreas.join(', ');
    }
    return 'Artificial Intelligence, Animal Ecology, Environmental Science';
  };

  const getInitialKeywords = () => {
    if (profile?.keywords && profile.keywords.length > 0) {
      return profile.keywords.join(', ');
    }
    return 'Machine Learning, Ecology, Health, Economics';
  };

  const [topic, setTopic] = useState<string>(getInitialTopic());
  const [keywords, setKeywords] = useState<string>(getInitialKeywords());
  const [researchMethod, setResearchMethod] = useState('Mixed Methods / Empirical Quantitative');
  const [desiredIndex, setDesiredIndex] = useState<JournalSearchFilter['desiredIndex']>('all');
  const [preferredQuartile, setPreferredQuartile] = useState<JournalSearchFilter['preferredQuartile']>('all');
  const [budgetTier, setBudgetTier] = useState<JournalSearchFilter['budgetTier']>('all');
  
  const [results, setResults] = useState<MatchedJournalResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Sync with profile whenever profile updates
  useEffect(() => {
    if (profile) {
      if (profile.keywords && profile.keywords.length > 0) {
        setKeywords(profile.keywords.join(', '));
      }
      if (profile.researchAreas && profile.researchAreas.length > 0) {
        setTopic(profile.researchAreas.join(', '));
      }
    }
  }, [profile]);

  const executeSearch = async (
    searchTopic = topic, 
    searchKeywords = keywords, 
    index = desiredIndex, 
    quartile = preferredQuartile, 
    budget = budgetTier
  ) => {
    setIsSearching(true);
    try {
      const matched = await findJournalsForResearch({
        topic: searchTopic,
        keywords: searchKeywords,
        researchMethod,
        desiredIndex: index,
        preferredQuartile: quartile,
        budgetTier: budget,
      }, profile);
      setResults(matched);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Run search on mount or when keywords/topic change
  useEffect(() => {
    executeSearch(topic, keywords, desiredIndex, preferredQuartile, budgetTier);
  }, [topic, keywords, desiredIndex, preferredQuartile, budgetTier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  // Add or toggle a keyword
  const handleToggleKeyword = (kw: string) => {
    const currentList = keywords.split(',').map(s => s.trim()).filter(Boolean);
    const exists = currentList.some(k => k.toLowerCase() === kw.toLowerCase());
    let updated: string[];
    if (exists) {
      updated = currentList.filter(k => k.toLowerCase() !== kw.toLowerCase());
    } else {
      updated = [...currentList, kw];
    }
    const newKeywordsStr = updated.join(', ');
    setKeywords(newKeywordsStr);
    executeSearch(topic, newKeywordsStr);
  };

  // Preset Topics
  const DOMAIN_PRESETS = [
    { label: 'Animal Ecology & Environment', keywords: 'Animal Ecology, Environmental Science, Biodiversity, Conservation' },
    { label: 'Artificial Intelligence & ML', keywords: 'Machine Learning, Artificial Intelligence, Neural Networks, Deep Learning' },
    { label: 'Medicine & Public Health', keywords: 'Medicine, Public Health, Clinical Trials, Epidemiology' },
    { label: 'Economics & Finance', keywords: 'Economics, Finance, Econometrics, Banking, Capital Markets' },
    { label: 'Education & Pedagogy', keywords: 'Education, Educational Technology, Higher Education, Pedagogy' },
    { label: 'Media & Communication', keywords: 'Digital Media, Communication, Social Media, Journalism' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Indexing Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Find &amp; Suggest Journals for My Research
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            Enter keywords or research areas to discover verified academic venues matching your manuscript scope, quartile targets, and publication budget.
          </p>
        </div>

        {onNavigateCfp && (
          <button
            type="button"
            onClick={onNavigateCfp}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shrink-0 transition-all cursor-pointer shadow-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore Call for Papers &rarr;</span>
          </button>
        )}
      </div>

      {/* Active Profile Sync Banner */}
      {profile && (profile.keywords?.length > 0 || profile.researchAreas?.length > 0) && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Keywords from Your Profile ({profile.fullName || 'Active Profile'}):</span>
            </span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {[...(profile.researchAreas || []), ...(profile.keywords || [])].map((kw, idx) => {
                const isSelected = keywords.toLowerCase().includes(kw.toLowerCase());
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleKeyword(kw)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                    }`}
                  >
                    <span>{kw}</span>
                    <span className="text-[10px] opacity-75">{isSelected ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const profKeywords = profile.keywords?.join(', ') || '';
              const profTopics = profile.researchAreas?.join(', ') || '';
              setKeywords(profKeywords);
              setTopic(profTopics);
              executeSearch(profTopics, profKeywords);
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset to Profile</span>
          </button>
        </div>
      )}

      {/* Domain Quick Presets */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Quick Domain Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {DOMAIN_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTopic(preset.label);
                setKeywords(preset.keywords);
                executeSearch(preset.label, preset.keywords);
              }}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 hover:text-purple-700 dark:hover:text-purple-300 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Criteria Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Field 1: Topic */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Research Topic / Field</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Animal Environment, AI, Public Health..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Field 2: Keywords */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Keywords (Comma-separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. Ecology, Machine Learning, Vaccines..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Field 3: Research Method */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Research Method
            </label>
            <input
              type="text"
              value={researchMethod}
              onChange={(e) => setResearchMethod(e.target.value)}
              placeholder="e.g. Empirical Quantitative, Systematic Review..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

        </div>

        {/* 3 Dropdown constraints */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          {/* Desired Index */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Desired Indexing Database
            </label>
            <select
              value={desiredIndex}
              onChange={(e) => setDesiredIndex(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
            >
              <option value="all">All Available Indices</option>
              <option value="scopus">Scopus Indexed Only</option>
              <option value="wos">Web of Science (WoS) Indexed Only</option>
              <option value="doaj">DOAJ Certified Open Access</option>
              <option value="open_access">Open Access (Any)</option>
            </select>
          </div>

          {/* Preferred Quartile */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Preferred Quartile Target
            </label>
            <select
              value={preferredQuartile}
              onChange={(e) => setPreferredQuartile(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
            >
              <option value="all">No Preference / All Quartiles</option>
              <option value="Q1">Q1 (Top 25% Quartile)</option>
              <option value="Q2">Q2 (Upper Middle Quartile)</option>
              <option value="Q3">Q3 (Lower Middle Quartile)</option>
              <option value="Q4">Q4 (Bottom Quartile)</option>
            </select>
          </div>

          {/* Budget Tier */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              APC Publication Budget
            </label>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
            >
              <option value="all">No Limit / Any Budget</option>
              <option value="no_apc">No APC (Diamond Open Access / Toll Free)</option>
              <option value="under_25k">Under ₹25,000</option>
              <option value="25k_75k">₹25,000 – ₹75,000</option>
              <option value="above_75k">₹75,000+</option>
            </select>
          </div>

        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {results.length} verified candidate journals found
          </span>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            {isSearching ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Searching Curated Registries...</span>
              </>
            ) : (
              <>
                <span>MATCH TARGET JOURNALS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Suggested Journals Based on Keywords ({results.length} Candidate Venues)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Ranked by Dynamic Researcher Fit Score
          </span>
        </div>

        {results.length === 0 && hasSearched ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold">No verified journals match the exact filter criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try broadening your quartile or budget filter to see candidate venues.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {results.map((j, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Journal Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 text-xs font-bold border border-purple-200 dark:border-purple-800">
                      {j.researchFit}% RESEARCH FIT
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {j.quartile}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      j.riskTier === 'LOW' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      Risk: {j.riskTier}
                    </span>

                    {j.matchedKeywordsList && j.matchedKeywordsList.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                        ✓ Matched: {j.matchedKeywordsList.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {j.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{j.publisher}</span>
                    <span>·</span>
                    <span className="font-mono">ISSN: {j.issn}</span>
                    <span>·</span>
                    <span>APC: <strong>{j.apc}</strong></span>
                    <span>·</span>
                    <span>Scopus: <strong>{j.scopusStatus}</strong></span>
                    <span>·</span>
                    <span>WoS: <strong>{j.wosStatus}</strong></span>
                  </div>

                  {/* Subject Match Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {j.subjectMatch.map((sm, smIdx) => (
                      <span 
                        key={smIdx} 
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          keywords.toLowerCase().includes(sm.toLowerCase())
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex sm:flex-col items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
                  <button
                    onClick={() => onVerifyJournal(j.issn || j.name)}
                    className="w-full px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Audit in Shodh Setu AI</span>
                  </button>

                  <a
                    href={j.officialWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
