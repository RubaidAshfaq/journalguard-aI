/**
 * Shodh Setu AI - AI Journal Recommendation & Keyword Matching Engine
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Analyzes:
 * - Title, Abstract, Keywords, Methodology, Discipline
 * Outputs:
 * - Transparent "SodhSetu Match Score: XX%" with 5-point breakdown
 * - "Why this journal?" explanations
 * - Prominent integrity disclaimer: Never guarantees acceptance
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  BookOpen, 
  ArrowRight, 
  Scale, 
  Info,
  Clock,
  DollarSign
} from 'lucide-react';
import { 
  AiRecommendationInput, 
  AiJournalRecommendationResult, 
  IntelligenceJournal,
  ResearcherProfile 
} from '../../types';
import { 
  recommendJournalsForResearch, 
  getStoredIntelligenceJournals 
} from '../../services/researchIntelligenceService';

interface AiJournalRecommendationViewProps {
  profile: ResearcherProfile;
  onOpenDossier: (journal: IntelligenceJournal) => void;
  onVerifyJournal: (query: string) => void;
  onAddToCompare: (journal: IntelligenceJournal) => void;
}

export const AiJournalRecommendationView: React.FC<AiJournalRecommendationViewProps> = ({
  profile,
  onOpenDossier,
  onVerifyJournal,
  onAddToCompare,
}) => {
  // Manuscript inputs pre-filled from researcher profile if available
  const [title, setTitle] = useState<string>('Algorithmic Trust & Fact-Checking Dynamics in Automated Digital Journalism');
  const [abstract, setAbstract] = useState<string>(
    'This paper examines algorithmic accountability and deepfake verification pipelines in digital newsrooms, evaluating editorial trust and transparency across international journalism outlets.'
  );
  const [keywords, setKeywords] = useState<string>(
    profile.keywords && profile.keywords.length ? profile.keywords.join(', ') : 'Digital Journalism, Automated Fact-Checking, Algorithmic Accountability, Media Ethics'
  );
  const [methodology, setMethodology] = useState<string>('Empirical Mixed Methods & Platform Analysis');
  const [discipline, setDiscipline] = useState<string>(
    (profile.researchAreas && profile.researchAreas[0]) || 'Media & Communication'
  );
  const [preferOpenAccess, setPreferOpenAccess] = useState<boolean>(false);
  const [preferFastReview, setPreferFastReview] = useState<boolean>(true);
  const [preferAbdc, setPreferAbdc] = useState<boolean>(false);

  const [recommendations, setRecommendations] = useState<AiJournalRecommendationResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);

  const handleRunRecommendation = () => {
    setIsAnalyzing(true);
    setHasRun(true);

    const input: AiRecommendationInput = {
      title,
      abstract,
      keywords,
      methodology,
      discipline,
      targetAudience: 'Academic Researchers & Peer Reviewers',
      preferredIndexing: preferAbdc ? 'abdc' : 'all',
      budgetTier: preferOpenAccess ? 'no_apc' : 'all',
      openAccessOnly: preferOpenAccess,
    };

    setTimeout(() => {
      const results = recommendJournalsForResearch(input, profile);
      setRecommendations(results);
      setIsAnalyzing(false);
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Engine Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scope &amp; Thematic Alignment Engine</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            AI-Based Journal Recommendation &amp; Keyword Matcher
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100/90 mt-1 leading-relaxed">
            Submit your manuscript details to evaluate structural fit against verified Scopus, Web of Science, and ABDC journal mandates. Every recommendation includes a 100% transparent score breakdown.
          </p>
        </div>
      </div>

      {/* Mandatory Academic Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <span className="font-bold text-amber-900 dark:text-amber-200">
            Academic Integrity Notice &amp; Scope Boundary
          </span>
          <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed text-[11px]">
            The <strong className="font-semibold">SodhSetu Match Score</strong> calculates thematic, methodological, and keyword alignment with a journal's verified aims and publication history. <strong className="font-semibold underline">It does not guarantee acceptance</strong> or influence editorial peer-review decisions. Always review the journal’s author guidelines and ethical disclosure requirements prior to submission.
          </p>
        </div>
      </div>

      {/* Manuscript Input Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Manuscript Attributes
        </h3>

        <div className="space-y-3">
          {/* Paper Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Manuscript Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Algorithmic Trust & Fact-Checking Dynamics in Automated Digital Journalism"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Abstract (Summary of Research, Findings &amp; Contribution)
            </label>
            <textarea
              rows={3}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Paste your abstract here to enable semantic keyword extraction..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Keywords & Methodology */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Keywords (Comma Separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Digital Journalism, Automated Fact-Checking, Algorithmic Trust"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Research Methodology
              </label>
              <select
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Empirical Mixed Methods & Platform Analysis">Empirical Mixed Methods &amp; Platform Analysis</option>
                <option value="Quantitative Survey & Statistical Modeling">Quantitative Survey &amp; Statistical Modeling</option>
                <option value="Qualitative Case Study & Textual Analysis">Qualitative Case Study &amp; Textual Analysis</option>
                <option value="Computational Experiment & Machine Learning Pipeline">Computational Experiment &amp; Machine Learning Pipeline</option>
                <option value="Systematic Review & Meta-Analysis">Systematic Review &amp; Meta-Analysis</option>
                <option value="Theoretical / Conceptual Framework">Theoretical / Conceptual Framework</option>
              </select>
            </div>
          </div>

          {/* Target Discipline & Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Disciplinary Field
              </label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Media & Communication">Media, Communication &amp; Journalism</option>
                <option value="Computer Science">Computer Science &amp; AI</option>
                <option value="Business & Management">Business, Management &amp; ABDC</option>
                <option value="Medicine & Public Health">Medicine &amp; Clinical Sciences</option>
                <option value="Environmental Science">Environmental Science &amp; Ecology</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <div className="flex flex-wrap items-center gap-3 py-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferOpenAccess}
                    onChange={(e) => setPreferOpenAccess(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Prioritize Diamond OA</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferFastReview}
                    onChange={(e) => setPreferFastReview(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Fast Decision (&lt;6 wks)</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferAbdc}
                    onChange={(e) => setPreferAbdc(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>ABDC Listed</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={handleRunRecommendation}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Evaluating Mandates...' : 'Analyze Manuscript & Recommend Journals'}</span>
          </button>
        </div>
      </div>

      {/* Recommendations Results List */}
      {hasRun && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="font-semibold text-slate-900 dark:text-white">
              Recommended Scholarly Venues ({recommendations.length} matched)
            </span>
            <span>Ranked by SodhSetu Match Score</span>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec) => {
              const j = rec.journal;
              const breakdown = rec.scoreBreakdown;

              return (
                <div 
                  key={j.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4"
                >
                  {/* Top Bar: Match Score & Title */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {j.scopusIndexed && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Scopus {j.scopusQuartile}
                          </span>
                        )}
                        {j.wosIndexed && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            WoS {j.wosCoreCollection}
                          </span>
                        )}
                        {j.abdcRating && j.abdcRating !== 'None' && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            ABDC {j.abdcRating}
                          </span>
                        )}
                        {j.openAccessType === 'Diamond' && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Diamond OA
                          </span>
                        )}
                      </div>

                      <h3 
                        onClick={() => onOpenDossier(j)}
                        className="text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                      >
                        {j.title}
                      </h3>

                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span>{j.publisher}</span>
                        <span>·</span>
                        <span className="font-mono">ISSN: {j.issn}</span>
                      </div>
                    </div>

                    {/* SodhSetu Match Score Badge */}
                    <div className="shrink-0 text-center sm:text-right p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80">
                      <div className="text-[11px] font-semibold uppercase text-blue-700 dark:text-blue-300">
                        SodhSetu Match Score
                      </div>
                      <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
                        {rec.matchScore}%
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        High Thematic Fit
                      </div>
                    </div>
                  </div>

                  {/* "Why this journal?" Explanation Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Why this journal?</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      {Array.isArray(rec.whyThisJournal) ? rec.whyThisJournal.join(' · ') : rec.whyThisJournal}
                    </p>
                  </div>

                  {/* Transparent 5-Metric Breakdown */}
                  <div>
                    <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">
                      Transparent 5-Factor Score Breakdown
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">1. Keywords</div>
                        <div className="font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                          {Math.round((breakdown.keywordMatch / 100) * 25)} <span className="text-slate-400 text-[10px]">/ 25</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">2. Scope Fit</div>
                        <div className="font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                          {Math.round((breakdown.scopeMatch / 100) * 25)} <span className="text-slate-400 text-[10px]">/ 25</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">3. Subject Area</div>
                        <div className="font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                          {Math.round((breakdown.subjectAreaMatch / 100) * 20)} <span className="text-slate-400 text-[10px]">/ 20</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">4. Index Quality</div>
                        <div className="font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                          {Math.round((breakdown.indexingPreference / 100) * 15)} <span className="text-slate-400 text-[10px]">/ 15</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">5. Integrity/Turnaround</div>
                        <div className="font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                          {Math.round((breakdown.recentPubRelevance / 100) * 15)} <span className="text-slate-400 text-[10px]">/ 15</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <button
                      onClick={() => onOpenDossier(j)}
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Examine Verified Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAddToCompare(j)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs flex items-center gap-1"
                        title="Add to journal comparison matrix"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Compare</span>
                      </button>

                      <button
                        onClick={() => onVerifyJournal(j.issn || j.title)}
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                      >
                        Forensic Integrity Audit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
