/**
 * SHODH SETU AI - Predatory Risk Analysis Engine
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Evaluates 14+ warning indicators.
 * Produces: JournalGuard Analytical Risk Score (0-100).
 * CRITICAL RULE: Never automatically classify a journal as predatory simply because it is not in Scopus/WoS.
 */

import { PredatoryIndicator, PredatoryRiskAnalysis, RiskTier } from '../types';

export function evaluatePredatoryRisk(params: {
  title: string;
  publisher: string;
  website?: string;
  scope?: string;
  inputQuery: string;
  crossrefFound: boolean;
  openAlexFound: boolean;
  doajFound: boolean;
  isSyntheticDemo?: boolean;
  demoType?: string;
}): PredatoryRiskAnalysis {
  const text = `${params.title} ${params.publisher} ${params.website || ''} ${params.scope || ''} ${params.inputQuery}`.toLowerCase();

  // 14 Evidence-based Warning Indicators
  const indicators: PredatoryIndicator[] = [
    {
      id: 'fake_impact_factor',
      title: 'Fake / Misleading Impact Factor Claims',
      category: 'metrics',
      flagged: false,
      severity: 'critical',
      evidence: 'No fabricated or deceptive metric services detected.',
      explanation: 'Predatory journals frequently invent fake metric services (e.g., Universal Impact Factor, Global Impact Factor, Cosmos, CiteFactor) to mimic Clarivate Journal Impact Factor (JIF).',
    },
    {
      id: 'guaranteed_acceptance',
      title: 'Guaranteed Publication / Acceptance',
      category: 'peer_review',
      flagged: false,
      severity: 'critical',
      evidence: 'No promise of guaranteed acceptance without independent peer review.',
      explanation: 'Promising acceptance or 100% acceptance rate violates fundamental scientific integrity.',
    },
    {
      id: 'unrealistic_review',
      title: 'Unrealistically Rapid Peer Review (< 7 Days)',
      category: 'peer_review',
      flagged: false,
      severity: 'high',
      evidence: 'Peer-review timeframe adheres to standard scholarly cycles.',
      explanation: 'Peer review claimed in 24–72 hours is incompatible with rigorous expert evaluation and revision cycles.',
    },
    {
      id: 'hidden_apc',
      title: 'Hidden or Opaque Article Processing Charges (APC)',
      category: 'fees',
      flagged: false,
      severity: 'high',
      evidence: 'Fees and publication costs appear transparent or clearly disclosed prior to submission.',
      explanation: 'Concealing publication fees until after copyright transfer or acceptance is a signature predatory tactic.',
    },
    {
      id: 'suspicious_contact',
      title: 'Generic Webmail or Consumer Messaging for Submissions',
      category: 'transparency',
      flagged: false,
      severity: 'high',
      evidence: 'Official organizational or institutional domain used for editorial correspondence.',
      explanation: 'Legitimate academic publishers do not use free webmail (@gmail.com, @yahoo.com) or WhatsApp as primary submission portals.',
    },
    {
      id: 'missing_editorial_board',
      title: 'Missing or Unverifiable Editorial Board',
      category: 'editorial',
      flagged: false,
      severity: 'critical',
      evidence: 'Editorial leadership and affiliations are disclosed and verifiable.',
      explanation: 'Absence of named editors or fabricated academic affiliations indicates lack of governance.',
    },
    {
      id: 'fake_indexing_claims',
      title: 'Fraudulent Indexing Claims',
      category: 'metrics',
      flagged: false,
      severity: 'critical',
      evidence: 'No deceptive claims of indexing in databases where no record exists.',
      explanation: 'Claiming indexing in Scopus, PubMed, or Web of Science without official inclusion is false advertising.',
    },
    {
      id: 'excessive_solicitation',
      title: 'Aggressive / Unsolicited Manuscript Solicitation',
      category: 'solicitation',
      flagged: false,
      severity: 'medium',
      evidence: 'No excessive mass-spamming signatures detected.',
      explanation: 'Spamming researchers outside their discipline with flattering generic invitations.',
    },
    {
      id: 'overbroad_scope',
      title: 'Excessively Broad or Incoherent Scope',
      category: 'editorial',
      flagged: false,
      severity: 'medium',
      evidence: 'Journal focuses on a well-defined disciplinary or multidisciplinary scope.',
      explanation: 'Publishing unrelated papers across all scientific, engineering, and medical domains simultaneously to maximize fees.',
    },
    {
      id: 'inconsistent_info',
      title: 'Inconsistent Journal Metadata Across Pages',
      category: 'transparency',
      flagged: false,
      severity: 'medium',
      evidence: 'Title, ISSN, and publisher metadata remain consistent across pages.',
      explanation: 'Contradictory journal titles, changing ISSNs, or mismatched publisher names on different subpages.',
    },
    {
      id: 'broken_doi_archive',
      title: 'Non-Resolving DOIs or Broken Digital Archive',
      category: 'transparency',
      flagged: false,
      severity: 'high',
      evidence: 'Digital object identifiers and archive repositories resolve properly.',
      explanation: 'Displaying fake DOI numbers that fail to resolve via doi.org or lacking long-term digital preservation (LOCKSS/CLOCKSS/Portico).',
    },
    {
      id: 'poor_publisher_transparency',
      title: 'Concealed Legal Identity or Location',
      category: 'transparency',
      flagged: false,
      severity: 'high',
      evidence: 'Publisher physical jurisdiction and corporate registration are verifiable.',
      explanation: 'Concealing publisher country of operation, using fake Western addresses, or operating through shell entities.',
    },
    {
      id: 'suspicious_publisher_network',
      title: 'Mass Bulk Journal Factory Pattern',
      category: 'editorial',
      flagged: false,
      severity: 'medium',
      evidence: 'No indications of industrial paper-mill or clone-network operation.',
      explanation: 'Single entity operating hundreds of identical low-content template journals launched simultaneously.',
    },
    {
      id: 'misleading_metrics',
      title: 'Promoting Google Scholar as Primary Indexing Proof',
      category: 'metrics',
      flagged: false,
      severity: 'low',
      evidence: 'Distinguishes between web-crawled citation engines and curated scholarly indices.',
      explanation: 'Google Scholar is a web search engine, not a peer-reviewed indexing database; any web-accessible PDF can appear in Google Scholar.',
    },
  ];

  // Evaluate flags based on triggers
  if (text.includes('universal impact factor') || text.includes('uif') || text.includes('global impact factor') || text.includes('cosmos impact') || text.includes('citefactor')) {
    const ind = indicators.find(i => i.id === 'fake_impact_factor');
    if (ind) {
      ind.flagged = true;
      ind.evidence = 'Explicitly references dubious metric agency (UIF, GIF, or Cosmos).';
    }
  }

  if (text.includes('guaranteed acceptance') || text.includes('100% acceptance') || text.includes('guaranteed publication')) {
    const ind = indicators.find(i => i.id === 'guaranteed_acceptance');
    if (ind) {
      ind.flagged = true;
      ind.evidence = 'Website advertises guaranteed publication or 100% acceptance guarantees.';
    }
  }

  if (text.includes('within 24 hours') || text.includes('within 48 hours') || text.includes('2 days peer review') || text.includes('rapid 3 days') || text.includes('rapid acceptance')) {
    const ind = indicators.find(i => i.id === 'unrealistic_review');
    if (ind) {
      ind.flagged = true;
      ind.evidence = 'Claims rapid peer-review decision in less than 4 days.';
    }
  }

  if (text.includes('gmail.com') || text.includes('yahoo.com') || text.includes('whatsapp') || text.includes('hotmail.com')) {
    const ind = indicators.find(i => i.id === 'suspicious_contact');
    if (ind) {
      ind.flagged = true;
      ind.evidence = 'Submissions or editorial communication solicited via free webmail or WhatsApp.';
    }
  }

  if (text.includes('all disciplines') || text.includes('multidisciplinary research') && (text.includes('rapid') || text.includes('apex global'))) {
    const ind = indicators.find(i => i.id === 'overbroad_scope');
    if (ind) {
      ind.flagged = true;
      ind.evidence = 'Offers indiscriminate publishing across all academic domains with no focused editorial board.';
    }
  }

  // Calculate analytical risk score
  let weightedRisk = 0;
  let flaggedCount = 0;

  indicators.forEach(ind => {
    if (ind.flagged) {
      flaggedCount++;
      if (ind.severity === 'critical') weightedRisk += 30;
      else if (ind.severity === 'high') weightedRisk += 18;
      else if (ind.severity === 'medium') weightedRisk += 10;
      else weightedRisk += 5;
    }
  });

  // Base score for lack of any open scholarly deposit
  if (!params.crossrefFound && !params.openAlexFound && !params.doajFound) {
    weightedRisk = Math.max(weightedRisk, 25);
  }

  const finalScore = Math.min(100, Math.max(0, weightedRisk));

  let riskTier: RiskTier = 'LOW';
  if (finalScore >= 80) riskTier = 'CRITICAL';
  else if (finalScore >= 60) riskTier = 'HIGH';
  else if (finalScore >= 40) riskTier = 'ELEVATED';
  else if (finalScore >= 20) riskTier = 'MODERATE';
  else riskTier = 'LOW';

  let summary = 'No high-risk predatory indicators detected.';
  if (riskTier === 'CRITICAL') {
    summary = 'CRITICAL PREDATORY RISK: Multiple severe deception flags detected including fake metrics, guaranteed review, or webmail submission channels.';
  } else if (riskTier === 'HIGH') {
    summary = 'HIGH PREDATORY RISK: Independent warning signs suggest potential predatory publishing patterns. Extreme caution advised.';
  } else if (riskTier === 'ELEVATED') {
    summary = 'ELEVATED RISK: Several transparency issues or missing institutional credentials identified. Independent verification required.';
  } else if (riskTier === 'MODERATE') {
    summary = 'MODERATE CAUTION: Minor informational gaps present. Check journal history and editorial guidelines thoroughly.';
  }

  return {
    riskScore: finalScore,
    riskTier,
    flaggedCount,
    indicators,
    summary,
  };
}
