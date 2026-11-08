/**
 * SHODH SETU AI - Crossref Open Scholarly API Connector
 * Provides open bibliographic records, publisher identity, ISSNs, and DOI prefix metadata.
 */

import { DataSourceResult } from '../../types';

export async function queryCrossref(query: string, issn?: string): Promise<{
  sourceResult: DataSourceResult;
  journalTitle?: string;
  publisher?: string;
  issn?: string;
  doiPrefix?: string;
  publisherUrl?: string;
}> {
  const start = performance.now();
  const timestamp = new Date().toISOString();

  try {
    // If input is DOI
    const cleanQuery = query.trim();
    const isDoi = cleanQuery.startsWith('10.') || cleanQuery.includes('doi.org/10.');
    
    if (isDoi) {
      const doiString = cleanQuery.replace(/^https?:\/\/doi\.org\//i, '');
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doiString)}`, {
        headers: { 'User-Agent': 'Shodh Setu AI/1.0 (mailto:academic-research@shodhsetu.org)' },
      });
      if (res.ok) {
        const json = await res.json();
        const msg = json.message || {};
        const title = msg['container-title']?.[0] || 'Unknown Journal';
        const publisher = msg.publisher || 'Unknown Publisher';
        const foundIssn = msg.ISSN?.[0] || '';
        const prefix = msg.prefix || '';

        return {
          sourceResult: {
            source: 'crossref',
            displayName: 'Crossref Metadata',
            status: 'FOUND',
            statusLabel: 'FOUND VIA DOI DEPOSIT',
            details: `Crossref record resolved via DOI. Registered by ${publisher}.`,
            data: { publisher, title, issn: foundIssn, prefix },
            lastChecked: timestamp,
            latencyMs: Math.round(performance.now() - start),
          },
          journalTitle: title,
          publisher,
          issn: foundIssn,
          doiPrefix: prefix,
        };
      }
    }

    // Try ISSN lookup directly
    const targetIssn = issn || (cleanQuery.match(/^\d{4}-\d{3}[\dX]$/i) ? cleanQuery : undefined);
    if (targetIssn) {
      const res = await fetch(`https://api.crossref.org/journals/${encodeURIComponent(targetIssn)}`, {
        headers: { 'User-Agent': 'Shodh Setu AI/1.0 (mailto:academic-research@shodhsetu.org)' },
      });
      if (res.ok) {
        const json = await res.json();
        const msg = json.message || {};
        const title = msg.title || 'Unknown Title';
        const publisher = msg.publisher || 'Crossref Registered Publisher';
        const foundIssn = msg.ISSN?.[0] || targetIssn;
        const publisherUrl = msg.URL || msg['publisher-url'] || '';

        return {
          sourceResult: {
            source: 'crossref',
            displayName: 'Crossref Metadata',
            status: 'FOUND',
            statusLabel: 'VERIFIED IN CROSSREF',
            details: `Official Crossref journal record for ISSN ${targetIssn}. Publisher: ${publisher}.`,
            data: msg,
            lastChecked: timestamp,
            latencyMs: Math.round(performance.now() - start),
          },
          journalTitle: title,
          publisher,
          issn: foundIssn,
          publisherUrl,
        };
      }
    }

    // Otherwise search works by container title
    const searchRes = await fetch(`https://api.crossref.org/works?query.container-title=${encodeURIComponent(cleanQuery)}&rows=3`, {
      headers: { 'User-Agent': 'Shodh Setu AI/1.0 (mailto:academic-research@shodhsetu.org)' },
    });

    if (searchRes.ok) {
      const json = await searchRes.json();
      const items = json.message?.items || [];
      if (items.length > 0) {
        const top = items[0];
        const title = top['container-title']?.[0] || cleanQuery;
        const publisher = top.publisher || 'Registered Publisher';
        const foundIssn = top.ISSN?.[0] || '';
        const prefix = top.prefix || '';

        return {
          sourceResult: {
            source: 'crossref',
            displayName: 'Crossref Metadata',
            status: 'FOUND',
            statusLabel: 'FOUND IN CROSSREF',
            details: `Matching publications indexed. Publisher: ${publisher}. DOI Prefix: ${prefix || 'Active'}.`,
            data: { publisher, title, issn: foundIssn, sampleDoi: top.DOI },
            lastChecked: timestamp,
            latencyMs: Math.round(performance.now() - start),
          },
          journalTitle: title,
          publisher,
          issn: foundIssn,
          doiPrefix: prefix,
        };
      }
    }

    return {
      sourceResult: {
        source: 'crossref',
        displayName: 'Crossref Metadata',
        status: 'NOT_FOUND',
        statusLabel: 'NO CROSSREF RECORD',
        details: 'No deposited records or registered journal container found in Crossref for this query.',
        lastChecked: timestamp,
        latencyMs: Math.round(performance.now() - start),
      },
    };
  } catch (err: any) {
    return {
      sourceResult: {
        source: 'crossref',
        displayName: 'Crossref Metadata',
        status: 'UNAVAILABLE',
        statusLabel: 'SOURCE TEMPORARILY UNAVAILABLE',
        details: `Could not reach Crossref API: ${err?.message || 'Network timeout'}. Continuing with remaining sources.`,
        lastChecked: timestamp,
        latencyMs: Math.round(performance.now() - start),
      },
    };
  }
}
