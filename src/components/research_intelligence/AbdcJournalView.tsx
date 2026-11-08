/**
 * Shodh Setu AI - Dedicated ABDC Journal Quality List View
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Authoritative ABDC (Australian Business Deans Council) ratings:
 * - Tiers: A*, A, B, C
 * - FoR Codes (Fields of Research): 1503, 1501, 1402, 0806, etc.
 * - Expert disciplinary panels review notes
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Award, 
  CheckCircle2, 
  Building, 
  BookOpen, 
  Layers,
  RefreshCw
} from 'lucide-react';
import { IntelligenceJournal, AbdcRating } from '../../types';
import { getStoredIntelligenceJournals } from '../../services/researchIntelligenceService';

interface AbdcJournalViewProps {
  onOpenDossier: (journal: IntelligenceJournal) => void;
  onVerifyJournal: (query: string) => void;
}

export const AbdcJournalView: React.FC<AbdcJournalViewProps> = ({
  onOpenDossier,
  onVerifyJournal,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedPanel, setSelectedPanel] = useState<string>('all');

  const allJournals = useMemo(() => getStoredIntelligenceJournals(), []);

  // Compute live ABDC tier counts across the catalog
  const counts = useMemo(() => {
    const abdcPool = allJournals.filter(j => {
      const r = j.abdcRating || j.abdcDetails?.rating;
      return Boolean(r && r !== 'None');
    });
    return {
      all: abdcPool.length,
      AStar: abdcPool.filter(j => (j.abdcRating || j.abdcDetails?.rating) === 'A*').length,
      A: abdcPool.filter(j => (j.abdcRating || j.abdcDetails?.rating) === 'A').length,
      B: abdcPool.filter(j => (j.abdcRating || j.abdcDetails?.rating) === 'B').length,
      C: abdcPool.filter(j => (j.abdcRating || j.abdcDetails?.rating) === 'C').length,
    };
  }, [allJournals]);

  const abdcJournals = useMemo(() => {
    return allJournals.filter(j => {
      const rating = j.abdcRating || j.abdcDetails?.rating;
      if (!rating || rating === 'None') return false;

      if (selectedRating !== 'all' && rating !== selectedRating) {
        return false;
      }

      if (selectedPanel !== 'all') {
        const panel = (j.abdcPanel || '').toLowerCase();
        const disc = (j.discipline || '').toLowerCase();
        const areas = (j.subjectAreas || []).join(' ').toLowerCase();
        const target = selectedPanel.toLowerCase();
        if (!panel.includes(target) && !disc.includes(target) && !areas.includes(target)) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const text = [j.title, j.publisher, j.issn, j.abdcPanel || '', rating, ...(j.subjectAreas || []), j.discipline || ''].join(' ').toLowerCase();
        if (!text.includes(searchQuery.toLowerCase().trim())) return false;
      }

      return true;
    });
  }, [allJournals, selectedRating, selectedPanel, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRating('all');
    setSelectedPanel('all');
  };

  return (
    <div className="space-y-6">
      {/* ABDC Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-700 via-yellow-800 to-slate-900 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 backdrop-blur-xs">
            <Award className="w-3.5 h-3.5" />
            <span>Australian Business Deans Council (ABDC)</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            ABDC Journal Quality List
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 mt-1 leading-relaxed">
            Examine verified ABDC quality tiers (A*, A, B, C) across Business, Management, Economics, Marketing, and Interdisciplinary Information Systems.
          </p>
        </div>
      </div>

      {/* ABDC Tier Legend Strip with Interactive Quick Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setSelectedRating(selectedRating === 'A*' ? 'all' : 'A*')}
          className={`p-3 rounded-xl border shadow-2xs cursor-pointer transition-all ${
            selectedRating === 'A*'
              ? 'bg-amber-100/80 dark:bg-amber-950/80 border-amber-400 ring-2 ring-amber-400/50'
              : 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-base font-extrabold text-amber-600 dark:text-amber-400">Tier A*</div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
              {counts.AStar}
            </span>
          </div>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">Premier Journals</div>
          <div className="text-[11px] text-slate-400 mt-1">Top ~5-7% of journals worldwide</div>
        </div>

        <div 
          onClick={() => setSelectedRating(selectedRating === 'A' ? 'all' : 'A')}
          className={`p-3 rounded-xl border shadow-2xs cursor-pointer transition-all ${
            selectedRating === 'A'
              ? 'bg-blue-100/80 dark:bg-blue-950/80 border-blue-400 ring-2 ring-blue-400/50'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-base font-extrabold text-blue-600 dark:text-blue-400">Tier A</div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {counts.A}
            </span>
          </div>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">High Quality</div>
          <div className="text-[11px] text-slate-400 mt-1">Next 15-25% leading field outlets</div>
        </div>

        <div 
          onClick={() => setSelectedRating(selectedRating === 'B' ? 'all' : 'B')}
          className={`p-3 rounded-xl border shadow-2xs cursor-pointer transition-all ${
            selectedRating === 'B'
              ? 'bg-indigo-100/80 dark:bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-400/50'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">Tier B</div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
              {counts.B}
            </span>
          </div>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">Solid Standard</div>
          <div className="text-[11px] text-slate-400 mt-1">Next 35-40% credible outlets</div>
        </div>

        <div 
          onClick={() => setSelectedRating(selectedRating === 'C' ? 'all' : 'C')}
          className={`p-3 rounded-xl border shadow-2xs cursor-pointer transition-all ${
            selectedRating === 'C'
              ? 'bg-slate-200 dark:bg-slate-800 border-slate-400 ring-2 ring-slate-400/50'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-base font-extrabold text-slate-600 dark:text-slate-400">Tier C</div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {counts.C}
            </span>
          </div>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">Recognized Baseline</div>
          <div className="text-[11px] text-slate-400 mt-1">Peer-reviewed regional/specialist</div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Search ABDC Titles</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Title, ISSN, panel..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">ABDC Rating</label>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1.5 px-2"
            >
              <option value="all">All ABDC Tiers ({counts.all} total)</option>
              <option value="A*">Tier A* Only ({counts.AStar})</option>
              <option value="A">Tier A Only ({counts.A})</option>
              <option value="B">Tier B Only ({counts.B})</option>
              <option value="C">Tier C Only ({counts.C})</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Panel &amp; FoR Discipline</label>
            <select
              value={selectedPanel}
              onChange={(e) => setSelectedPanel(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1.5 px-2"
            >
              <option value="all">All Disciplinary Panels</option>
              <option value="Marketing">Marketing (1505)</option>
              <option value="Management">Management (1503)</option>
              <option value="Economics">Applied Economics &amp; Finance (1402)</option>
              <option value="Information">Information Systems (0806)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ABDC Count & Status Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Showing <strong className="text-slate-800 dark:text-slate-200">{abdcJournals.length}</strong> authenticated ABDC journals</span>
        {(searchQuery || selectedRating !== 'all' || selectedPanel !== 'all') && (
          <button
            onClick={handleResetFilters}
            className="text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
          >
            Clear Active Filters
          </button>
        )}
      </div>

      {abdcJournals.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No ABDC Journals Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No journals match the chosen ABDC tier or panel keywords.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset ABDC Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {abdcJournals.map((j) => (
          <div 
            key={j.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 transition-all shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  ABDC Tier {j.abdcRating}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Panel: <span className="font-semibold text-slate-700 dark:text-slate-300">{j.abdcPanel}</span>
                </span>
              </div>

              <h3 
                onClick={() => onOpenDossier(j)}
                className="text-base font-bold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
              >
                {j.title}
              </h3>

              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {j.publisher}
                </span>
                <span>·</span>
                <span className="font-mono">ISSN: {j.issn}</span>
              </div>

              {/* ABDC Detail Box */}
              <div className="mt-3 p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Field of Research (FoR):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{j.abdcForCode || '1503 / 1505'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Review Panel:</span>
                  <span className="font-medium text-amber-700 dark:text-amber-300">{j.abdcPanel}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Cross-Indexed:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {j.scopusIndexed ? `Scopus ${j.scopusQuartile}` : ''} {j.wosIndexed ? `· WoS ${j.wosCoreCollection}` : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={() => onOpenDossier(j)}
                className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
              >
                View ABDC Dossier &rarr;
              </button>
              <button
                onClick={() => onVerifyJournal(j.issn || j.title)}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
              >
                Forensic Check
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
    </div>
  );
};

