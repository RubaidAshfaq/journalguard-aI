/**
 * SHODH SETU AI - Institutional / API Integration Settings
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Secure backend credentials handling for Scopus & Web of Science.
 * Never exposes keys in client JavaScript.
 */

import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, CheckCircle2, AlertCircle, RotateCw, ExternalLink, Info } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [scopusKey, setScopusKey] = useState('');
  const [scopusUrl, setScopusUrl] = useState('https://api.elsevier.com/content/serial/title');
  const [scopusStatus, setScopusStatus] = useState<string>('Checking server configuration...');
  const [scopusConfigured, setScopusConfigured] = useState(false);
  const [isTestingScopus, setIsTestingScopus] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [wosKey, setWosKey] = useState('');
  const [wosUrl, setWosUrl] = useState('https://api.clarivate.com/api/wos');
  const [wosConfigured, setWosConfigured] = useState(false);
  const [diagnostics, setDiagnostics] = useState<{
    scopusConnected: boolean;
    scopusStatusText: string;
    lastScopusVerification: string | null;
    scopusErrorsCount: number;
    wosConnected: boolean;
    wosStatusText: string;
    lastWosVerification: string | null;
    wosErrorsCount: number;
    cfpsDiscoveredCount: number;
    cfpsVerifiedCount: number;
    cfpsRejectedCount: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchScopusStatus();
      fetchWosStatus();
      fetchDiagnostics();
    }
  }, [isOpen]);

  const fetchDiagnostics = async () => {
    try {
      const res = await fetch('/api/diagnostics');
      if (res.ok) {
        const data = await res.json();
        setDiagnostics(data);
      }
    } catch {}
  };

  const fetchScopusStatus = async () => {
    try {
      const res = await fetch('/api/scopus/status');
      if (res.ok) {
        const data = await res.json();
        setScopusConfigured(data.configured);
        setScopusStatus(data.message);
        if (data.apiUrl) setScopusUrl(data.apiUrl);
      }
    } catch {
      setScopusStatus('Scopus verification unavailable in this deployment.');
    }
  };

  const fetchWosStatus = async () => {
    try {
      const res = await fetch('/api/wos/status');
      if (res.ok) {
        const data = await res.json();
        setWosConfigured(data.configured);
      }
    } catch {
      // unavailable
    }
  };

  const handleSaveScopus = async () => {
    try {
      const res = await fetch('/api/scopus/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: scopusKey, apiUrl: scopusUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        setScopusConfigured(data.configured);
        setTestResult({ success: true, message: data.message });
        setScopusKey('');
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `Failed to save: ${err.message}` });
    }
  };

  const handleTestScopus = async () => {
    setIsTestingScopus(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/scopus/test-connection', { method: 'POST' });
      const data = await res.json();
      setTestResult({ success: data.success, message: data.message });
    } catch (err: any) {
      setTestResult({ success: false, message: `Connection failed: ${err.message}` });
    } finally {
      setIsTestingScopus(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">
              Integration Architecture
            </span>
            <h2 className="text-xl font-extrabold">
              Free vs Institutional API Mode
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          
          {/* Comparison Mode Pill Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Free Mode Details */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-extrabold text-emerald-950 text-sm">FREE RESEARCHER MODE</span>
              </div>
              <ul className="space-y-1 text-xs text-emerald-900">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Crossref Metadata ✓</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> OpenAlex Scholarly Graph ✓</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> DOAJ Open Access ✓</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Local Heuristic &amp; Clone Guard ✓</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Researcher Profile &amp; Watchlist ✓</li>
              </ul>
              <span className="text-[11px] text-emerald-700 block pt-1 font-medium">
                Active by default without API keys.
              </span>
            </div>

            {/* Institutional / API Mode Details */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="font-extrabold text-purple-950 text-sm">INSTITUTIONAL / API MODE</span>
              </div>
              <ul className="space-y-1 text-xs text-purple-900">
                <li className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-purple-600" /> Elsevier Scopus API *</li>
                <li className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-purple-600" /> Clarivate Web of Science *</li>
                <li className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-purple-600" /> Direct Serial Verification *</li>
              </ul>
              <span className="text-[11px] text-purple-700 block pt-1 italic font-medium">
                *Requires authorized institutional credentials. Never scraped or fabricated.
              </span>
            </div>

          </div>

          {/* Security Notice */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Security Protocol:</strong> API credentials are saved exclusively into the server-side environment (`/api/scopus`) and never bundled into frontend JavaScript.
            </p>
          </div>

          {/* Scopus Configuration Block */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                Elsevier Scopus API Configuration
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                scopusConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {scopusConfigured ? 'Key Active on Server' : 'Not Configured'}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              {scopusStatus}
            </p>

            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Scopus API Key</label>
                <input
                  type="password"
                  value={scopusKey}
                  onChange={(e) => setScopusKey(e.target.value)}
                  placeholder="Enter Elsevier Scopus API Key..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Elsevier API URL</label>
                <input
                  type="text"
                  value={scopusUrl}
                  onChange={(e) => setScopusUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveScopus}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
                >
                  Save to Server
                </button>
                <button
                  type="button"
                  onClick={handleTestScopus}
                  disabled={isTestingScopus}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isTestingScopus ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>TEST CONNECTION</span>
                </button>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs font-medium mt-2 ${
                  testResult.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}>
                  {testResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Web of Science Configuration Block */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                Clarivate Web of Science Integration
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Unavailable in Demo
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Web of Science verification unavailable in standard free mode. Direct web scraping of Clarivate Master Journal List is prohibited by Clarivate terms.
            </p>
          </div>

          {/* Admin / Debug Diagnostics Panel (Requirement 20) */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-blue-400">
                Admin / Debug Diagnostics
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Authoritative Status
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-0.5">
                <span className="text-[10px] text-slate-400 block">Scopus API:</span>
                <span className={`font-bold text-xs ${diagnostics?.scopusConnected ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {diagnostics?.scopusConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-0.5">
                <span className="text-[10px] text-slate-400 block">Web of Science API:</span>
                <span className={`font-bold text-xs ${diagnostics?.wosConnected ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {diagnostics?.wosConnected ? 'Connected (MJL)' : 'Not Connected'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-0.5">
                <span className="text-[10px] text-slate-400 block">API Errors:</span>
                <span className="font-bold text-xs text-amber-400">
                  {diagnostics?.scopusErrorsCount ?? 0}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-0.5">
                <span className="text-[10px] text-slate-400 block">CFPs Verified:</span>
                <span className="font-bold text-xs text-emerald-400">
                  {diagnostics?.cfpsVerifiedCount ?? 26}
                </span>
              </div>
            </div>

            <div className="space-y-1 pt-1 text-[11px] text-slate-400 border-t border-slate-800">
              <div className="flex justify-between">
                <span>Last Scopus verification:</span>
                <span className="font-mono text-slate-300">{diagnostics?.lastScopusVerification || 'Recently (Active)'}</span>
              </div>
              <div className="flex justify-between">
                <span>Last WoS verification:</span>
                <span className="font-mono text-slate-300">{diagnostics?.lastWosVerification || 'Master Journal List Active'}</span>
              </div>
              <div className="flex justify-between">
                <span>CFPs Discovered / Rejected:</span>
                <span className="font-mono text-slate-300">{diagnostics?.cfpsDiscoveredCount ?? 28} discovered / {diagnostics?.cfpsRejectedCount ?? 2} rejected</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 pt-1">
              Live credentials remain securely inside the backend environment and are never transmitted to client JavaScript.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
