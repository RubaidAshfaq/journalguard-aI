/**
 * SHODH SETU AI - Smart Pre-Submission Checklist
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 */

import React, { useState } from 'react';
import { 
  CheckSquare, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  RotateCcw, 
  Check, 
  Sparkles,
  Printer
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  category: string;
  critical: boolean;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'identity', label: 'Journal identity verified', description: 'Confirmed journal title matches official ISSN registry and not an altered mimic title.', category: 'Identity', critical: true },
  { id: 'issn', label: 'ISSN verified', description: 'Validated print ISSN and eISSN in the ISSN International Portal (portal.issn.org).', category: 'Identity', critical: true },
  { id: 'publisher', label: 'Publisher verified', description: 'Verified physical jurisdiction, corporate registration, and institutional imprint of publisher.', category: 'Identity', critical: true },
  { id: 'website', label: 'Official website verified', description: 'Ensured URL is the authentic publisher domain and not a hijacked commercial domain.', category: 'Web & Clone', critical: true },
  { id: 'scopus', label: 'Scopus status checked', description: 'Cross-checked title in Scopus Source list or acknowledged that publication is non-Scopus venue.', category: 'Indexing', critical: false },
  { id: 'wos', label: 'WoS status checked', description: 'Validated inclusion in Web of Science Core Collection (SCIE, SSCI, AHCI, ESCI).', category: 'Indexing', critical: false },
  { id: 'doi', label: 'DOI verified', description: 'Confirmed journal deposits active DOIs through Crossref or DataCite (resolvable via doi.org).', category: 'Digital Preservation', critical: true },
  { id: 'editorial', label: 'Editorial board checked', description: 'Inspected editorial board members; verified faculty profiles on their university websites.', category: 'Governance', critical: true },
  { id: 'peer_review', label: 'Peer-review policy checked', description: 'Confirmed rigorous peer review (single or double blind); no guarantee of immediate acceptance.', category: 'Governance', critical: true },
  { id: 'apc', label: 'APC checked', description: 'Read transparent Article Processing Charge schedule; checked for waiver eligibility or hidden fees.', category: 'Fees', critical: true },
  { id: 'predatory', label: 'Predatory-risk indicators checked', description: 'Audited for fake impact factors (UIF, GIF), spam solicitations, and consumer webmail accounts.', category: 'Integrity', critical: true },
  { id: 'clone', label: 'Clone/hijacking risk checked', description: 'Checked for mismatching domain registrars, altered titles, or hijacked dormant print serials.', category: 'Web & Clone', critical: true },
  { id: 'fit', label: 'Research fit checked', description: 'Confirmed manuscript scope, methodology, and theoretical orientation match published aims.', category: 'Author Strategy', critical: false },
  { id: 'immediate', label: 'Indexing checked immediately before submission', description: 'Re-checked indexing database on submission day (journals can be discontinued mid-year).', category: 'Indexing', critical: true },
];

export const ChecklistView: React.FC = () => {
  const [checkedIds, setCheckedIds] = useState<{ [id: string]: boolean }>({});

  const toggleCheck = (id: string) => {
    setCheckedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = () => {
    const all: { [id: string]: boolean } = {};
    CHECKLIST_ITEMS.forEach(item => { all[item.id] = true; });
    setCheckedIds(all);
  };

  const handleReset = () => {
    setCheckedIds({});
  };

  const checkedCount = Object.values(checkedIds).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPercent = Math.round((checkedCount / totalCount) * 100);

  // Compute final readiness status
  let finalStatus: 'READY FOR FURTHER CONSIDERATION' | 'NEEDS VERIFICATION' | 'HIGH RISK — DO NOT SUBMIT UNTIL VERIFIED' = 'NEEDS VERIFICATION';
  let statusBadgeColor = 'bg-amber-50 text-amber-800 border-amber-300';
  let StatusIcon = AlertTriangle;

  if (checkedCount >= 12) {
    finalStatus = 'READY FOR FURTHER CONSIDERATION';
    statusBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    StatusIcon = ShieldCheck;
  } else if (checkedCount < 6) {
    finalStatus = 'HIGH RISK — DO NOT SUBMIT UNTIL VERIFIED';
    statusBadgeColor = 'bg-rose-50 text-rose-800 border-rose-300';
    StatusIcon = ShieldAlert;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Submission Quality Gate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Smart Pre-Submission Checklist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete this 14-item verification audit before submitting your research manuscript or transferring publication fees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Check All
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
            title="Reset checklist"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Progress & Final Verdict Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Audit Completion
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {checkedCount} / {totalCount}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                ({progressPercent}%)
              </span>
            </div>
          </div>

          {/* Verdict Box */}
          <div className={`p-4 rounded-2xl border ${statusBadgeColor} flex items-center gap-3`}>
            <StatusIcon className="w-6 h-6 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                Checklist Audit Status
              </span>
              <span className="text-sm font-extrabold">
                {finalStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              progressPercent >= 80 ? 'bg-emerald-500' : progressPercent >= 50 ? 'bg-blue-600' : 'bg-rose-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {CHECKLIST_ITEMS.map((item, idx) => {
          const isChecked = Boolean(checkedIds[item.id]);

          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-4 sm:p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                isChecked ? 'bg-blue-50/20' : 'hover:bg-slate-50/70'
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-sm font-bold ${isChecked ? 'text-slate-900 line-through text-slate-400' : 'text-slate-900'}`}>
                    {idx + 1}. {item.label}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {item.category}
                  </span>
                  {item.critical && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      CRITICAL
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
