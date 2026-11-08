/**
 * SHODH SETU AI - Authoritative Domain Comparison Engine
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Compares a submitted journal URL/domain against expected authoritative metadata
 * (Crossref, OpenAlex, DOAJ, ISSN Portal, Official Publisher Registries).
 * 
 * Flags:
 * - Domain Inconsistencies & Hijacking Attempts
 * - Typosquatting and Deceptive Lookalikes
 * - Discrepancies between submitted hosting servers and official publisher registries
 * - OJS hijacking paths and misleading TLD variations
 */

import { DomainComparisonResult, DomainMismatchAlert, VerificationResult } from '../types';
import { lookupHijackedRegistry } from './hijackedRegistry';

// Multi-part Public Suffixes commonly found in academic institutions and international registries
const KNOWN_MULTI_PART_TLDS = new Set([
  'co.uk', 'ac.uk', 'gov.uk', 'org.uk',
  'edu.au', 'com.au', 'org.au', 'gov.au',
  'org.in', 'co.in', 'ac.in', 'edu.in', 'res.in',
  'ac.za', 'co.za',
  'edu.pk', 'gov.pk', 'com.pk', 'org.pk',
  'com.br', 'edu.br', 'org.br',
  'com.cn', 'edu.cn', 'org.cn',
  'com.mx', 'edu.mx',
  'co.jp', 'ac.jp', 'ne.jp',
  'co.kr', 'ac.kr',
  'ktn.gv.at', 'gv.at', 'ac.at',
  'ibles.org',
]);

// Authoritative publisher domain infrastructure map
const PUBLISHER_CANONICAL_DOMAINS: Record<string, string[]> = {
  'elsevier': ['elsevier.com', 'sciencedirect.com', 'cell.com', 'thelancet.com', 'ssrn.com'],
  'sciencedirect': ['sciencedirect.com', 'elsevier.com'],
  'springer': ['springer.com', 'nature.com', 'biomedcentral.com', 'springeropen.com', 'palgrave.com', 'springernature.com'],
  'springer nature': ['springer.com', 'nature.com', 'biomedcentral.com', 'springeropen.com', 'palgrave.com', 'springernature.com'],
  'nature': ['nature.com', 'springer.com', 'biomedcentral.com'],
  'wiley': ['wiley.com', 'onlinelibrary.wiley.com', 'wileyonlinelibrary.com', 'hindawi.com'],
  'john wiley': ['wiley.com', 'onlinelibrary.wiley.com', 'wileyonlinelibrary.com'],
  'taylor & francis': ['tandfonline.com', 'taylorandfrancis.com', 'routledge.com', 'cogentoa.com'],
  'taylor and francis': ['tandfonline.com', 'taylorandfrancis.com', 'routledge.com'],
  'routledge': ['tandfonline.com', 'taylorandfrancis.com', 'routledge.com'],
  'oxford university press': ['oup.com', 'academic.oup.com'],
  'oup': ['oup.com', 'academic.oup.com'],
  'cambridge university press': ['cambridge.org'],
  'cup': ['cambridge.org'],
  'ieee': ['ieee.org', 'ieeexplore.ieee.org'],
  'sage': ['sagepub.com', 'journals.sagepub.com'],
  'sage publications': ['sagepub.com', 'journals.sagepub.com'],
  'mdpi': ['mdpi.com'],
  'frontiers': ['frontiersin.org'],
  'plos': ['plos.org', 'plosone.org'],
  'de gruyter': ['degruyter.com', 'degruyter.de'],
  'walter de gruyter': ['degruyter.com', 'degruyter.de'],
  'emerald': ['emerald.com', 'emeraldinsight.com'],
  'iop publishing': ['iop.org', 'iopscience.iop.org'],
  'aip publishing': ['aip.scitation.org', 'pubs.aip.org'],
  'american chemical society': ['pubs.acs.org', 'acs.org'],
  'bmj': ['bmj.com'],
  'wolters kluwer': ['lww.com', 'wkhealth.com', 'medknow.com'],
  'francoangeli': ['francoangeli.it'],
  'federazione italiana dei cineforum': ['cineforum.it'],
  'fic': ['cineforum.it'],
  'kärntner landesmuseum': ['landesmuseum.ktn.gv.at'],
  'incds marin drăcea': ['e-afr.org'],
  'polskie towarzystwo leśne': ['sylwan.ibles.org'],
  'polish forest society': ['sylwan.ibles.org'],
  'iceland glaciological society': ['jokulljournal.is'],
};

/**
 * Extracts normalized hostname, root domain (SLD + TLD), and path from any URL or domain string.
 */
export function normalizeDomain(rawInput: string): {
  normalizedUrl: string;
  host: string;
  rootDomain: string;
  tld: string;
  path: string;
} {
  if (!rawInput || typeof rawInput !== 'string') {
    return { normalizedUrl: '', host: '', rootDomain: '', tld: '', path: '' };
  }

  const trimmed = rawInput.trim();
  let parsedUrl: URL | null = null;

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      parsedUrl = new URL(trimmed);
    } else {
      parsedUrl = new URL(`https://${trimmed}`);
    }
  } catch {
    // Fallback extraction
    const firstSlash = trimmed.indexOf('/');
    const hostPart = (firstSlash >= 0 ? trimmed.substring(0, firstSlash) : trimmed).toLowerCase().replace(/^www\./, '');
    const pathPart = firstSlash >= 0 ? trimmed.substring(firstSlash) : '';
    return {
      normalizedUrl: `https://${hostPart}${pathPart}`,
      host: hostPart,
      rootDomain: hostPart,
      tld: hostPart.split('.').pop() || '',
      path: pathPart,
    };
  }

  const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
  const path = (parsedUrl.pathname + parsedUrl.search).toLowerCase();

  // Root domain extraction considering multi-part TLDs
  const parts = host.split('.');
  let rootDomain = host;
  let tld = '';

  if (parts.length >= 3) {
    const lastTwo = parts.slice(-2).join('.');
    const lastThree = parts.slice(-3).join('.');

    if (KNOWN_MULTI_PART_TLDS.has(lastThree)) {
      rootDomain = parts.slice(-4).join('.');
      tld = lastThree;
    } else if (KNOWN_MULTI_PART_TLDS.has(lastTwo)) {
      rootDomain = parts.slice(-3).join('.');
      tld = lastTwo;
    } else {
      rootDomain = parts.slice(-2).join('.');
      tld = parts.slice(-1)[0];
    }
  } else if (parts.length === 2) {
    rootDomain = host;
    tld = parts[1];
  } else {
    tld = parts[0] || '';
  }

  return {
    normalizedUrl: parsedUrl.href,
    host,
    rootDomain,
    tld,
    path,
  };
}

/**
 * Extracts the base domain (e.g., "revistadecineforum.com", "springer.com", "cineforum.it")
 * from any submitted URL or hostname.
 */
export function extractBaseDomain(rawUrl: string): string {
  const norm = normalizeDomain(rawUrl);
  return norm.rootDomain || norm.host || '';
}

/**
 * Extracts the normalized hostname (lowercase without www.) from any URL or hostname.
 */
export function extractHostname(rawUrl: string): string {
  const norm = normalizeDomain(rawUrl);
  return norm.host || '';
}

/**
 * Calculates string similarity (Sørensen–Dice coefficient on bigrams)
 * Useful for detecting lookalikes (e.g. revistadecineforum.com vs cineforum.it)
 */
function calculateLexicalSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length < 2 || b.length < 2) return 0.0;

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bg = str.substring(i, i + 2);
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }
    return bigrams;
  };

  const bgA = getBigrams(a);
  const bgB = getBigrams(b);

  let intersection = 0;
  for (const [bg, countA] of bgA.entries()) {
    if (bgB.has(bg)) {
      intersection += Math.min(countA, bgB.get(bg)!);
    }
  }

  const total = (a.length - 1) + (b.length - 1);
  return total > 0 ? (2.0 * intersection) / total : 0;
}

export interface DomainComparisonOptions {
  submittedUrl: string;
  canonicalJournalUrl?: string;
  canonicalPublisher?: string;
  publisherUrl?: string;
  knownAuthenticDomains?: string[];
  knownHijackedDomains?: string[];
  journalTitle?: string;
  issn?: string;
  isKnownHijacked?: boolean;
}

/**
 * Dedicated domain comparison function in the verification engine that flags mismatches
 * between the provided URL domain and the expected publisher/journal website listed in
 * authoritative metadata.
 */
export function compareDomainWithAuthoritative(options: DomainComparisonOptions): DomainComparisonResult {
  const {
    submittedUrl,
    canonicalJournalUrl,
    canonicalPublisher,
    publisherUrl,
    knownAuthenticDomains = [],
    knownHijackedDomains = [],
    journalTitle = '',
    issn = '',
    isKnownHijacked = false,
  } = options;

  const sub = normalizeDomain(submittedUrl);
  const sourcesChecked: string[] = [];

  // Check known hijacked registry first
  const registryCheck = lookupHijackedRegistry(submittedUrl || sub.host);
  const isHijackedRegistryConfirmed = isKnownHijacked || registryCheck.isHijackedDomain;

  // Compile list of expected authoritative domains
  const expectedDomainList: string[] = [];

  if (canonicalJournalUrl) {
    const cNorm = normalizeDomain(canonicalJournalUrl);
    if (cNorm.host) {
      expectedDomainList.push(cNorm.host);
      sourcesChecked.push('Authoritative Open Metadata (DOAJ / OpenAlex)');
    }
  }

  if (publisherUrl) {
    const pNorm = normalizeDomain(publisherUrl);
    if (pNorm.host && !expectedDomainList.includes(pNorm.host)) {
      expectedDomainList.push(pNorm.host);
      sourcesChecked.push('Crossref / Publisher Record');
    }
  }

  for (const kad of knownAuthenticDomains) {
    const kNorm = normalizeDomain(kad);
    if (kNorm.host && !expectedDomainList.includes(kNorm.host)) {
      expectedDomainList.push(kNorm.host);
      sourcesChecked.push('Curated Hijacked Journal Watchdog Registry');
    }
  }

  if (registryCheck.record?.officialWebsite) {
    const rNorm = normalizeDomain(registryCheck.record.officialWebsite);
    if (rNorm.host && !expectedDomainList.includes(rNorm.host)) {
      expectedDomainList.push(rNorm.host);
      sourcesChecked.push('Retraction Watch / Official Society Registry');
    }
  }

  // Check publisher platform domain associations
  let matchedPublisherPlatform = false;
  if (canonicalPublisher) {
    const pubLower = canonicalPublisher.toLowerCase().trim();
    for (const [pubKey, allowedDomains] of Object.entries(PUBLISHER_CANONICAL_DOMAINS)) {
      if (pubLower.includes(pubKey) || pubKey.includes(pubLower)) {
        for (const ad of allowedDomains) {
          if (!expectedDomainList.includes(ad)) {
            expectedDomainList.push(ad);
          }
        }
        sourcesChecked.push(`Verified Publisher Platform (${canonicalPublisher})`);
        break;
      }
    }
  }

  // De-duplicate expected domains
  const uniqueExpectedDomains = Array.from(new Set(expectedDomainList.filter(Boolean)));
  const primaryExpectedHost = uniqueExpectedDomains[0] || '';

  // Inspect submitted URL for deceptive OJS patterns or suspicious spoofing tokens
  const suspiciousKeywordsFound: string[] = [];
  const SUSPICIOUS_AFFIXES = ['journal', 'review', 'international', 'academic', 'research', 'revistas', 'online', 'press'];
  
  for (const affix of SUSPICIOUS_AFFIXES) {
    if (sub.host.includes(affix)) {
      suspiciousKeywordsFound.push(affix);
    }
  }

  const hasOjsArtifacts = sub.path.includes('index.php') || sub.path.includes('/ojs/') || sub.path.includes('/cf');

  // Compute similarity score against expected domains or title stem
  let highestSimilarity = 0;
  for (const exp of uniqueExpectedDomains) {
    const sim = calculateLexicalSimilarity(sub.host, exp);
    if (sim > highestSimilarity) highestSimilarity = sim;
  }

  // If no expected domain, check against journal title stem
  if (uniqueExpectedDomains.length === 0 && journalTitle) {
    const cleanStem = journalTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanSubHost = sub.host.replace(/[^a-z0-9]/g, '');
    highestSimilarity = calculateLexicalSimilarity(cleanSubHost, cleanStem);
  }

  const isLookalikeStem = highestSimilarity > 0.45 && highestSimilarity < 0.95;
  const isTldMismatch = uniqueExpectedDomains.some(exp => {
    const expTld = exp.split('.').pop();
    return expTld && sub.tld && expTld !== sub.tld && (sub.host.includes(exp.split('.')[0]) || exp.includes(sub.host.split('.')[0]));
  });

  // Evaluate Domain Match Status
  if (isHijackedRegistryConfirmed) {
    const regRec = registryCheck.record;
    return {
      hasMismatch: true,
      matchType: 'CONFIRMED_HIJACKED_DOMAIN',
      severity: 'critical',
      submittedUrl: sub.normalizedUrl,
      submittedHost: sub.host,
      submittedRootDomain: sub.rootDomain,
      expectedDomains: uniqueExpectedDomains,
      primaryExpectedHost: regRec ? normalizeDomain(regRec.officialWebsite).host : primaryExpectedHost,
      expectedPublisher: regRec?.officialPublisher || canonicalPublisher,
      similarityScore: highestSimilarity,
      warningTitle: 'CONFIRMED HIJACKED COUNTERFEIT DOMAIN',
      mismatchExplanation: `CRITICAL DOMAIN HIJACKING: The submitted domain "${sub.host}" is a verified counterfeit portal actively hijacking the identity of "${regRec?.officialTitle || journalTitle}" (ISSN ${regRec?.issn || issn}). Submissions to this host are fraudulent.`,
      recommendation: `DO NOT SUBMIT. Navigate immediately to the authentic registered journal portal: ${regRec?.officialWebsite || primaryExpectedHost}`,
      technicalDetails: {
        isTldMismatch: true,
        hasOjsArtifacts,
        isLookalikeStem: true,
        suspiciousKeywordsFound,
        authoritativeSourcesChecked: sourcesChecked,
      },
    };
  }

  // Exact Match Check
  const hasExactMatch = uniqueExpectedDomains.some(exp => exp.toLowerCase() === sub.host.toLowerCase());
  if (hasExactMatch) {
    return {
      hasMismatch: false,
      matchType: 'EXACT_MATCH',
      severity: 'none',
      submittedUrl: sub.normalizedUrl,
      submittedHost: sub.host,
      submittedRootDomain: sub.rootDomain,
      expectedDomains: uniqueExpectedDomains,
      primaryExpectedHost: sub.host,
      expectedPublisher: canonicalPublisher,
      similarityScore: 1.0,
      mismatchExplanation: `Canonical domain integrity verified. The submitted website domain "${sub.host}" matches the authoritative registry record in ${sourcesChecked.join(', ') || 'scholarly databases'}.`,
      recommendation: 'Proceed with normal journal evaluation and manuscript submission guidelines.',
      technicalDetails: {
        isTldMismatch: false,
        hasOjsArtifacts,
        isLookalikeStem: false,
        suspiciousKeywordsFound: [],
        authoritativeSourcesChecked: sourcesChecked,
      },
    };
  }

  // Subdomain / Parent Domain Match Check
  const hasSubdomainMatch = uniqueExpectedDomains.some(exp => {
    return sub.host.endsWith(`.${exp}`) || exp.endsWith(`.${sub.host}`) || sub.rootDomain === normalizeDomain(exp).rootDomain;
  });

  if (hasSubdomainMatch) {
    return {
      hasMismatch: false,
      matchType: 'CANONICAL_SUBDOMAIN',
      severity: 'none',
      submittedUrl: sub.normalizedUrl,
      submittedHost: sub.host,
      submittedRootDomain: sub.rootDomain,
      expectedDomains: uniqueExpectedDomains,
      primaryExpectedHost,
      expectedPublisher: canonicalPublisher,
      similarityScore: 0.95,
      mismatchExplanation: `Domain verified as an authorized subdomain or associated host (${sub.host}) of the canonical publisher domain (${primaryExpectedHost}).`,
      recommendation: 'Domain structure is consistent with legitimate publisher hosting infrastructure.',
      technicalDetails: {
        isTldMismatch: false,
        hasOjsArtifacts,
        isLookalikeStem: false,
        suspiciousKeywordsFound: [],
        authoritativeSourcesChecked: sourcesChecked,
      },
    };
  }

  // Authorized Publisher Platform Check
  if (canonicalPublisher) {
    const pubLower = canonicalPublisher.toLowerCase().trim();
    for (const [pubKey, allowedDomains] of Object.entries(PUBLISHER_CANONICAL_DOMAINS)) {
      if (pubLower.includes(pubKey) || pubKey.includes(pubLower)) {
        if (allowedDomains.some(ad => sub.host === ad || sub.host.endsWith(`.${ad}`))) {
          matchedPublisherPlatform = true;
          break;
        }
      }
    }
  }

  if (matchedPublisherPlatform) {
    return {
      hasMismatch: false,
      matchType: 'AUTHORIZED_PUBLISHER_PLATFORM',
      severity: 'none',
      submittedUrl: sub.normalizedUrl,
      submittedHost: sub.host,
      submittedRootDomain: sub.rootDomain,
      expectedDomains: uniqueExpectedDomains,
      primaryExpectedHost,
      expectedPublisher: canonicalPublisher,
      similarityScore: 0.9,
      mismatchExplanation: `The submitted domain "${sub.host}" is a recognized publishing platform belonging to authoritative publisher "${canonicalPublisher}".`,
      recommendation: 'Domain infrastructure is authenticated for this publisher group.',
      technicalDetails: {
        isTldMismatch: false,
        hasOjsArtifacts,
        isLookalikeStem: false,
        suspiciousKeywordsFound: [],
        authoritativeSourcesChecked: sourcesChecked,
      },
    };
  }

  // If there are expected domains and the submitted domain doesn't match:
  if (uniqueExpectedDomains.length > 0) {
    // Check if it's a suspicious lookalike / typosquat
    if (isLookalikeStem || isTldMismatch || (highestSimilarity > 0.35 && suspiciousKeywordsFound.length > 0)) {
      return {
        hasMismatch: true,
        matchType: 'SUSPICIOUS_LOOKALIKE',
        severity: 'critical',
        submittedUrl: sub.normalizedUrl,
        submittedHost: sub.host,
        submittedRootDomain: sub.rootDomain,
        expectedDomains: uniqueExpectedDomains,
        primaryExpectedHost,
        expectedPublisher: canonicalPublisher,
        similarityScore: highestSimilarity,
        warningTitle: 'SUSPICIOUS LOOKALIKE / SPOOFED DOMAIN DETECTED',
        mismatchExplanation: `CRITICAL DOMAIN INCONSISTENCY: The submitted URL "${sub.host}" exhibits lookalike characteristics imitating the authoritative publication "${journalTitle || primaryExpectedHost}", but is hosted on an unverified domain differing from the canonical publisher website ("${primaryExpectedHost}").`,
        recommendation: `DO NOT SUBMIT MANUSCRIPTS OR PAY FEES ON "${sub.host}". Verify and use the canonical publisher domain: https://${primaryExpectedHost}`,
        technicalDetails: {
          isTldMismatch,
          hasOjsArtifacts,
          isLookalikeStem: true,
          suspiciousKeywordsFound,
          authoritativeSourcesChecked: sourcesChecked,
        },
      };
    }

    // Generic Unauthorized Domain Mismatch
    return {
      hasMismatch: true,
      matchType: 'UNAUTHORIZED_DOMAIN_MISMATCH',
      severity: 'high',
      submittedUrl: sub.normalizedUrl,
      submittedHost: sub.host,
      submittedRootDomain: sub.rootDomain,
      expectedDomains: uniqueExpectedDomains,
      primaryExpectedHost,
      expectedPublisher: canonicalPublisher,
      similarityScore: highestSimilarity,
      warningTitle: 'AUTHORITATIVE DOMAIN MISMATCH',
      mismatchExplanation: `DOMAIN MISMATCH FLAGGED: The submitted website host "${sub.host}" does not match the official registered domain(s) [${uniqueExpectedDomains.slice(0, 3).join(', ')}] listed for this journal or its publisher (${canonicalPublisher || 'Authoritative Publisher'}).`,
      recommendation: `Verify the authenticity of this submission portal. Official indexing databases associate this journal with https://${primaryExpectedHost}`,
      technicalDetails: {
        isTldMismatch,
        hasOjsArtifacts,
        isLookalikeStem: false,
        suspiciousKeywordsFound,
        authoritativeSourcesChecked: sourcesChecked,
      },
    };
  }

  // If no expected authoritative domain was found in open metadata:
  return {
    hasMismatch: false,
    matchType: 'NO_AUTHORITATIVE_DATA',
    severity: hasOjsArtifacts && suspiciousKeywordsFound.length > 0 ? 'medium' : 'low',
    submittedUrl: sub.normalizedUrl,
    submittedHost: sub.host,
    submittedRootDomain: sub.rootDomain,
    expectedDomains: [],
    primaryExpectedHost: undefined,
    expectedPublisher: canonicalPublisher,
    similarityScore: 0,
    mismatchExplanation: sub.host
      ? `Submitted domain "${sub.host}" could not be cross-checked against a definitive canonical URL in open repositories. Manual verification of publisher contact details recommended.`
      : 'No submitted domain was provided for comparison.',
    recommendation: 'Perform manual website verification by contacting the journal\'s editorial office via official university channels.',
    technicalDetails: {
      isTldMismatch: false,
      hasOjsArtifacts,
      isLookalikeStem: false,
      suspiciousKeywordsFound,
      authoritativeSourcesChecked: sourcesChecked,
    },
  };
}

/**
 * Curated list of known-good scholarly domains and authentic publisher infrastructure.
 */
export const KNOWN_GOOD_DOMAINS: string[] = [
  'cineforum.it',
  'sciencedirect.com',
  'elsevier.com',
  'cell.com',
  'thelancet.com',
  'springer.com',
  'nature.com',
  'biomedcentral.com',
  'springeropen.com',
  'palgrave.com',
  'springernature.com',
  'wiley.com',
  'onlinelibrary.wiley.com',
  'wileyonlinelibrary.com',
  'tandfonline.com',
  'taylorandfrancis.com',
  'routledge.com',
  'oup.com',
  'academic.oup.com',
  'cambridge.org',
  'ieee.org',
  'ieeexplore.ieee.org',
  'sagepub.com',
  'journals.sagepub.com',
  'mdpi.com',
  'frontiersin.org',
  'plos.org',
  'plosone.org',
  'degruyter.com',
  'emerald.com',
  'emeraldinsight.com',
  'iop.org',
  'iopscience.iop.org',
  'bmj.com',
  'pubs.acs.org',
  'acs.org',
  'francoangeli.it',
  'landesmuseum.ktn.gv.at',
  'e-afr.org',
  'sylwan.ibles.org',
  'jokulljournal.is',
  'unibe.ch',
  'doaj.org',
  'crossref.org',
  'openalex.org',
];

/**
 * Compares the base domain from the submitted URL against the known-good domain list or a metadata source.
 */
export function compareDomainAgainstKnownGood(
  submittedUrl: string,
  knownGoodList: string[] = KNOWN_GOOD_DOMAINS
): {
  isKnownGood: boolean;
  baseDomain: string;
  hostname: string;
  matchedCanonicalDomain?: string;
} {
  const baseDomain = extractBaseDomain(submittedUrl);
  const hostname = extractHostname(submittedUrl);

  const matched = knownGoodList.find(good => 
    hostname === good || 
    hostname.endsWith(`.${good}`) || 
    baseDomain === good ||
    good.endsWith(`.${baseDomain}`)
  );

  return {
    isKnownGood: Boolean(matched),
    baseDomain,
    hostname,
    matchedCanonicalDomain: matched,
  };
}

/**
 * Compares a submitted URL against a canonical domain recorded in verified metadata.
 */
export function compareDomains(
  submittedUrl: string,
  canonicalDomainOrUrl: string
): {
  isMatch: boolean;
  submittedHost: string;
  canonicalHost: string;
  submittedBaseDomain: string;
  canonicalBaseDomain: string;
  details: string;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
} {
  const sub = normalizeDomain(submittedUrl);
  const can = normalizeDomain(canonicalDomainOrUrl);

  if (!sub.host || !can.host) {
    return {
      isMatch: true,
      submittedHost: sub.host,
      canonicalHost: can.host,
      submittedBaseDomain: sub.rootDomain,
      canonicalBaseDomain: can.rootDomain,
      details: 'Insufficient domain data for direct comparison.',
      severity: 'none',
    };
  }

  const isExact = sub.host === can.host;
  const isSubdomain = sub.host.endsWith(`.${can.host}`) || can.host.endsWith(`.${sub.host}`) || sub.rootDomain === can.rootDomain;
  const isMatch = isExact || isSubdomain;

  return {
    isMatch,
    submittedHost: sub.host,
    canonicalHost: can.host,
    submittedBaseDomain: sub.rootDomain,
    canonicalBaseDomain: can.rootDomain,
    details: isMatch
      ? `Hostname "${sub.host}" correlates with canonical domain "${can.host}".`
      : `DOMAIN MISMATCH: Submitted hostname "${sub.host}" does not match canonical verified domain "${can.host}".`,
    severity: isMatch ? 'none' : 'critical',
  };
}

// Global alert listeners for real-time UI notification dispatch
type DomainAlertCallback = (alert: DomainMismatchAlert) => void;
const domainAlertListeners = new Set<DomainAlertCallback>();

export function onDomainMismatchAlert(callback: DomainAlertCallback): () => void {
  domainAlertListeners.add(callback);
  return () => {
    domainAlertListeners.delete(callback);
  };
}

export function broadcastDomainMismatchAlert(alert: DomainMismatchAlert): void {
  for (const listener of domainAlertListeners) {
    try {
      listener(alert);
    } catch (e) {
      console.error('Error invoking domain mismatch alert listener:', e);
    }
  }
}

/**
 * Triggers a UI alert upon verification if the hostname of the provided journal URL
 * does not match the canonical domain recorded in the verified metadata.
 */
export function triggerDomainMismatchAlert(
  result: VerificationResult,
  onAlertTriggered?: (alert: DomainMismatchAlert) => void
): DomainMismatchAlert | null {
  const submittedUrl = result.journal.website || result.searchQuery;
  const subHost = extractHostname(submittedUrl);

  // If there's no submitted hostname, no domain mismatch alert needed
  if (!subHost || !subHost.includes('.')) {
    return null;
  }

  const canonicalDomain = 
    result.cloneGuard.domainDetails?.canonicalHost ||
    result.cloneGuard.legitimateRecord?.officialWebsite ||
    result.cloneGuard.domainComparison?.primaryExpectedHost ||
    '';

  const canHost = extractHostname(canonicalDomain);

  // Check if cloneGuard already flagged a domain inconsistency or if hosts differ
  const hasInconsistency = 
    result.cloneGuard.hasDomainInconsistency ||
    (result.cloneGuard.domainComparison && result.cloneGuard.domainComparison.hasMismatch) ||
    (canHost && subHost !== canHost && !subHost.endsWith(`.${canHost}`) && !canHost.endsWith(`.${subHost}`));

  if (!hasInconsistency) {
    return null;
  }

  const mismatchDetails = result.cloneGuard.domainComparison?.mismatchExplanation ||
    `The hostname of the provided journal URL ("${subHost}") does not match the canonical domain ("${canHost || 'official publisher record'}") recorded in verified scholarly metadata.`;

  const recommendation = result.cloneGuard.domainComparison?.recommendation ||
    `Do not submit manuscripts or pay fees on ${subHost}. Navigate to the authentic verified journal portal: ${canHost ? `https://${canHost}` : 'official registry'}`;

  const alert: DomainMismatchAlert = {
    id: `alert-domain-${Date.now()}`,
    title: result.cloneGuard.domainComparison?.warningTitle || 'CRITICAL DOMAIN MISMATCH DETECTED',
    message: mismatchDetails,
    submittedHostname: subHost,
    canonicalDomain: canHost || 'Authoritative Publisher Record',
    severity: (result.cloneGuard.domainComparison?.severity && result.cloneGuard.domainComparison.severity !== 'none')
      ? result.cloneGuard.domainComparison.severity
      : 'critical',
    recommendation,
    timestamp: new Date().toISOString(),
  };

  // Invoke direct callback if provided
  if (onAlertTriggered) {
    onAlertTriggered(alert);
  }

  // Broadcast to global listeners
  broadcastDomainMismatchAlert(alert);

  return alert;
}
