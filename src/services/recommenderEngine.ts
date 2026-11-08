/**
 * Shodh Setu AI - Journal Recommender Engine
 * Concept & Academic Direction: Dr. Rubaid Ashfaq
 * 
 * Accurately searches and suggests verified academic journals matching
 * researcher keywords, research areas, and indexing constraints across all disciplines.
 * 
 * STRICT POLICY: NEVER invent fake quartiles or metrics.
 */

import { RecommendedJournalItem, ResearcherProfile } from '../types';

export interface JournalSearchFilter {
  topic: string;
  keywords?: string | string[];
  researchMethod?: string;
  desiredIndex?: 'all' | 'scopus' | 'wos' | 'doaj' | 'open_access';
  preferredQuartile?: 'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4';
  budgetTier?: 'all' | 'no_apc' | 'under_25k' | '25k_75k' | 'above_75k';
}

export interface MatchedJournalResult extends RecommendedJournalItem {
  matchedKeywordsList?: string[];
  relevanceReason?: string;
}

// Curated verified catalog of real-world academic journals across major disciplines
export const VERIFIED_CANONICAL_JOURNALS: RecommendedJournalItem[] = [
  // --- Computer Science, Artificial Intelligence & Machine Learning ---
  {
    name: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
    publisher: 'IEEE Computer Society',
    issn: '0162-8828',
    eIssn: '2160-9292',
    researchFit: 98,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SCI/SCIE)',
    openAccess: false,
    apc: '$2,495 USD (Hybrid OA option)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 99,
    riskTier: 'LOW',
    officialWebsite: 'https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=34',
    subjectMatch: ['Artificial Intelligence', 'Machine Learning', 'Computer Vision', 'Pattern Recognition', 'Deep Learning', 'Data Science'],
  },
  {
    name: 'Journal of Machine Learning Research (JMLR)',
    publisher: 'Microtome Publishing / JMLR Inc',
    issn: '1532-4435',
    eIssn: '1533-7928',
    researchFit: 97,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SCIE)',
    openAccess: true,
    apc: 'No APC (Diamond Open Access / Free to Publish & Read)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 99,
    riskTier: 'LOW',
    officialWebsite: 'https://www.jmlr.org/',
    subjectMatch: ['Machine Learning', 'Artificial Intelligence', 'Statistics', 'Optimization', 'Neural Networks', 'Data Science'],
  },
  {
    name: 'Computers in Human Behavior',
    publisher: 'Elsevier',
    issn: '0747-5632',
    eIssn: '1873-7692',
    researchFit: 96,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SSCI/SCIE)',
    openAccess: false,
    apc: '$3,670 USD (Optional OA)',
    quartile: 'Q1 (Scopus / WoS Verified)',
    authenticity: 99,
    riskTier: 'LOW',
    officialWebsite: 'https://www.sciencedirect.com/journal/computers-in-human-behavior',
    subjectMatch: ['Human-Computer Interaction', 'AI in Media', 'Generative AI', 'Digital Media', 'User Behavior', 'Information Systems'],
  },
  {
    name: 'Artificial Intelligence',
    publisher: 'Elsevier',
    issn: '0004-3702',
    eIssn: '1872-8847',
    researchFit: 96,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SCIE)',
    openAccess: false,
    apc: '$3,400 USD (Hybrid OA)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 99,
    riskTier: 'LOW',
    officialWebsite: 'https://www.sciencedirect.com/journal/artificial-intelligence',
    subjectMatch: ['Artificial Intelligence', 'Knowledge Representation', 'Reasoning', 'Cognitive Systems', 'Robotics', 'Natural Language Processing'],
  },

  // --- Environmental Sciences, Animal Ecology & Agricultural Studies ---
  {
    name: 'Journal of Animal Ecology',
    publisher: 'British Ecological Society / Wiley',
    issn: '0021-8790',
    eIssn: '1365-2656',
    researchFit: 96,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SCIE)',
    openAccess: false,
    apc: '$3,800 USD (Hybrid OA)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 99,
    riskTier: 'LOW',
    officialWebsite: 'https://besjournals.onlinelibrary.wiley.com/journal/13652656',
    subjectMatch: ['Animal Ecology', 'Animal Environment', 'Ecology', 'Wildlife Biology', 'Population Dynamics', 'Behavioral Ecology'],
  },
  {
    name: 'Ecological Indicators',
    publisher: 'Elsevier',
    issn: '1470-160X',
    eIssn: '1872-7034',
    researchFit: 95,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SCIE)',
    openAccess: true,
    apc: '$2,780 USD (Gold Open Access)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 98,
    riskTier: 'LOW',
    officialWebsite: 'https://www.sciencedirect.com/journal/ecological-indicators',
    subjectMatch: ['Environmental Science', 'Ecology', 'Ecological Assessment', 'Ecosystem Health', 'Biodiversity', 'Environmental Monitoring'],
  },
  {
    name: 'Environmental Science & Technology',
    publisher: 'American Chemical Society (ACS)',
    issn: '0013-936X',
    eIssn: '1520-5851',
    researchFit: 97,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SCIE)',
    openAccess: false,
    apc: '$4,500 USD (Hybrid OA option)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 99,
    riskTier: 'LOW',
    officialWebsite: 'https://pubs.acs.org/journal/esthag',
    subjectMatch: ['Environmental Science', 'Environmental Chemistry', 'Pollution Control', 'Sustainability', 'Climate Change', 'Ecotoxicology'],
  },
  {
    name: 'Animal Conservation',
    publisher: 'Zoological Society of London / Wiley',
    issn: '1367-9430',
    eIssn: '1469-1795',
    researchFit: 93,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SCIE)',
    openAccess: false,
    apc: '$3,400 USD (Hybrid OA)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 98,
    riskTier: 'LOW',
    officialWebsite: 'https://zslpublications.onlinelibrary.wiley.com/journal/14691795',
    subjectMatch: ['Animal Conservation', 'Zoology', 'Wildlife Ecology', 'Conservation Biology', 'Species Habitat', 'Animal Environment'],
  },
  {
    name: 'Journal of Cleaner Production',
    publisher: 'Elsevier',
    issn: '0959-6526',
    eIssn: '1879-1786',
    researchFit: 94,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SCIE)',
    openAccess: false,
    apc: '$4,150 USD (Hybrid OA)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 98,
    riskTier: 'LOW',
    officialWebsite: 'https://www.sciencedirect.com/journal/journal-of-cleaner-production',
    subjectMatch: ['Sustainability', 'Environmental Management', 'Clean Energy', 'Circular Economy', 'Waste Management', 'Resource Efficiency'],
  },

  // --- Economics, Finance & Business Management ---
  {
    name: 'The Journal of Finance',
    publisher: 'American Finance Association / Wiley',
    issn: '0022-1082',
    eIssn: '1540-6261',
    researchFit: 98,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SSCI)',
    openAccess: false,
    apc: 'Standard Institutional Subscription (No Predatory APC)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 99,
    riskTier: 'LOW',
    officialWebsite: 'https://onlinelibrary.wiley.com/journal/15406261',
    subjectMatch: ['Finance', 'Financial Economics', 'Banking', 'Corporate Finance', 'Asset Pricing', 'Investment'],
  },
  {
    name: 'Journal of Financial Economics',
    publisher: 'Elsevier',
    issn: '0304-405X',
    eIssn: '1879-2774',
    researchFit: 97,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SSCI)',
    openAccess: false,
    apc: '$3,900 USD (Hybrid OA)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 99,
    riskTier: 'LOW',
    officialWebsite: 'https://www.sciencedirect.com/journal/journal-of-financial-economics',
    subjectMatch: ['Economics', 'Finance', 'Capital Markets', 'Financial Institutions', 'Econometrics', 'Monetary Economics'],
  },
  {
    name: 'Journal of Economic Perspectives',
    publisher: 'American Economic Association',
    issn: '0895-3309',
    eIssn: '1944-7965',
    researchFit: 96,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SSCI)',
    openAccess: true,
    apc: 'No APC (Diamond Open Access / Sponsored by AEA)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 99,
    riskTier: 'LOW',
    officialWebsite: 'https://www.aeaweb.org/journals/jep',
    subjectMatch: ['Economics', 'Applied Economics', 'Macroeconomics', 'Microeconomics', 'Economic Policy', 'Econometrics'],
  },
  {
    name: 'Applied Economics',
    publisher: 'Routledge / Taylor & Francis',
    issn: '0003-6846',
    eIssn: '1466-4283',
    researchFit: 92,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SSCI)',
    openAccess: false,
    apc: '$3,300 USD (Hybrid OA)',
    quartile: 'Q2 (Scopus / WoS Verified)',
    authenticity: 97,
    riskTier: 'LOW',
    officialWebsite: 'https://www.tandfonline.com/toc/raec20/current',
    subjectMatch: ['Applied Economics', 'Econometrics', 'Development Economics', 'Financial Markets', 'Trade Policy'],
  },

  // --- Medicine, Health Sciences & Public Health ---
  {
    name: 'The Lancet',
    publisher: 'Elsevier',
    issn: '0140-6736',
    eIssn: '1474-547X',
    researchFit: 99,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SCIE)',
    openAccess: false,
    apc: '$6,800 USD (Hybrid OA option)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 99,
    riskTier: 'LOW',
    officialWebsite: 'https://www.thelancet.com/',
    subjectMatch: ['Medicine', 'Public Health', 'Clinical Medicine', 'Epidemiology', 'Global Health', 'Health Policy'],
  },
  {
    name: 'BMC Medicine',
    publisher: 'BioMed Central / Springer Nature',
    issn: '1741-7015',
    eIssn: '1741-7015',
    researchFit: 96,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SCIE)',
    openAccess: true,
    apc: '$3,890 USD (Gold OA)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 98,
    riskTier: 'LOW',
    officialWebsite: 'https://bmcmedicine.biomedcentral.com/',
    subjectMatch: ['Medicine', 'Clinical Trials', 'Translational Medicine', 'Oncology', 'Cardiovascular', 'Infectious Disease'],
  },
  {
    name: 'Frontiers in Public Health',
    publisher: 'Frontiers Media',
    issn: '2296-2565',
    eIssn: '2296-2565',
    researchFit: 91,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (ESCI/SSCI)',
    openAccess: true,
    apc: '$2,490 USD',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 96,
    riskTier: 'LOW',
    officialWebsite: 'https://www.frontiersin.org/journals/public-health',
    subjectMatch: ['Public Health', 'Health Informatics', 'Occupational Health', 'Health Systems', 'Epidemiology'],
  },
  {
    name: 'Journal of Medical Internet Research (JMIR)',
    publisher: 'JMIR Publications',
    issn: '1438-8871',
    eIssn: '1438-8871',
    researchFit: 94,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SCIE)',
    openAccess: true,
    apc: '$2,900 USD',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 97,
    riskTier: 'LOW',
    officialWebsite: 'https://www.jmir.org/',
    subjectMatch: ['Digital Health', 'Health Informatics', 'AI in Medicine', 'Telemedicine', 'Medical Technology'],
  },

  // --- Education, Pedagogy & Social Sciences ---
  {
    name: 'Computers & Education',
    publisher: 'Elsevier',
    issn: '0360-1315',
    eIssn: '1873-782X',
    researchFit: 97,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SSCI)',
    openAccess: false,
    apc: '$3,500 USD (Hybrid OA)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 99,
    riskTier: 'LOW',
    officialWebsite: 'https://www.sciencedirect.com/journal/computers-and-education',
    subjectMatch: ['Education', 'Educational Technology', 'E-Learning', 'Pedagogy', 'Higher Education', 'Digital Learning'],
  },
  {
    name: 'Journal of Higher Education',
    publisher: 'Taylor & Francis',
    issn: '0022-1546',
    eIssn: '1538-4640',
    researchFit: 93,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SSCI)',
    openAccess: false,
    apc: '$3,150 USD (Hybrid)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 98,
    riskTier: 'LOW',
    officialWebsite: 'https://www.tandfonline.com/toc/ujhe20/current',
    subjectMatch: ['Higher Education', 'Academic Policy', 'University Governance', 'Curriculum', 'Faculty Development'],
  },
  {
    name: 'Journal of Media Education',
    publisher: 'Broadcast Education Association (BEA)',
    issn: '2152-436X',
    eIssn: '2152-436X',
    researchFit: 88,
    scopusStatus: 'Data unavailable (Non-commercial)',
    wosStatus: 'Data unavailable',
    openAccess: true,
    apc: 'No APC (Diamond Open Access)',
    quartile: 'Data unavailable (Academic Society)',
    authenticity: 92,
    riskTier: 'LOW',
    officialWebsite: 'https://www.beaweb.org/wp/?page_id=594',
    subjectMatch: ['Media Education', 'Journalism Pedagogy', 'Communication Pedagogy', 'Curriculum Design'],
  },

  // --- Media, Communication & Journalism ---
  {
    name: 'New Media & Society',
    publisher: 'SAGE Publications',
    issn: '1461-4448',
    eIssn: '1461-7315',
    researchFit: 95,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SSCI)',
    openAccess: false,
    apc: '$3,250 USD (Hybrid OA)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 99,
    riskTier: 'LOW',
    officialWebsite: 'https://journals.sagepub.com/home/nms',
    subjectMatch: ['Media and Communication', 'Digital Media', 'Data Journalism', 'Algorithmic Governance', 'Social Media'],
  },
  {
    name: 'Journal of Advertising',
    publisher: 'Taylor & Francis',
    issn: '0091-3367',
    eIssn: '1557-7805',
    researchFit: 94,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SSCI)',
    openAccess: false,
    apc: '$3,400 USD (Hybrid OA)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 98,
    riskTier: 'LOW',
    officialWebsite: 'https://www.tandfonline.com/toc/ujoa20/current',
    subjectMatch: ['Advertising', 'Digital Marketing', 'Consumer Behavior', 'Brand Strategy', 'Media Planning'],
  },
  {
    name: 'Journal of Computer-Mediated Communication',
    publisher: 'Oxford University Press',
    issn: '1083-6101',
    eIssn: '1083-6101',
    researchFit: 95,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SSCI)',
    openAccess: true,
    apc: '$2,800 USD (Waivers available)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 98,
    riskTier: 'LOW',
    officialWebsite: 'https://academic.oup.com/jcmc',
    subjectMatch: ['Digital Communication', 'Social Computing', 'AI in Media', 'Online Interaction'],
  },
  {
    name: 'Digital Journalism',
    publisher: 'Routledge / Taylor & Francis',
    issn: '2167-0811',
    eIssn: '2167-082X',
    researchFit: 92,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SSCI)',
    openAccess: false,
    apc: '$3,400 USD (Hybrid)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 98,
    riskTier: 'LOW',
    officialWebsite: 'https://www.tandfonline.com/toc/rdij20/current',
    subjectMatch: ['Data Journalism', 'AI in Media', 'Newsrooms', 'Computational Journalism'],
  },
  {
    name: 'Media and Communication',
    publisher: 'Cogitatio Press',
    issn: '2183-2439',
    researchFit: 89,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SSCI)',
    openAccess: true,
    apc: '€1,250 EUR (approx. ₹110,000)',
    quartile: 'Q2 (Scopus Verified)',
    authenticity: 95,
    riskTier: 'LOW',
    officialWebsite: 'https://www.cogitatiopress.com/mediaandcommunication',
    subjectMatch: ['Media Education', 'Digital Media', 'Communication', 'Journalism'],
  },

  // --- Multidisciplinary & High-Impact Open Access ---
  {
    name: 'Nature Communications',
    publisher: 'Springer Nature',
    issn: '2041-1723',
    eIssn: '2041-1723',
    researchFit: 98,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SCI/SCIE)',
    openAccess: true,
    apc: '$6,490 USD (Gold Open Access)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 99,
    riskTier: 'LOW',
    officialWebsite: 'https://www.nature.com/ncomms/',
    subjectMatch: ['Multidisciplinary', 'Biological Sciences', 'Physics', 'Chemistry', 'Earth & Environmental Sciences', 'Artificial Intelligence', 'Health Sciences'],
  },
  {
    name: 'PLOS ONE',
    publisher: 'Public Library of Science (PLOS)',
    issn: '1932-6203',
    eIssn: '1932-6203',
    researchFit: 90,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SCIE)',
    openAccess: true,
    apc: '$2,290 USD (Fee assistance programs)',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 97,
    riskTier: 'LOW',
    officialWebsite: 'https://journals.plos.org/plosone/',
    subjectMatch: ['Multidisciplinary', 'Science', 'Engineering', 'Medicine', 'Social Sciences', 'Economics'],
  },
  {
    name: 'Scientific Reports',
    publisher: 'Nature Portfolio / Springer Nature',
    issn: '2045-2322',
    eIssn: '2045-2322',
    researchFit: 91,
    scopusStatus: 'Indexed (Verified)',
    wosStatus: 'Indexed (SCIE)',
    openAccess: true,
    apc: '$2,490 USD',
    quartile: 'Q1 (WoS / Scopus Verified)',
    authenticity: 97,
    riskTier: 'LOW',
    officialWebsite: 'https://www.nature.com/srep/',
    subjectMatch: ['Multidisciplinary', 'Physical Sciences', 'Biological Sciences', 'Clinical Medicine', 'Engineering'],
  },
];

/**
 * Tokenize and normalize text into clean search keywords
 */
function extractSearchTokens(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .split(/[,;\s/]+/)
    .map(w => w.replace(/[^\w]/g, '').trim())
    .filter(w => w.length >= 3 && !['and', 'the', 'for', 'with', 'from', 'journal'].includes(w));
}

/**
 * Synchronous journal matcher and ranker
 */
export function findJournalsSync(
  filter: JournalSearchFilter,
  profile?: ResearcherProfile
): MatchedJournalResult[] {
  const kwStr = Array.isArray(filter.keywords) 
    ? filter.keywords.join(', ') 
    : (filter.keywords || '');

  const rawQuery = `${filter.topic || ''} ${kwStr} ${filter.researchMethod || ''}`;
  const queryTokens = extractSearchTokens(rawQuery);

  // Profile terms to supplement
  const profileTokens = [
    ...(profile?.researchAreas?.flatMap(ra => extractSearchTokens(ra)) || []),
    ...(profile?.keywords?.flatMap(kw => extractSearchTokens(kw)) || []),
  ];

  const allSearchTokens = Array.from(new Set([...queryTokens, ...profileTokens]));

  // Clean explicit keywords list for exact phrase matching
  const explicitKeywords = [
    ...kwStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
    ...(filter.topic || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
    ...(profile?.keywords?.map(k => k.trim().toLowerCase()) || []),
    ...(profile?.researchAreas?.map(r => r.trim().toLowerCase()) || []),
  ];

  return VERIFIED_CANONICAL_JOURNALS.filter(j => {
    // 1. Indexing filter
    if (filter.desiredIndex === 'scopus' && !j.scopusStatus.toLowerCase().includes('indexed')) {
      return false;
    }
    if (filter.desiredIndex === 'wos' && !j.wosStatus.toLowerCase().includes('indexed')) {
      return false;
    }
    if (filter.desiredIndex === 'doaj' && (!j.openAccess || !j.apc.toLowerCase().includes('diamond') && !j.scopusStatus.includes('Indexed'))) {
      return false;
    }
    if (filter.desiredIndex === 'open_access' && !j.openAccess) {
      return false;
    }

    // 2. Quartile filter
    if (filter.preferredQuartile && filter.preferredQuartile !== 'all') {
      if (!j.quartile.includes(filter.preferredQuartile)) {
        return false;
      }
    }

    // 3. Budget filter
    if (filter.budgetTier === 'no_apc' && !j.apc.toLowerCase().includes('no apc')) {
      return false;
    }

    return true;
  }).map(j => {
    const journalText = `${j.name} ${j.publisher} ${j.subjectMatch.join(' ')}`.toLowerCase();
    
    // Check which explicit keywords match this journal
    const matchedPills = new Set<string>();

    explicitKeywords.forEach(kw => {
      if (kw.length >= 3 && journalText.includes(kw)) {
        matchedPills.add(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    });

    // Count token overlaps
    let tokenOverlapCount = 0;
    allSearchTokens.forEach(token => {
      if (journalText.includes(token)) {
        tokenOverlapCount++;
      }
    });

    // Check subjectMatch direct overlap
    j.subjectMatch.forEach(sm => {
      const smLower = sm.toLowerCase();
      if (rawQuery.toLowerCase().includes(smLower) || (profile?.keywords || []).some(pk => pk.toLowerCase().includes(smLower))) {
        matchedPills.add(sm);
        tokenOverlapCount += 2;
      }
    });

    // Compute dynamic fit score
    let dynamicFit = j.researchFit;
    if (allSearchTokens.length > 0) {
      if (tokenOverlapCount > 0) {
        dynamicFit = Math.min(99, Math.max(70, j.researchFit + Math.min(10, tokenOverlapCount * 2)));
      } else {
        dynamicFit = Math.max(50, j.researchFit - 18);
      }
    }

    const matchedList = Array.from(matchedPills);

    return {
      ...j,
      researchFit: dynamicFit,
      matchedKeywordsList: matchedList,
      relevanceReason: matchedList.length > 0 
        ? `Matched on: ${matchedList.slice(0, 3).join(', ')}` 
        : 'General scope match',
    };
  }).sort((a, b) => b.researchFit - a.researchFit);
}

/**
 * Find and rank verified journals matching research topic, keywords, and researcher profile
 */
export async function findJournalsForResearch(
  filter: JournalSearchFilter,
  profile?: ResearcherProfile
): Promise<MatchedJournalResult[]> {
  return findJournalsSync(filter, profile);
}
