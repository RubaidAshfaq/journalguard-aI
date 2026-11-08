/**
 * Shodh Setu AI - Call for Papers (CfP) Discovery & Matching Service
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Implements semantic keyword extraction, multi-field matching,
 * authoritative Scopus/WoS validation, deadline tracking, duplicate detection,
 * and researcher profile notifications.
 * 
 * STRICT POLICY: NEVER hallucinate or fabricate CFPs, deadlines, or links.
 */

import { CallForPaperItem, CfpSearchQuery, CfpDeadlineStatus, ResearcherProfile, CfpNotificationItem } from '../types';
import { VERIFIED_CFP_CATALOG } from './cfpData';

// Known academic concept synonym clusters for semantic expansion
const CONCEPT_CLUSTERS: Record<string, string[]> = {
  ai: ['artificial intelligence', 'machine learning', 'deep learning', 'neural networks', 'algorithmic', 'automated'],
  generative_ai: ['generative ai', 'genai', 'large language models', 'llms', 'chatgpt', 'synthetic media', 'foundation models'],
  journalism: ['journalism', 'news', 'newsroom', 'editorial', 'fact-checking', 'data journalism', 'computational journalism', 'reporters'],
  digital_media: ['digital media', 'social media', 'online media', 'new media', 'platforms', 'interactive media', 'internet communication'],
  responsible_communication: ['responsible communication', 'communication ethics', 'media ethics', 'accountability', 'transparency', 'disinformation', 'misinformation'],
  marketing_advertising: ['advertising', 'digital marketing', 'algorithmic advertising', 'branding', 'consumer engagement'],
  media_education: ['media education', 'media literacy', 'digital literacy', 'pedagogy', 'curriculum', 'higher education'],
  storytelling: ['ai storytelling', 'automated storytelling', 'narrative', 'film', 'ott', 'streaming', 'creative media'],
  ecology: ['animal ecology', 'wildlife', 'conservation', 'biodiversity', 'environmental science', 'ecosystem'],
  health: ['medicine', 'public health', 'clinical trials', 'epidemiology', 'health informatics', 'biomedical'],
  economics: ['economics', 'finance', 'econometrics', 'banking', 'macroeconomics', 'microeconomics', 'capital markets'],
};

/**
 * Extract clean, normalized tokens from raw text
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 3);
}

/**
 * Extract key research concepts from query components
 */
export function extractResearchConcepts(query: CfpSearchQuery): {
  primaryKeywords: string[];
  expandedConcepts: string[];
} {
  const rawCombined = [
    query.title || '',
    query.abstract || '',
    query.keywords || '',
    query.researchArea || '',
    query.discipline || '',
    query.methodology || ''
  ].join(' ').toLowerCase();

  const primaryList = (query.keywords || '')
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  const matchedClusters = new Set<string>();

  Object.entries(CONCEPT_CLUSTERS).forEach(([key, terms]) => {
    const hasMatch = terms.some(term => rawCombined.includes(term));
    if (hasMatch) {
      terms.forEach(t => matchedClusters.add(t));
    }
  });

  return {
    primaryKeywords: primaryList.length > 0 ? primaryList : Array.from(matchedClusters).slice(0, 5),
    expandedConcepts: Array.from(matchedClusters),
  };
}

/**
 * Validate and calculate submission deadline status
 */
export function calculateDeadlineStatus(deadlineStr: string): {
  status: CfpDeadlineStatus;
  daysRemaining: number;
} {
  if (!deadlineStr) {
    return { status: 'DATE_NOT_VERIFIED', daysRemaining: 0 };
  }

  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) {
    return { status: 'DATE_NOT_VERIFIED', daysRemaining: 0 };
  }

  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { status: 'CLOSED', daysRemaining: days };
  } else if (days <= 30) {
    return { status: 'CLOSING_SOON', daysRemaining: days };
  } else {
    return { status: 'OPEN', daysRemaining: days };
  }
}

/**
 * Search, match, and rank Call for Papers from authoritative sources
 */
export async function searchCallForPapers(
  query: CfpSearchQuery,
  profile?: ResearcherProfile
): Promise<CallForPaperItem[]> {
  const { primaryKeywords, expandedConcepts } = extractResearchConcepts(query);
  const searchTokens = tokenize([
    query.title || '',
    query.abstract || '',
    query.keywords || '',
    query.researchArea || '',
    query.discipline || '',
    ...(profile?.keywords || []),
    ...(profile?.researchAreas || [])
  ].join(' '));

  // Merge duplicate catalog entries (keyed by normalized URL or ISSN + Title)
  const uniqueMap = new Map<string, CallForPaperItem>();
  VERIFIED_CFP_CATALOG.forEach(item => {
    const key = (item.originalCfpUrl || item.issn || item.title).toLowerCase().trim();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });

  const catalog = Array.from(uniqueMap.values());

  const matchedResults = catalog.map(item => {
    const itemCorpus = [
      item.title,
      item.journalName,
      item.publisher,
      item.publicationArea,
      item.specialIssueTitle || '',
      ...item.researchTopics,
    ].join(' ').toLowerCase();

    // 1. Direct and Expanded Keyword Overlaps
    const matchedPills = new Set<string>();
    let keywordOverlapCount = 0;

    // Check primary user keywords
    primaryKeywords.forEach(kw => {
      const kwLower = kw.toLowerCase().trim();
      if (kwLower && itemCorpus.includes(kwLower)) {
        matchedPills.add(kw);
        keywordOverlapCount += 2;
      }
    });

    // Check expanded concepts
    expandedConcepts.forEach(concept => {
      if (itemCorpus.includes(concept)) {
        // Capitalize for display
        const displayWord = concept.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        matchedPills.add(displayWord);
        keywordOverlapCount += 1;
      }
    });

    // Check token overlaps
    let tokenOverlapCount = 0;
    searchTokens.forEach(t => {
      if (itemCorpus.includes(t)) {
        tokenOverlapCount++;
      }
    });

    // Check topic match inside item.researchTopics
    let directTopicMatchCount = 0;
    item.researchTopics.forEach(rt => {
      const rtLower = rt.toLowerCase();
      if (searchTokens.some(st => rtLower.includes(st))) {
        matchedPills.add(rt);
        directTopicMatchCount++;
      }
    });

    // Compute dynamic relevance score
    let baseScore = item.matchScore || 70;
    
    // Scale by overlap density
    const totalSignal = keywordOverlapCount * 3 + directTopicMatchCount * 4 + tokenOverlapCount;
    let computedScore = baseScore;

    if (searchTokens.length > 0) {
      if (totalSignal >= 12) {
        computedScore = Math.min(98, Math.max(90, baseScore + 4));
      } else if (totalSignal >= 6) {
        computedScore = Math.min(92, Math.max(82, baseScore));
      } else if (totalSignal >= 3) {
        computedScore = Math.min(84, Math.max(70, baseScore - 5));
      } else {
        computedScore = Math.max(45, baseScore - 25);
      }
    }

    // Indexing preference bonus
    if (query.scopusPreference && item.scopusStatus === 'SCOPUS_VERIFIED') {
      computedScore = Math.min(100, computedScore + 2);
    }
    if (query.wosPreference && item.wosStatus === 'WOS_VERIFIED') {
      computedScore = Math.min(100, computedScore + 2);
    }

    // Determine match tier
    let topicMatchTier: CallForPaperItem['matchBreakdown']['topicMatchTier'] = 'Moderate Match';
    if (computedScore >= 95) topicMatchTier = 'Excellent Match';
    else if (computedScore >= 85) topicMatchTier = 'Very Strong Match';
    else if (computedScore >= 70) topicMatchTier = 'Strong Match';
    else if (computedScore >= 55) topicMatchTier = 'Moderate Match';
    else topicMatchTier = 'Low Match';

    const matchedList = Array.from(matchedPills);
    const deadlineCalc = calculateDeadlineStatus(item.submissionDeadline);

    return {
      ...item,
      matchScore: computedScore,
      matchedKeywords: matchedList.length > 0 ? matchedList.slice(0, 6) : item.matchedKeywords,
      deadlineStatus: deadlineCalc.status,
      daysRemaining: deadlineCalc.daysRemaining,
      matchBreakdown: {
        topicMatchTier,
        matchedTopics: matchedList.slice(0, 4),
        keywordsCountSummary: primaryKeywords.length > 0 
          ? `${Math.min(primaryKeywords.length, matchedList.length)}/${primaryKeywords.length} matched`
          : `${matchedList.length} concepts matched`,
        journalScope: computedScore >= 85 ? 'High Match' : 'Moderate Match',
        indexingSummary: `${item.scopusStatus === 'SCOPUS_VERIFIED' ? 'Scopus Verified' : 'Scopus N/A'} • ${item.wosStatus === 'WOS_VERIFIED' ? (item.wosCollection || 'WoS Verified') : 'WoS N/A'}`,
        publicationArea: item.publicationArea,
        overallScore: computedScore,
      }
    };
  });

  // Sort by match score descending
  return matchedResults.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Generate researcher notifications based on profile research keywords and high-match CFPs
 */
export function generateCfpNotificationsForProfile(
  profile: ResearcherProfile,
  existingNotifications: CfpNotificationItem[] = []
): CfpNotificationItem[] {
  if (!profile || (!profile.keywords?.length && !profile.researchAreas?.length)) {
    return existingNotifications;
  }

  const existingCfpIds = new Set(existingNotifications.map(n => n.cfpId));

  const query: CfpSearchQuery = {
    keywords: (profile.keywords || []).join(', '),
    researchArea: (profile.researchAreas || []).join(', '),
  };

  // Synchronously evaluate matching against verified catalog
  const { primaryKeywords, expandedConcepts } = extractResearchConcepts(query);
  const profileTokens = tokenize([
    ...(profile.keywords || []),
    ...(profile.researchAreas || []),
    profile.publicationGoals || '',
  ].join(' '));

  const newNotifications: CfpNotificationItem[] = [];

  VERIFIED_CFP_CATALOG.forEach(item => {
    // Only genuine, verified CFPs
    if (!item.isVerifiedCfp) return;

    const itemCorpus = [item.title, item.journalName, ...item.researchTopics].join(' ').toLowerCase();
    
    // Check keyword overlap
    let matchCount = 0;
    const matchedPills = new Set<string>();

    primaryKeywords.forEach(kw => {
      if (itemCorpus.includes(kw.toLowerCase())) {
        matchCount++;
        matchedPills.add(kw);
      }
    });

    expandedConcepts.forEach(c => {
      if (itemCorpus.includes(c)) {
        matchCount++;
        matchedPills.add(c);
      }
    });

    profileTokens.forEach(t => {
      if (itemCorpus.includes(t)) {
        matchCount++;
      }
    });

    // If strong match (at least 3 conceptual overlaps or baseline match >= 88%)
    if (matchCount >= 3 || (primaryKeywords.length > 0 && matchCount >= 1 && item.matchScore >= 88)) {
      if (!existingCfpIds.has(item.id)) {
        newNotifications.push({
          id: `notif-${item.id}-${Date.now()}`,
          cfpId: item.id,
          title: item.title,
          journalName: item.journalName,
          publisher: item.publisher,
          deadline: item.submissionDeadline,
          matchScore: Math.min(98, Math.max(86, item.matchScore)),
          matchedKeywords: Array.from(matchedPills).slice(0, 4),
          scopusStatus: item.scopusStatus === 'SCOPUS_VERIFIED' ? 'Scopus Verified' : 'Not verified',
          wosStatus: item.wosCollection ? `WoS ${item.wosCollection}` : (item.wosStatus === 'WOS_VERIFIED' ? 'WoS Verified' : 'Not verified'),
          originalCfpUrl: item.originalCfpUrl,
          dateCreated: new Date().toISOString(),
          isRead: false,
        });
      }
    }
  });

  return [...newNotifications, ...existingNotifications];
}
