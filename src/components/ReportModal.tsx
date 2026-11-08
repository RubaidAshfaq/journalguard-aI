/**
 * JOURNALGUARD AI - Formal Journal Verification Audit Report Modal
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 */

import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  FileJson, 
  ShieldCheck, 
  Building2, 
  Calendar,
  AlertTriangle,
  Info
} from 'lucide-react';
import { VerificationResult, ResearcherProfile } from '../types';
import { exportResultToCSV, exportResultToJSON } from '../services/reportEngine';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: VerificationResult | null;
  profile: ResearcherProfile;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  result,
  profile,
}) => {
  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportResultToCSV(result, profile);
  };

  const handleExportJSON = () => {
    exportResultToJSON(result, profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm tracking-tight">
              Official Journal Verification Audit Report
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Document Body */}
        <div className="p-8 sm:p-12 space-y-8 max-h-[80vh] overflow-y-auto bg-white text-slate-900 font-sans print:max-h-none print:overflow-visible">
          
          {/* Formal Header */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900">
                ShodhSetu
              </div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mt-0.5">
                Academic Research Bridge &amp; Journal Integrity Intelligence
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Created by <strong>Dr. Rubaid Ashfaq</strong> · Co-creator: <strong>Zeba Nabi</strong>
              </p>
            </div>

            <div className="text-right text-xs text-slate-500 font-mono">
              <span className="block font-bold text-slate-800">AUDIT CERTIFICATE</span>
              <span>REF: {result.id}</span>
              <span className="block">Date: {new Date(result.timestamp).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Section 1: Researcher & Journal Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Auditing Researcher
              </span>
              <p className="text-sm font-extrabold text-slate-900">{profile.fullName}</p>
              <p className="text-slate-700">{profile.designation}</p>
              <p className="text-slate-600">{profile.institution} · {profile.department}</p>
              <p className="font-mono text-slate-500">ORCID: {profile.orcid || 'Not provided'}</p>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Target Publication Serial
              </span>
              <p className="text-sm font-extrabold text-slate-900">{result.journal.title}</p>
              <p className="text-slate-700">Publisher: {result.journal.publisher}</p>
              <p className="font-mono text-slate-600">ISSN / eISSN: {result.journal.issn}</p>
              <p className="text-slate-500 truncate">Website: {result.journal.website || 'Unlisted'}</p>
            </div>
          </div>

          {/* Section 2: Core Analytical Scores Summary */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Integrity Scores &amp; Analytical Evaluation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Authenticity Score</span>
                <span className="text-3xl font-black text-slate-900 tabular-nums">
                  {result.authenticityScore.total}
                </span>
                <span className="text-xs text-slate-500 block">/ 100 (7 Weighted Factors)</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Risk Assessment</span>
                <span className="text-3xl font-black text-slate-900">
                  {result.riskAnalysis.riskTier}
                </span>
                <span className="text-xs text-slate-500 block">
                  Score: {result.riskAnalysis.riskScore}/100 ({result.riskAnalysis.flaggedCount} Flags)
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Research Fit Score</span>
                <span className="text-3xl font-black text-purple-900 tabular-nums">
                  {result.researchFit.total}%
                </span>
                <span className="text-xs text-purple-700 font-semibold block">{result.researchFit.tier}</span>
              </div>

            </div>
          </div>

          {/* Section 3: Scholarly Database Verification Evidence */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Independent Scholarly Database Findings
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Data Source</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Audited Details &amp; Registration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 font-semibold">ISSN International Register</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{result.sources.issn.status}</td>
                  <td className="py-2.5 px-3 text-slate-600">{result.sources.issn.details}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Crossref Scholarly Metadata</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{result.sources.crossref.status}</td>
                  <td className="py-2.5 px-3 text-slate-600">{result.sources.crossref.details}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">OpenAlex Scholarly Engine</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{result.sources.openalex.status}</td>
                  <td className="py-2.5 px-3 text-slate-600">{result.sources.openalex.details}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">DOAJ (Directory of Open Access Journals)</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{result.sources.doaj.status}</td>
                  <td className="py-2.5 px-3 text-slate-600">{result.sources.doaj.details}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Elsevier Scopus API</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{result.sources.scopus.status}</td>
                  <td className="py-2.5 px-3 text-slate-600">{result.sources.scopus.details}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Clarivate Web of Science</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{result.sources.wos.status}</td>
                  <td className="py-2.5 px-3 text-slate-600">{result.sources.wos.details}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Clone Guard & Predatory Risk Findings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Integrity &amp; Cloning Risk Summary
            </h4>
            <p className="text-slate-700">
              {result.cloneGuard.isPossibleClone ? (
                <strong className="text-rose-700">
                  CLONING ALERT: Mismatches detected against canonical publisher records. Risk of spoofed submission portal.
                </strong>
              ) : (
                <span className="text-emerald-700 font-semibold">
                  CLONE GUARD CLEAR: Domain and publisher identity correlate with registered ISSN records.
                </span>
              )}
            </p>
            <p className="text-slate-600">
              {result.riskAnalysis.summary}
            </p>
          </div>

          {/* Section 4.5: Publication Behaviour & Volume Anomaly Findings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Publication Behaviour &amp; Volume Anomaly Monitor</span>
              <span className="font-mono text-[10px] text-slate-500">
                Baseline vs Recent Telemetry
              </span>
            </h4>
            <p className="text-slate-700 leading-relaxed">
              {result.publicationBehaviour?.summaryText || 'Historical publication baseline established and evaluated across issue frequency and annual paper counts.'}
            </p>
            {result.publicationBehaviour && result.publicationBehaviour.anomalyTier !== 'NORMAL' && (
              <div className="pt-2 border-t border-slate-200 text-amber-800 text-[11px] font-medium">
                <strong>Attention:</strong> Historical baseline of {result.publicationBehaviour.historicalBaseline.avgIssuesPerYear} issues/yr and {result.publicationBehaviour.historicalBaseline.avgPapersPerYear} papers/yr shifted to {result.publicationBehaviour.currentPeriod.issues} issues and {result.publicationBehaviour.currentPeriod.papers} papers in the latest monitored period.
              </div>
            )}
          </div>

          {/* Section 5: Recommendation & Limitations */}
          <div className="space-y-3 pt-2">
            <div className="p-5 rounded-xl bg-slate-900 text-white text-xs space-y-2">
              <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px] block">
                AUDIT VERDICT
              </span>
              <p className="text-base font-extrabold text-white">
                {result.recommendation.status}
              </p>
              <p className="text-slate-300 leading-relaxed">
                {result.recommendation.summary}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">DATA LIMITATIONS &amp; DISCLAIMER:</span>
              <p>
                {result.limitations}
              </p>
              <p className="pt-1 italic">
                ShodhSetu is an academic research-support and screening tool. Its scores and classifications are analytical indicators and are not official determinations by Scopus, Clarivate, DOAJ, Crossref, OpenAlex, COPE, ISSN International Centre, or any publisher. Researchers should independently verify journal information through authoritative sources immediately before submission or payment.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
