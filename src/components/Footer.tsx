/**
 * SHODH SETU AI - Material 3 Academic Footer
 * Academic Concept & Direction: Dr. Rubaid Ashfaq · Co-creator: Zeba Nabi
 */

import React from 'react';
import { ShieldCheck, Heart, Sparkles, ExternalLink, Globe } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onNavigateTab,
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-slate-600 text-xs py-10 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Concept Credits */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight">
                Shodh Setu AI
              </span>
            </div>
            
            <p className="text-xs font-semibold text-blue-700">
              Journal Authenticity, Indexing &amp; Research Integrity Intelligence
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 inline-block text-xs">
              <span className="text-slate-500 block">Academic Concept:</span>
              <strong className="text-slate-900 font-extrabold text-sm">
                Created by Dr. Rubaid Ashfaq · Co-creator: Zeba Nabi
              </strong>
            </div>

            <p className="text-slate-500 max-w-md leading-relaxed text-[11px]">
              Dedicated to safeguarding postgraduate students, PhD scholars, university faculty, and academic librarians from predatory journals, hijacked domains, and counterfeit metrics.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Integrity Navigation
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('home')}
                  className="hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Verify a Journal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('finder')}
                  className="hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Find Journals for My Research
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('library')}
                  className="hover:text-blue-600 transition-colors cursor-pointer"
                >
                  My Journal Watchlist
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('checklist')}
                  className="hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Smart Pre-Submission Checklist
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('academy')}
                  className="hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Research Integrity Academy
                </button>
              </li>
            </ul>
          </div>

          {/* Open Scholarly Registries */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Authoritative Databases
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>
                <a href="https://www.crossref.org" target="_blank" rel="noreferrer" className="hover:text-slate-800 flex items-center gap-1">
                  <span>Crossref Metadata</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://openalex.org" target="_blank" rel="noreferrer" className="hover:text-slate-800 flex items-center gap-1">
                  <span>OpenAlex Scholarly Graph</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://doaj.org" target="_blank" rel="noreferrer" className="hover:text-slate-800 flex items-center gap-1">
                  <span>DOAJ Open Access Directory</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://portal.issn.org" target="_blank" rel="noreferrer" className="hover:text-slate-800 flex items-center gap-1">
                  <span>ISSN International Centre</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Delete My Local Data
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Mandatory Final Disclaimer */}
        <div className="pt-6 border-t border-slate-200/80 space-y-2 text-[11px] text-slate-500 leading-relaxed">
          <p className="font-bold text-slate-700 uppercase tracking-wide">
            Academic Research Integrity Disclaimer
          </p>
          <p>
            Shodh Setu AI is an academic research-support and screening tool. Its scores and classifications are analytical indicators and are not official determinations by Scopus, Clarivate, DOAJ, Crossref, OpenAlex, COPE, ISSN International Centre, or any publisher. Researchers should independently verify journal information through authoritative sources immediately before submission or payment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 text-slate-400">
            <span>© {new Date().getFullYear()} Shodh Setu AI · Verify Before You Submit. Publish With Confidence.</span>
            <span>Created by Dr. Rubaid Ashfaq · Co-creator: Zeba Nabi</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
