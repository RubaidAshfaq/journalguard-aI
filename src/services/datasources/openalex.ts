/**
 * SHODH SETU AI - OpenAlex Scholarly Source Connector
 * Clearly labeled as: OpenAlex metadata.
 * Do not call OpenAlex equivalent to Scopus.
 */

import { DataSourceResult } from '../../types';

export async function queryOpenAlex(query: string, issn?: string): Promise<{
  sourceResult: DataSourceResult;
  journalTitle?: string;
  publisher?: string;
  issn?: string;
  isOa?: boolean;
  apcUsd?: number | null;
  subjectAreas?: string[];
  homepageUrl?: string;
  hIndex?: number;
  worksCount?: number;
}> {
  const start = performance.now();
  const timestamp = new Date().toISOString();

  try {
    const cleanQuery = query.trim();
    let url = '';

    const targetIssn = issn || (cleanQuery.match(/^\d{4}-\d{3}[\dX]$/i) ? cleanQuery : undefined);
    if (targetIssn) {
      url = `https://api.openalex.org/sources?filter=issn:${encodeURIComponent(targetIssn)}`;
    } else {
      url = `https://api.openalex.org/sources?search=${encodeURIComponent(cleanQuery)}`;
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Shodh Setu AI/1.0 (mailto:academic-research@shodhsetu.org)' },
    });

    if (res.ok) {
      const data = await res.json();
      const results = data.results || [];

      if (results.length > 0) {
        const top = results[0];
        const title = top.display_name || cleanQuery;
        const publisher = top.host_organization_name || 'OpenAlex Indexed Publisher';
        const foundIssn = top.issn_l || (top.issn && top.issn[0]) || '';
        const isOa = Boolean(top.is_oa);
        const apcUsd = top.apc_usd;
        const homepageUrl = top.homepage_url || '';
        const hIndex = top.summary_stats?.h_index || 0;
        const worksCount = top.works_count || 0;
        const subjectAreas = (top.x_concepts || [])
          .slice(0, 5)
          .map((c: any) => c.display_name);

        return {
          sourceResult: {
            source: 'openalex',
            displayName: 'OpenAlex Scholarly Engine',
            status: 'FOUND',
            statusLabel: 'OPENALEX METADATA FOUND',
            details: `OpenAlex metadata record identified: "${title}". Publisher: ${publisher}. Indexed works: ${worksCount.toLocaleString()}. NOTE: OpenAlex is an open scholarly metadata graph, distinct from commercial indexation (Scopus/WoS).`,
            data: {
              openAlexId: top.id,
              title,
              publisher,
              issn: foundIssn,
              isOa,
              apcUsd,
              homepageUrl,
              hIndex,
              worksCount,
              countsByYear: top.counts_by_year || [],
            },
            lastChecked: timestamp,
            latencyMs: Math.round(performance.now() - start),
          },
          journalTitle: title,
          publisher,
          issn: foundIssn,
          isOa,
          apcUsd,
          subjectAreas,
          homepageUrl,
          hIndex,
          worksCount,
        };
      }
    }

    return {
      sourceResult: {
        source: 'openalex',
        displayName: 'OpenAlex Scholarly Engine',
        status: 'NOT_FOUND',
        statusLabel: 'NOT FOUND IN OPENALEX',
        details: 'No matching academic source found in OpenAlex open catalog.',
        lastChecked: timestamp,
        latencyMs: Math.round(performance.now() - start),
      },
    };
  } catch (err: any) {
    return {
      sourceResult: {
        source: 'openalex',
        displayName: 'OpenAlex Scholarly Engine',
        status: 'UNAVAILABLE',
        statusLabel: 'SOURCE TEMPORARILY UNAVAILABLE',
        details: `OpenAlex API network failure: ${err?.message || 'Timeout'}. Proceeding with remaining sources.`,
        lastChecked: timestamp,
        latencyMs: Math.round(performance.now() - start),
      },
    };
  }
}
