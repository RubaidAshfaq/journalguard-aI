/**
 * Shodh Setu AI - Multi-Database Journal Finder ("Find the Right Journal")
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Allows multi-database search across:
 * - Scopus (CiteScore, SNIP, Q1-Q4)
 * - Web of Science Core Collection (SCIE, SSCI, AHCI, ESCI, JIF)
 * - ABDC Journal Quality List (A*, A, B, C)
 * - DOAJ (Open Access, Diamond OA, APC)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  LayoutGrid, 
  List, 
  Scale, 
  Sparkles, 
  Check, 
  FileText,
  Clock,
  DollarSign,
  UploadCloud
} from 'lucide-react';
import { IntelligenceJournal, ResearcherProfile } from '../../types';
import { 
  searchIntelligenceJournals, 
  getStoredIntelligenceJournals, 
  JournalSearchFilterOptions 
} from '../../services/researchIntelligenceService';
import { ScopusExcelUploadModal } from './ScopusExcelUploadModal';

interface MultiDatabaseJournalFinderProps {
  profile: ResearcherProfile;
  onOpenDossier: (journal: IntelligenceJournal) => void;
  onVerifyJournal: (query: string) => void;
  onAddToCompare: (journal: IntelligenceJournal) => void;
  compareList: IntelligenceJournal[];
}

export const MultiDatabaseJournalFinder: React.FC<MultiDatabaseJournalFinderProps> = ({
  profile,
  onOpenDossier,
  onVerifyJournal,
  onAddToCompare,
  compareList,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedIndexing, setSelectedIndexing] = useState<'all' | 'scopus' | 'wos' | 'abdc' | 'open_access'>('all');
  const [selectedQuartile, setSelectedQuartile] = useState<'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('all');
  const [selectedAbdc, setSelectedAbdc] = useState<'all' | 'A*' | 'A' | 'B' | 'C'>('all');
  const [diamondOnly, setDiamondOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [catalogVersion, setCatalogVersion] = useState<number>(0);

  useEffect(() => {
    const handleUpdate = () => setCatalogVersion(v => v + 1);
    window.addEventListener('shodhsetu_intel_journals_updated', handleUpdate);
    return () => window.removeEventListener('shodhsetu_intel_journals_updated', handleUpdate);
  }, []);

  const filterOptions: JournalSearchFilterOptions = useMemo(() => ({
    query: searchQuery,
    discipline: selectedDiscipline,
    indexing: selectedIndexing,
    quartile: selectedQuartile,
    abdcRating: selectedAbdc,
    openAccessOnly: diamondOnly,
  }), [searchQuery, selectedDiscipline, selectedIndexing, selectedQuartile, selectedAbdc, diamondOnly]);

  const results = useMemo(() => {
    let list = searchIntelligenceJournals(filterOptions);
    if (diamondOnly) {
      list = list.filter(j => j.openAccessType === 'Diamond' || !j.apcAmount || j.apcAmount.toLowerCase().includes('zero'));
    }
    return list;
  }, [filterOptions, diamondOnly]);

  const allCatalog = useMemo(() => getStoredIntelligenceJournals(), [catalogVersion]);
  const allJournalsCount = allCatalog.length;
  const scopusCount = useMemo(() => allCatalog.filter(j => j.scopusIndexed).length, [allCatalog]);
  const wosCount = useMemo(() => allCatalog.filter(j => j.wosIndexed).length, [allCatalog]);
  const abdcCount = useMemo(() => allCatalog.filter(j => j.abdcRanked || (j.abdcRating && j.abdcRating !== 'None' && j.abdcRating !== 'Unranked')).length, [allCatalog]);
  const oaCount = useMemo(() => allCatalog.filter(j => j.openAccess || j.doajIndexed || j.openAccessType === 'Diamond' || j.openAccessType === 'Gold').length, [allCatalog]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDiscipline('all');
    setSelectedIndexing('all');
    setSelectedQuartile('all');
    setSelectedAbdc('all');
    setDiamondOnly(false);
  };

  const isAlreadyInCompare = (id: string) => compareList.some(item => item.id === id);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-2 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cross-Registry Scholarly Discovery</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Find the Right Journal Across Authoritative Databases
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/80 mt-1 leading-relaxed">
            Directly cross-reference Scopus, Web of Science Core Collection, ABDC 2026 Ratings, and DOAJ Open Access standards before manuscript submission.
          </p>
        </div>
      </div>

      {/* Unified Search & Multi-Filter Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        
        {/* Quick Database Selector Bar with live counts */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Select Authoritative Scholarly Database
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-orange-600" />
              <span>Upload Scopus Excel</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedIndexing('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                selectedIndexing === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Databases ({allJournalsCount})
            </button>
            <button
              onClick={() => setSelectedIndexing('scopus')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedIndexing === 'scopus'
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100'
              }`}
            >
              <span>Elsevier Scopus</span>
              <span className="text-[10px] opacity-80 tabular-nums font-bold">({scopusCount})</span>
            </button>
            <button
              onClick={() => setSelectedIndexing('wos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedIndexing === 'wos'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <span>Web of Science Core</span>
              <span className="text-[10px] opacity-80 tabular-nums font-bold">({wosCount})</span>
            </button>
            <button
              onClick={() => setSelectedIndexing('abdc')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedIndexing === 'abdc'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
              }`}
            >
              <span>ABDC 2026 List</span>
              <span className="text-[10px] opacity-80 tabular-nums font-bold">({abdcCount})</span>
            </button>
            <button
              onClick={() => setSelectedIndexing('open_access')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedIndexing === 'open_access'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100'
              }`}
            >
              <span>DOAJ Open Access</span>
              <span className="text-[10px] opacity-80 tabular-nums font-bold">({oaCount})</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by journal title, ISSN, publisher, subject keywords, or research field..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          
          {/* Indexing Database */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Database Index</label>
            <select
              value={selectedIndexing}
              onChange={(e) => setSelectedIndexing(e.target.value as any)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1.5 px-2 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Authoritative Databases ({allJournalsCount})</option>
              <option value="scopus">Scopus Indexed ({scopusCount})</option>
              <option value="wos">Web of Science Core ({wosCount})</option>
              <option value="abdc">ABDC Listed ({abdcCount})</option>
              <option value="open_access">DOAJ / Open Access ({oaCount})</option>
            </select>
          </div>

          {/* Discipline */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Discipline</label>
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1.5 px-2 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Disciplines</option>
              <option value="Computer Science">Computer Science &amp; AI</option>
              <option value="Communication">Media &amp; Communication</option>
              <option value="Business">Business &amp; Management</option>
              <option value="Medicine">Medicine &amp; Clinical Sciences</option>
              <option value="Environmental">Environmental &amp; Ecology</option>
            </select>
          </div>

          {/* Scopus Quartile */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Scopus Quartile</label>
            <select
              value={selectedQuartile}
              onChange={(e) => setSelectedQuartile(e.target.value as any)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1.5 px-2 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Any Quartile</option>
              <option value="Q1">Q1 (Top 25%)</option>
              <option value="Q2">Q2 (25% - 50%)</option>
              <option value="Q3">Q3 (50% - 75%)</option>
              <option value="Q4">Q4</option>
            </select>
          </div>

          {/* ABDC Rating */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">ABDC Tier</label>
            <select
              value={selectedAbdc}
              onChange={(e) => setSelectedAbdc(e.target.value as any)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1.5 px-2 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Any ABDC Tier</option>
              <option value="A*">A* (Premier Excellence)</option>
              <option value="A">A (Leading Quality)</option>
              <option value="B">B (Recognized Standard)</option>
              <option value="C">C (Baseline)</option>
            </select>
          </div>

          {/* Diamond OA Toggle */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={diamondOnly}
                onChange={(e) => setDiamondOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Zero APC / Diamond</span>
            </label>
          </div>

        </div>

        {/* View Mode & Count Row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            Found <span className="font-bold text-slate-900 dark:text-white tabular-nums">{results.length}</span> verified journals matching criteria
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1 rounded text-xs transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-500'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded text-xs transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-500'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Results View */}
      {results.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No Journals Matched Current Filter Combination
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try selecting "All Databases" or clearing specific discipline/quartile constraints to see the entire catalog of {allJournalsCount} verified journals.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((j) => (
            <div 
              key={j.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-2xs flex flex-col justify-between"
            >
              <div>
                {/* Badges Strip */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  {j.scopusIndexed && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Scopus {j.scopusQuartile}
                    </span>
                  )}
                  {j.wosIndexed && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      WoS {j.wosCoreCollection}
                    </span>
                  )}
                  {j.abdcRating && j.abdcRating !== 'None' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      ABDC {j.abdcRating}
                    </span>
                  )}
                  {j.openAccessType === 'Diamond' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Diamond OA
                    </span>
                  )}
                </div>

                {/* Title & Publisher */}
                <h3 
                  onClick={() => onOpenDossier(j)}
                  className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                >
                  {j.title}
                </h3>
                
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <span>{j.publisher}</span>
                  <span>·</span>
                  <span className="font-mono">{j.issn}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                  {j.aimsAndScope}
                </p>

                {/* Metrics Summary Strip */}
                <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CiteScore</span>
                    <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                      {j.scopusCiteScore ? j.scopusCiteScore : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">WoS Impact Factor</span>
                    <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                      {j.wosImpactFactor ? j.wosImpactFactor : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">1st Decision</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ~{j.firstDecisionWeeks} wks
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onOpenDossier(j)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Full Dossier &rarr;
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onAddToCompare(j)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      isAlreadyInCompare(j.id)
                        ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                    title={isAlreadyInCompare(j.id) ? 'Added to Comparison' : 'Add to Comparison'}
                  >
                    <Scale className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onVerifyJournal(j.issn || j.title)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    Forensic Check
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Journal Title &amp; Publisher</th>
                  <th className="py-3 px-3">ISSN</th>
                  <th className="py-3 px-3">Scopus</th>
                  <th className="py-3 px-3">Web of Science</th>
                  <th className="py-3 px-3">ABDC</th>
                  <th className="py-3 px-3">Open Access</th>
                  <th className="py-3 px-3">Turnaround</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {results.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div 
                        onClick={() => onOpenDossier(j)}
                        className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate"
                      >
                        {j.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{j.publisher}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {j.issn}
                    </td>
                    <td className="py-3 px-3">
                      {j.scopusIndexed ? (
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {j.scopusQuartile} ({j.scopusCiteScore})
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {j.wosIndexed ? (
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {j.wosCoreCollection} {j.wosImpactFactor ? `(IF ${j.wosImpactFactor})` : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {j.abdcRating && j.abdcRating !== 'None' ? (
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {j.abdcRating}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={j.openAccessType === 'Diamond' ? 'font-bold text-emerald-600' : 'text-slate-600 dark:text-slate-400'}>
                        {j.openAccessType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      ~{j.firstDecisionWeeks} wks
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenDossier(j)}
                          className="px-2 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded"
                        >
                          Dossier
                        </button>
                        <button
                          onClick={() => onVerifyJournal(j.issn || j.title)}
                          className="px-2 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
                        >
                          Verify
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scopus Excel Batch Upload Modal */}
      <ScopusExcelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        existingJournals={allCatalog}
      />
    </div>
  );
};

