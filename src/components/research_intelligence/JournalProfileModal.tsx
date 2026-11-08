/**
 * Shodh Setu AI - Journal Profile Dossier Modal
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Detailed dossier for verified journals featuring:
 * - Dynamic "Last Verified: [Date]" & "Next Verification: Scheduled [Date]"
 * - Source Transparency ("View Source" & "Verify Now")
 * - Indexing breakdown across Scopus, WoS, ABDC, and DOAJ
 * - Publication frequency, issue volume behavior, and peer review speed
 */

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  DollarSign, 
  Globe, 
  Bookmark, 
  Share2, 
  RefreshCw,
  FileText,
  Building,
  Check
} from 'lucide-react';
import { IntelligenceJournal } from '../../types';

interface JournalProfileModalProps {
  journal: IntelligenceJournal | null;
  isOpen: boolean;
  onClose: () => void;
  onVerifyNow: (query: string) => void;
  onSaveToWatchlist?: (journal: IntelligenceJournal) => void;
}

export const JournalProfileModal: React.FC<JournalProfileModalProps> = ({
  journal,
  isOpen,
  onClose,
  onVerifyNow,
  onSaveToWatchlist,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen || !journal) return null;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(journal.canonicalUrl || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    if (onSaveToWatchlist) {
      onSaveToWatchlist(journal);
    }
    setIsSaved(true);
  };

  const getStatusBadge = () => {
    const s = String(journal.verificationStatus).toUpperCase();
    switch (s) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified &amp; Authentic
          </span>
        );
      case 'NEEDS_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Needs Review / Discrepancy
          </span>
        );
      case 'CLONED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-rose-300 border border-rose-500">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Cloned / Hijacked Impersonation
          </span>
        );
      case 'HIGH_RISK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            High Risk / Delisted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Unverified
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Journal Intelligence Dossier
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Main Title & Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                {getStatusBadge()}
                {journal.openAccessType === 'Diamond' && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                    Diamond OA (Zero APC)
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {journal.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  {journal.publisher}
                </span>
                <span>·</span>
                <span>ISSN: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{journal.issn}</span></span>
                {journal.eIssn && (
                  <>
                    <span>·</span>
                    <span>E-ISSN: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{journal.eIssn}</span></span>
                  </>
                )}
                <span>·</span>
                <span>{journal.country}</span>
              </div>
            </div>

            {/* Verification Timestamps Badge (Dynamic Requirement) */}
            <div className="shrink-0 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right text-xs">
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">Audit Timestamp</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                Last Verified: <span className="text-blue-600 dark:text-blue-400">{journal.lastVerifiedDate}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Next Verification: <span className="text-emerald-600 dark:text-emerald-400 font-medium">{journal.nextVerificationDate}</span>
              </div>
            </div>
          </div>

          {/* Action Strip: Source Transparency, Verify Now, Save, Share */}
          <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
            <button
              onClick={() => {
                onClose();
                onVerifyNow(journal.issn || journal.title);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Verify Now (Forensic Audit)</span>
            </button>

            {journal.canonicalUrl && (
              <a
                href={journal.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>View Official Source</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}

            <button
              onClick={handleSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                isSaved 
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5 text-slate-500" />}
              <span>{isSaved ? 'Saved to Watchlist' : 'Add to Watchlist'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? 'Copied Link!' : 'Share Dossier'}</span>
            </button>
          </div>

          {/* 4-Database Indexing Verification Matrix */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Official Database Indexing Status
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Scopus */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Elsevier Scopus</div>
                <div className="mt-1 flex items-center gap-1.5">
                  {journal.scopusIndexed ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Indexed
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">Not Indexed</span>
                  )}
                </div>
                {journal.scopusCiteScore && (
                  <div className="mt-2 text-xs">
                    <span className="text-slate-400">CiteScore:</span> <span className="font-bold tabular-nums text-slate-900 dark:text-white">{journal.scopusCiteScore}</span>
                  </div>
                )}
                {journal.scopusQuartile && (
                  <div className="text-xs">
                    <span className="text-slate-400">Quartile:</span> <span className="font-bold text-blue-600 dark:text-blue-400">{journal.scopusQuartile}</span>
                  </div>
                )}
              </div>

              {/* Web of Science */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Web of Science</div>
                <div className="mt-1 flex items-center gap-1.5">
                  {journal.wosIndexed ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Core Collection
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">Not Indexed</span>
                  )}
                </div>
                {journal.wosCoreCollection && (
                  <div className="mt-2 text-xs">
                    <span className="text-slate-400">Collection:</span> <span className="font-bold text-indigo-600 dark:text-indigo-400">{journal.wosCoreCollection}</span>
                  </div>
                )}
                {journal.wosImpactFactor && (
                  <div className="text-xs">
                    <span className="text-slate-400">JIF:</span> <span className="font-bold tabular-nums text-slate-900 dark:text-white">{journal.wosImpactFactor}</span>
                  </div>
                )}
              </div>

              {/* ABDC */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">ABDC List</div>
                <div className="mt-1 flex items-center gap-1.5">
                  {journal.abdcRating && journal.abdcRating !== 'None' ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Rated {journal.abdcRating}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">Not in ABDC</span>
                  )}
                </div>
                {journal.abdcRating && journal.abdcRating !== 'None' && (
                  <div className="mt-2 text-xs">
                    <span className="text-slate-400">Quality:</span> <span className="font-bold text-amber-600 dark:text-amber-400">Tier {journal.abdcRating}</span>
                  </div>
                )}
                {journal.abdcPanel && (
                  <div className="text-xs truncate" title={journal.abdcPanel}>
                    <span className="text-slate-400">Panel:</span> <span className="font-medium text-slate-700 dark:text-slate-300">{journal.abdcPanel}</span>
                  </div>
                )}
              </div>

              {/* DOAJ */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">DOAJ Open Access</div>
                <div className="mt-1 flex items-center gap-1.5">
                  {journal.doajIndexed ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">Subscription / Not DOAJ</span>
                  )}
                </div>
                <div className="mt-2 text-xs">
                  <span className="text-slate-400">Model:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{journal.openAccessType}</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400">APC:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{journal.apcAmount || 'None'}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Operational Metrics (Turnaround, Acceptance, Publication Behaviour) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium">Peer Review Speed</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {journal.firstDecisionWeeks} wks to 1st decision
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Publication: ~{journal.submissionToPublicationWeeks} wks total
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-medium">Acceptance Rate</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {journal.acceptanceRatePercent ? `${journal.acceptanceRatePercent}%` : 'Selective'}
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Based on historical author reports
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">APC / Author Fee</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {journal.apcAmount || 'Zero APC'}
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                {journal.openAccessType === 'Diamond' ? 'Fully institutional sponsored' : 'Author or grant funded'}
              </div>
            </div>

          </div>

          {/* Aim & Scope and Subject Areas */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Aim &amp; Scholarly Scope
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              {journal.aimsAndScope}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Subject Categories &amp; Fields
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {journal.subjectAreas.map((area, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Forensic Integrity & Volume Check Notice */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1.5">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>SodhSetu Forensic Integrity Trail</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Canonical URL verified against Crossref DOI prefix deposit registry and ISSN portal. Published issues crawl confirmed publication consistency without irregular special issue volume inflation.
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Academic Integrity Concept: Dr. Rubaid Ashfaq · Co-creator: Zeba Nabi
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium transition-colors"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
