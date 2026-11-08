/**
 * SHODH SETU AI - Web of Science Client
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Never scrapes restricted Clarivate pages.
 * Distinctly marks: VERIFIED, NOT FOUND, or UNAVAILABLE.
 */

import { DataSourceResult } from '../../types';

export async function queryWebOfScience(query: string, issn?: string): Promise<{
  sourceResult: DataSourceResult;
  journalTitle?: string;
  publisher?: string;
  issn?: string;
}> {
  const start = performance.now();
  const timestamp = new Date().toISOString();

  try {
    const params = new URLSearchParams();
    if (issn) params.append('issn', issn);
    if (query) params.append('query', query);

    const res = await fetch(`/api/wos/verify?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'VERIFIED') {
        return {
          sourceResult: {
            source: 'wos',
            displayName: 'Clarivate Web of Science (WoS)',
            status: 'VERIFIED',
            statusLabel: 'VERIFIED IN WOS',
            details: `Indexed in Web of Science Core Collection (${data.collection || 'SCIE/SSCI'}).`,
            data,
            lastChecked: timestamp,
            latencyMs: Math.round(performance.now() - start),
          },
          journalTitle: data.title,
          publisher: data.publisher,
          issn: data.issn,
        };
      }

      if (data.status === 'NOT_FOUND') {
        return {
          sourceResult: {
            source: 'wos',
            displayName: 'Clarivate Web of Science (WoS)',
            status: 'NOT_FOUND',
            statusLabel: 'NOT IN WOS CORE COLLECTION',
            details: 'No record in Clarivate Web of Science database.',
            data,
            lastChecked: timestamp,
            latencyMs: Math.round(performance.now() - start),
          },
        };
      }
    }

    return {
      sourceResult: {
        source: 'wos',
        displayName: 'Clarivate Web of Science (WoS)',
        status: 'UNAVAILABLE',
        statusLabel: 'VERIFICATION UNAVAILABLE',
        details: 'Web of Science verification unavailable in this deployment (requires authorized Clarivate API integration). Never scraped without authorization.',
        lastChecked: timestamp,
        latencyMs: Math.round(performance.now() - start),
      },
    };
  } catch (err: any) {
    return {
      sourceResult: {
        source: 'wos',
        displayName: 'Clarivate Web of Science (WoS)',
        status: 'UNAVAILABLE',
        statusLabel: 'VERIFICATION UNAVAILABLE',
        details: 'Web of Science verification unavailable in this deployment.',
        lastChecked: timestamp,
        latencyMs: Math.round(performance.now() - start),
      },
    };
  }
}
