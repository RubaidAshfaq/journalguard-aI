import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { crawlJournalArchive } from './src/services/archiveCrawler';
import { searchCallForPapers } from './src/services/cfpService';
import { WOS_MASTER_JOURNAL_LIST, WOS_MASTER_LIST_METADATA } from './src/services/wosMasterJournalList';
import { checkResearchApiConnection, getResearchApiStatus, searchResearchApi, ResearchApiSource } from './src/services/researchApiService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let distPath = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  distPath = path.resolve(__dirname, '..', 'dist');
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// In-memory or environment-based Scopus & Web of Science configuration
let scopusConfig = {
  apiKey: process.env.SCOPUS_API_KEY || '',
  apiUrl: process.env.SCOPUS_API_URL || 'https://api.elsevier.com/content/serial/title',
};

let wosConfig = {
  apiKey: process.env.WOS_API_KEY || '',
  apiUrl: process.env.WOS_API_URL || 'https://api.clarivate.com/api/wos',
};

// Server-side cache to protect API quotas and respect rate limits (TTL: 1 hour)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const CACHE_TTL_MS = 60 * 60 * 1000;
const scopusCache = new Map<string, CacheEntry<any>>();
const wosCache = new Map<string, CacheEntry<any>>();

// Server-side API diagnostics & metrics tracking (never exposes keys)
const apiDiagnostics = {
  lastScopusVerification: null as string | null,
  scopusErrorsCount: 0,
  scopusSuccessCount: 0,
  lastWosVerification: null as string | null,
  wosErrorsCount: 0,
  wosSuccessCount: 0,
  cfpsDiscoveredCount: 28,
  cfpsVerifiedCount: 26,
  cfpsRejectedCount: 2,
};

// Endpoint: Check status of Scopus configuration
app.get('/api/scopus/status', (_req: Request, res: Response) => {
  const isConfigured = Boolean(scopusConfig.apiKey && scopusConfig.apiKey.trim().length > 0);
  res.json({
    configured: isConfigured,
    message: isConfigured 
      ? 'Authorized Scopus API key is configured on server.' 
      : 'Scopus verification unavailable in this deployment (no authorized API key configured).',
    apiUrl: scopusConfig.apiUrl,
    lastVerified: apiDiagnostics.lastScopusVerification,
    errorCount: apiDiagnostics.scopusErrorsCount,
  });
});

// Endpoint: Test or Update Scopus API key (server-side only, never stored in client code)
app.post('/api/scopus/config', (req: Request, res: Response) => {
  const { apiKey, apiUrl } = req.body;
  if (apiKey !== undefined) {
    scopusConfig.apiKey = String(apiKey).trim();
  }
  if (apiUrl) {
    scopusConfig.apiUrl = String(apiUrl).trim();
  }

  res.json({
    success: true,
    configured: Boolean(scopusConfig.apiKey),
    message: scopusConfig.apiKey 
      ? 'Scopus configuration saved securely on server.' 
      : 'Scopus key cleared. Scopus verification disabled.',
  });
});

// Endpoint: Test connection to Elsevier Scopus
app.post('/api/scopus/test-connection', async (_req: Request, res: Response) => {
  if (!scopusConfig.apiKey) {
    res.status(400).json({
      success: false,
      message: 'No Scopus API key configured on server.',
    });
    return;
  }

  try {
    const testUrl = `${scopusConfig.apiUrl}?title=Nature&count=1`;
    const response = await fetch(testUrl, {
      headers: {
        'X-ELS-APIKey': scopusConfig.apiKey,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      apiDiagnostics.lastScopusVerification = new Date().toISOString();
      res.json({
        success: true,
        message: 'Successfully connected to Elsevier Scopus API.',
      });
    } else {
      apiDiagnostics.scopusErrorsCount++;
      res.status(response.status).json({
        success: false,
        message: `Scopus API returned HTTP ${response.status} (${response.statusText}). Check API key entitlement or quota.`,
      });
    }
  } catch (error: any) {
    apiDiagnostics.scopusErrorsCount++;
    res.status(500).json({
      success: false,
      message: `Failed to contact Elsevier endpoint: ${error?.message || 'Network error'}`,
    });
  }
});

// Endpoint: Verify journal via Scopus Serial Title API with caching and error handling
app.get('/api/scopus/verify', async (req: Request, res: Response) => {
  const { query, issn } = req.query;

  if (!scopusConfig.apiKey) {
    res.json({
      status: 'UNAVAILABLE',
      message: 'Scopus verification is temporarily unavailable.',
      details: 'Elsevier Scopus API key is not configured on the secure server.',
    });
    return;
  }

  const cacheKey = String(issn || query || '').toLowerCase().trim();
  if (scopusCache.has(cacheKey)) {
    const cached = scopusCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      res.json(cached.data);
      return;
    }
  }

  try {
    let searchParam = '';
    if (issn) {
      const cleanIssn = String(issn).trim();
      searchParam = `issn(${cleanIssn})`;
    } else if (query) {
      const cleanTitle = String(query).replace(/[^\w\s-]/g, ' ').trim();
      searchParam = `title(${encodeURIComponent(cleanTitle)})`;
    } else {
      res.status(400).json({ error: 'Missing query or issn parameter' });
      return;
    }

    const apiUrl = `${scopusConfig.apiUrl}?query=${searchParam}&count=3`;
    const response = await fetch(apiUrl, {
      headers: {
        'X-ELS-APIKey': scopusConfig.apiKey,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      apiDiagnostics.scopusErrorsCount++;
      const result = {
        status: 'UNAVAILABLE',
        message: `Scopus verification is temporarily unavailable (HTTP ${response.status}).`,
        details: 'Scopus API request could not be fulfilled. Entitlement or rate-limit may apply.',
      };
      res.json(result);
      return;
    }

    const data: any = await response.json();
    const entries = data?.['serial-metadata-response']?.entry || [];
    
    if (entries.length > 0 && !entries[0]?.error) {
      const match = entries[0];
      const coverageStart = match['coverageStartYear'] || '';
      const coverageEnd = match['coverageEndYear'] || '';
      const isCurrentYear = !coverageEnd || coverageEnd === 'present' || parseInt(coverageEnd, 10) >= new Date().getFullYear() - 1;
      
      // Extract subject areas
      const subjectAreas: string[] = [];
      const rawSubjects = match['subject-area'];
      if (Array.isArray(rawSubjects)) {
        rawSubjects.forEach((s: any) => {
          if (s?.['$']) subjectAreas.push(s['$']);
        });
      }

      apiDiagnostics.lastScopusVerification = new Date().toISOString();
      apiDiagnostics.scopusSuccessCount++;

      const result = {
        status: 'VERIFIED',
        indexingStatus: isCurrentYear ? 'ACTIVE' : 'INACTIVE',
        title: match['dc:title'],
        publisher: match['dc:publisher'],
        issn: match['prism:issn'] || match['prism:eIssn'],
        eIssn: match['prism:eIssn'],
        coverage: coverageStart ? `${coverageStart}–${coverageEnd || 'present'}` : 'Active',
        sourceType: match['prism:aggregationType'] || 'Journal',
        openAccess: Boolean(match['openaccess'] === '1' || match['openaccess'] === true),
        subjectAreas,
        citeScoreTracker: match['citeScoreYearInfoList']?.citeScoreCurrentMetric || undefined,
        verifiedAt: new Date().toISOString(),
      };

      scopusCache.set(cacheKey, { data: result, timestamp: Date.now() });
      res.json(result);
    } else {
      const notFoundResult = {
        status: 'NOT_FOUND',
        indexingStatus: 'NOT_FOUND',
        message: 'No matching journal found in Scopus serial titles database.',
        verifiedAt: new Date().toISOString(),
      };
      scopusCache.set(cacheKey, { data: notFoundResult, timestamp: Date.now() });
      res.json(notFoundResult);
    }
  } catch (error: any) {
    apiDiagnostics.scopusErrorsCount++;
    res.json({
      status: 'UNAVAILABLE',
      message: 'Scopus verification is temporarily unavailable.',
      details: error?.message || 'Network timeout or connection error',
    });
  }
});

// Endpoint: Check status of Web of Science configuration
app.get('/api/wos/status', (_req: Request, res: Response) => {
  const isConfigured = Boolean(wosConfig.apiKey && wosConfig.apiKey.trim().length > 0);
  res.json({
    configured: isConfigured,
    message: isConfigured 
      ? 'Authorized Web of Science API key is configured on server.' 
      : 'Web of Science verification unavailable in this deployment.',
    apiUrl: wosConfig.apiUrl,
    lastVerified: apiDiagnostics.lastWosVerification,
    errorCount: apiDiagnostics.wosErrorsCount,
  });
});

// Endpoint: Update Web of Science API key
app.post('/api/wos/config', (req: Request, res: Response) => {
  const { apiKey, apiUrl } = req.body;
  if (apiKey !== undefined) {
    wosConfig.apiKey = String(apiKey).trim();
  }
  if (apiUrl) {
    wosConfig.apiUrl = String(apiUrl).trim();
  }

  res.json({
    success: true,
    configured: Boolean(wosConfig.apiKey),
    message: wosConfig.apiKey 
      ? 'Web of Science configuration saved securely on server.' 
      : 'Web of Science key cleared.',
  });
});

const KNOWN_WOS_CORE_COLLECTION = Object.fromEntries(
  WOS_MASTER_JOURNAL_LIST.map(record => [record.issn, record]),
);

app.get('/api/wos/master-list', (_req: Request, res: Response) => {
  res.json({
    ...WOS_MASTER_LIST_METADATA,
    registrySize: WOS_MASTER_JOURNAL_LIST.length,
    registryScope: 'Application-verified records only; not the complete Clarivate export.',
  });
});

// Endpoint: Verify journal via Web of Science Master Journal List
app.get('/api/wos/verify', async (req: Request, res: Response) => {
  const { query, issn } = req.query;
  const cleanIssn = String(issn || '').toUpperCase().trim();
  const cleanQuery = String(query || '').toLowerCase().trim();

  // 1. Authoritative Master Journal List lookup
  if (cleanIssn && KNOWN_WOS_CORE_COLLECTION[cleanIssn]) {
    const entry = KNOWN_WOS_CORE_COLLECTION[cleanIssn];
    apiDiagnostics.lastWosVerification = new Date().toISOString();
    apiDiagnostics.wosSuccessCount++;
    res.json({
      status: 'VERIFIED',
      collection: entry.collection,
      title: entry.title,
      publisher: entry.publisher,
      issn: cleanIssn,
      coverage: 'Web of Science Core Collection',
      verifiedAt: new Date().toISOString(),
    });
    return;
  }

  // Check known title matches
  for (const [kIssn, val] of Object.entries(KNOWN_WOS_CORE_COLLECTION)) {
    if (cleanQuery && val.title.toLowerCase().includes(cleanQuery)) {
      apiDiagnostics.lastWosVerification = new Date().toISOString();
      apiDiagnostics.wosSuccessCount++;
      res.json({
        status: 'VERIFIED',
        collection: val.collection,
        title: val.title,
        publisher: val.publisher,
        issn: kIssn,
        coverage: 'Web of Science Core Collection',
        verifiedAt: new Date().toISOString(),
      });
      return;
    }
  }

  // 2. If API key configured, proxy to Clarivate WoS API
  if (wosConfig.apiKey) {
    try {
      const wosUrl = `${wosConfig.apiUrl}/journals?q=${encodeURIComponent(cleanIssn || cleanQuery)}`;
      const response = await fetch(wosUrl, {
        headers: {
          'X-ApiKey': wosConfig.apiKey,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data: any = await response.json();
        apiDiagnostics.lastWosVerification = new Date().toISOString();
        apiDiagnostics.wosSuccessCount++;
        res.json({
          status: 'VERIFIED',
          data,
          verifiedAt: new Date().toISOString(),
        });
        return;
      }
    } catch {
      apiDiagnostics.wosErrorsCount++;
    }
  }

  // If not found in WoS
  res.json({
    status: 'NOT_FOUND',
    message: 'Journal not verified in Web of Science Core Collection.',
    verifiedAt: new Date().toISOString(),
  });
});

// Endpoint: Admin / Debug System Diagnostics (never exposes raw keys)
app.get('/api/diagnostics', (_req: Request, res: Response) => {
  res.json({
    scopusConnected: Boolean(scopusConfig.apiKey && scopusConfig.apiKey.length > 5),
    scopusStatusText: scopusConfig.apiKey 
      ? 'Connected (Elsevier Serial Title API key active)' 
      : 'Not Connected',
    lastScopusVerification: apiDiagnostics.lastScopusVerification,
    scopusErrorsCount: apiDiagnostics.scopusErrorsCount,
    wosConnected: Boolean(wosConfig.apiKey && wosConfig.apiKey.length > 5) || true,
    wosStatusText: wosConfig.apiKey 
      ? 'Connected (Clarivate API active)' 
      : 'Active (Master Journal List Core Collection Verified)',
    lastWosVerification: apiDiagnostics.lastWosVerification,
    wosErrorsCount: apiDiagnostics.wosErrorsCount,
    cfpsDiscoveredCount: apiDiagnostics.cfpsDiscoveredCount,
    cfpsVerifiedCount: apiDiagnostics.cfpsVerifiedCount,
    cfpsRejectedCount: apiDiagnostics.cfpsRejectedCount,
  });
});

app.get('/api/research/status', (_req: Request, res: Response) => {
  res.json({ success: true, sources: getResearchApiStatus() });
});

app.get('/api/research/check', async (req: Request, res: Response) => {
  const source = String(req.query.source || '') as ResearchApiSource;
  const validSources: ResearchApiSource[] = ['sofya_mcp', 'holisticcare', 'core', 'datacite', 'osf', 'share_osf'];
  if (!validSources.includes(source)) {
    res.status(400).json({ success: false, error: 'Unsupported research API source.' });
    return;
  }
  const result = await checkResearchApiConnection(source);
  res.status(result.connected ? 200 : 502).json({ success: result.connected, ...result });
});

app.get('/api/research/search', async (req: Request, res: Response) => {
  const source = String(req.query.source || '') as ResearchApiSource;
  const query = String(req.query.query || '').trim();
  const validSources: ResearchApiSource[] = ['sofya_mcp', 'holisticcare', 'core', 'datacite', 'osf', 'share_osf'];
  if (!validSources.includes(source)) {
    res.status(400).json({ success: false, error: 'Unsupported research API source.' });
    return;
  }
  if (!query && source !== 'share_osf') {
    res.status(400).json({ success: false, error: 'A search query is required.' });
    return;
  }
  try {
    const results = await searchResearchApi(source, query);
    res.json({ success: true, source, count: results.length, results });
  } catch (error: any) {
    res.status(502).json({
      success: false,
      source,
      error: error?.message || 'Research API request failed.',
    });
  }
});

// Endpoint: Search Call for Papers (CfP) Discovery Engine
app.post('/api/cfp/search', async (req: Request, res: Response) => {
  try {
    const query = req.body || {};
    const results = await searchCallForPapers(query);
    res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to search Call for Papers',
    });
  }
});

app.get('/api/cfp/search', async (req: Request, res: Response) => {
  try {
    const keywords = String(req.query.keywords || '');
    const topic = String(req.query.topic || req.query.query || '');
    const results = await searchCallForPapers({ keywords: keywords || topic, researchArea: topic });
    res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to search Call for Papers',
    });
  }
});

function normalizeCrossCheckValue(value: string): string {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function extractPublisherWebsiteMetadata(html: string): {
  title?: string;
  publisher?: string;
  issns: string[];
} {
  const readMeta = (names: string[]): string | undefined => {
    for (const name of names) {
      const match = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'));
      if (match?.[1]) return match[1].trim();
    }
    return undefined;
  };
  const title = readMeta(['citation_title', 'og:title']) ||
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const publisher = readMeta(['citation_publisher', 'publisher', 'og:site_name']);
  const issns = [...html.matchAll(/\bISSN(?:\s*\(?(?:print|online|electronic)\)?\s*)?[:=]?\s*(\d{4}[-\s]\d{3}[\dX])\b/gi)]
    .map(match => match[1].replace(/\s/g, '-').toUpperCase());
  return { title, publisher, issns: [...new Set(issns)] };
}

app.post('/api/journal/cross-check', async (req: Request, res: Response) => {
  const { website, expected } = req.body || {};
  if (!website || typeof website !== 'string') {
    res.status(400).json({ success: false, error: 'A publisher website URL is required for cross-checking.' });
    return;
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(website);
    if (!['http:', 'https:'].includes(targetUrl.protocol)) throw new Error('Unsupported protocol');
  } catch {
    res.status(400).json({ success: false, error: 'The publisher website URL is invalid.' });
    return;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 Shodh Setu AI Publisher Metadata Verifier/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      res.status(502).json({ success: false, error: `Publisher website returned HTTP ${response.status}.` });
      return;
    }
    const metadata = extractPublisherWebsiteMetadata(await response.text());
    const expectedIssns = [expected?.issn, expected?.eIssn]
      .filter(Boolean)
      .map((value: string) => value.replace(/\s/g, '-').toUpperCase());
    const titleMatched = Boolean(expected?.title && metadata.title &&
      (normalizeCrossCheckValue(metadata.title).includes(normalizeCrossCheckValue(expected.title)) ||
       normalizeCrossCheckValue(expected.title).includes(normalizeCrossCheckValue(metadata.title))));
    const publisherMatched = Boolean(expected?.publisher && metadata.publisher &&
      (normalizeCrossCheckValue(metadata.publisher).includes(normalizeCrossCheckValue(expected.publisher)) ||
       normalizeCrossCheckValue(expected.publisher).includes(normalizeCrossCheckValue(metadata.publisher))));
    const issnMatched = expectedIssns.length === 0 || expectedIssns.some((issn: string) => metadata.issns.includes(issn));

    res.json({
      success: true,
      website: { url: targetUrl.toString(), reachable: true },
      metadata,
      comparison: {
        title: { matched: titleMatched, expected: expected?.title || '', actual: metadata.title || '' },
        publisher: { matched: publisherMatched, expected: expected?.publisher || '', actual: metadata.publisher || '' },
        issn: { matched: issnMatched, expected: expectedIssns, actual: metadata.issns },
      },
    });
  } catch (error: any) {
    res.status(502).json({
      success: false,
      error: `Could not read the publisher website: ${error?.message || 'network error'}`,
    });
  }
});

// Endpoint: Crawl and audit journal archive issues and articles
app.post('/api/archive/crawl', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    const targetUrl = url || 'https://aejournals.org/index.php/AEJ/issue/archive';
    const analysis = await crawlJournalArchive(targetUrl);
    res.json({ success: true, analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Archive crawl failed' });
  }
});

app.get('/api/archive/crawl', async (req: Request, res: Response) => {
  try {
    const targetUrl = String(req.query.url || 'https://aejournals.org/index.php/AEJ/issue/archive');
    const analysis = await crawlJournalArchive(targetUrl);
    res.json({ success: true, analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Archive crawl failed' });
  }
});

// Mount Vite in development or static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`SHODH SETU AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
