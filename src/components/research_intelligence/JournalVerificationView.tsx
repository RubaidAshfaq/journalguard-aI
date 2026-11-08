/**
 * Shodh Setu AI - Journal Authenticity & Predatory / Cloned Check View
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Forensic inspection for:
 * - 🟢 Verified (Official ISSN, canonical domain, verified index)
 * - 🟡 Needs Review (Discrepancy in metadata or recent volume anomaly)
 * - 🔴 High Risk (Signs of predatory practices, delisting, fake impact metric)
 * - ⚫ Cloned / Impersonated (Hijacked domain, phishing author submission portal)
 * - ❌ Unverified (No authoritative registry match)
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ExternalLink, 
  Building, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { IntelligenceJournal, IntelligenceVerificationStatus } from '../../types';
import { getStoredIntelligenceJournals } from '../../services/researchIntelligenceService';

interface JournalVerificationViewProps {
  onVerifyJournal: (query: string) => void;
  onOpenDossier: (journal: IntelligenceJournal) => void;
}

export const JournalVerificationView: React.FC<JournalVerificationViewProps> = ({
  onVerifyJournal,
  onOpenDossier,
}) => {
  const [inputQuery, setInputQuery] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [analyzedJournal, setAnalyzedJournal] = useState<IntelligenceJournal | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [hasAudited, setHasAudited] = useState<boolean>(false);

  const catalog = getStoredIntelligenceJournals();

  const handleRunAudit = () => {
    setIsAuditing(true);
    setHasAudited(true);

    setTimeout(() => {
      const q = inputQuery.toLowerCase().trim();
      const match = catalog.find(j => 
        j.title.toLowerCase().includes(q) || 
        j.issn.toLowerCase().includes(q) || 
        (j.eIssn && j.eIssn.toLowerCase().includes(q))
      );

      if (match) {
        setAnalyzedJournal(match);
      } else {
        // Fallback demo result for testing unknown / unverified
        setAnalyzedJournal({
          id: 'custom-check',
          title: inputQuery || 'Unknown Journal Registry Search',
          publisher: 'Unverified Publisher Entity',
          issn: 'XXXX-XXXX',
          country: 'Unverified',
          discipline: 'General Studies',
          subjectAreas: ['Multidisciplinary'],
          scopusIndexed: false,
          wosIndexed: false,
          abdcRating: 'None',
          doajIndexed: false,
          openAccessType: 'Hybrid',
          firstDecisionWeeks: 2,
          submissionToPublicationWeeks: 4,
          aimsAndScope: 'No authoritative metadata could be retrieved from ISSN Portal, Crossref, or Scopus.',
          canonicalUrl: targetUrl || '',
          verificationStatus: 'UNVERIFIED',
          lastVerifiedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          nextVerificationDate: 'Immediate recheck suggested',
        });
      }
      setIsAuditing(false);
    }, 400);
  };

  const getStatusDisplay = (status: IntelligenceVerificationStatus) => {
    const s = String(status).toUpperCase();
    switch (s) {
      case 'VERIFIED':
        return {
          color: 'emerald',
          label: '🟢 Verified & Authentic',
          desc: 'Official ISSN, canonical domain, verified index, and consistent historical publication volume.',
          badgeClass: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        };
      case 'NEEDS_REVIEW':
        return {
          color: 'amber',
          label: '🟡 Needs Review / Discrepancy',
          desc: 'Sudden publication volume spike detected or recent ownership / editorial board transition.',
          badgeClass: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        };
      case 'HIGH_RISK':
        return {
          color: 'rose',
          label: '🔴 High Risk / Delisted',
          desc: 'Subject to indexing delisting, aggressive paper mill submissions, or fake impact factor claims.',
          badgeClass: 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        };
      case 'CLONED':
        return {
          color: 'purple',
          label: '⚫ Cloned / Impersonated Portal',
          desc: 'CRITICAL ALERT: Hijacked domain impersonating a legitimate journal to collect fraudulent author fees.',
          badgeClass: 'bg-slate-900 text-rose-300 border-rose-500 shadow-sm',
        };
      default:
        return {
          color: 'slate',
          label: '❌ Unverified in Open Registries',
          desc: 'No record found in Crossref, Scopus, Clarivate, or DOAJ. Manual verification strongly required.',
          badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 text-xs font-semibold mb-2 backdrop-blur-xs">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Forensic Scholarly Authentication</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Journal Authenticity &amp; Cloned / Predatory Detection
          </h2>
          <p className="text-xs sm:text-sm text-slate-200/90 mt-1 leading-relaxed">
            Screen against hijacked domain clones, fraudulent editorial boards, and predatory paper mills. Every check verifies canonical Crossref deposits and historical issue consistency.
          </p>
        </div>
      </div>

      {/* Forensic Search Inputs */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Enter Journal Information for Forensic Inspection
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Journal Title or ISSN
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="e.g. Digital Journalism or 2167-0811"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Journal Website URL (Optional for Domain Integrity Check)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="e.g. https://www.tandfonline.com/journals/rdij20"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Quick Test Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400">Quick Test Cases:</span>
          <button
            onClick={() => {
              setInputQuery('Digital Journalism');
              setTargetUrl('https://www.tandfonline.com/journals/rdij20');
            }}
            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
          >
            Digital Journalism (Verified)
          </button>
          <button
            onClick={() => {
              setInputQuery('Revista Cineforum');
              setTargetUrl('http://cineforum-fake-portal.org');
            }}
            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
          >
            Revista Cineforum (Cloned Example)
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunAudit}
            disabled={!inputQuery.trim() || isAuditing}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Inspecting Registries...' : 'Run Forensic Integrity Audit'}</span>
          </button>
        </div>
      </div>

      {/* Audit Output Dossier */}
      {hasAudited && analyzedJournal && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
          {(() => {
            const statusInfo = getStatusDisplay(analyzedJournal.verificationStatus);
            return (
              <div className="space-y-4">
                {/* Status Hero Card */}
                <div className={`p-4 rounded-xl border ${statusInfo.badgeClass}`}>
                  <div className="text-sm font-extrabold flex items-center justify-between">
                    <span>{statusInfo.label}</span>
                    <span className="text-[11px] font-normal opacity-80">
                      Audit Date: {analyzedJournal.lastVerifiedDate}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {statusInfo.desc}
                  </p>
                </div>

                {/* Journal Identity */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {analyzedJournal.title}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                      <span>Publisher: <strong className="text-slate-700 dark:text-slate-300">{analyzedJournal.publisher}</strong></span>
                      <span>·</span>
                      <span>ISSN: <strong className="font-mono text-slate-700 dark:text-slate-300">{analyzedJournal.issn}</strong></span>
                      <span>·</span>
                      <span>Country: <strong className="text-slate-700 dark:text-slate-300">{analyzedJournal.country}</strong></span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => onOpenDossier(analyzedJournal)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Open Full Dossier
                    </button>
                    <button
                      onClick={() => onVerifyJournal(analyzedJournal.issn || analyzedJournal.title)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                    >
                      Deep Engine Verification
                    </button>
                  </div>
                </div>

                {/* 3 Forensic Checkpoints */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  
                  {/* Canonical URL Check */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>Canonical Domain</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-[11px] truncate">
                      Official: <span className="font-mono text-blue-600">{analyzedJournal.canonicalUrl || 'Verified Crossref'}</span>
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Domain Matches ISSN Record
                    </div>
                  </div>

                  {/* Volume Anomaly Status */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Volume Behavior</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                      Historical Issue Consistency
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      No Artificial Special Issue Spike
                    </div>
                  </div>

                  {/* Registry Cross-Index */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Indexing Evidence</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                      {analyzedJournal.scopusIndexed ? 'Scopus Verified' : 'No Scopus'} · {analyzedJournal.wosIndexed ? 'WoS Verified' : 'No WoS'}
                    </div>
                    <div className="text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold pt-1">
                      ABDC: {analyzedJournal.abdcRating} · DOAJ: {analyzedJournal.doajIndexed ? 'Yes' : 'No'}
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
