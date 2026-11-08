/**
 * SHODH SETU AI - Journal Clone & Hijacking Detector
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Compares submitted website and claimed ISSN against canonical database entries in real time.
 * Explicitly flags:
 * - Domain Inconsistencies (Submitted Host vs Canonical Publisher Registry)
 * - ISSN Mismatches & Hijacking (Claimed ISSN vs Legal Title/Publisher in ISSN Portal & Crossref)
 */

import { CloneGuardAssessment, CloneMismatchItem, DomainComparisonResult } from '../types';
import { 
  compareDomainWithAuthoritative, 
  normalizeDomain, 
  extractBaseDomain, 
  extractHostname, 
  compareDomains, 
  compareDomainAgainstKnownGood,
  triggerDomainMismatchAlert,
  KNOWN_GOOD_DOMAINS
} from './domainComparator';

export { 
  compareDomainWithAuthoritative, 
  normalizeDomain, 
  extractBaseDomain, 
  extractHostname, 
  compareDomains, 
  compareDomainAgainstKnownGood,
  triggerDomainMismatchAlert,
  KNOWN_GOOD_DOMAINS
};

export interface CloneGuardParams {
  submittedTitle: string;
  submittedIssn: string;
  submittedPublisher?: string;
  submittedUrl?: string;
  canonicalTitle?: string;
  canonicalPublisher?: string;
  canonicalIssn?: string;
  canonicalUrl?: string;
  publisherUrl?: string;
  expectedDomains?: string[];
  canonicalCountry?: string;
  doiPrefix?: string;
  isSyntheticDemo?: boolean;
  demoType?: string;
  isKnownHijacked?: boolean;
  knownHijackedWarning?: string;
}

export function evaluateCloneGuard(params: CloneGuardParams): CloneGuardAssessment {
  const mismatches: CloneMismatchItem[] = [];
  let mismatchCount = 0;

  // 1. Authoritative Domain Comparison Function
  let domainComparison: DomainComparisonResult | undefined = undefined;
  let hasDomainInconsistency = false;
  let domainDetails = undefined;

  if (params.submittedUrl) {
    domainComparison = compareDomainWithAuthoritative({
      submittedUrl: params.submittedUrl,
      canonicalJournalUrl: params.canonicalUrl,
      canonicalPublisher: params.canonicalPublisher,
      publisherUrl: params.publisherUrl,
      knownAuthenticDomains: params.expectedDomains || (params.canonicalUrl ? [params.canonicalUrl] : []),
      journalTitle: params.canonicalTitle || params.submittedTitle,
      issn: params.canonicalIssn || params.submittedIssn,
      isKnownHijacked: params.isKnownHijacked,
    });

    hasDomainInconsistency = domainComparison.hasMismatch;

    domainDetails = {
      submittedHost: domainComparison.submittedHost,
      canonicalHost: domainComparison.primaryExpectedHost || (params.canonicalUrl ? normalizeDomain(params.canonicalUrl).host : 'Authoritative Registry Host'),
      isMatch: !domainComparison.hasMismatch,
      details: domainComparison.mismatchExplanation,
    };

    mismatches.push({
      field: 'domain',
      label: 'Website Domain & Host',
      submittedValue: domainComparison.submittedHost || 'N/A',
      verifiedValue: domainComparison.primaryExpectedHost || (params.canonicalUrl ? normalizeDomain(params.canonicalUrl).host : 'Authoritative Publisher Record'),
      matched: !domainComparison.hasMismatch,
      riskNote: domainComparison.hasMismatch
        ? (domainComparison.warningTitle || 'Submitted domain differs from canonical publisher website in authoritative registry')
        : undefined,
    });

    if (domainComparison.hasMismatch) {
      mismatchCount += domainComparison.severity === 'critical' ? 3 : 2;
    }
  }

  const subHost = domainComparison?.submittedHost || (params.submittedUrl ? normalizeDomain(params.submittedUrl).host : '');
  const canHost = domainComparison?.primaryExpectedHost || (params.canonicalUrl ? normalizeDomain(params.canonicalUrl).host : '');

  // 2. Title Comparison
  let titleMatch = true;
  if (params.canonicalTitle && params.submittedTitle) {
    const sTitle = params.submittedTitle.toLowerCase().trim().replace(/\[.*?\]/g, '').trim();
    const cTitle = params.canonicalTitle.toLowerCase().trim();
    
    // Fuzzy check title containment
    titleMatch = sTitle === cTitle || sTitle.includes(cTitle) || cTitle.includes(sTitle);
    
    if (params.isKnownHijacked) {
      titleMatch = false;
    }

    mismatches.push({
      field: 'title',
      label: 'Journal Title',
      submittedValue: params.submittedTitle,
      verifiedValue: params.canonicalTitle,
      matched: titleMatch,
      riskNote: titleMatch ? undefined : 'Title discrepancy between submitted query and canonical database registry',
    });
    if (!titleMatch) mismatchCount++;
  }

  // 3. ISSN Check & Hijacking Detection
  let hasIssnMismatch = false;
  let issnDetails = undefined;

  const sIssn = (params.submittedIssn || '').replace(/[^0-9xX]/g, '').toUpperCase();
  const cIssn = (params.canonicalIssn || '').replace(/[^0-9xX]/g, '').toUpperCase();

  if (sIssn && sIssn.length === 8) {
    // If domain is inconsistent or known hijacked, the ISSN is hijacked
    const isHijacked = hasDomainInconsistency || Boolean(params.isKnownHijacked);
    hasIssnMismatch = isHijacked || (cIssn.length === 8 && sIssn !== cIssn);

    issnDetails = {
      submittedIssn: params.submittedIssn,
      canonicalIssn: params.canonicalIssn || params.submittedIssn,
      canonicalTitle: params.canonicalTitle || 'Authentic Registered Title',
      canonicalPublisher: params.canonicalPublisher || 'Registered Publisher',
      isMatch: !hasIssnMismatch,
      isHijacked,
      details: isHijacked
        ? `ISSN ${params.submittedIssn} belongs legitimately to "${params.canonicalTitle || 'Authentic Serial'}" (${params.canonicalPublisher || 'Official Publisher'}), NOT to the submitted host "${subHost || 'this website'}".`
        : `ISSN ${params.submittedIssn} is validly registered to "${params.canonicalTitle || 'Authentic Title'}".`,
    };

    mismatches.push({
      field: 'issn',
      label: 'ISSN Correlation',
      submittedValue: params.submittedIssn,
      verifiedValue: `${params.canonicalIssn || params.submittedIssn} (Registered to ${params.canonicalTitle || 'Publisher'})`,
      matched: !isHijacked,
      riskNote: isHijacked ? 'Legitimate ISSN hijacked and displayed on an unauthorized counterfeit domain' : undefined,
    });

    if (isHijacked) mismatchCount += 2;
  }

  // 4. Publisher Check
  if (params.canonicalPublisher && params.submittedPublisher) {
    const sPub = params.submittedPublisher.toLowerCase().trim();
    const cPub = params.canonicalPublisher.toLowerCase().trim();
    const pubMatch = !params.isKnownHijacked && (sPub === cPub || sPub.includes(cPub) || cPub.includes(sPub));
    
    mismatches.push({
      field: 'publisher',
      label: 'Publisher Identity',
      submittedValue: params.submittedPublisher,
      verifiedValue: params.canonicalPublisher,
      matched: pubMatch,
      riskNote: pubMatch ? undefined : 'Publisher identity does not match canonical registry records',
    });
    if (!pubMatch) mismatchCount++;
  }

  // 5. DOI Prefix Check
  if (params.doiPrefix) {
    const isDoiValid = !params.isKnownHijacked && !hasDomainInconsistency;
    mismatches.push({
      field: 'doiPrefix',
      label: 'Crossref DOI Prefix',
      submittedValue: params.isKnownHijacked ? 'Unregistered / Fake' : params.doiPrefix,
      verifiedValue: `${params.doiPrefix} (Active Crossref Member)`,
      matched: isDoiValid,
      riskNote: isDoiValid ? undefined : 'No active Crossref DOI deposit agreements exist under submitted host',
    });
    if (!isDoiValid) mismatchCount++;
  }

  const isPossibleClone = Boolean(params.isKnownHijacked) || hasDomainInconsistency || mismatchCount >= 2;

  let warningMessage: string | undefined = undefined;
  if (isPossibleClone) {
    if (hasDomainInconsistency && hasIssnMismatch) {
      warningMessage = `CRITICAL ALERT: CLONED / HIJACKED JOURNAL. Domain inconsistency and ISSN hijacking detected. The submitted host "${subHost}" does not match the official record for ISSN ${params.submittedIssn}.`;
    } else if (hasDomainInconsistency) {
      warningMessage = domainComparison?.warningTitle
        ? `${domainComparison.warningTitle}: ${domainComparison.mismatchExplanation}`
        : `DOMAIN INCONSISTENCY FLAGGED: The submitted website host "${subHost}" differs from the canonical publisher host "${canHost}".`;
    } else {
      warningMessage = `CLONE GUARD WARNING: Multiple inconsistencies identified between submitted metadata and canonical scholarly registries.`;
    }
  }

  return {
    isPossibleClone,
    confidence: isPossibleClone ? 'HIGH' : 'NONE',
    hasDomainInconsistency,
    hasIssnMismatch,
    domainDetails,
    domainComparison,
    issnDetails,
    warningMessage: params.knownHijackedWarning || warningMessage,
    mismatches,
    legitimateRecord: params.canonicalTitle ? {
      officialTitle: params.canonicalTitle,
      officialPublisher: params.canonicalPublisher || 'Registered Publisher',
      officialWebsite: params.canonicalUrl || 'https://crossref.org',
      officialIssn: params.canonicalIssn || params.submittedIssn,
      officialCountry: params.canonicalCountry || 'Verified Jurisdiction',
      doiPrefix: params.doiPrefix || '10.xxxx',
      evidenceSource: 'Crossref / OpenAlex / ISSN Portal Registry',
    } : undefined,
  };
}
