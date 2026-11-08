/**
 * Shodh Setu AI - Delisted Journals Repository View
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Comprehensive, searchable repository of academic serials delisted, suppressed, or discontinued
 * from Clarivate Web of Science, Elsevier Scopus, DOAJ, and UGC-CARE.
 * Allows researchers to explore reasons, export data, and submit newly delisted journals.
 */

import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Download, 
  Share2, 
  Plus, 
  ExternalLink, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  BookMarked, 
  Check, 
  X, 
  Sparkles,
  Info,
  ChevronDown,
  Globe,
  FileText,
  FileSpreadsheet,
  UploadCloud
} from 'lucide-react';
import { DelistedJournal, DelistedIndexSource, ResearcherProfile } from '../types';
import { ExcelUploadModal } from './ExcelUploadModal';

interface DelistedRepositoryViewProps {
  journals: DelistedJournal[];
  onAddJournal: (journal: DelistedJournal) => void;
  onAddBatchJournals?: (journals: DelistedJournal[]) => void;
  onVerifyJournal: (query: string) => void;
  profile?: ResearcherProfile;
}

export const DelistedRepositoryView: React.FC<DelistedRepositoryViewProps> = ({
  journals,
  onAddJournal,
  onAddBatchJournals,
  onVerifyJournal,
  profile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndexFilter, setSelectedIndexFilter] = useState<'ALL' | DelistedIndexSource>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // New Delisted Journal Form State
  const [formTitle, setFormTitle] = useState('');
  const [formIssn, setFormIssn] = useState('');
  const [formPublisher, setFormPublisher] = useState('');
  const [formIndexes, setFormIndexes] = useState<DelistedIndexSource[]>(['Web of Science']);
  const [formYear, setFormYear] = useState<number>(new Date().getFullYear());
  const [formReason, setFormReason] = useState('');
  const [formCategory, setFormCategory] = useState<DelistedJournal['category']>('peer_review_papermill');
  const [formStatus, setFormStatus] = useState<DelistedJournal['status']>('DELISTED');
  const [formEvidence, setFormEvidence] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Filtered journals
  const filteredJournals = useMemo(() => {
    return journals.filter(item => {
      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.title.toLowerCase().includes(q) ||
        item.issn.toLowerCase().includes(q) ||
        item.publisher.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q);

      // Index filter
      const matchesIndex = selectedIndexFilter === 'ALL' || item.delistedFrom.includes(selectedIndexFilter);

      // Category filter
      const matchesCategory = selectedCategoryFilter === 'ALL' || item.category === selectedCategoryFilter;

      return matchesSearch && matchesIndex && matchesCategory;
    });
  }, [journals, searchQuery, selectedIndexFilter, selectedCategoryFilter]);

  // Statistics
  const wosCount = journals.filter(j => j.delistedFrom.includes('Web of Science')).length;
  const scopusCount = journals.filter(j => j.delistedFrom.includes('Scopus')).length;
  const doajCount = journals.filter(j => j.delistedFrom.includes('DOAJ')).length;
  const ugcCount = journals.filter(j => j.delistedFrom.includes('UGC-CARE')).length;

  // Handle Share Record
  const handleShareRecord = async (journal: DelistedJournal) => {
    const text = `⚠️ DELISTED JOURNAL ALERT: "${journal.title}" (ISSN: ${journal.issn}) was delisted from ${journal.delistedFrom.join(', ')} in ${journal.delistedYear}. Reason: ${journal.reason}. Tracked via Shodh Setu AI (Concept: Dr. Rubaid Ashfaq).`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopiedId(journal.id);
        setTimeout(() => setCopiedId(null), 2500);
      }
    } catch {
      setCopiedId(journal.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Export Delisted Repository as CSV
  const handleExportCSV = () => {
    const headers = ['Title', 'ISSN', 'Publisher', 'Delisted From', 'Year', 'Status', 'Reason', 'Last Known Volume', 'Evidence Source'];
    const rows = filteredJournals.map(j => [
      `"${j.title.replace(/"/g, '""')}"`,
      j.issn,
      `"${j.publisher.replace(/"/g, '""')}"`,
      `"${j.delistedFrom.join(', ')}"`,
      j.delistedYear,
      j.status,
      `"${j.reason.replace(/"/g, '""')}"`,
      `"${(j.lastKnownIndexedVolume || '').replace(/"/g, '""')}"`,
      `"${(j.evidenceSource || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `Shodh Setu AI_Delisted_Journals_Repository_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Submit Form
  const handleSubmitNewDelisted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formIssn.trim() || !formReason.trim()) return;

    const newEntry: DelistedJournal = {
      id: `delist-user-${Date.now()}`,
      title: formTitle.trim(),
      issn: formIssn.trim(),
      publisher: formPublisher.trim() || 'Unspecified Publisher',
      delistedFrom: formIndexes.length > 0 ? formIndexes : ['Web of Science'],
      delistedYear: Number(formYear) || new Date().getFullYear(),
      reason: formReason.trim(),
      category: formCategory,
      status: formStatus,
      dateAdded: new Date().toISOString().split('T')[0],
      sharedBy: profile?.fullName || 'Academic Community Researcher',
      evidenceSource: formEvidence.trim() || 'Authoritative Publisher / Index Advisory',
      notes: formNotes.trim() || undefined,
    };

    onAddJournal(newEntry);
    setIsSubmitModalOpen(false);

    // Reset Form
    setFormTitle('');
    setFormIssn('');
    setFormPublisher('');
    setFormReason('');
    setFormEvidence('');
    setFormNotes('');
  };

  const toggleIndexCheckbox = (src: DelistedIndexSource) => {
    if (formIndexes.includes(src)) {
      if (formIndexes.length > 1) {
        setFormIndexes(formIndexes.filter(i => i !== src));
      }
    } else {
      setFormIndexes([...formIndexes, src]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Hero Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden shadow-xl border border-rose-900/40">
        {/* Google 4-color accent stripe */}
        <div className="h-1.5 w-full grid grid-cols-4 absolute top-0 left-0 right-0">
          <span className="bg-[#4285F4]"></span>
          <span className="bg-[#EA4335]"></span>
          <span className="bg-[#FBBC05]"></span>
          <span className="bg-[#34A853]"></span>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5" />
              Delisted Repository
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-rose-200 text-xs font-semibold backdrop-blur-xs">
              Academic Concept: Dr. Rubaid Ashfaq · Co-creator: Zeba Nabi
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Delisted &amp; Discontinued Journals Repository
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                An authoritative, searchable registry of academic journals discontinued or suppressed from Clarivate Web of Science, Elsevier Scopus, DOAJ, and UGC-CARE due to compromised peer review, rogue special issues, citation cartels, or predatory practices.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                title="Upload Excel (.xlsx, .xls) or CSV spreadsheet containing multiple discontinued journals"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload Excel / CSV List</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Share a Delisted Journal</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 transition-colors border border-white/20 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/15">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">Web of Science</span>
              <span className="text-xl sm:text-2xl font-black text-white">{wosCount}</span>
              <span className="text-[10px] text-slate-300 block">Delisted / Suppressed</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">Scopus Radar</span>
              <span className="text-xl sm:text-2xl font-black text-white">{scopusCount}</span>
              <span className="text-[10px] text-slate-300 block">Discontinued Serials</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">DOAJ &amp; UGC-CARE</span>
              <span className="text-xl sm:text-2xl font-black text-white">{doajCount + ugcCount}</span>
              <span className="text-[10px] text-slate-300 block">Purged / Blacklisted</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">Total Delisted Tracked</span>
              <span className="text-xl sm:text-2xl font-black text-white">{journals.length}</span>
              <span className="text-[10px] text-slate-300 block">Continuous Due Diligence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by journal title, ISSN, publisher, or delisting reason..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium focus:bg-white focus:border-rose-500 focus:outline-hidden transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Categories / Causes</option>
              <option value="peer_review_papermill">Papermill &amp; Peer Review Failure</option>
              <option value="citation_manipulation">Citation Manipulation &amp; Stacking</option>
              <option value="volume_relevance">Publication Volume &amp; Scope Concerns</option>
              <option value="predatory_clone">Cloned / Impersonated Serial</option>
              <option value="publication_malpractice">Publication Malpractice</option>
            </select>
          </div>
        </div>

        {/* Index Badges Filter Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
            Index Filter:
          </span>
          {(['ALL', 'Web of Science', 'Scopus', 'DOAJ', 'UGC-CARE'] as const).map((source) => {
            const isSelected = selectedIndexFilter === source;
            return (
              <button
                key={source}
                type="button"
                onClick={() => setSelectedIndexFilter(source)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {source === 'ALL' ? 'All Databases' : source}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-slate-500 font-mono">
            Showing {filteredJournals.length} of {journals.length} journals
          </span>
        </div>
      </div>

      {/* Delisted Journals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJournals.map((journal) => {
          return (
            <div
              key={journal.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-rose-300 shadow-2xs hover:shadow-sm transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Header row: Status & Delisted Year */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-600 text-white shadow-2xs">
                      ⛔ {journal.status} ({journal.delistedYear})
                    </span>
                    {journal.delistedFrom.map(src => (
                      <span
                        key={src}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {src}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                    ISSN: {journal.issn}
                  </span>
                </div>

                {/* Journal Title & Publisher */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {journal.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Publisher: <strong className="text-slate-800">{journal.publisher}</strong></span>
                  </div>
                </div>

                {/* Delisting Reason Box */}
                <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-950">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Official Delisting Cause:</span>
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed font-medium">
                    {journal.reason}
                  </p>
                </div>

                {/* Evidence & Details */}
                <div className="text-[11px] text-slate-500 space-y-1 pt-1 font-mono">
                  {journal.lastKnownIndexedVolume && (
                    <div>
                      <span className="text-slate-400 font-sans font-semibold">Cutoff Volume:</span> {journal.lastKnownIndexedVolume}
                    </div>
                  )}
                  {journal.evidenceSource && (
                    <div className="truncate">
                      <span className="text-slate-400 font-sans font-semibold">Source:</span> {journal.evidenceSource}
                    </div>
                  )}
                  {journal.sharedBy && (
                    <div className="text-slate-400 font-sans">
                      Documented by: <span className="font-semibold text-slate-700">{journal.sharedBy}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onVerifyJournal(journal.issn || journal.title)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Verify in Shodh Setu AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareRecord(journal)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer border ${
                    copiedId === journal.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  title="Share this delisting record"
                >
                  {copiedId === journal.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Share Alert</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredJournals.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Delisted Journals Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No journal in this repository matches your search filter "{searchQuery}". Try a different keyword or reset filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedIndexFilter('ALL');
              setSelectedCategoryFilter('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            Reset Search Filters
          </button>
        </div>
      )}

      {/* SUBMISSION MODAL: Share a Delisted Journal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 text-rose-300">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Submit / Share a Delisted Journal
                  </h3>
                  <p className="text-xs text-rose-200">
                    Contribute newly purged or discontinued serials to the community registry
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitNewDelisted} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Journal Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Journal of Applied Research"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    ISSN / eISSN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formIssn}
                    onChange={(e) => setFormIssn(e.target.value)}
                    placeholder="xxxx-xxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Publisher Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPublisher}
                    onChange={(e) => setFormPublisher(e.target.value)}
                    placeholder="e.g. Elsevier / Wiley / Hindawi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Indexes Delisted From */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Indexes Delisted / Purged From:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Web of Science', 'Scopus', 'DOAJ', 'UGC-CARE'] as const).map(src => {
                    const isChecked = formIndexes.includes(src);
                    return (
                      <button
                        key={src}
                        type="button"
                        onClick={() => toggleIndexCheckbox(src)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                          isChecked 
                            ? 'bg-rose-50 border-rose-300 text-rose-800' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{src}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-rose-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Year of Delisting
                  </label>
                  <input
                    type="number"
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    min={2015}
                    max={2030}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:outline-hidden bg-white"
                  >
                    <option value="peer_review_papermill">Papermill / Peer Review Compromise</option>
                    <option value="citation_manipulation">Citation Cartels &amp; Stacking</option>
                    <option value="volume_relevance">Publication Volume / Scope Flaws</option>
                    <option value="predatory_clone">Cloned / Impersonated Serial</option>
                    <option value="publication_malpractice">Publication Malpractice</option>
                  </select>
                </div>
              </div>

              {/* Primary Reason */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Delisting Explanation &amp; Finding *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Summarize the official grounds stated by Clarivate, Elsevier, DOAJ, or retraction notices..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Evidence Source URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Official Verification Source / Link
                </label>
                <input
                  type="text"
                  value={formEvidence}
                  onChange={(e) => setFormEvidence(e.target.value)}
                  placeholder="e.g. Clarivate Monthly De-listing Bulletin, Retraction Watch"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
                >
                  Add to Repository
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel / CSV Spreadsheet Upload Modal */}
      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportBatch={(batch) => {
          if (onAddBatchJournals) {
            onAddBatchJournals(batch);
          } else {
            batch.forEach(j => onAddJournal(j));
          }
        }}
        existingJournals={journals}
        profile={profile}
      />

    </div>
  );
};
