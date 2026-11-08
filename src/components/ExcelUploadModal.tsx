/**
 * Shodh Setu AI - Excel & Spreadsheet Batch Upload Modal for Discontinued Journals
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Allows academic contributors and research integrity analysts to upload Excel (.xlsx, .xls)
 * or CSV spreadsheets containing multiple discontinued, suppressed, or delisted journals.
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
  ShieldAlert, 
  CheckCircle2, 
  RotateCw,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';
import { DelistedJournal, DelistedIndexSource, ResearcherProfile } from '../types';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportBatch: (journals: DelistedJournal[]) => void;
  existingJournals: DelistedJournal[];
  profile?: ResearcherProfile;
}

interface ParsedRowPreview {
  id: string;
  title: string;
  issn: string;
  publisher: string;
  delistedFrom: DelistedIndexSource[];
  delistedYear: number;
  reason: string;
  category: DelistedJournal['category'];
  status: DelistedJournal['status'];
  evidenceSource: string;
  notes?: string;
  isDuplicate: boolean;
  isValid: boolean;
  validationError?: string;
  selected: boolean;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onImportBatch,
  existingJournals,
  profile,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRowPreview[]>([]);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Existing keys for duplicate detection
  const existingIssns = new Set(existingJournals.map(j => (j.issn || '').toLowerCase().trim()).filter(Boolean));
  const existingTitles = new Set(existingJournals.map(j => (j.title || '').toLowerCase().trim()).filter(Boolean));

  // Helper to map cell value case-insensitively
  const getCellValue = (row: any, ...aliases: string[]): string => {
    const keys = Object.keys(row);
    for (const alias of aliases) {
      const match = keys.find(k => k.trim().toLowerCase() === alias.trim().toLowerCase());
      if (match && row[match] !== undefined && row[match] !== null) {
        return String(row[match]).trim();
      }
    }
    return '';
  };

  // Helper to parse index sources string (e.g. "Web of Science, Scopus" -> ['Web of Science', 'Scopus'])
  const parseIndexSources = (val: string): DelistedIndexSource[] => {
    const raw = (val || '').toLowerCase();
    const result: DelistedIndexSource[] = [];
    if (raw.includes('scopus')) result.push('Scopus');
    if (raw.includes('wos') || raw.includes('web of science') || raw.includes('clarivate')) result.push('Web of Science');
    if (raw.includes('doaj')) result.push('DOAJ');
    if (raw.includes('ugc') || raw.includes('ugc-care') || raw.includes('ugc care')) result.push('UGC-CARE');
    
    return result.length > 0 ? result : ['Web of Science'];
  };

  // Helper to parse category
  const parseCategory = (val: string): DelistedJournal['category'] => {
    const raw = (val || '').toLowerCase();
    if (raw.includes('papermill') || raw.includes('peer review')) return 'peer_review_papermill';
    if (raw.includes('citation') || raw.includes('cartel') || raw.includes('manipulation')) return 'citation_manipulation';
    if (raw.includes('volume') || raw.includes('surge') || raw.includes('relevance')) return 'volume_relevance';
    if (raw.includes('clone') || raw.includes('hijack')) return 'predatory_clone';
    return 'publication_malpractice';
  };

  // Helper to parse status
  const parseStatus = (val: string): DelistedJournal['status'] => {
    const raw = (val || '').toUpperCase();
    if (raw.includes('DISCONTINUED')) return 'DISCONTINUED';
    if (raw.includes('SUPPRESSED')) return 'SUPPRESSED';
    if (raw.includes('HOLD') || raw.includes('ON_HOLD')) return 'ON_HOLD';
    return 'DELISTED';
  };

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  // Drag and Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Process File using SheetJS (xlsx)
  const processFile = async (f: File) => {
    setFile(f);
    setParseError(null);
    setImportSuccessCount(null);
    setIsProcessing(true);

    try {
      const buffer = await f.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('Spreadsheet contains no readable sheets.');
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!jsonRows || jsonRows.length === 0) {
        throw new Error('The uploaded spreadsheet appears to be empty.');
      }

      // Map rows to ParsedRowPreview
      const previews: ParsedRowPreview[] = jsonRows.map((row, index) => {
        const title = getCellValue(row, 'Title', 'Journal Title', 'Journal Name', 'Name', 'Journal');
        const issn = getCellValue(row, 'ISSN', 'issn', 'eISSN', 'Print ISSN', 'Online ISSN', 'ISSN-L');
        const publisher = getCellValue(row, 'Publisher', 'publisher', 'Publishing House', 'Publisher Name') || 'Unspecified Publisher';
        const rawIndexes = getCellValue(row, 'Delisted From', 'Index', 'Database', 'Sources', 'Delisted Index', 'Indices');
        const delistedFrom = parseIndexSources(rawIndexes);
        
        const rawYear = getCellValue(row, 'Year', 'Delisted Year', 'Discontinued Year', 'Date', 'Year Delisted');
        const delistedYear = Number(rawYear) || new Date().getFullYear();
        
        const reason = getCellValue(row, 'Reason', 'Discontinuation Reason', 'Grounds', 'Cause', 'Details', 'Remarks', 'Description') || 
          'Discontinued following editorial evaluation regarding publication integrity.';
        
        const rawCategory = getCellValue(row, 'Category', 'Classification', 'Malpractice Type');
        const category = parseCategory(rawCategory);

        const rawStatus = getCellValue(row, 'Status', 'Delisting Status', 'State');
        const status = parseStatus(rawStatus);

        const evidenceSource = getCellValue(row, 'Evidence', 'Evidence Source', 'Source Link', 'Official Bulletin') || 'Contributor Uploaded Registry Record';
        const notes = getCellValue(row, 'Notes', 'Comments', 'Extra Info') || undefined;

        // Validation
        let isValid = true;
        let validationError: string | undefined = undefined;

        if (!title && !issn) {
          isValid = false;
          validationError = 'Missing title and ISSN';
        } else if (!title) {
          isValid = false;
          validationError = 'Missing title';
        }

        const isDuplicate = Boolean(
          (issn && existingIssns.has(issn.toLowerCase().trim())) ||
          (title && existingTitles.has(title.toLowerCase().trim()))
        );

        return {
          id: `preview-${index}-${Date.now()}`,
          title: title || 'Untitled Journal',
          issn: issn || 'Not provided',
          publisher,
          delistedFrom,
          delistedYear,
          reason,
          category,
          status,
          evidenceSource,
          notes,
          isDuplicate,
          isValid,
          validationError,
          selected: isValid && !isDuplicate,
        };
      });

      setParsedRows(previews);
    } catch (err: any) {
      console.error('Spreadsheet processing error:', err);
      setParseError(err.message || 'Failed to read spreadsheet file. Please check file formatting.');
      setParsedRows([]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle row selection
  const toggleRow = (id: string) => {
    setParsedRows(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  // Toggle select all
  const selectAll = (select: boolean) => {
    setParsedRows(prev => prev.map(r => r.isValid ? { ...r, selected: select } : r));
  };

  // Execute Batch Import
  const handleExecuteImport = () => {
    const selected = parsedRows.filter(r => r.selected && r.isValid);
    if (selected.length === 0) return;

    const newEntries: DelistedJournal[] = selected.map(s => ({
      id: `delist-batch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: s.title,
      issn: s.issn === 'Not provided' ? '' : s.issn,
      publisher: s.publisher,
      delistedFrom: s.delistedFrom,
      delistedYear: s.delistedYear,
      reason: s.reason,
      category: s.category,
      status: s.status,
      dateAdded: new Date().toISOString().split('T')[0],
      sharedBy: profile?.fullName ? `${profile.fullName} (Batch Contributor)` : 'Academic Community Contributor',
      evidenceSource: s.evidenceSource,
      notes: s.notes,
    }));

    onImportBatch(newEntries);
    setImportSuccessCount(newEntries.length);

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Title': 'International Journal of Environmental Research and Public Health',
        'ISSN': '1660-4601',
        'Publisher': 'MDPI',
        'Delisted From': 'Web of Science',
        'Year': 2023,
        'Status': 'DELISTED',
        'Category': 'volume_relevance',
        'Reason': 'Delisted from SCIE following Clarivate editorial evaluation regarding publication volume anomalies and content criteria.',
        'Evidence Source': 'Clarivate WoS De-listing Bulletin',
        'Notes': 'Example of high-volume serial delisting'
      },
      {
        'Title': 'Fresenius Environmental Bulletin',
        'ISSN': '1018-4619',
        'Publisher': 'Parlar Scientific Publications',
        'Delisted From': 'Web of Science, Scopus',
        'Year': 2022,
        'Status': 'DISCONTINUED',
        'Category': 'citation_manipulation',
        'Reason': 'Discontinued due to abnormal publication spikes, citation cartels, and compromised peer review.',
        'Evidence Source': 'Scopus Discontinued Sources List',
        'Notes': 'Systematic peer review failure'
      },
      {
        'Title': 'Computational Intelligence and Neuroscience',
        'ISSN': '1687-5265',
        'Publisher': 'Hindawi / Wiley',
        'Delisted From': 'Web of Science, Scopus',
        'Year': 2023,
        'Status': 'DELISTED',
        'Category': 'peer_review_papermill',
        'Reason': 'Delisted following comprehensive investigation into compromised special issues and coordinated papermill activity.',
        'Evidence Source': 'Wiley Public Transparency Report',
        'Notes': 'Over 500 retractions'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Discontinued_Journals');
    XLSX.writeFile(wb, 'Shodh Setu AI_Discontinued_Journals_Template.xlsx');
  };

  const validSelectedCount = parsedRows.filter(r => r.selected && r.isValid).length;
  const duplicateCount = parsedRows.filter(r => r.isDuplicate).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Upload Excel / CSV Discontinued Journals List
              </h3>
              <p className="text-xs text-rose-200">
                Batch contribute multiple discontinued or delisted serials into the Shodh Setu AI repository
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          
          {/* Success Banner */}
          {importSuccessCount !== null && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="block text-sm font-bold">Import Successful!</strong>
                <span>{importSuccessCount} discontinued journals were successfully added to the Shodh Setu AI repository.</span>
              </div>
            </div>
          )}

          {/* Upload Dropzone */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/40 text-center transition-colors cursor-pointer flex flex-col items-center justify-center space-y-3"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
            />
            
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-2xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-100 block text-sm sm:text-base">
                {file ? file.name : 'Click to select or drag and drop your spreadsheet here'}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv) files with multi-row journal records
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                Browse Files
              </span>
            </div>
          </div>

          {/* Sample Template Download Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Need standard column headers? Download our pre-formatted template (Title, ISSN, Publisher, Delisted From, Year, Reason).
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template (.xlsx)</span>
            </button>
          </div>

          {/* Loading Indicator */}
          {isProcessing && (
            <div className="p-6 text-center text-slate-500 space-y-2">
              <RotateCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
              <span className="text-xs font-semibold block">Reading and analyzing spreadsheet entries...</span>
            </div>
          )}

          {/* Error Banner */}
          {parseError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Results Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">
                    Preview: {parsedRows.length} Journals Detected in File
                  </span>
                  {duplicateCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                      {duplicateCount} duplicates identified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => selectAll(true)}
                    className="text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Select All Valid
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => selectAll(false)}
                    className="text-slate-500 hover:underline font-semibold cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto max-h-72 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3 w-8">
                        {/* Checkbox */}
                      </th>
                      <th className="py-2.5 px-3">Journal Title</th>
                      <th className="py-2.5 px-3">ISSN</th>
                      <th className="py-2.5 px-3">Publisher</th>
                      <th className="py-2.5 px-3">Delisted From</th>
                      <th className="py-2.5 px-3 text-right">Year</th>
                      <th className="py-2.5 px-3">Status / Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.map((row) => (
                      <tr 
                        key={row.id}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                          !row.isValid ? 'bg-rose-50/30 dark:bg-rose-950/20 opacity-60' : row.isDuplicate ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            disabled={!row.isValid}
                            onChange={() => toggleRow(row.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 max-w-[200px] truncate" title={row.title}>
                          {row.title}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                          {row.issn}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-[140px] truncate" title={row.publisher}>
                          {row.publisher}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          {row.delistedFrom.join(', ')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {row.delistedYear}
                        </td>
                        <td className="py-2.5 px-3">
                          {!row.isValid ? (
                            <span className="text-[10px] font-bold text-rose-600">
                              ⚠ {row.validationError}
                            </span>
                          ) : row.isDuplicate ? (
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                              Already in repo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              <Check className="w-3 h-3" /> Ready
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

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {parsedRows.length > 0 ? (
              <span><strong>{validSelectedCount}</strong> of {parsedRows.length} journals selected for import</span>
            ) : (
              <span>Upload an Excel or CSV file to start batch import</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={validSelectedCount === 0 || isProcessing}
              onClick={handleExecuteImport}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Import {validSelectedCount > 0 ? `${validSelectedCount} Journals` : 'Journals'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
