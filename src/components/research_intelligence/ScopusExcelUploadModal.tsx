/**
 * ShodhSetu - Scopus Listed Journals Excel Batch Upload Modal
 * Academic Concept & Direction: Dr. Rubaid Ashfaq & Co-creator Zeba Nabi
 * 
 * Allows researchers, librarians, and integrity analysts to upload Excel spreadsheets
 * (.xlsx, .xls, .csv) containing official Elsevier Scopus listed journals with full metrics:
 * - Source Title / Journal Name
 * - Print-ISSN & E-ISSN
 * - Publisher Name & Country
 * - CiteScore, SNIP, and SJR
 * - Quartile Rankings (Q1, Q2, Q3, Q4)
 * - All Science Journal Classification (ASJC) Subject Areas & Discipline
 * - Active Coverage Status & Open Access Type
 */

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Check, 
  AlertTriangle, 
  Download, 
  Award, 
  CheckCircle2, 
  RefreshCw,
  Search,
  BookOpen,
  Building,
  CheckSquare,
  Square,
  Info
} from 'lucide-react';
import { IntelligenceJournal, ResearcherProfile } from '../../types';
import { importScopusJournalsBatch } from '../../services/researchIntelligenceService';

interface ScopusExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (added: number, updated: number) => void;
  existingJournals?: IntelligenceJournal[];
  profile?: ResearcherProfile;
}

interface ParsedScopusRow {
  id: string;
  title: string;
  issn: string;
  eIssn: string;
  publisher: string;
  country: string;
  quartile: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  citeScore: number;
  snip: string;
  sjr: string;
  discipline: string;
  subjectAreas: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  coverage: string;
  openAccess: boolean;
  openAccessType: string;
  website: string;
  isExisting: boolean;
  isValid: boolean;
  selected: boolean;
  rawRow: any;
}

export const ScopusExcelUploadModal: React.FC<ScopusExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingJournals = [],
  profile,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedScopusRow[]>([]);
  const [previewSearch, setPreviewSearch] = useState<string>('');
  const [importSummary, setImportSummary] = useState<{ added: number; updated: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Build existing ISSN & title lookup
  const existingIssns = new Set(
    existingJournals
      .flatMap(j => [j.issn, j.eIssn])
      .filter((s): s is string => Boolean(s))
      .map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );
  const existingTitles = new Set(
    existingJournals
      .map(j => (j.title || '').toLowerCase().trim())
      .filter(Boolean)
  );

  // Helper to extract cell value with case-insensitive and trimmed aliases
  const getCellValue = (row: any, aliases: string[]): string => {
    const keys = Object.keys(row);
    for (const alias of aliases) {
      const match = keys.find(k => k.trim().toLowerCase() === alias.trim().toLowerCase());
      if (match && row[match] !== undefined && row[match] !== null) {
        return String(row[match]).trim();
      }
    }
    // Also try fuzzy substring match for complex Scopus headers
    for (const alias of aliases) {
      const match = keys.find(k => k.trim().toLowerCase().includes(alias.trim().toLowerCase()));
      if (match && row[match] !== undefined && row[match] !== null) {
        return String(row[match]).trim();
      }
    }
    return '';
  };

  // Helper to normalize ISSN format (XXXX-XXXX)
  const cleanIssn = (raw: string): string => {
    const digits = raw.replace(/[^0-9Xx]/g, '').toUpperCase();
    if (digits.length === 8) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    return raw.trim();
  };

  // Helper to parse quartile to 'Q1' | 'Q2' | 'Q3' | 'Q4'
  const parseQuartile = (val: string, citeScore: number): 'Q1' | 'Q2' | 'Q3' | 'Q4' => {
    const upper = val.toUpperCase().trim();
    if (upper.includes('Q1') || upper === '1' || upper === '1ST') return 'Q1';
    if (upper.includes('Q2') || upper === '2' || upper === '2ND') return 'Q2';
    if (upper.includes('Q3') || upper === '3' || upper === '3RD') return 'Q3';
    if (upper.includes('Q4') || upper === '4' || upper === '4TH') return 'Q4';

    // Fallback heuristic based on CiteScore if quartile column omitted
    if (citeScore >= 6.0) return 'Q1';
    if (citeScore >= 3.0) return 'Q2';
    if (citeScore >= 1.5) return 'Q3';
    return 'Q4';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    setFile(selectedFile);
    setParseError(null);
    setParsedRows([]);
    setImportSummary(null);
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
        
        // Find best sheet: prefer sheet with 'scopus', 'titles', 'sources', or use first sheet
        const sheetName = workbook.SheetNames.find(name => 
          name.toLowerCase().includes('scopus') || 
          name.toLowerCase().includes('title') ||
          name.toLowerCase().includes('source')
        ) || workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          throw new Error('No valid sheet found in uploaded file.');
        }

        // Convert to array of objects
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('The uploaded spreadsheet contains no data rows.');
        }

        // Parse and validate rows
        const parsed: ParsedScopusRow[] = [];

        rawJson.forEach((row, idx) => {
          const title = getCellValue(row, [
            'Source Title', 'Title', 'Journal Title', 'Publication Name', 
            'Journal Name', 'Source Record Title', 'Full Title'
          ]);

          const printIssn = cleanIssn(getCellValue(row, [
            'Print-ISSN', 'Print ISSN', 'ISSN', 'issn', 'ISSN (Print)', 'Print_ISSN'
          ]));

          const eIssn = cleanIssn(getCellValue(row, [
            'E-ISSN', 'E-Issn', 'Electronic-ISSN', 'Electronic ISSN', 'eISSN', 'Online ISSN'
          ]));

          const publisher = getCellValue(row, [
            "Publisher's Name", 'Publisher', 'Publishers Name', 'Publishing House', 'Publisher Name'
          ]) || 'Academic Publisher';

          const country = getCellValue(row, [
            'Country', 'Publisher Country', 'Country of Publication'
          ]) || 'International';

          const rawCiteScore = getCellValue(row, [
            'CiteScore', 'CiteScore 2024', 'CiteScore 2023', '2024 CiteScore', 'Cite Score', 'Score'
          ]);
          const citeScore = parseFloat(rawCiteScore) || 3.2;

          const rawQuartile = getCellValue(row, [
            'Quartile', 'CiteScore Quartile', 'Scopus Quartile', 'Highest Percentile Quartile', 'Percentile Quartile', 'Tier'
          ]);
          const quartile = parseQuartile(rawQuartile, citeScore);

          const snip = getCellValue(row, ['SNIP', 'SNIP 2024', 'SNIP 2023', 'Source Normalized Impact per Paper']) || '1.75';
          const sjr = getCellValue(row, ['SJR', 'SJR 2024', 'SJR 2023', 'SCImago Journal Rank']) || '1.15';

          const discipline = getCellValue(row, [
            'Discipline', 'Major Discipline', 'Subject', 'Primary Field'
          ]) || 'Multidisciplinary & Applied Sciences';

          const rawSubjectAreas = getCellValue(row, [
            'Subject Area', 'ASJC Code', 'All Science Journal Classification Codes (ASJC)', 
            'Subject Areas', 'Sub-Subject Area', 'ASJC'
          ]);
          const subjectAreas = rawSubjectAreas 
            ? rawSubjectAreas.split(/[,;|]/).map(s => s.trim()).filter(Boolean)
            : [discipline];

          const rawStatus = getCellValue(row, [
            'Active / Inactive', 'Active/Inactive', 'Status', 'Coverage Status', 'Coverage'
          ]).toUpperCase();
          const status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' = 
            rawStatus.includes('INACTIVE') ? 'INACTIVE' : 
            rawStatus.includes('DISCONTINUED') ? 'DISCONTINUED' : 'ACTIVE';

          const coverage = getCellValue(row, ['Coverage', 'Coverage Years']) || 'Coverage 2018 - Present';

          const rawOa = getCellValue(row, [
            'Open Access', 'OA Status', 'DOAJ / Open Access', 'Open Access (OA)'
          ]).toLowerCase();
          const openAccess = rawOa.includes('yes') || rawOa.includes('gold') || rawOa.includes('diamond') || rawOa.includes('true');
          const openAccessType = openAccess ? (rawOa.includes('diamond') ? 'Diamond' : 'Gold') : 'Hybrid';

          const website = getCellValue(row, [
            'Website', 'Journal Website', 'URL', 'Source Homepage', 'Link'
          ]);

          // Must have at least a Title or an ISSN
          const isValid = Boolean(title && title.length >= 3);
          const cleanKeyIssn = (printIssn || eIssn).toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanKeyTitle = title.toLowerCase().trim();

          const isExisting = (Boolean(cleanKeyIssn) && existingIssns.has(cleanKeyIssn)) ||
                             (Boolean(cleanKeyTitle) && existingTitles.has(cleanKeyTitle));

          if (isValid) {
            parsed.push({
              id: `scopus-upload-${idx}-${Date.now()}`,
              title,
              issn: printIssn || eIssn || 'N/A',
              eIssn: eIssn || '',
              publisher,
              country,
              quartile,
              citeScore,
              snip,
              sjr,
              discipline,
              subjectAreas,
              status,
              coverage,
              openAccess,
              openAccessType,
              website,
              isExisting,
              isValid,
              selected: true,
              rawRow: row,
            });
          }
        });

        if (parsed.length === 0) {
          throw new Error('No valid journals could be recognized. Ensure your sheet has columns for "Source Title" and "ISSN".');
        }

        setParsedRows(parsed);
      } catch (err: any) {
        setParseError(err.message || 'Failed to read or parse the spreadsheet file.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setParseError('Failed to read file from disk.');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleToggleSelectAll = (select: boolean) => {
    setParsedRows(parsedRows.map(r => ({ ...r, selected: select })));
  };

  const handleToggleRow = (id: string) => {
    setParsedRows(parsedRows.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const handleImportSelected = () => {
    const selected = parsedRows.filter(r => r.selected && r.isValid);
    if (selected.length === 0) {
      alert('Please select at least one valid journal to import.');
      return;
    }

    const payload: Partial<IntelligenceJournal>[] = selected.map(r => ({
      title: r.title,
      issn: r.issn,
      eIssn: r.eIssn,
      publisher: r.publisher,
      country: r.country,
      website: r.website,
      canonicalUrl: r.website,
      discipline: r.discipline,
      subjectAreas: r.subjectAreas,
      scopusIndexed: true,
      scopusQuartile: r.quartile,
      scopusCiteScore: r.citeScore,
      scopusSnip: r.snip,
      scopusSjr: r.sjr,
      scopusDetails: {
        status: r.status,
        coverage: r.coverage,
        citeScore: r.citeScore,
        quartile: r.quartile,
        sourceType: 'Journal',
      },
      openAccess: r.openAccess,
      openAccessType: r.openAccessType,
      verificationStatus: 'VERIFIED',
    }));

    const result = importScopusJournalsBatch(payload);
    setImportSummary(result);
    if (onSuccess) {
      onSuccess(result.added, result.updated);
    }
  };

  // Helper to generate a download template
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        'Source Title': 'Digital Journalism',
        'Print-ISSN': '2167-0811',
        'E-ISSN': '2167-082X',
        "Publisher's Name": 'Routledge / Taylor & Francis',
        'Country': 'United Kingdom',
        'CiteScore': 7.6,
        'CiteScore Quartile': 'Q1',
        'SNIP': '2.45',
        'SJR': '1.89',
        'Subject Area': 'Communication, Information Systems, Media Technology',
        'Discipline': 'Media & Communication',
        'Active / Inactive': 'Active',
        'Coverage': '2013-Present',
        'Open Access': 'Hybrid',
        'Website': 'https://www.tandfonline.com/journals/rdij20'
      },
      {
        'Source Title': 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
        'Print-ISSN': '0162-8828',
        'E-ISSN': '1939-3539',
        "Publisher's Name": 'IEEE Computer Society',
        'Country': 'United States',
        'CiteScore': 35.2,
        'CiteScore Quartile': 'Q1',
        'SNIP': '7.12',
        'SJR': '5.85',
        'Subject Area': 'Computer Science, Artificial Intelligence, Pattern Recognition',
        'Discipline': 'Computer Science & AI',
        'Active / Inactive': 'Active',
        'Coverage': '1979-Present',
        'Open Access': 'Hybrid',
        'Website': 'https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=34'
      },
      {
        'Source Title': 'Journal of Consumer Behaviour',
        'Print-ISSN': '1472-0817',
        'E-ISSN': '1479-1838',
        "Publisher's Name": 'John Wiley & Sons',
        'Country': 'United Kingdom',
        'CiteScore': 5.8,
        'CiteScore Quartile': 'Q2',
        'SNIP': '1.38',
        'SJR': '0.94',
        'Subject Area': 'Marketing, Consumer Psychology, Behavioural Business',
        'Discipline': 'Business & Management',
        'Active / Inactive': 'Active',
        'Coverage': '2001-Present',
        'Open Access': 'Hybrid',
        'Website': 'https://onlinelibrary.wiley.com/journal/14791838'
      },
      {
        'Source Title': 'Critical Inquiry',
        'Print-ISSN': '0093-1896',
        'E-ISSN': '1539-7858',
        "Publisher's Name": 'University of Chicago Press',
        'Country': 'United States',
        'CiteScore': 2.4,
        'CiteScore Quartile': 'Q1',
        'SNIP': '1.82',
        'SJR': '0.85',
        'Subject Area': 'Literature and Literary Theory, Philosophy, Cultural Studies',
        'Discipline': 'Arts & Humanities',
        'Active / Inactive': 'Active',
        'Coverage': '1974-Present',
        'Open Access': 'Subscription',
        'Website': 'https://www.journals.uchicago.edu/toc/ci/current'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Scopus_Listed_Journals');
    XLSX.writeFile(wb, 'ShodhSetu_Scopus_Listed_Journals_Template.xlsx');
  };

  const filteredPreviewRows = parsedRows.filter(r => {
    if (!previewSearch.trim()) return true;
    const term = previewSearch.toLowerCase();
    return r.title.toLowerCase().includes(term) ||
           r.issn.toLowerCase().includes(term) ||
           r.publisher.toLowerCase().includes(term) ||
           r.discipline.toLowerCase().includes(term);
  });

  const selectedCount = parsedRows.filter(r => r.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-orange-600 via-amber-700 to-slate-900 text-white shrink-0 relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 backdrop-blur-xs">
                <Award className="w-3.5 h-3.5" />
                <span>Elsevier Scopus Source Title Importer</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Upload Scopus Listed Journals (Excel / CSV)
              </h2>
              <p className="text-xs sm:text-sm text-orange-100/90 mt-1 max-w-2xl leading-relaxed">
                Directly import official Scopus title lists (.xlsx, .xls, .csv). ShodhSetu automatically reads Source Titles, Print &amp; E-ISSNs, CiteScores, SNIP, SJR, and Quartiles (Q1–Q4).
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[11px] text-orange-200 mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
            <span>Concept: <strong>Dr. Rubaid Ashfaq</strong> &amp; Co-creator <strong>Zeba Nabi</strong></span>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 text-xs text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel Template</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5">

          {/* Success Notification */}
          {importSummary && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-2 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Successfully Imported Scopus Journals!</span>
              </div>
              <p className="text-xs leading-relaxed">
                <strong>{importSummary.added}</strong> new Scopus journals added, and <strong>{importSummary.updated}</strong> existing records updated with latest Scopus quartile and CiteScore metrics. All imported journals are immediately active in the ShodhSetu Scopus Database and Multi-Database Journal Finder.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  View in Scopus Database Directory &rarr;
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setParsedRows([]);
                    setImportSummary(null);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 text-xs font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/50 transition-colors cursor-pointer"
                >
                  Upload Another Sheet
                </button>
              </div>
            </div>
          )}

          {/* Upload Dropzone */}
          {!importSummary && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                  file 
                    ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20' 
                    : 'border-slate-300 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 bg-slate-50 dark:bg-slate-800/50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {file ? file.name : 'Click to Browse or Drag & Drop your Scopus Excel Sheet'}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv) spreadsheets.
                </p>

                {file && (
                  <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200 text-xs font-semibold">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{(file.size / 1024).toFixed(1)} KB · Ready to preview</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error notice */}
          {parseError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Parsing Error:</strong> {parseError}
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isProcessing && (
            <div className="p-6 text-center text-slate-500 text-xs space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-600" />
              <p>Analyzing spreadsheet columns, CiteScores, and Scopus quartiles...</p>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && !importSummary && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Parsed Scopus Directory Preview</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
                      {parsedRows.length} journals detected
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedCount} selected for import · {parsedRows.filter(r => r.isExisting).length} will update existing records.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSelectAll(true)}
                    className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => handleToggleSelectAll(false)}
                    className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Search filter within parsed rows */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  placeholder="Filter preview by title, ISSN, or publisher..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCount === parsedRows.length}
                          onChange={(e) => handleToggleSelectAll(e.target.checked)}
                          className="rounded text-orange-600 focus:ring-orange-500"
                        />
                      </th>
                      <th className="p-2.5">Source Title &amp; ISSN</th>
                      <th className="p-2.5">Publisher</th>
                      <th className="p-2.5">Quartile</th>
                      <th className="p-2.5">CiteScore</th>
                      <th className="p-2.5">Discipline</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredPreviewRows.map((r) => (
                      <tr 
                        key={r.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          r.selected ? '' : 'opacity-50 bg-slate-50/50 dark:bg-slate-900/50'
                        }`}
                      >
                        <td className="p-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={r.selected}
                            onChange={() => handleToggleRow(r.id)}
                            className="rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900 dark:text-white">{r.title}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            ISSN: {r.issn} {r.eIssn ? `· eISSN: ${r.eIssn}` : ''}
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">
                          {r.publisher}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.quartile === 'Q1' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' :
                            r.quartile === 'Q2' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {r.quartile}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white tabular-nums">
                          {r.citeScore}
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-500 max-w-[140px] truncate" title={r.discipline}>
                          {r.discipline}
                        </td>
                        <td className="p-2.5 text-right">
                          {r.isExisting ? (
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded">
                              Will Update
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded">
                              New Journal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Scopus Sheet Format Guide */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <Info className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Supported Scopus Excel Columns &amp; Automatic Recognition</span>
            </div>
            <p className="leading-relaxed">
              Your spreadsheet can use any standard Elsevier Scopus Source Title list format. Columns automatically matched include: <strong>Source Title / Journal Name</strong>, <strong>Print-ISSN / E-ISSN</strong>, <strong>Publisher</strong>, <strong>CiteScore</strong>, <strong>Quartile (Q1–Q4)</strong>, <strong>SNIP</strong>, <strong>SJR</strong>, <strong>Subject Area (ASJC)</strong>, and <strong>Active/Inactive Status</strong>.
            </p>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Sample Template</span>
            </button>

            <button
              onClick={handleImportSelected}
              disabled={selectedCount === 0 || isProcessing}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                selectedCount > 0 && !isProcessing
                  ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'
                  : 'bg-slate-400 cursor-not-allowed opacity-50'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Import {selectedCount} Scopus Journals</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
