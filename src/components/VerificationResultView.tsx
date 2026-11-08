/**
 * SHODH SETU AI - Complete Journal Verification Result Screen
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Features explicit Real-Time Canonical Cross-Check for ISSN Mismatches & Domain Inconsistencies.
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink, 
  Star, 
  FileText, 
  RotateCw, 
  Globe, 
  Building2, 
  BookMarked, 
  Sparkles,
  Info,
  Check,
  X,
  FileCheck,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  Network,
  Mail,
  BarChart3
} from 'lucide-react';
import { VerificationResult, ResearcherProfile } from '../types';
import { EditorAlertModal } from './EditorAlertModal';
import { JournalBehaviourMonitor } from './JournalBehaviourMonitor';

interface VerificationResultViewProps {
  result: VerificationResult;
  profile: ResearcherProfile;
  onSaveToWatchlist: (result: VerificationResult) => void;
  onOpenReport: (result: VerificationResult) => void;
  onOpenChecklist: () => void;
  onRecheck: () => void;
  isSaved: boolean;
}

export const VerificationResultView: React.FC<VerificationResultViewProps> = ({
  result,
  profile,
  onSaveToWatchlist,
  onOpenReport,
  onOpenChecklist,
  onRecheck,
  isSaved,
}) => {
  const [showAllIndicators, setShowAllIndicators] = useState(false);
  const [isSavedLocal, setIsSavedLocal] = useState(isSaved);
  const [isEditorAlertOpen, setIsEditorAlertOpen] = useState(false);

  const { journal, authenticityScore, riskAnalysis, cloneGuard, researchFit, sources } = result;

  // Flag if journal is confirmed or highly suspected predatory / cloned
  const isPredatoryOrClone = 
    cloneGuard.hasDomainInconsistency || 
    cloneGuard.hasIssnMismatch || 
    cloneGuard.isPossibleClone || 
    riskAnalysis.riskTier === 'CRITICAL' || 
    riskAnalysis.riskTier === 'HIGH';

  // Trigger celebration confetti for verified low-risk journals
  useEffect(() => {
    if (authenticityScore.total >= 85 && riskAnalysis.riskTier === 'LOW') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#16a34a', '#9333ea', '#38bdf8'],
        });
      } catch (e) {
        // Reduced motion or test env
      }
    }
  }, [result.id, authenticityScore.total, riskAnalysis.riskTier]);

  const handleSave = () => {
    onSaveToWatchlist(result);
    setIsSavedLocal(true);
  };

  // Color code status helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'FOUND':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'NOT_FOUND':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'NOT_VERIFIED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'UNAVAILABLE':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'HIGH_RISK':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Risk Tier color styles
  const getRiskColor = (tier: string) => {
    switch (tier) {
      case 'LOW':
        return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' };
      case 'MODERATE':
        return { text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500' };
      case 'ELEVATED':
        return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' };
      case 'HIGH':
      case 'CRITICAL':
        return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500' };
      default:
        return { text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-500' };
    }
  };

  const riskStyle = getRiskColor(riskAnalysis.riskTier);

  // Circular score stroke calculation
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (authenticityScore.total / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20 space-y-6">
      
      {/* Synthetic Demo Watermark if synthetic */}
      {journal.isSyntheticDemo && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-semibold">DEMO / SYNTHETIC DATA RECORD</span>
            <span className="text-amber-800">
              — This profile is an illustrative academic case study. It does not defame or fabricate accusations against real titles.
            </span>
          </div>
        </div>
      )}

      {/* Top Main Result Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                JOURNAL VERIFICATION RESULT
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">
                Audited: {new Date(result.timestamp).toLocaleDateString()}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {journal.title}
            </h2>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Building2 className="w-4 h-4 text-slate-400" />
                {journal.publisher}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 font-mono">
                <BookMarked className="w-4 h-4 text-slate-400" />
                ISSN: {journal.issn}
              </span>
              {journal.website && (
                <>
                  <span className="text-slate-300">·</span>
                  <a
                    href={journal.website.startsWith('http') ? journal.website : `https://${journal.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Visit Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                isSavedLocal
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <Star className={`w-4 h-4 ${isSavedLocal ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
              <span>{isSavedLocal ? 'Saved in Watchlist' : 'Save to Watchlist'}</span>
            </button>

            <button
              onClick={() => onOpenReport(result)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Audit Report</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('journal-behaviour-monitor') || document.getElementById('publication-behaviour-monitor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title="Jump to Journal Publication Behaviour & Volume Anomaly Monitor"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Publication Behaviour</span>
            </button>

            {isPredatoryOrClone && (
              <button
                onClick={() => setIsEditorAlertOpen(true)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Send official forensic alert warning to the authentic journal editors"
              >
                <Mail className="w-4 h-4" />
                <span>Mail Real Editors</span>
              </button>
            )}

            <button
              onClick={onRecheck}
              title="Re-run verification against live sources"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Core Metric Displays: Authenticity, Risk Score, Research Fit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-center">
          
          {/* Metric 1: Authenticity Score with Circular Gauge */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 110 110">
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  className="stroke-slate-200"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  className={authenticityScore.total >= 80 ? 'stroke-emerald-500' : authenticityScore.total >= 50 ? 'stroke-blue-500' : 'stroke-rose-500'}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900 tabular-nums">
                  {authenticityScore.total}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">/ 100</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Authenticity Score
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {authenticityScore.total >= 85
                  ? 'Highly Authentic'
                  : authenticityScore.total >= 60
                  ? 'Moderate Evidence'
                  : 'Low Provenance'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated across 7 weighted integrity factors
              </p>
            </div>
          </div>

          {/* Metric 2: Analytical Risk Tier */}
          <div className={`p-5 rounded-2xl border ${riskStyle.bg} ${riskStyle.border} flex flex-col justify-between h-full`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Shodh Setu AI Risk Score
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${riskStyle.dot}`} />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-3xl font-extrabold tabular-nums ${riskStyle.text}`}>
                  {riskAnalysis.riskTier}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({riskAnalysis.riskScore}/100)
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {riskAnalysis.flaggedCount === 0
                ? 'Zero predatory red flags identified'
                : `${riskAnalysis.flaggedCount} risk indicators require researcher caution`}
            </p>
          </div>

          {/* Metric 3: Research Fit Score */}
          <div className="p-5 rounded-2xl bg-purple-50/80 border border-purple-200/80 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  Researcher Fit
                </span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-purple-900 tabular-nums">
                  {researchFit.total}%
                </span>
                <span className="text-xs text-purple-700 font-semibold">
                  {researchFit.tier}
                </span>
              </div>
            </div>
            <p className="text-xs text-purple-800 mt-2 truncate">
              Matches portfolio: {profile.fullName}
            </p>
          </div>

        </div>

      </div>

      {/* DEDICATED CANONICAL CROSS-CHECK & CONSISTENCY INSPECTOR */}
      <div className={`p-6 rounded-3xl border-2 shadow-sm space-y-5 transition-all ${
        cloneGuard.hasDomainInconsistency || cloneGuard.hasIssnMismatch || cloneGuard.isPossibleClone
          ? 'bg-rose-50/90 border-rose-300'
          : 'bg-emerald-50/60 border-emerald-300'
      }`}>
        
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl text-white shrink-0 ${
              cloneGuard.hasDomainInconsistency || cloneGuard.hasIssnMismatch || cloneGuard.isPossibleClone
                ? 'bg-rose-600'
                : 'bg-emerald-600'
            }`}>
              {cloneGuard.hasDomainInconsistency || cloneGuard.hasIssnMismatch || cloneGuard.isPossibleClone ? (
                <AlertOctagon className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Real-Time Canonical Cross-Check
              </span>
              <h3 className={`text-lg sm:text-xl font-black ${
                cloneGuard.hasDomainInconsistency || cloneGuard.hasIssnMismatch || cloneGuard.isPossibleClone
                  ? 'text-rose-950'
                  : 'text-emerald-950'
              }`}>
                {cloneGuard.hasDomainInconsistency || cloneGuard.hasIssnMismatch || cloneGuard.isPossibleClone
                  ? 'CRITICAL INCONSISTENCY & CLONING ALERT'
                  : 'CANONICAL DOMAIN & ISSN INTEGRITY VERIFIED'}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Domain Inconsistency Status Badge */}
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              cloneGuard.hasDomainInconsistency
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              {cloneGuard.hasDomainInconsistency ? '🔴 DOMAIN INCONSISTENCY' : '🟢 DOMAIN MATCH'}
            </span>

            {/* ISSN Mismatch Status Badge */}
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              cloneGuard.hasIssnMismatch
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              {cloneGuard.hasIssnMismatch ? '🔴 ISSN HIJACKED / MISMATCH' : '🟢 ISSN REGISTERED'}
            </span>
          </div>
        </div>

        {/* Warning Message Summary */}
        <p className={`text-xs sm:text-sm font-medium leading-relaxed ${
          cloneGuard.hasDomainInconsistency || cloneGuard.hasIssnMismatch || cloneGuard.isPossibleClone
            ? 'text-rose-900'
            : 'text-emerald-900'
        }`}>
          {cloneGuard.warningMessage || 'All submitted identifiers correlate precisely with canonical entries in the ISSN International Portal, Crossref, and OpenAlex.'}
        </p>

        {/* Diagnostic Dual Cards: Domain Check & ISSN Ownership Check */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Card A: Authoritative Domain Comparison & Consistency Diagnosis */}
          <div className={`p-4 rounded-2xl bg-white border shadow-2xs space-y-2.5 ${
            cloneGuard.hasDomainInconsistency
              ? 'border-rose-200'
              : 'border-slate-200/90'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Domain &amp; Host Comparison</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase ${
                cloneGuard.domainComparison?.matchType === 'CONFIRMED_HIJACKED_DOMAIN'
                  ? 'bg-rose-600 text-white'
                  : cloneGuard.domainComparison?.matchType === 'SUSPICIOUS_LOOKALIKE'
                  ? 'bg-rose-500 text-white'
                  : cloneGuard.hasDomainInconsistency
                  ? 'bg-rose-100 text-rose-800'
                  : cloneGuard.domainComparison?.matchType === 'AUTHORIZED_PUBLISHER_PLATFORM'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {cloneGuard.domainComparison?.matchType === 'CONFIRMED_HIJACKED_DOMAIN'
                  ? 'HIJACKED CLONE'
                  : cloneGuard.domainComparison?.matchType === 'SUSPICIOUS_LOOKALIKE'
                  ? 'LOOKALIKE SPOOF'
                  : cloneGuard.hasDomainInconsistency
                  ? 'MISMATCH FLAGGED'
                  : cloneGuard.domainComparison?.matchType === 'AUTHORIZED_PUBLISHER_PLATFORM'
                  ? 'PUBLISHER PLATFORM'
                  : 'PASSED'}
              </span>
            </div>
            
            <p className="text-slate-600 leading-relaxed">
              {cloneGuard.domainComparison?.mismatchExplanation || cloneGuard.domainDetails?.details || 'Submitted host matches verified publisher infrastructure.'}
            </p>

            {cloneGuard.domainComparison?.recommendation && cloneGuard.hasDomainInconsistency && (
              <div className="p-2 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 font-semibold text-[11px]">
                ⚠️ {cloneGuard.domainComparison.recommendation}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 font-mono text-[11px] space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Submitted Host:</span>
                <span className={`font-bold ${cloneGuard.hasDomainInconsistency ? 'text-rose-700' : 'text-slate-900'}`}>
                  {cloneGuard.domainDetails?.submittedHost || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Expected Registry Host:</span>
                <span className="text-emerald-700 font-bold truncate max-w-[200px]">
                  {cloneGuard.domainDetails?.canonicalHost || 'Authoritative Publisher Record'}
                </span>
              </div>
              {cloneGuard.domainComparison?.expectedPublisher && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Expected Publisher:</span>
                  <span className="text-slate-700 font-semibold truncate max-w-[200px]">
                    {cloneGuard.domainComparison.expectedPublisher}
                  </span>
                </div>
              )}
              {cloneGuard.domainComparison?.technicalDetails && (
                <div className="flex flex-wrap gap-1 pt-1.5 text-[10px] font-sans">
                  {cloneGuard.domainComparison.technicalDetails.isTldMismatch && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                      TLD Mismatch Detected
                    </span>
                  )}
                  {cloneGuard.domainComparison.technicalDetails.hasOjsArtifacts && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">
                      OJS Path Detected
                    </span>
                  )}
                  {cloneGuard.domainComparison.technicalDetails.isLookalikeStem && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-medium">
                      Lexical Brand Spoofing
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card B: ISSN Ownership Diagnosis */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <BookMarked className="w-4 h-4 text-purple-600" />
                <span>ISSN Legal Ownership Check</span>
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                cloneGuard.hasIssnMismatch
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {cloneGuard.hasIssnMismatch ? 'HIJACKED' : 'CORRELATED'}
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              {cloneGuard.issnDetails?.details || 'ISSN confirmed to belong to this academic title.'}
            </p>

            <div className="pt-2 border-t border-slate-100 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Legal Title for ISSN:</span>
                <span className="text-slate-900 font-bold truncate max-w-[200px]">{cloneGuard.issnDetails?.canonicalTitle || journal.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Legal Publisher:</span>
                <span className="text-emerald-700 font-bold truncate max-w-[200px]">{cloneGuard.issnDetails?.canonicalPublisher || journal.publisher}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Side-by-Side Canonical Mismatch Matrix Table */}
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                <th className="pb-2.5">Metadata Field</th>
                <th className="pb-2.5">Input / Submitted Record</th>
                <th className="pb-2.5">Canonical Database Entry</th>
                <th className="pb-2.5 text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cloneGuard.mismatches.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 font-bold text-slate-800">{m.label}</td>
                  <td className="py-2.5 text-slate-600 font-mono text-xs max-w-[200px] truncate">{m.submittedValue}</td>
                  <td className="py-2.5 text-slate-900 font-bold font-mono text-xs max-w-[220px] truncate">{m.verifiedValue}</td>
                  <td className="py-2.5 text-right">
                    {m.matched ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> MATCH
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-extrabold">
                        <X className="w-3.5 h-3.5 text-rose-600" /> MISMATCH
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verified Official Domain Redirect Box if Clone or Mismatch Detected */}
        {cloneGuard.legitimateRecord && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 block text-sm">
                CANONICAL OFFICIAL JOURNAL DESTINATION:
              </span>
              <p className="text-slate-600">
                Official Title: <strong className="text-slate-900">{cloneGuard.legitimateRecord.officialTitle}</strong> · 
                Publisher: <strong className="text-slate-900">{cloneGuard.legitimateRecord.officialPublisher}</strong> ({cloneGuard.legitimateRecord.officialCountry})
              </p>
              <span className="font-mono text-slate-500 block truncate">
                {cloneGuard.legitimateRecord.officialWebsite}
              </span>
            </div>
            <a
              href={cloneGuard.legitimateRecord.officialWebsite?.startsWith('http') ? cloneGuard.legitimateRecord.officialWebsite : `https://${cloneGuard.legitimateRecord.officialWebsite}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold inline-flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
            >
              <span>Visit Authentic Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Real Editors Urgent Notification Banner for Cloned / Predatory Cases */}
        {isPredatoryOrClone && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-2 border-rose-300 text-xs shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                  ACTION RECOMMENDED
                </span>
                <span className="font-extrabold text-rose-950 text-sm">
                  Alert Authentic Editorial Office &amp; Publisher
                </span>
              </div>
              <p className="text-rose-800 leading-relaxed font-medium">
                The authentic journal's title and ISSN are being exploited by counterfeit / predatory actors.
                Dispatch a formal forensic alert with verified metadata evidence to assist in legal DMCA takedowns and indexing alerts.
              </p>
            </div>
            <button
              onClick={() => setIsEditorAlertOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold inline-flex items-center gap-2 shrink-0 shadow-xs transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Mail Real Editors</span>
            </button>
          </div>
        )}

      </div>

      {/* Colourful Source Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Scholarly Source Verification Cards
          </h3>
          <span className="text-xs text-slate-500">
            Open Registries &amp; Authorized APIs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: ISSN Portal */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">🟢 ISSN Register</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(sources.issn.status)}`}>
                {sources.issn.statusLabel}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {sources.issn.details}
            </p>
          </div>

          {/* Card 2: Crossref */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">🔵 Crossref Metadata</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(sources.crossref.status)}`}>
                {sources.crossref.statusLabel}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {sources.crossref.details}
            </p>
          </div>

          {/* Card 3: DOAJ */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">🟢 DOAJ Open Access</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(sources.doaj.status)}`}>
                {sources.doaj.statusLabel}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {sources.doaj.details}
            </p>
          </div>

          {/* Card 4: OpenAlex */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">🟣 OpenAlex Graph</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(sources.openalex.status)}`}>
                {sources.openalex.statusLabel}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {sources.openalex.details}
            </p>
          </div>

          {/* Card 5: Scopus */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">🔵 Elsevier Scopus</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(sources.scopus.status)}`}>
                {sources.scopus.statusLabel}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {sources.scopus.details}
            </p>
          </div>

          {/* Card 6: Web of Science */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">🟡 Web of Science</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(sources.wos.status)}`}>
                {sources.wos.statusLabel}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {sources.wos.details}
            </p>
          </div>

        </div>
      </div>

      {/* Critical Guidance Notice: Do Not Confuse "Not Verified" with "Predatory" */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70 text-blue-900 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">INTEGRITY PRINCIPLE: Do not confuse &quot;Not Verified&quot; with &quot;Predatory&quot;</span>
          <p className="text-blue-800 leading-relaxed">
            Never automatically classify a journal as predatory simply because it is not found in Scopus or Web of Science. Many legitimate emergent, regional, and Diamond Open Access journals operate ethical peer review without commercial indexing. High-risk status requires multiple independent deception indicators.
          </p>
        </div>
      </div>

      {/* NEW FEATURE: Journal Publication Behaviour / Volume Anomaly Monitor */}
      <JournalBehaviourMonitor currentResult={result} result={result} />

      {/* Section: DOES THIS JOURNAL SUIT YOUR RESEARCH? */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              DOES THIS JOURNAL SUIT YOUR RESEARCH?
            </h3>
            <p className="text-xs text-slate-500">
              Contextual fit against researcher profile: <strong className="text-slate-800">{profile.fullName}</strong>
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-bold text-xs">
            {researchFit.total}% · {researchFit.tier}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {researchFit.explanation}
        </p>

        {/* Matching Keywords Chips */}
        {researchFit.matchingKeywords.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Direct Topic &amp; Keyword Overlaps:
            </span>
            <div className="flex flex-wrap gap-2">
              {researchFit.matchingKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 5-Factor Fit Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-50">
            <span className="text-[11px] text-slate-500 block">Subject Fit</span>
            <span className="font-bold text-slate-800">{researchFit.subjectFit} / 35</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <span className="text-[11px] text-slate-500 block">Scope Match</span>
            <span className="font-bold text-slate-800">{researchFit.scopeMatch} / 25</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <span className="text-[11px] text-slate-500 block">Indexing Match</span>
            <span className="font-bold text-slate-800">{researchFit.indexingMatch} / 15</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <span className="text-[11px] text-slate-500 block">Pub Type</span>
            <span className="font-bold text-slate-800">{researchFit.publicationType} / 10</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-500 block">Keywords</span>
            <span className="font-bold text-slate-800">{researchFit.keywordScore} / 15</span>
          </div>
        </div>
      </div>

      {/* Section: Authenticity 7-Factor Weighted Breakdown */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Journal Authenticity Score Breakdown (100-Point Weighted Model)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Identity Consistency</span>
              <span>{authenticityScore.identityConsistency} / 20</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full" style={{ width: `${(authenticityScore.identityConsistency / 20) * 100}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Indexing Evidence</span>
              <span>{authenticityScore.indexingEvidence} / 20</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full" style={{ width: `${(authenticityScore.indexingEvidence / 20) * 100}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>ISSN Evidence</span>
              <span>{authenticityScore.issnEvidence} / 15</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full" style={{ width: `${(authenticityScore.issnEvidence / 15) * 100}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Publisher Verification</span>
              <span>{authenticityScore.publisherVerification} / 15</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full" style={{ width: `${(authenticityScore.publisherVerification / 15) * 100}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Website Consistency</span>
              <span>{authenticityScore.websiteConsistency} / 10</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full" style={{ width: `${(authenticityScore.websiteConsistency / 10) * 100}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Editorial Transparency</span>
              <span>{authenticityScore.editorialTransparency} / 10</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full" style={{ width: `${(authenticityScore.editorialTransparency / 10) * 100}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Publication Ethics</span>
              <span>{authenticityScore.publicationTransparency} / 10</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full" style={{ width: `${(authenticityScore.publicationTransparency / 10) * 100}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex justify-between font-bold text-blue-900 mb-1">
              <span>Total Score</span>
              <span>{authenticityScore.total} / 100</span>
            </div>
            <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-700 h-full" style={{ width: `${authenticityScore.total}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Section: Predatory Risk Analysis (14 Indicators) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Predatory Risk Analysis (Shodh Setu AI Analytical Engine)
            </h3>
            <p className="text-xs text-slate-500">
              Evidence-based screening of 14 predatory and deceptive publishing indicators.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            Score: {riskAnalysis.riskScore}/100 ({riskAnalysis.riskTier})
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 font-medium">
          {riskAnalysis.summary}
        </p>

        {/* Indicators List */}
        <div className="space-y-2 pt-2">
          {(showAllIndicators ? riskAnalysis.indicators : riskAnalysis.indicators.slice(0, 5)).map((ind) => (
            <div
              key={ind.id}
              className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
                ind.flagged
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : 'bg-slate-50/70 border-slate-200 text-slate-800'
              }`}
            >
              {ind.flagged ? (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{ind.title}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${ind.flagged ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {ind.flagged ? 'FLAGGED' : 'CLEAR'}
                  </span>
                </div>
                <p className="text-slate-600">{ind.evidence}</p>
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowAllIndicators(!showAllIndicators)}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 mt-2 focus:outline-none cursor-pointer"
          >
            <span>{showAllIndicators ? 'Collapse to Top Indicators' : `Show All ${riskAnalysis.indicators.length} Risk Indicators`}</span>
            {showAllIndicators ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Section: Final Recommendation & Next Steps */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
            FINAL VERIFICATION VERDICT
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          {result.recommendation.status}
        </h3>

        <p className="text-sm text-slate-300 leading-relaxed">
          {result.recommendation.summary}
        </p>

        <div className="pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Recommended Researcher Action Protocol:
          </span>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {result.recommendation.nextSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-400 font-bold shrink-0">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3">
          <button
            onClick={onOpenChecklist}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>Complete Pre-Submission Checklist</span>
          </button>
          <button
            onClick={() => onOpenReport(result)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Print Formal Verification Audit</span>
          </button>
        </div>
      </div>

      {/* Editor Forensic Alert Modal */}
      <EditorAlertModal
        isOpen={isEditorAlertOpen}
        onClose={() => setIsEditorAlertOpen(false)}
        result={result}
        profile={profile}
      />

    </div>
  );
};
