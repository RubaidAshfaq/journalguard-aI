/**
 * SHODH SETU AI - My Research Library & Watchlist
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 */

import React, { useState } from 'react';
import { 
  Star, 
  RotateCw, 
  Trash2, 
  Plus, 
  Tag, 
  FileText, 
  ExternalLink, 
  SlidersHorizontal,
  Bell,
  Check,
  Search
} from 'lucide-react';
import { SavedJournalEntry } from '../types';

interface LibraryViewProps {
  entries: SavedJournalEntry[];
  onUpdateEntry: (id: string, updates: Partial<SavedJournalEntry>) => void;
  onRemoveEntry: (id: string) => void;
  onRecheckJournal: (query: string) => void;
  onOpenCompare: (selectedEntries: SavedJournalEntry[]) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  entries,
  onUpdateEntry,
  onRemoveEntry,
  onRecheckJournal,
  onOpenCompare,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'Saved' | 'Checked' | 'Recommended' | 'Rejected' | 'Watchlist'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [newTagInput, setNewTagInput] = useState<{ [id: string]: string }>({});

  const filteredEntries = entries.filter(e => {
    if (activeTab === 'Watchlist') {
      if (!e.isWatched && e.status !== 'Watchlist') return false;
    } else if (activeTab !== 'all') {
      if (e.status !== activeTab) return false;
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        e.journalName.toLowerCase().includes(q) ||
        e.publisher.toLowerCase().includes(q) ||
        e.issn.toLowerCase().includes(q) ||
        (e.tags && e.tags.some(t => t.toLowerCase().includes(q))) ||
        (e.notes && e.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const toggleSelectForCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(x => x !== id));
    } else {
      if (selectedForCompare.length >= 5) {
        alert('You can compare a maximum of 5 journals at once.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const handleLaunchCompare = () => {
    const selectedItems = entries.filter(e => selectedForCompare.includes(e.id));
    if (selectedItems.length < 2) {
      alert('Please select at least 2 journals to compare.');
      return;
    }
    onOpenCompare(selectedItems);
  };

  const handleSaveNotes = (id: string) => {
    onUpdateEntry(id, { notes: notesDraft });
    setEditingNotesId(null);
  };

  const handleAddTag = (id: string) => {
    const tag = (newTagInput[id] || '').trim();
    if (!tag) return;
    const entry = entries.find(e => e.id === id);
    if (entry) {
      const currentTags = entry.tags || [];
      if (!currentTags.includes(tag)) {
        onUpdateEntry(id, { tags: [...currentTags, tag] });
      }
    }
    setNewTagInput({ ...newTagInput, [id]: '' });
  };

  const handleRemoveTag = (id: string, tagToRemove: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry && entry.tags) {
      onUpdateEntry(id, { tags: entry.tags.filter(t => t !== tagToRemove) });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Research Library &amp; Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track submission candidates, record custom review notes, and monitor indexing integrity.
          </p>
        </div>

        {/* Compare Launch CTA */}
        {selectedForCompare.length > 0 && (
          <button
            onClick={handleLaunchCompare}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Compare Selected ({selectedForCompare.length}/5)</span>
          </button>
        )}
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto p-1">
          {(['all', 'Watchlist', 'Saved', 'Checked', 'Recommended', 'Rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab === 'all' ? 'All Records' : tab}
            </button>
          ))}
        </div>

        {/* Search Filter */}
        <div className="relative flex items-center pr-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by title, tag, notes..."
            className="w-full md:w-64 pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table List of Journals */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <p className="text-sm font-semibold">No journal records matching this category.</p>
            <p className="text-xs text-slate-400">Save journals during your verification queries or add custom tags.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEntries.map(entry => {
              const isSelected = selectedForCompare.includes(entry.id);
              const isEditingNotes = editingNotesId === entry.id;

              return (
                <div key={entry.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors space-y-3">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    
                    {/* Checkbox and Title block */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectForCompare(entry.id)}
                        className="mt-1 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300 cursor-pointer"
                        title="Select to compare up to 5 journals"
                      />
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                            {entry.journalName}
                          </h3>
                          {entry.isWatched && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              <Bell className="w-2.5 h-2.5" /> WATCHING
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            entry.status === 'Saved' ? 'bg-emerald-50 text-emerald-800' :
                            entry.status === 'Rejected' ? 'bg-rose-50 text-rose-800' :
                            entry.status === 'Watchlist' ? 'bg-blue-50 text-blue-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {entry.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>{entry.publisher}</span>
                          <span>·</span>
                          <span className="font-mono">ISSN: {entry.issn}</span>
                          <span>·</span>
                          <span>Last Checked: {entry.lastChecked}</span>
                        </div>
                      </div>
                    </div>

                    {/* Scores & Quick Indicators */}
                    <div className="flex items-center gap-4 text-xs shrink-0 self-end lg:self-auto">
                      <div className="text-center">
                        <span className="text-[10px] uppercase text-slate-400 block font-bold">Authenticity</span>
                        <span className="font-extrabold text-slate-900 tabular-nums">
                          {entry.authenticityScore} / 100
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="text-[10px] uppercase text-slate-400 block font-bold">Risk Tier</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          entry.riskTier === 'LOW' ? 'bg-emerald-50 text-emerald-800' :
                          entry.riskTier === 'MODERATE' ? 'bg-amber-50 text-amber-800' :
                          'bg-rose-50 text-rose-800'
                        }`}>
                          {entry.riskTier}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                        {/* Watch toggle */}
                        <button
                          onClick={() => onUpdateEntry(entry.id, { isWatched: !entry.isWatched })}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            entry.isWatched ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-700'
                          }`}
                          title={entry.isWatched ? 'Stop watching' : 'Watch this journal'}
                        >
                          <Bell className="w-4 h-4" />
                        </button>

                        {/* Recheck */}
                        <button
                          onClick={() => onRecheckJournal(entry.issn || entry.journalName)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Recheck live sources"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onRemoveEntry(entry.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove from library"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                  </div>

                  {/* Notes & Tags Section */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                    
                    {/* Notes block */}
                    <div className="flex-1">
                      {isEditingNotes ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            placeholder="Add submission notes (e.g. Check APC, good for AI paper)..."
                            className="w-full px-2.5 py-1 text-xs border border-blue-400 rounded-lg focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveNotes(entry.id)}
                            className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="px-2 py-1 text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setNotesDraft(entry.notes || '');
                            setEditingNotesId(entry.id);
                          }}
                          className="text-slate-600 italic cursor-pointer hover:text-slate-900 group flex items-center gap-1.5"
                          title="Click to edit notes"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                          <span>{entry.notes || 'Click to add notes for this journal...'}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags block */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {(entry.tags || []).map((t, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          <span>{t}</span>
                          <button
                            onClick={() => handleRemoveTag(entry.id, t)}
                            className="text-slate-400 hover:text-rose-600 ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      {/* Add tag inline form */}
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          placeholder="+ tag"
                          value={newTagInput[entry.id] || ''}
                          onChange={(e) => setNewTagInput({ ...newTagInput, [entry.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddTag(entry.id);
                          }}
                          className="w-16 px-1.5 py-0.5 text-[11px] rounded border border-slate-200 bg-white focus:outline-none focus:w-24 transition-all"
                        />
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
