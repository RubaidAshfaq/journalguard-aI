/**
 * Server-side adapters for optional scholarly discovery APIs.
 * Credentials are read only from environment variables and never returned.
 */

export type ResearchApiSource = 'sofya_mcp' | 'holisticcare' | 'core' | 'datacite' | 'osf' | 'share_osf';

interface ResearchApiConfig {
  key?: string;
  baseUrl: string;
  configured: boolean;
}

export interface ResearchApiResult {
  source: ResearchApiSource;
  title: string;
  description?: string;
  authors?: string;
  year?: number;
  doi?: string;
  url?: string;
  rawId?: string;
}

const configs: Record<ResearchApiSource, ResearchApiConfig> = {
  sofya_mcp: {
    key: process.env.SOFYA_MCP_API_KEY,
    baseUrl: process.env.SOFYA_MCP_URL || '',
    configured: Boolean(process.env.SOFYA_MCP_URL),
  },
  holisticcare: {
    key: process.env.HOLISTICCARE_API_KEY,
    baseUrl: process.env.HOLISTICCARE_API_URL || 'https://api.theholisticcare.com/v1',
    configured: true,
  },
  core: {
    key: process.env.CORE_API_KEY,
    baseUrl: process.env.CORE_API_URL || 'https://api.core.ac.uk/v3',
    configured: Boolean(process.env.CORE_API_KEY),
  },
  datacite: {
    key: process.env.DATACITE_API_KEY,
    baseUrl: process.env.DATACITE_API_URL || 'https://api.datacite.org',
    configured: true,
  },
  osf: {
    key: process.env.OSF_API_TOKEN,
    baseUrl: process.env.OSF_API_URL || 'https://api.osf.io/v2',
    configured: true,
  },
  share_osf: {
    key: process.env.SHARE_OSF_API_TOKEN,
    baseUrl: process.env.SHARE_OSF_API_URL || 'https://share.osf.io/api/v2',
    configured: true,
  },
};

export function getResearchApiStatus(): Record<ResearchApiSource, { configured: boolean; authentication: 'required' | 'optional' | 'mcp' }> {
  return {
    sofya_mcp: { configured: configs.sofya_mcp.configured, authentication: 'mcp' },
    holisticcare: { configured: true, authentication: 'optional' },
    core: { configured: configs.core.configured, authentication: 'required' },
    datacite: { configured: true, authentication: 'optional' },
    osf: { configured: true, authentication: 'optional' },
    share_osf: { configured: true, authentication: 'optional' },
  };
}

function headers(config: ResearchApiConfig): Record<string, string> {
  return {
    Accept: 'application/json',
    ...(config.key ? { Authorization: `Bearer ${config.key}` } : {}),
  };
}

function asArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.records)) return value.records;
  return [];
}

function normalize(source: ResearchApiSource, item: any): ResearchApiResult | null {
  const attributes = item?.attributes || item;
  const title = attributes?.title || attributes?.titles?.[0]?.title || attributes?.name;
  if (!title || typeof title !== 'string') return null;
  const creators = attributes?.creators || attributes?.authors || [];
  const authors = Array.isArray(creators)
    ? creators.map((creator: any) => creator?.name || creator?.family || creator?.given).filter(Boolean).join(', ')
    : undefined;
  return {
    source,
    title: title.trim(),
    description: attributes?.description || attributes?.descriptions?.[0]?.description || attributes?.abstract || attributes?.summary,
    authors,
    year: Number(attributes?.publication_year || attributes?.published || attributes?.date_created || 0) || undefined,
    doi: attributes?.doi || attributes?.identifiers?.doi,
    url: attributes?.url || attributes?.links?.html || attributes?.links?.self,
    rawId: item?.id || attributes?.id,
  };
}

export async function searchResearchApi(source: ResearchApiSource, query: string): Promise<ResearchApiResult[]> {
  const config = configs[source];
  if (!config.configured && source !== 'holisticcare' && source !== 'datacite') {
    throw new Error(`${source} is not configured on the server.`);
  }
  if (source === 'sofya_mcp') {
    throw new Error('Sofya MCP is a tool server, not a REST search endpoint. Configure its MCP URL for an MCP client connection.');
  }

  const params = new URLSearchParams();
  let endpoint = config.baseUrl;
  if (source === 'holisticcare') {
    endpoint += '/resources';
    params.set('q', query);
    params.set('limit', '10');
  } else if (source === 'core') {
    endpoint += '/search/works';
    params.set('q', query);
    params.set('limit', '10');
  } else if (source === 'datacite') {
    endpoint += '/dois';
    params.set('query', query);
    params.set('page[size]', '10');
  } else if (source === 'osf') {
    endpoint += '/nodes/';
    params.set('filter[title]', query);
    params.set('page[size]', '10');
  } else {
    endpoint += '/sources/';
    params.set('page[size]', '10');
  }

  const response = await fetch(`${endpoint}?${params.toString()}`, {
    headers: headers(config),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`${source} returned HTTP ${response.status}.`);
  const payload = await response.json();
  return asArray(payload).map(item => normalize(source, item)).filter((item): item is ResearchApiResult => Boolean(item));
}
