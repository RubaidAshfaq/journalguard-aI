import React from 'react';
import { BookOpen, Download, ExternalLink, Github, Search } from 'lucide-react';

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
