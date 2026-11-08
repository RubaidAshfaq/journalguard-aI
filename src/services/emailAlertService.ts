/**
 * SHODH SETU AI - Email Alert Service
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Centralized service providing pre-defined forensic templates and dispatch handlers
 * for warning authentic journal editors and publishers about identified cloned/predatory versions.
 */

import { 
  VerificationResult, 
  ResearcherProfile, 
  ForensicEmailAlertData, 
  SentEditorAlertRecord, 
  EmailDispatchMethod 
} from '../types';

const STORAGE_KEY_ALERTS = 'journalguard_editor_alerts';

/**
 * Extracts and sanitizes clean domain hostnames from a URL or raw hostname string.
 */
export function extractCleanHostname(urlOrHost?: string): string {
  if (!urlOrHost) return 'official-journal.org';
  try {
    const formatted = urlOrHost.startsWith('http://') || urlOrHost.startsWith('https://') 
      ? urlOrHost 
      : `https://${urlOrHost}`;
    const parsed = new URL(formatted);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return urlOrHost.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
  }
}

/**
 * Ensures a valid absolute URL with https protocol.
 */
export function ensureAbsoluteUrl(url?: string): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Derives suggested official editorial email addresses for a given journal and canonical host.
 */
export function deriveEditorialRecipients(canonicalHost: string, publisher?: string): string[] {
  const cleanHost = extractCleanHostname(canonicalHost);
  const recipients: string[] = [
    `editor@${cleanHost}`,
    `editorial@${cleanHost}`,
    `info@${cleanHost}`
  ];

  // If known academic publisher, add known ethics / permissions routing hints
  if (publisher) {
    const lowerPub = publisher.toLowerCase();
    if (lowerPub.includes('elsevier')) {
      recipients.push('integrity@elsevier.com');
    } else if (lowerPub.includes('springer') || lowerPub.includes('nature')) {
      recipients.push('publishingethics@springernature.com');
    } else if (lowerPub.includes('wiley')) {
      recipients.push('publication.ethics@wiley.com');
    } else if (lowerPub.includes('taylor') || lowerPub.includes('francis')) {
      recipients.push('ethicsandintegrity@tandf.co.uk');
    } else if (lowerPub.includes('oxford') || lowerPub.includes('oup')) {
      recipients.push('academic.journals.ethics@oup.com');
    }
  }

  return recipients;
}

/**
 * Builds a concise URL-safe body representation.
 * Standard mailto & Web compose URLs must stay under 1500 chars to prevent browser/OS truncation or 414 errors.
 */
export function buildConciseUrlSafeBody(params: {
  journalTitle: string;
  issn: string;
  cleanCanonicalHost: string;
  counterfeitHost: string;
  infringingUrl: string;
  riskTier: string;
  score: number;
  auditId: string;
}): string {
  return `Dear Editorial Board & Publisher of "${params.journalTitle}",

URGENT ACADEMIC INTEGRITY ALERT: An unauthorized, counterfeit cloned journal website is actively impersonating your publication and misusing your serial identity.

1. AUTHENTIC JOURNAL RECORD
• Official Journal: ${params.journalTitle}
• Registered ISSN: ${params.issn || 'Registered Serial'}
• Canonical Domain: ${params.cleanCanonicalHost}

2. DETECTED COUNTERFEIT CLONE
• Impersonating Host: ${params.counterfeitHost}
• Infringing URL: ${params.infringingUrl}
• Authenticity Score: ${params.score}/100 (Risk Tier: ${params.riskTier})

3. RECOMMENDED ACTIONS FOR EDITORS & PUBLISHER
1. Publish immediate warning disclaimer on your official domain (${params.cleanCanonicalHost})
2. File domain registrar / host DMCA abuse takedown for host: ${params.counterfeitHost}
3. Alert Clarivate (WoS), Scopus, DOAJ, Crossref, and COPE

* Forensic Audit Reference: ${params.auditId}
* Generated via Shodh Setu AI (Academic Concept & Direction: Dr. Rubaid Ashfaq)
[Notice: Full technical evidence report has also been copied to clipboard for your legal team.]`;
}

/**
 * Builds the comprehensive pre-defined forensic warning template.
 * Formatted with authoritative scholarly evidence and actionable publisher takedown steps.
 */
export function buildForensicEmailAlert(
  result: VerificationResult,
  profile?: ResearcherProfile,
  customNotes?: string
): ForensicEmailAlertData {
  const { journal, cloneGuard, authenticityScore, riskAnalysis } = result;

  // Derive canonical host
  const canonicalHost = cloneGuard.domainDetails?.canonicalHost || 
    cloneGuard.domainComparison?.primaryExpectedHost ||
    (cloneGuard.domainComparison?.expectedDomains && cloneGuard.domainComparison.expectedDomains[0]) ||
    (journal.website ? extractCleanHostname(journal.website) : '') ||
    'official-journal.org';

  const cleanCanonicalHost = extractCleanHostname(canonicalHost);

  // Submitted counterfeit details
  const infringingUrl = result.searchQuery?.startsWith('http') 
    ? result.searchQuery 
    : cloneGuard.domainDetails?.submittedHost 
      ? `https://${cloneGuard.domainDetails.submittedHost}`
      : 'Identified Counterfeit Website';

  const counterfeitHost = cloneGuard.domainDetails?.submittedHost || 
    cloneGuard.domainComparison?.submittedHost || 
    cloneGuard.domainComparison?.submittedRootDomain ||
    extractCleanHostname(result.searchQuery) || 
    'unauthorized-domain.com';

  // Suggested recipients
  const suggestedRecipients = deriveEditorialRecipients(cleanCanonicalHost, journal.publisher);
  const recipientsString = suggestedRecipients.join(', ');
  const primaryRecipient = suggestedRecipients[0];

  // Subject line with high-priority academic integrity markers
  const subject = `[URGENT INTEGRITY ALERT] Counterfeit / Cloned Journal Website Impersonating "${journal.title}" (ISSN: ${journal.issn || 'Registered Serial'})`;

  // Flagged indicator items formatted for forensic evidence
  const flaggedIndicators = riskAnalysis.indicators
    .filter(i => i.flagged)
    .map(i => `  • [${i.severity.toUpperCase()}] ${i.title}: ${i.evidence} (${i.explanation})`)
    .join('\n');

  // Specific clone mismatch details
  const cloneMismatches = (cloneGuard.mismatches || [])
    .filter(m => !m.matched)
    .map(m => `  • Discrepancy in ${m.label}: Provided "${m.submittedValue}" vs Authoritative Record "${m.verifiedValue}"`)
    .join('\n');

  // Pre-defined Forensic Template (Full Dossier)
  const body = `Dear Editorial Board & Publishing Directorate of "${journal.title}",
cc: Scholarly Integrity, Legal Affairs & Ethics Office,

I am writing to formally alert your editorial office that an unauthorized, counterfeit, and predatory cloned journal website appears to be actively misappropriating the academic identity, serial title, and ISSN of your legitimate publication.

This forensic alert has been generated via Shodh Setu AI to equip your legal and editorial team with verified technical evidence to initiate domain takedowns and protect scholars from deceptive publication solicitation.

========================================================================
1. AUTHENTIC JOURNAL IDENTITY (Authoritative Registry Record)
========================================================================
• Official Journal Title : ${journal.title}
• Registered Print ISSN   : ${journal.issn || 'N/A'}
• Registered Online eISSN : ${journal.eIssn || 'N/A'}
• Legitimate Publisher   : ${journal.publisher || 'Official Publishing House'}
• Canonical Web Domain   : ${cleanCanonicalHost}
• Indexing Affiliations  : ${[
    result.sources.wos.status === 'FOUND' || result.sources.wos.status === 'VERIFIED' ? 'Web of Science (Clarivate)' : null,
    result.sources.scopus.status === 'FOUND' || result.sources.scopus.status === 'VERIFIED' ? 'Scopus (Elsevier)' : null,
    result.sources.doaj.status === 'FOUND' || result.sources.doaj.status === 'VERIFIED' ? 'DOAJ (Directory of Open Access Journals)' : null,
    result.sources.issn.status === 'FOUND' || result.sources.issn.status === 'VERIFIED' ? 'ISSN International Register' : null,
  ].filter(Boolean).join(', ') || 'Authorized Academic Serials Registry'}

========================================================================
2. IDENTIFIED COUNTERFEIT / PREDATORY CLONE
========================================================================
• Infringing Website URL  : ${infringingUrl}
• Counterfeit Hostname    : ${counterfeitHost}
• Authenticity Score      : ${authenticityScore.total} / 100
• Predatory Risk Tier     : ${riskAnalysis.riskTier} (Risk Metric: ${riskAnalysis.riskScore}/100)
• Timestamp of Detection  : ${new Date(result.timestamp).toUTCString()}

========================================================================
3. FORENSIC IRREGULARITIES & EVIDENCE OF HIJACKING
========================================================================
${cloneGuard.hasDomainInconsistency ? `• CRITICAL DOMAIN MISMATCH: The infringing website host ("${counterfeitHost}") is operating outside your verified publisher infrastructure ("${cleanCanonicalHost}").\n` : ''}${cloneGuard.hasIssnMismatch ? `• ISSN MISAPPROPRIATION: The counterfeit portal is publicly displaying ISSN ${journal.issn} without authorization from the legitimate registry holder.\n` : ''}${cloneMismatches ? `• METADATA ANOMALIES:\n${cloneMismatches}\n` : ''}${flaggedIndicators ? `• PREDATORY PRACTICES DETECTED:\n${flaggedIndicators}\n` : '• Risk evaluation indicates high-probability clone based on domain divergence and registry mismatch.\n'}
${customNotes ? `========================================================================\nADDITIONAL RESEARCHER NOTES:\n${customNotes}\n` : ''}
========================================================================
4. RECOMMENDED IMMEDIATE MITIGATION ACTIONS FOR EDITORS & PUBLISHER
========================================================================
1. PUBLIC FRAUD ADVISORY:
   Publish an immediate warning notice on your official domain (${cleanCanonicalHost}) advising authors that "${counterfeitHost}" is a fraudulent clone and submissions sent there are not affiliated with your journal.

2. ABUSE & DMCA TAKEDOWN:
   File a domain abuse / DMCA copyright infringement notice with the domain registrar and cloud hosting provider servicing "${counterfeitHost}" demanding revocation of the DNS records.

3. INDEXING DATABASE NOTIFICATION:
   Inform the integrity and selection teams at Clarivate Web of Science (WoS), Elsevier Scopus, DOAJ, and Crossref so that fraudulent submissions published on the clone are barred from citation indexes.

4. ETHICS & SERIALS REGISTRATION REPORTING:
   Submit an incident report to the Committee on Publication Ethics (COPE) and the ISSN International Centre (issn.org) to officially document the clone operation.

========================================================================
FORENSIC AUDIT RECORD
========================================================================
Audit Reference ID : ${result.id}
Audited By         : ${profile?.fullName || 'Scholarly Integrity Researcher'}
Affiliated Org     : ${profile?.institution || 'Academic Institution'} (${profile?.country || 'Global Research Community'})
Verification Engine: SHODHSETU (Research Integrity & Journal Authenticity Intelligence)
Academic Concept   : Dr. Rubaid Ashfaq
Verification Date  : ${new Date(result.timestamp).toUTCString()}
========================================================================
`;

  return {
    recipients: recipientsString,
    primaryRecipient,
    subject,
    body,
    cleanCanonicalHost,
    counterfeitHost,
    infringingUrl,
    summary: `Urgent forensic cloned journal warning addressed to ${journal.title} editorial board at ${cleanCanonicalHost}`
  };
}

/**
 * Builds mailto URL with properly escaped headers and safe body length.
 */
export function buildMailtoUrl(recipient: string, subject: string, body: string): string {
  const primary = recipient.split(',')[0].trim();
  // Safe body truncation for mailto protocol handler limits
  const safeBody = body.length > 1200 ? body.substring(0, 1150) + '\n\n[Full technical report copied to clipboard]' : body;
  return `mailto:${encodeURIComponent(primary)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(safeBody)}`;
}

/**
 * Builds direct Gmail Web compose URL with safe body length.
 */
export function buildGmailComposeUrl(recipient: string, subject: string, body: string): string {
  const primary = recipient.split(',')[0].trim();
  const safeBody = body.length > 1400 ? body.substring(0, 1350) + '\n\n[Full technical report copied to clipboard]' : body;
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(primary)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(safeBody)}`;
}

/**
 * Builds direct Outlook Web compose URL with safe body length.
 */
export function buildOutlookComposeUrl(recipient: string, subject: string, body: string): string {
  const primary = recipient.split(',')[0].trim();
  const safeBody = body.length > 1400 ? body.substring(0, 1350) + '\n\n[Full technical report copied to clipboard]' : body;
  return `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(primary)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(safeBody)}`;
}

/**
 * Retrieves the history of dispatched editor alerts from local storage.
 */
export function getSentEditorAlertHistory(): SentEditorAlertRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load sent editor alerts:', err);
    return [];
  }
}

/**
 * Checks if a warning alert has already been sent for a specific journal.
 */
export function hasAlertBeenSentForJournal(issnOrTitle: string): boolean {
  if (!issnOrTitle) return false;
  const history = getSentEditorAlertHistory();
  const target = issnOrTitle.trim().toLowerCase();
  return history.some(record => 
    (record.issn && record.issn.toLowerCase() === target) ||
    (record.journalTitle && record.journalTitle.toLowerCase() === target)
  );
}

/**
 * Alias for checking if an alert has been dispatched for a journal.
 */
export const hasAlertBeenDispatched = hasAlertBeenSentForJournal;

/**
 * Records a dispatched editor warning in local storage.
 */
export function recordSentAlert(record: SentEditorAlertRecord): void {
  try {
    const existing = getSentEditorAlertHistory();
    const updated = [record, ...existing.filter(r => r.id !== record.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to persist sent editor alert:', err);
  }
}

/**
 * Safely executes dispatch via direct navigation or window opening without triggering popup blockers.
 */
export function executeDispatch(url: string, method: EmailDispatchMethod): boolean {
  try {
    if (method === 'mailto') {
      // Use hidden anchor click to trigger OS mail client reliably without blank tab
      const a = document.createElement('a');
      a.href = url;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try { document.body.removeChild(a); } catch {}
      }, 500);
      return true;
    } else {
      // For web services (Gmail / Outlook), open in new tab
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        // Fallback to anchor click if popup blocked
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          try { document.body.removeChild(a); } catch {}
        }, 500);
      }
      return true;
    }
  } catch (err) {
    console.warn('Dispatch navigation failed:', err);
    return false;
  }
}

/**
 * Sends and dispatches the warning email to the journal editors using the chosen method,
 * automatically copies full report to clipboard, and records the forensic event.
 */
export function sendWarningAlert(params: {
  result: VerificationResult;
  recipients: string;
  subject: string;
  body: string;
  method: EmailDispatchMethod;
  profile?: ResearcherProfile;
}): { success: boolean; record: SentEditorAlertRecord; dispatchUrl: string } {
  const { result, recipients, subject, body, method, profile } = params;
  const cleanCanonicalHost = extractCleanHostname(
    result.cloneGuard.domainDetails?.canonicalHost || 
    result.cloneGuard.domainComparison?.primaryExpectedHost ||
    result.journal.website || 
    'official-journal.org'
  );
  const counterfeitHost = result.cloneGuard.domainDetails?.submittedHost || 
    result.cloneGuard.domainComparison?.submittedHost || 
    'unauthorized-domain.com';

  // Automatically copy full text to clipboard so user has it immediately
  copyAlertToClipboard(`To: ${recipients}\nSubject: ${subject}\n\n${body}`).catch(() => {});

  let dispatchUrl = '';

  switch (method) {
    case 'mailto':
      dispatchUrl = buildMailtoUrl(recipients, subject, body);
      break;
    case 'gmail':
      dispatchUrl = buildGmailComposeUrl(recipients, subject, body);
      break;
    case 'outlook':
      dispatchUrl = buildOutlookComposeUrl(recipients, subject, body);
      break;
    case 'clipboard':
      dispatchUrl = '#';
      break;
  }

  // Attempt dispatch execution
  if (dispatchUrl && dispatchUrl !== '#') {
    executeDispatch(dispatchUrl, method);
  }

  // Record dispatched alert
  const alertRecord: SentEditorAlertRecord = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    journalTitle: result.journal.title,
    issn: result.journal.issn,
    canonicalDomain: cleanCanonicalHost,
    counterfeitHost,
    recipients: recipients.split(',').map(r => r.trim()).filter(Boolean),
    subject,
    dispatchMethod: method,
    riskTier: result.riskAnalysis.riskTier,
    authenticityScore: result.authenticityScore.total,
    senderName: profile?.fullName || 'Academic Integrity Researcher'
  };

  recordSentAlert(alertRecord);

  return {
    success: true,
    record: alertRecord,
    dispatchUrl
  };
}

/**
 * Copies full forensic text to clipboard reliably.
 */
export async function copyAlertToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    throw new Error('Clipboard API unavailable');
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }
}
