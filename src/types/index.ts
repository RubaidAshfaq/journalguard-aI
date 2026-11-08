/**
 * SHODH SETU AI - Core Type Definitions
 * Concept & Academic Direction: Dr. Rubaid Ashfaq
 */

export type VerificationStatus = 
  | 'VERIFIED'
  | 'FOUND'
  | 'NOT_FOUND'
  | 'NOT_VERIFIED'
  | 'UNAVAILABLE'
  | 'HIGH_RISK';

export type RiskTier = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export interface ResearcherProfile {
  fullName: string;
  designation: string;
  institution: string;
  department: string;
  researchAreas: string[];
  keywords: string[];
  orcid: string;
  googleScholarUrl: string;
  researchGateUrl: string;
  scopusAuthorId: string;
  wosResearcherId: string;
  email: string;
  country: string;
  avatarUrl?: string;
  publicationGoals?: string;
}

export interface DataSourceResult {
  source: 'crossref' | 'openalex' | 'doaj' | 'scopus' | 'wos' | 'issn_portal';
  displayName: string;
  status: VerificationStatus;
  statusLabel: string;
  details?: string;
  data?: Record<string, any>;
  lastChecked: string;
  latencyMs?: number;
}

export interface PredatoryIndicator {
  id: string;
  title: string;
  category: 'metrics' | 'peer_review' | 'fees' | 'editorial' | 'transparency' | 'solicitation';
  flagged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string;
  explanation: string;
}

export interface PredatoryRiskAnalysis {
  riskScore: number; // 0 - 100
  riskTier: RiskTier;
  flaggedCount: number;
  indicators: PredatoryIndicator[];
  summary: string;
}

export interface CloneMismatchItem {
  field: string;
  label: string;
  submittedValue: string;
  verifiedValue: string;
  matched: boolean;
  riskNote?: string;
}

export interface DomainComparisonResult {
  hasMismatch: boolean;
  matchType: 
    | 'EXACT_MATCH'
    | 'CANONICAL_SUBDOMAIN'
    | 'AUTHORIZED_PUBLISHER_PLATFORM'
    | 'SUSPICIOUS_LOOKALIKE'
    | 'CONFIRMED_HIJACKED_DOMAIN'
    | 'UNAUTHORIZED_DOMAIN_MISMATCH'
    | 'NO_AUTHORITATIVE_DATA';
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  submittedUrl: string;
  submittedHost: string;
  submittedRootDomain: string;
  expectedDomains: string[];
  primaryExpectedHost?: string;
  expectedPublisher?: string;
  similarityScore: number; // 0 to 1
  mismatchExplanation: string;
  warningTitle?: string;
  recommendation: string;
  technicalDetails: {
    isTldMismatch: boolean;
    hasOjsArtifacts: boolean;
    isLookalikeStem: boolean;
    suspiciousKeywordsFound: string[];
    authoritativeSourcesChecked: string[];
  };
}

export interface DomainMismatchAlert {
  id: string;
  title: string;
  message: string;
  submittedHostname: string;
  canonicalDomain: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
  timestamp: string;
}

export interface CloneGuardAssessment {
  isPossibleClone: boolean;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'NONE';
  hasDomainInconsistency: boolean;
  hasIssnMismatch: boolean;
  domainDetails?: {
    submittedHost: string;
    canonicalHost: string;
    isMatch: boolean;
    details: string;
  };
  domainComparison?: DomainComparisonResult;
  issnDetails?: {
    submittedIssn: string;
    canonicalTitle: string;
    canonicalPublisher: string;
    canonicalIssn: string;
    isMatch: boolean;
    isHijacked: boolean;
    details: string;
  };
  mismatches: CloneMismatchItem[];
  legitimateRecord?: {
    officialTitle: string;
    officialPublisher: string;
    officialWebsite: string;
    officialIssn: string;
    officialCountry: string;
    doiPrefix: string;
    evidenceSource: string;
  };
  warningMessage?: string;
}

export interface VerificationInputOptions {
  query: string;
  claimedIssn?: string;
  claimedUrl?: string;
  claimedTitle?: string;
  claimedPublisher?: string;
}

export interface AuthenticityScoreBreakdown {
  identityConsistency: number; // Max 20
  indexingEvidence: number;    // Max 20
  issnEvidence: number;        // Max 15
  publisherVerification: number; // Max 15
  websiteConsistency: number;  // Max 10
  editorialTransparency: number; // Max 10
  publicationTransparency: number; // Max 10
  total: number;               // Max 100
}

export interface ResearchFitScore {
  total: number; // 0 - 100
  tier: 'Excellent Match' | 'Strong Fit' | 'Moderate Fit' | 'Low Relevance';
  subjectFit: number;     // max 35
  scopeMatch: number;     // max 25
  indexingMatch: number;  // max 15
  publicationType: number;// max 10
  keywordScore: number;   // max 15
  matchingKeywords: string[];
  explanation: string;
}

export interface JournalRecord {
  id: string;
  title: string;
  issn: string;
  eIssn?: string;
  publisher: string;
  website: string;
  country: string;
  openAccess: boolean;
  apcVerified?: string;
  subjectAreas: string[];
  scopeDescription?: string;
  doiPrefix?: string;
  isSyntheticDemo?: boolean;
  demoType?: 'verified' | 'suspicious' | 'cloned' | 'non_indexed';
}

export interface VerificationResult {
  id: string;
  searchQuery: string;
  timestamp: string;
  journal: JournalRecord;
  authenticityScore: AuthenticityScoreBreakdown;
  riskAnalysis: PredatoryRiskAnalysis;
  cloneGuard: CloneGuardAssessment;
  researchFit: ResearchFitScore;
  sources: {
    issn: DataSourceResult;
    crossref: DataSourceResult;
    openalex: DataSourceResult;
    doaj: DataSourceResult;
    scopus: DataSourceResult;
    wos: DataSourceResult;
  };
  recommendation: {
    status: 'READY FOR FURTHER CONSIDERATION' | 'NEEDS VERIFICATION' | 'HIGH RISK — DO NOT SUBMIT UNTIL VERIFIED';
    summary: string;
    nextSteps: string[];
  };
  limitations: string;
  publicationBehaviour?: PublicationBehaviourAnalysis;
}

export interface SavedJournalEntry {
  id: string;
  journalName: string;
  publisher: string;
  issn: string;
  scopusStatus: VerificationStatus;
  wosStatus: VerificationStatus;
  doajStatus: VerificationStatus;
  authenticityScore: number;
  riskScore: number;
  riskTier: RiskTier;
  lastChecked: string;
  status: 'Saved' | 'Checked' | 'Recommended' | 'Rejected' | 'Watchlist';
  notes?: string;
  tags?: string[];
  isWatched?: boolean;
}

export interface RecommendedJournalItem {
  name: string;
  publisher: string;
  issn: string;
  eIssn?: string;
  researchFit: number;
  scopusStatus: string;
  wosStatus: string;
  openAccess: boolean;
  apc: string;
  quartile: string;
  authenticity: number;
  riskTier: RiskTier;
  officialWebsite: string;
  subjectMatch: string[];
}

export type EmailDispatchMethod = 'mailto' | 'gmail' | 'outlook' | 'clipboard';

export interface SentEditorAlertRecord {
  id: string;
  timestamp: string;
  journalTitle: string;
  issn: string;
  canonicalDomain: string;
  counterfeitHost: string;
  recipients: string[];
  subject: string;
  dispatchMethod: EmailDispatchMethod;
  riskTier: RiskTier;
  authenticityScore: number;
  senderName?: string;
}

export interface ForensicEmailAlertData {
  recipients: string;
  primaryRecipient: string;
  subject: string;
  body: string;
  cleanCanonicalHost: string;
  counterfeitHost: string;
  infringingUrl: string;
  summary: string;
}

export type DelistedIndexSource = 'Scopus' | 'Web of Science' | 'DOAJ' | 'UGC-CARE';

export interface DelistedJournal {
  id: string;
  title: string;
  issn: string;
  eIssn?: string;
  publisher: string;
  delistedFrom: DelistedIndexSource[];
  delistedYear: number;
  reason: string;
  category: 'peer_review_papermill' | 'citation_manipulation' | 'volume_relevance' | 'predatory_clone' | 'publication_malpractice';
  status: 'DELISTED' | 'DISCONTINUED' | 'SUPPRESSED' | 'ON_HOLD';
  lastKnownIndexedVolume?: string;
  sharedBy?: string;
  dateAdded: string;
  evidenceSource?: string;
  officialWebsite?: string;
  notes?: string;
}

export interface PlatformStats {
  visitors: number;
  journalsExamined: number;
  clonesTracked: number;
  delistedRecorded: number;
}

export type VolumeAnomalyTier = 
  | 'NORMAL' 
  | 'PUBLICATION_INCREASE'       // 🟡
  | 'SIGNIFICANT_GROWTH'          // 🟠
  | 'UNUSUAL_PATTERN'             // 🔴
  | 'MAJOR_VOLUME_ANOMALY';       // 🚨

export interface VolumeAnomalyExplanation {
  type: 'ISSUE_FREQUENCY' | 'PAPERS_PER_ISSUE' | 'ANNUAL_VOLUME' | 'SPECIAL_ISSUE_SURGE';
  title: string;
  description: string;
  historicalBaselineText: string;
  currentValueText: string;
  percentageChange: number;
}

export interface IssueArticleItem {
  id: string;
  title: string;
  url: string;
  type?: string; // e.g. "Research Article", "Review Article", "Original Article"
  doi?: string;
  authors?: string;
  pages?: string;
}

export interface IssueDrillDownItem {
  id?: string;
  volume?: string;
  issueNumber?: string;
  issueTitle: string;
  issueType: 'Regular' | 'Special' | 'Supplement';
  articlesCount: number;
  url: string;
  source: string; // e.g. "Issue page: https://aejournals.org/index.php/AEJ/issue/view/82"
  year: number;
  articles?: IssueArticleItem[];
}

export interface ArchiveAuditCoverage {
  archiveUrl: string;
  totalArchivePagesCrawled: number;
  issuesDetected: number;
  issuesProcessed: number;
  issuesFailed: number;
  totalArticlesCounted: number;
  duplicateArticlesFiltered: number;
  crawledAt: string;
  isRealTimeCrawl: boolean;
  statusMessage?: string;
}

export interface AnnualPublicationRecord {
  year: number;
  issues: number;
  papers: number;
  papersPerIssue: number;
  regularIssues: number;
  specialIssues: number;
  supplements: number;
  continuousPublication?: boolean;
  onlineFirstCount?: number;
  pctChangeFromPrevYear: number;
  status: 'Normal' | 'Moderate Increase' | 'Significant Increase' | 'Major Anomaly' | 'Decline';
  notes?: string;
  issueList?: IssueDrillDownItem[];
}

export interface PublicationBehaviourAnalysis {
  journalTitle: string;
  issn: string;
  publisher: string;
  archiveAudit?: ArchiveAuditCoverage;
  allIssuesList?: IssueDrillDownItem[];
  historicalBaseline: {
    baselineYears: string; // e.g. "2020 – 2024"
    avgIssuesPerYear: number;
    avgPapersPerIssue: number;
    avgPapersPerYear: number;
  };
  currentPeriod: {
    year: number;
    issues: number;
    papers: number;
    papersPerIssue: number;
    pctIncreaseIssues: number;
    pctIncreasePapersPerIssue: number;
    pctIncreaseTotalPapers: number;
  };
  anomalyTier: VolumeAnomalyTier;
  flagLabels: {
    severity: 'yellow' | 'orange' | 'red' | 'critical';
    label: string; // e.g. "🟡 Publication Increase", "🔴 Unusual Publication Pattern", etc.
  }[];
  explanations: VolumeAnomalyExplanation[];
  yearlyData: AnnualPublicationRecord[];
  summaryText: string;
  specialIssueBreakdown: {
    regularIssuesCount: number;
    specialIssuesCount: number;
    supplementsCount: number;
    specialIssuePercentage: number;
    hasHighSpecialIssueRatio: boolean;
  };
  delistedNotice?: {
    isDelisted: boolean;
    reason?: string;
    delistedFrom?: string[];
  };
}

// --- Call for Papers (CfP) Discovery & Authoritative Verification ---

export type CfpDeadlineStatus = 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'DATE_NOT_VERIFIED';

export interface CallForPaperItem {
  id: string;
  title: string;
  journalName: string;
  publisher: string;
  issn?: string;
  eIssn?: string;
  researchTopics: string[];
  submissionDeadline: string;
  deadlineStatus: CfpDeadlineStatus;
  daysRemaining?: number;
  publicationDate?: string;
  specialIssueTitle?: string;
  scopusStatus: 'SCOPUS_VERIFIED' | 'NOT_VERIFIED' | 'UNAVAILABLE';
  scopusDetails?: string;
  wosStatus: 'WOS_VERIFIED' | 'NOT_VERIFIED' | 'UNAVAILABLE';
  wosCollection?: 'SCIE' | 'SSCI' | 'AHCI' | 'ESCI';
  wosDetails?: string;
  originalCfpUrl: string; // Authenticated original publisher/journal URL
  officialJournalUrl?: string;
  sourceType: 'LEVEL_1_OFFICIAL_PUBLISHER' | 'LEVEL_2_SCHOLARLY_SOCIETY';
  verificationDate: string;
  matchScore: number; // 0 - 100
  matchedKeywords: string[];
  journalScopeMatch: 'High' | 'Moderate' | 'General';
  publicationArea: string;
  matchBreakdown: {
    topicMatchTier: 'Excellent Match' | 'Very Strong Match' | 'Strong Match' | 'Moderate Match' | 'Low Match';
    matchedTopics: string[];
    keywordsCountSummary: string; // e.g. "4/5 matched"
    journalScope: string;
    indexingSummary: string;
    publicationArea: string;
    overallScore: number;
  };
  isVerifiedCfp: boolean;
  guestEditors?: string;
}

export interface CfpSearchQuery {
  title?: string;
  abstract?: string;
  keywords: string;
  researchArea?: string;
  methodology?: string;
  discipline?: string;
  preferredJournal?: string;
  preferredPublisher?: string;
  scopusPreference?: boolean;
  wosPreference?: boolean;
  openAccessOnly?: boolean;
}

export interface CfpNotificationItem {
  id: string;
  cfpId: string;
  title: string;
  journalName: string;
  publisher: string;
  deadline: string;
  matchScore: number;
  matchedKeywords: string[];
  scopusStatus: string;
  wosStatus: string;
  originalCfpUrl: string;
  dateCreated: string;
  isRead: boolean;
}

export interface ApiDiagnostics {
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
}

// ==========================================
// RESEARCH INTELLIGENCE & VERIFIED DISCOVERY
// ==========================================

export type ResearchIntelligenceSubTab = 
  | 'dashboard' 
  | 'finder' 
  | 'scopus' 
  | 'wos' 
  | 'abdc' 
  | 'recommend'
  | 'ai-recommend' 
  | 'verify' 
  | 'authenticity'
  | 'compare' 
  | 'feed' 
  | 'alerts' 
  | 'admin';

export type AbdcRating = 'A*' | 'A' | 'B' | 'C' | 'Unranked' | 'None';
export type WosCoreCollectionType = 'SCIE' | 'SSCI' | 'AHCI' | 'ESCI' | 'None';
export type IntelligenceVerificationStatus = 
  | 'VERIFIED'           // 🟢 Verified
  | 'NEEDS_REVIEW'       // 🟡 Needs Review
  | 'HIGH_RISK'          // 🔴 High Risk
  | 'CLONED'             // ⚫ Potential Clone
  | 'UNVERIFIED'         // ❌ Unverified
  | 'verified'
  | 'needs_review'
  | 'high_risk'
  | 'cloned'
  | 'unverified';

export interface JournalChangeRecord {
  id: string;
  field: string;
  previousValue: string;
  newValue: string;
  dateChanged: string;
  source: string;
  verificationStatus: string;
  notes?: string;
}

export interface IntelligenceJournal {
  id: string;
  title: string;
  issn: string;
  eIssn?: string;
  publisher: string;
  country: string;
  website?: string;
  canonicalUrl?: string;
  subjectAreas: string[];
  discipline: string;
  aimsAndScope?: string;
  
  // Scopus data
  scopusIndexed: boolean;
  scopusQuartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  scopusCiteScore?: number;
  scopusSnip?: string;
  scopusSjr?: string;
  scopusDetails?: {
    status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
    coverage: string;
    citeScore?: number;
    quartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    sourceId?: string;
    sourceType?: string;
  };
  
  // Web of Science data
  wosIndexed: boolean;
  wosCoreCollection?: WosCoreCollectionType;
  wosImpactFactor?: string;
  wosJci?: string;
  wosDetails?: {
    collection: WosCoreCollectionType;
    category?: string;
    impactFactor?: string;
  };

  // ABDC data
  abdcRanked?: boolean;
  abdcRating?: AbdcRating;
  abdcPanel?: string;
  abdcForCode?: string;
  abdcDetails?: {
    rating: AbdcRating;
    forCode?: string;
    panel?: string;
    yearEstablished?: number;
  };

  // DOAJ / Open Access
  openAccess?: boolean;
  openAccessType?: 'Diamond' | 'Gold' | 'Hybrid' | 'Subscription' | string;
  doajIndexed?: boolean;
  apcAmount?: string;
  publicationFrequency?: string;
  peerReviewType?: string;
  firstDecisionWeeks?: number;
  submissionToPublicationWeeks?: number;
  acceptanceRatePercent?: number;

  // Authenticity & Verification
  verificationStatus: IntelligenceVerificationStatus;
  riskScore?: number; // 0-100
  riskTier?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskWarningSignals?: string[];
  isClonedRisk?: boolean;
  clonedEvidence?: {
    canonicalDomain: string;
    counterfeitHost?: string;
    reason: string;
  };
  lastVerified?: string;
  lastVerifiedDate?: string;
  nextVerification?: string;
  nextVerificationDate?: string;
  sourceAttribution?: string[];
  changeHistory?: JournalChangeRecord[];
}

export interface EcosystemStats {
  totalRegisteredResearchers: number;
  activeResearchersThisMonth: number;
  totalCountries: number;
  countriesBreakdown: { country: string; code: string; count: number; region: string }[];
  regionsBreakdown: { region: string; count: number }[];
  institutionsBreakdown: { institution: string; country: string; count: number }[];
  careerStagesBreakdown: { stage: string; count: number }[];
  popularResearchAreas: { area: string; count: number }[];
  mostSearchedKeywords: { keyword: string; searches: number; trend: string }[];
  mostFollowedJournals: { journal: string; followers: number; publisher: string }[];
  mostSearchedPublishers: { publisher: string; count: number }[];
  trendingTopics: string[];
  recentJournalUpdates: { journalTitle: string; change: string; date: string; type: 'indexing' | 'abdc' | 'verification' }[];
}

export interface IntelligenceAlert {
  id: string;
  type: 'info' | 'action_required' | 'critical';
  priority?: 'info' | 'action_required' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  journalName?: string;
  journalTitle?: string;
  issn?: string;
  read: boolean;
  actionLabel?: string;
  actionTarget?: string;
}

export interface AiRecommendationInput {
  title: string;
  abstract: string;
  keywords: string;
  methodology: string;
  discipline: string;
  targetAudience: string;
  preferredIndexing: 'all' | 'scopus' | 'wos' | 'abdc' | 'open_access';
  budgetTier: 'all' | 'no_apc' | 'under_25k' | 'above_25k';
  openAccessOnly: boolean;
}

export interface AiJournalRecommendationResult {
  journal: IntelligenceJournal;
  matchScore: number;
  scoreBreakdown: {
    scopeMatch: number;
    keywordMatch: number;
    subjectAreaMatch: number;
    recentPubRelevance: number;
    indexingPreference: number;
  };
  whyThisJournal: string[];
  suitabilityVerdict: string;
}


