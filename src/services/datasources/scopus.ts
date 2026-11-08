/**
 * SHODH SETU AI - Scopus API Client
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Secure backend-mediated integration.
 * NEVER fabricates Scopus indexing results.
 */

import { DataSourceResult } from '../../types';

export async function queryScopus(query: string, issn?: string): Promise<{
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

    const res = await fetch(`/api/scopus/verify?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      
      if (data.status === 'VERIFIED') {
        return {
          sourceResult: {
            source: 'scopus',
            displayName: 'Elsevier Scopus API',
            status: 'VERIFIED',
            statusLabel: 'VERIFIED IN SCOPUS',
            details: `Active Scopus record: "${data.title}". Publisher: ${data.publisher || 'Elsevier/Authorized'}. Coverage: ${data.coverage || 'Active'}.`,
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
            source: 'scopus',
            displayName: 'Elsevier Scopus API',
            status: 'NOT_FOUND',
            statusLabel: 'NOT INDEXED IN SCOPUS',
            details: 'Query checked against Elsevier Scopus Serial Titles database; no matching record found.',
            data,
            lastChecked: timestamp,
            latencyMs: Math.round(performance.now() - start),
          },
        };
      }

      // UNAVAILABLE
      return {
        sourceResult: {
          source: 'scopus',
          displayName: 'Elsevier Scopus API',
          status: 'UNAVAILABLE',
          statusLabel: 'SCOPUS UNAVAILABLE',
          details: data.details || 'Scopus verification unavailable in this deployment (requires authorized Elsevier API credentials on server).',
          lastChecked: timestamp,
          latencyMs: Math.round(performance.now() - start),
        },
      };
    }

    return {
      sourceResult: {
        source: 'scopus',
        displayName: 'Elsevier Scopus API',
        status: 'UNAVAILABLE',
        statusLabel: 'SCOPUS UNAVAILABLE',
        details: 'Scopus verification endpoint returned an error or is unconfigured.',
        lastChecked: timestamp,
        latencyMs: Math.round(performance.now() - start),
      },
    };
  } catch (err: any) {
    return {
      sourceResult: {
        source: 'scopus',
        displayName: 'Elsevier Scopus API',
        status: 'UNAVAILABLE',
        statusLabel: 'SCOPUS UNAVAILABLE',
        details: 'Scopus verification unavailable in this deployment.',
        lastChecked: timestamp,
        latencyMs: Math.round(performance.now() - start),
      },
    };
  }
}
