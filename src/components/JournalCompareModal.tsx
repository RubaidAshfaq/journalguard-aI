/**
 * SHODH SETU AI - Journal Comparison Modal (Up to 5 journals)
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 */

import React from 'react';
import { X, SlidersHorizontal, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { SavedJournalEntry } from '../types';

interface JournalCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  journals: SavedJournalEntry[];
}

export const JournalCompareModal: React.FC<JournalCompareModalProps> = ({
  isOpen,
  onClose,
  journals,
}) => {
  if (!isOpen || journals.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-purple-200 tracking-wider">
              Cross-Journal Comparison Matrix
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold">
              Side-by-Side Journal Comparison ({journals.length} Selected)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Table */}
        <div className="p-6 overflow-x-auto max-h-[75vh]">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 px-4 text-slate-400 font-bold uppercase text-[11px] w-40 bg-slate-50 rounded-tl-xl">
                  Metric / Indicator
                </th>
                {journals.map(j => (
                  <th key={j.id} className="py-3 px-4 font-extrabold text-slate-900 bg-slate-50/50 min-w-[180px]">
                    {j.journalName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              {/* Publisher */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">Publisher</td>
                {journals.map(j => (
                  <td key={j.id} className="py-3 px-4 text-slate-800 font-medium">
                    {j.publisher}
                  </td>
                ))}
              </tr>

              {/* ISSN */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">ISSN</td>
                {journals.map(j => (
                  <td key={j.id} className="py-3 px-4 font-mono text-xs text-slate-700">
                    {j.issn}
                  </td>
                ))}
              </tr>

              {/* Authenticity Score */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">Authenticity Score</td>
                {journals.map(j => (
                  <td key={j.id} className="py-3 px-4">
                    <span className="text-base font-extrabold text-slate-900 tabular-nums">
                      {j.authenticityScore}
                    </span>
                    <span className="text-xs text-slate-400 font-medium"> / 100</span>
                  </td>
                ))}
              </tr>

              {/* Analytical Risk Score */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">Risk Tier</td>
                {journals.map(j => (
                  <td key={j.id} className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      j.riskTier === 'LOW'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : j.riskTier === 'MODERATE'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {j.riskTier} ({j.riskScore}/100)
                    </span>
                  </td>
                ))}
              </tr>

              {/* Scopus Status */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">Elsevier Scopus</td>
                {journals.map(j => (
                  <td key={j.id} className="py-3 px-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      j.scopusStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-800' :
                      j.scopusStatus === 'NOT_FOUND' ? 'bg-slate-100 text-slate-700' :
                      'bg-purple-50 text-purple-800'
                    }`}>
                      {j.scopusStatus}
                    </span>
                  </td>
                ))}
              </tr>

              {/* WoS Status */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">Clarivate WoS</td>
                {journals.map(j => (
                  <td key={j.id} className="py-3 px-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      j.wosStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-800' :
                      j.wosStatus === 'NOT_FOUND' ? 'bg-slate-100 text-slate-700' :
                      'bg-yellow-50 text-yellow-800'
                    }`}>
                      {j.wosStatus}
                    </span>
                  </td>
                ))}
              </tr>

              {/* DOAJ Status */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">DOAJ Open Access</td>
                {journals.map(j => (
                  <td key={j.id} className="py-3 px-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      j.doajStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {j.doajStatus === 'VERIFIED' ? 'Verified Open Access' : 'Not Listed'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Submission Notes */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/50">Researcher Notes</td>
                {journals.map(j => (
                  <td key={j.id} className="py-3 px-4 text-xs text-slate-600 italic">
                    {j.notes || '—'}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Matrix
          </button>
        </div>

      </div>
    </div>
  );
};
