/**
 * SHODH SETU AI - Real-Time Domain Mismatch UI Alert Banner
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Displays an immediate high-visibility warning if the submitted journal URL hostname
 * does not match the canonical domain recorded in authoritative verified metadata.
 */

import React from 'react';
import { AlertOctagon, ExternalLink, X, ShieldAlert, ArrowRight, Mail } from 'lucide-react';
import { DomainMismatchAlert } from '../types';

interface DomainMismatchAlertBannerProps {
  alert: DomainMismatchAlert;
  onDismiss: () => void;
  onScrollToDetails?: () => void;
  onOpenEditorAlert?: () => void;
}

export const DomainMismatchAlertBanner: React.FC<DomainMismatchAlertBannerProps> = ({
  alert,
  onDismiss,
  onScrollToDetails,
  onOpenEditorAlert,
}) => {
  const cleanDomain = alert.canonicalDomain ? alert.canonicalDomain.trim() : '';
  const canonicalUrl = cleanDomain.startsWith('http://') || cleanDomain.startsWith('https://') 
    ? cleanDomain 
    : `https://${cleanDomain}`;

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-6 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 border-2 border-rose-400 shadow-md relative overflow-hidden">
        
        {/* Soft background glow decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Alert Icon & Message Content */}
          <div className="flex items-start gap-3.5 flex-1">
            <div className="p-3 rounded-2xl bg-rose-600 text-white shadow-sm shrink-0 mt-0.5 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase bg-rose-600 text-white px-2.5 py-0.5 rounded-full">
                  ⚠️ DOMAIN MISMATCH ALERT
                </span>
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                  Hostname Inconsistency Detected Upon Verification
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-extrabold text-rose-950 leading-snug">
                {alert.title}
              </h4>

              <p className="text-xs sm:text-sm font-medium text-rose-900 leading-relaxed">
                {alert.message}
              </p>

              {/* Quick Diagnostic Comparison Strip */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 border border-rose-200 text-rose-900 shadow-2xs">
                  <span className="text-slate-400 font-sans font-bold">Provided Host:</span>
                  <span className="font-extrabold text-rose-700">{alert.submittedHostname}</span>
                </div>
                <span className="text-rose-400 font-sans font-bold">≠</span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50/95 border border-emerald-300 text-emerald-900 shadow-2xs">
                  <span className="text-slate-500 font-sans font-bold">Verified Canonical Domain:</span>
                  <span className="font-extrabold text-emerald-700">{alert.canonicalDomain}</span>
                </div>
              </div>

              {/* Recommended Action */}
              <p className="text-xs font-semibold text-rose-800 pt-1">
                Recommendation: {alert.recommendation}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
            {onOpenEditorAlert && (
              <button
                type="button"
                onClick={onOpenEditorAlert}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Send pre-filled forensic alert warning to legitimate journal editors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Mail Real Editors</span>
              </button>
            )}

            {alert.canonicalDomain && alert.canonicalDomain !== 'Authoritative Publisher Record' && (
              <a
                href={canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <span>Visit Genuine Domain</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {onScrollToDetails && (
              <button
                type="button"
                onClick={onScrollToDetails}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <span>View Breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss domain alert"
              className="p-2 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors cursor-pointer shrink-0"
              title="Dismiss Alert"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
