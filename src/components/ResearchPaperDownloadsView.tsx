import React, { useState } from 'react';
import { BookOpen, Download, ExternalLink, Github, Search, RefreshCw, AlertTriangle } from 'lucide-react';

const RESP_REPOSITORY_URL = 'https://github.com/monk1337/resp';
const RESP_DOWNLOAD_URL = `${RESP_REPOSITORY_URL}/archive/refs/heads/main.zip`;
const RESP_PYPI_URL = 'https://pypi.org/project/respsearch/';

export const ResearchPaperDownloadsView: React.FC = () => (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <div>
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Research Paper Downloads
        </h1>
      </div>
      <p className="text-sm text-slate-500 mt-1">
        Curated tools and resources for discovering academic papers from trusted research sources.
      </p>
    </div>

    <ResearchApiSearch />

    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Featured research tool</p>
            <h2 className="text-xl font-bold text-slate-900 mt-1">RESP: Research Papers Search</h2>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Search and fetch academic papers across arXiv, Semantic Scholar, Google Scholar,
              ACM, ACL Anthology, and other research sources.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold whitespace-nowrap">
          <Search className="w-3.5 h-3.5" />
          Paper discovery
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <a
          href={RESP_DOWNLOAD_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          Download RESP
        </a>
        <a
          href={RESP_REPOSITORY_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors"
        >
          View GitHub repository
          <ExternalLink className="w-4 h-4" />
        </a>
        <a
          href={RESP_PYPI_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-blue-700 hover:bg-blue-50 text-sm font-semibold transition-colors"
        >
          Install from PyPI
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <p className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
        External resource by <span className="font-semibold text-slate-700">monk1337</span>.
        Review each paper&apos;s publisher, license, and access terms before downloading or citing.
      </p>
    </article>
  </div>
);

const RESEARCH_SOURCES = [
  { id: 'core', label: 'CORE Open Access' },
  { id: 'datacite', label: 'DataCite DOI Metadata' },
  { id: 'osf', label: 'OSF Registrations' },
  { id: 'share_osf', label: 'SHARE OSF Sources' },
  { id: 'holisticcare', label: 'The Holistic Care Resources' },
] as const;

function ResearchApiSearch() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<(typeof RESEARCH_SOURCES)[number]['id']>('core');
  const [results, setResults] = useState<Array<{ title: string; description?: string; authors?: string; doi?: string; url?: string; source: string }>>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const search = async () => {
    if (!query.trim()) {
      setMessage('Enter a topic, title, DOI, or author name.');
      return;
    }
    setIsSearching(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/research/search?source=${source}&query=${encodeURIComponent(query.trim())}`);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Research source unavailable.');
      setResults(data.results || []);
      setMessage(`${data.count || 0} results returned from ${RESEARCH_SOURCES.find(item => item.id === source)?.label}.`);
    } catch (error) {
      setResults([]);
      setMessage(error instanceof Error ? error.message : 'Research source unavailable.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="rounded-3xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Multi-source research discovery</h2>
      </div>
      <p className="text-sm text-slate-600 mt-1">
        Search trusted scholarly metadata through server-side integrations. Results are labeled by source and are not treated as journal-indexing evidence.
      </p>
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <select value={source} onChange={event => setSource(event.target.value as typeof source)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
          {RESEARCH_SOURCES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') void search(); }} placeholder="Search title, topic, DOI, or author..." className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
        <button onClick={() => void search()} disabled={isSearching} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </div>
      {message && <p className="mt-3 text-xs text-slate-600">{message}</p>}
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((result, index) => (
            <article key={`${result.source}-${result.doi || result.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{result.title}</h3>
              {result.authors && <p className="mt-1 text-xs text-slate-500">{result.authors}</p>}
              {result.description && <p className="mt-2 text-sm text-slate-600 line-clamp-3">{result.description}</p>}
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                <span className="text-blue-700 font-medium">{result.source}</span>
                {result.doi && <span className="font-mono text-slate-500">DOI: {result.doi}</span>}
                {result.url && <a href={result.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-700 hover:underline">Open source <ExternalLink className="w-3 h-3" /></a>}
              </div>
            </article>
          ))}
        </div>
      )}
      {message?.includes('not configured') && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700"><AlertTriangle className="w-4 h-4" />Configure the source key on the server to enable registered access.</div>
      )}
    </section>
  );
}
