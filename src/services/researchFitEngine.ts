/**
 * SHODH SETU AI - Researcher-Specific Fit Engine
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Compares journal scope, title, and subjects against researcher profile:
 * - Subject Fit: 35
 * - Scope Match: 25
 * - Indexing Match: 15
 * - Publication Type: 10
 * - Researcher Keywords: 15
 * Total: 100
 */

import { ResearcherProfile, ResearchFitScore } from '../types';

export function calculateResearchFit(
  journalTitle: string,
  subjectAreas: string[],
  scopeDescription: string = '',
  profile?: ResearcherProfile,
  isOa: boolean = false,
  isIndexed: boolean = false
): ResearchFitScore {
  const journalText = `${journalTitle} ${subjectAreas.join(' ')} ${scopeDescription}`.toLowerCase();
  
  // Researcher terms
  const allTerms = [
    ...(profile?.researchAreas || ['Multidisciplinary']),
    ...(profile?.keywords || []),
  ];

  const matchingKeywords: string[] = [];

  allTerms.forEach(term => {
    const cleanTerm = term.trim().toLowerCase();
    if (cleanTerm.length > 2 && journalText.includes(cleanTerm)) {
      if (!matchingKeywords.includes(term)) {
        matchingKeywords.push(term);
      }
    }
  });

  // Calculate 1. Subject Fit (max 35)
  let subjectFit = 12; // baseline for academic venues
  const profileKeywordsLength = profile?.keywords?.length || 2;
  const matchRatio = Math.min(1, matchingKeywords.length / Math.max(2, profileKeywordsLength));
  subjectFit = Math.round(12 + matchRatio * 23);

  // 2. Scope Match (max 25)
  let scopeMatch = 10;
  if (matchingKeywords.length >= 3) scopeMatch = 24;
  else if (matchingKeywords.length >= 2) scopeMatch = 19;
  else if (matchingKeywords.length === 1) scopeMatch = 14;

  // 3. Indexing Match (max 15)
  let indexingMatch = 8;
  if (isIndexed) indexingMatch = 15;

  // 4. Publication Type (max 10)
  let publicationType = 7;
  if (isOa) publicationType = 10;

  // 5. Researcher Keywords (max 15)
  let keywordScore = Math.min(15, Math.round(matchingKeywords.length * 3.5));

  const total = Math.min(100, Math.max(10, subjectFit + scopeMatch + indexingMatch + publicationType + keywordScore));

  let tier: ResearchFitScore['tier'] = 'Low Relevance';
  if (total >= 85) tier = 'Excellent Match';
  else if (total >= 70) tier = 'Strong Fit';
  else if (total >= 50) tier = 'Moderate Fit';
  else tier = 'Low Relevance';

  let explanation = '';
  if (matchingKeywords.length > 0) {
    explanation = `High contextual overlap with your research portfolio in ${matchingKeywords.slice(0, 3).join(', ')}.`;
  } else {
    const kwText = profile?.keywords && profile.keywords.length > 0 ? profile.keywords.slice(0, 3).join(', ') : 'stated research focus';
    explanation = `The journal focus does not directly intersect with your profile keywords (${kwText}).`;
  }

  return {
    total,
    tier,
    subjectFit,
    scopeMatch,
    indexingMatch,
    publicationType,
    keywordScore,
    matchingKeywords,
    explanation,
  };
}
