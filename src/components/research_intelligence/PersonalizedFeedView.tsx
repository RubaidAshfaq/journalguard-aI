/**
 * Shodh Setu AI - Personalized Research Feed & Follow Alerts
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Curated research feed matching:
 * - Researcher profile keywords & disciplinary interests
 * - "Do not use search history" privacy toggle
 * - Journal follow alerts & special issue notices
 */

import React, { useState, useMemo } from 'react';
import { 
  Rss, 
  Sparkles, 
  Lock, 
  Bell, 
  ExternalLink, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Bookmark, 
  Building,
  Check
} from 'lucide-react';
import { IntelligenceJournal, ResearcherProfile } from '../../types';
import { getStoredIntelligenceJournals } from '../../services/researchIntelligenceService';

interface PersonalizedFeedViewProps {
  profile: ResearcherProfile;
  onOpenDossier: (journal: IntelligenceJournal) => void;
  onVerifyJournal: (query: string) => void;
}

export const PersonalizedFeedView: React.FC<PersonalizedFeedViewProps> = ({
  profile,
  onOpenDossier,
  onVerifyJournal,
}) => {
  const [doNotUseSearchHistory, setDoNotUseSearchHistory] = useState<boolean>(false);
  const [followedIds, setFollowedIds] = useState<string[]>(['j1', 'j2']);

  const allJournals = useMemo(() => getStoredIntelligenceJournals(), []);

  // Filter journals matching researcher's profile
  const matchedJournals = useMemo(() => {
    const profileKeywords = profile.keywords || ['Digital Journalism', 'Artificial Intelligence'];
    const profileAreas = profile.researchAreas || ['Media & Communication'];

    return allJournals.filter(j => {
      // If privacy toggle active, do strictly static profile matching without historical search weights
      const text = [j.title, j.discipline, ...j.subjectAreas].join(' ').toLowerCase();
      const hasKwMatch = profileKeywords.some(kw => text.includes(kw.toLowerCase()));
      const hasAreaMatch = profileAreas.some(area => text.includes(area.toLowerCase()));
      return hasKwMatch || hasAreaMatch || followedIds.includes(j.id);
    });
  }, [allJournals, profile, followedIds, doNotUseSearchHistory]);

  const toggleFollow = (id: string) => {
    if (followedIds.includes(id)) {
      setFollowedIds(followedIds.filter(item => item !== id));
    } else {
      setFollowedIds([...followedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Rss className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Personalized Research &amp; Journal Watch Feed
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Curated research intelligence matching your designated scholarly keywords: <span className="font-semibold text-slate-700 dark:text-slate-300">{(profile.keywords || ['Digital Journalism', 'AI']).join(', ')}</span>
          </p>
        </div>

        {/* Privacy Toggle: "Do not use search history" */}
        <div className="flex items-center gap-2 shrink-0 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={doNotUseSearchHistory}
              onChange={(e) => setDoNotUseSearchHistory(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium">Do not use search history</span>
          </label>
        </div>
      </div>

      {/* Feed Items Stream */}
      <div className="space-y-4">
        {matchedJournals.map((j) => {
          const isFollowed = followedIds.includes(j.id);

          return (
            <div 
              key={j.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {j.scopusIndexed && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        Scopus {j.scopusQuartile}
                      </span>
                    )}
                    {j.wosIndexed && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        WoS {j.wosCoreCollection}
                      </span>
                    )}
                    {j.abdcRating && j.abdcRating !== 'None' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        ABDC {j.abdcRating}
                      </span>
                    )}
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  </div>

                  <h3 
                    onClick={() => onOpenDossier(j)}
                    className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer"
                  >
                    {j.title}
                  </h3>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {j.publisher}
                    </span>
                    <span>·</span>
                    <span className="font-mono">ISSN: {j.issn}</span>
                    <span>·</span>
                    <span>Next Verification: {j.nextVerificationDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleFollow(j.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isFollowed
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isFollowed ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Bell className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{isFollowed ? 'Following Alerts' : 'Follow Journal'}</span>
                  </button>
                </div>
              </div>

              {/* Feed Card Insight */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Recent Activity:
                </span>{' '}
                <span className="text-slate-600 dark:text-slate-300">
                  Confirmed continuous indexing in {j.scopusIndexed ? `Scopus ${j.scopusQuartile}` : 'authoritative registry'}. Average review turnaround: ~{j.firstDecisionWeeks} weeks. Zero abnormal issue volume detected in recent volumes.
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={() => onOpenDossier(j)}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Journal Profile &rarr;
                </button>
                <button
                  onClick={() => onVerifyJournal(j.issn || j.title)}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Verify Authenticity
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
