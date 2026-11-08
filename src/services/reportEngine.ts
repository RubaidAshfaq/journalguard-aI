/**
 * SHODH SETU AI - Report Export & Generation Engine
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 */

import { VerificationResult, ResearcherProfile } from '../types';

export function exportResultToCSV(result: VerificationResult, profile: ResearcherProfile): void {
  const rows = [
    ['SHODHSETU - JOURNAL VERIFICATION REPORT'],
    ['Created by', 'Dr. Rubaid Ashfaq'],
    ['Report Date', result.timestamp],
    [''],
    ['RESEARCHER PROFILE'],
    ['Researcher Name', profile.fullName || 'Unspecified Researcher'],
    ['Designation', profile.designation || 'Not specified'],
    ['Institution', profile.institution || 'Not specified'],
    ['Department', profile.department || 'Not specified'],
    ['ORCID', profile.orcid || 'Not provided'],
    ['Email', profile.email || 'Not provided'],
    [''],
    ['JOURNAL IDENTIFIERS'],
    ['Journal Title', result.journal.title],
    ['Publisher', result.journal.publisher],
    ['ISSN / eISSN', result.journal.issn],
    ['Official Website', result.journal.website],
    ['Open Access Status', result.journal.openAccess ? 'Yes' : 'Subscription / Toll'],
    ['APC Verified', result.journal.apcVerified || 'Not verified'],
    [''],
    ['INTELLIGENCE SCORES'],
    ['Authenticity Score (0-100)', result.authenticityScore.total.toString()],
    ['Shodh Setu AI Analytical Risk Score', `${result.riskAnalysis.riskScore} (${result.riskAnalysis.riskTier})`],
    ['Research Fit Score', `${result.researchFit.total}% (${result.researchFit.tier})`],
    ['Cloning / Hijacking Risk', result.cloneGuard.isPossibleClone ? 'YES - ELEVATED/CRITICAL' : 'NO - RECORD CONSISTENT'],
    [''],
    ['INDEXING & SCHOLARLY INFRASTRUCTURE'],
    ['Crossref', result.sources.crossref.status],
    ['OpenAlex', result.sources.openalex.status],
    ['DOAJ', result.sources.doaj.status],
    ['Elsevier Scopus', result.sources.scopus.status],
    ['Clarivate Web of Science', result.sources.wos.status],
    [''],
    ['PUBLICATION BEHAVIOUR & VOLUME ANOMALY MONITOR'],
    ['Historical Baseline (Issues/Yr)', result.publicationBehaviour ? `${result.publicationBehaviour.historicalBaseline.avgIssuesPerYear} issues/yr` : 'Evaluated'],
    ['Historical Baseline (Papers/Yr)', result.publicationBehaviour ? `${result.publicationBehaviour.historicalBaseline.avgPapersPerYear} papers/yr` : 'Evaluated'],
    ['Latest Volume Telemetry', result.publicationBehaviour ? `${result.publicationBehaviour.currentPeriod.papers} papers across ${result.publicationBehaviour.currentPeriod.issues} issues` : 'Evaluated'],
    ['Anomaly Classification', result.publicationBehaviour ? result.publicationBehaviour.anomalyTier : 'NORMAL'],
    ['Behaviour Summary', result.publicationBehaviour ? `"${result.publicationBehaviour.summaryText.replace(/"/g, '""')}"` : 'Evaluated'],
    [''],
    ['FINAL VERDICT & RECOMMENDATION'],
    ['Final Status', result.recommendation.status],
    ['Summary', `"${result.recommendation.summary.replace(/"/g, '""')}"`],
    ['Limitations', `"${result.limitations.replace(/"/g, '""')}"`],
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Shodh Setu AI_Report_${result.journal.issn || 'Record'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportResultToJSON(result: VerificationResult, profile: ResearcherProfile): void {
  const exportPayload = {
    metadata: {
      generator: 'Shodh Setu AI',
      createdBy: 'Dr. Rubaid Ashfaq',
      exportedAt: new Date().toISOString(),
      disclaimer: 'Shodh Setu AI is an academic screening tool. Indicators do not represent official determinations by indexing bodies.',
    },
    researcher: profile,
    verification: result,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `Shodh Setu AI_Report_${result.journal.issn || 'Record'}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
