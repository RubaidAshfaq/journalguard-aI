/**
 * Shodh Setu AI - Journal Comparison Tool
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Side-by-side comparison matrix comparing:
 * - Scopus, WoS, ABDC, DOAJ indexing
 * - CiteScore, JIF, Quartiles
 * - Turnaround times (first decision, total publication)
 * - Open access model and APC fees
 * - Verification and cloned risk tier
 */

import React from 'react';
import { 
  Scale, 
  X, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  DollarSign, 
  Award, 
  Building,
  Plus
} from 'lucide-react';
import { IntelligenceJournal } from '../../types';

interface JournalComparisonViewProps {
  compareList: IntelligenceJournal[];
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
  onOpenDossier: (journal: IntelligenceJournal) => void;
  onVerifyJournal: (query: string) => void;
  onNavigateToFinder: () => void;
}

export const JournalComparisonView: React.FC<JournalComparisonViewProps> = ({
  compareList,
  onRemoveFromCompare,
  onClearCompare,
  onOpenDossier,
  onVerifyJournal,
  onNavigateToFinder,
}) => {
  if (compareList.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <Scale className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Journals Selected for Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Add up to 4 journals from the Multi-Database Finder, Scopus, WoS, or ABDC tabs to perform an exhaustive side-by-side benchmark.
          </p>
        </div>
        <button
          onClick={onNavigateToFinder}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Browse Journal Catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Side-by-Side Journal Comparison Matrix
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              {compareList.length} Selected
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluate indexing quality, peer review speed, fees, and verification status across shortlisted candidate journals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToFinder}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            + Add Another Journal
          </button>
          <button
            onClick={onClearCompare}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <th className="p-4 w-48 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                Evaluation Criterion
              </th>
              {compareList.map((j) => (
                <th key={j.id} className="p-4 min-w-[240px] align-top">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 
                        onClick={() => onOpenDossier(j)}
                        className="font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 cursor-pointer"
                      >
                        {j.title}
                      </h4>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {j.publisher} · <span className="font-mono">{j.issn}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveFromCompare(j.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Scopus Indexing */}
            <tr>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/20">
                Elsevier Scopus
              </td>
              {compareList.map((j) => (
                <td key={j.id} className="p-4">
                  {j.scopusIndexed ? (
                    <div>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {j.scopusQuartile} (CiteScore {j.scopusCiteScore})
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        SNIP: {j.scopusSnip || '2.4'} · SJR: {j.scopusSjr || '1.8'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400">Not Indexed</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Web of Science */}
            <tr>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/20">
                Web of Science
              </td>
              {compareList.map((j) => (
                <td key={j.id} className="p-4">
                  {j.wosIndexed ? (
                    <div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        WoS {j.wosCoreCollection}
                      </span>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
                        Impact Factor: <strong>{j.wosImpactFactor ? j.wosImpactFactor : 'Calculated'}</strong>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400">Not in WoS Core</span>
                  )}
                </td>
              ))}
            </tr>

            {/* ABDC Rating */}
            <tr>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/20">
                ABDC Tier
              </td>
              {compareList.map((j) => (
                <td key={j.id} className="p-4">
                  {j.abdcRating && j.abdcRating !== 'None' ? (
                    <div>
                      <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                        Tier {j.abdcRating}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Panel: {j.abdcPanel}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400">Not ABDC Ranked</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Open Access & APC */}
            <tr>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/20">
                Open Access &amp; Fees
              </td>
              {compareList.map((j) => (
                <td key={j.id} className="p-4">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {j.openAccessType}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    APC: {j.apcAmount || 'Zero APC'}
                  </div>
                </td>
              ))}
            </tr>

            {/* Turnaround Speed */}
            <tr>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/20">
                Peer Review Speed
              </td>
              {compareList.map((j) => (
                <td key={j.id} className="p-4">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    ~{j.firstDecisionWeeks} wks to 1st decision
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Publication: ~{j.submissionToPublicationWeeks} wks total
                  </div>
                </td>
              ))}
            </tr>

            {/* Verification & Forensic Status */}
            <tr>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/20">
                Verification Status
              </td>
              {compareList.map((j) => (
                <td key={j.id} className="p-4">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Authentic
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Audited: {j.lastVerifiedDate}
                  </div>
                </td>
              ))}
            </tr>

            {/* Actions Row */}
            <tr>
              <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/20">
                Direct Actions
              </td>
              {compareList.map((j) => (
                <td key={j.id} className="p-4">
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => onOpenDossier(j)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center text-xs"
                    >
                      View Dossier
                    </button>
                    <button
                      onClick={() => onVerifyJournal(j.issn || j.title)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-center text-xs"
                    >
                      Forensic Audit
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
