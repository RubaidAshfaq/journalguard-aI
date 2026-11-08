/**
 * SHODH SETU AI - Directory of Open Access Journals (DOAJ) Connector
 * Verifies open-access legitimacy, peer-review transparency, license, and APC terms.
 */

import { DataSourceResult } from '../../types';

export async function queryDOAJ(query: string, issn?: string): Promise<{
  sourceResult: DataSourceResult;
  journalTitle?: string;
  publisher?: string;
  issn?: string;
  hasSeal?: boolean;
  apcDetails?: string;
  license?: string;
  homepageUrl?: string;
}> {
  const start = performance.now();
  const timestamp = new Date().toISOString();

  try {
    const cleanQuery = query.trim();
    const targetQuery = issn || cleanQuery;
    const url = `https://doaj.org/api/v2/search/journals/${encodeURIComponent(targetQuery)}?pageSize=3`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const results = data.results || [];

      if (results.length > 0) {
        const top = results[0];
        const bib = top.bibjson || {};
        const title = bib.title || cleanQuery;
        const publisher = bib.publisher?.name || 'DOAJ Registered Publisher';
        const pissn = bib.pissn || '';
        const eissn = bib.eissn || '';
        const hasSeal = Boolean(top.admin?.seal);
        const hasApc = bib.apc?.has_apc;
        const license = bib.license?.[0]?.type || 'Open Access';
        
        let apcDetails = 'No APC (Diamond Open Access)';
        if (hasApc) {
          const max = bib.apc?.max?.[0];
          apcDetails = max ? `${max.currency} ${max.price}` : 'Fee required';
        }

        const links = bib.link || [];
        const homepageUrl = links.find((l: any) => l.type === 'homepage')?.url || links[0]?.url || '';

        return {
          sourceResult: {
            source: 'doaj',
            displayName: 'Directory of Open Access Journals (DOAJ)',
            status: 'VERIFIED',
            statusLabel: hasSeal ? 'VERIFIED (DOAJ SEAL)' : 'VERIFIED IN DOAJ',
            details: `Strictly verified in DOAJ. License: ${license}. APC Policy: ${apcDetails}.${hasSeal ? ' Awarded DOAJ Seal for best publishing practices.' : ''}`,
            data: {
              title,
              publisher,
              pissn,
              eissn,
              hasSeal,
              license,
              apcDetails,
              homepageUrl,
            },
            lastChecked: timestamp,
            latencyMs: Math.round(performance.now() - start),
          },
          journalTitle: title,
          publisher,
          issn: eissn || pissn,
          hasSeal,
          apcDetails,
          license,
          homepageUrl,
        };
      }
    }

    return {
      sourceResult: {
        source: 'doaj',
        displayName: 'Directory of Open Access Journals (DOAJ)',
        status: 'NOT_FOUND',
        statusLabel: 'NOT LISTED IN DOAJ',
        details: 'Journal is not indexed in DOAJ. (Note: Subscription / toll-access journals are not included in DOAJ by definition).',
        lastChecked: timestamp,
        latencyMs: Math.round(performance.now() - start),
      },
    };
  } catch (err: any) {
    return {
      sourceResult: {
        source: 'doaj',
        displayName: 'Directory of Open Access Journals (DOAJ)',
        status: 'UNAVAILABLE',
        statusLabel: 'SOURCE TEMPORARILY UNAVAILABLE',
        details: `DOAJ public API unreachable: ${err?.message || 'Network issue'}.`,
        lastChecked: timestamp,
        latencyMs: Math.round(performance.now() - start),
      },
    };
  }
}
