/**
 * SHODH SETU AI - Researcher Profile Modal
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 */

import React, { useState, useEffect } from 'react';
import { X, User, Save, RotateCcw, Check, Sparkles } from 'lucide-react';
import { ResearcherProfile } from '../types';

interface ResearcherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ResearcherProfile;
  onSaveProfile: (profile: ResearcherProfile) => void;
}

export const ResearcherProfileModal: React.FC<ResearcherProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [draft, setDraft] = useState<ResearcherProfile>(profile);
  const [researchAreasStr, setResearchAreasStr] = useState(profile?.researchAreas?.join(', ') || '');
  const [keywordsStr, setKeywordsStr] = useState(profile?.keywords?.join(', ') || '');
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  // Sync draft state whenever modal opens or active profile updates
  useEffect(() => {
    if (isOpen && profile) {
      setDraft(profile);
      setResearchAreasStr(Array.isArray(profile.researchAreas) ? profile.researchAreas.join(', ') : '');
      setKeywordsStr(Array.isArray(profile.keywords) ? profile.keywords.join(', ') : '');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ResearcherProfile = {
      ...draft,
      researchAreas: researchAreasStr.split(',').map(s => s.trim()).filter(Boolean),
      keywords: keywordsStr.split(',').map(s => s.trim()).filter(Boolean),
    };
    onSaveProfile(updated);
    setShowSavedNotification(true);
    setTimeout(() => {
      setShowSavedNotification(false);
      onClose();
    }, 600);
  };

  const handleClearProfile = () => {
    const blankProfile: ResearcherProfile = {
      fullName: '',
      designation: '',
      institution: '',
      department: '',
      researchAreas: [],
      keywords: [],
      orcid: '',
      googleScholarUrl: '',
      researchGateUrl: '',
      scopusAuthorId: '',
      wosResearcherId: '',
      email: '',
      country: '',
      publicationGoals: '',
    };
    setDraft(blankProfile);
    setResearchAreasStr('');
    setKeywordsStr('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-blue-200 tracking-wider">
              Academic Identity Workspace
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold">
              My Researcher Profile
            </h2>
            <p className="text-xs text-blue-100">
              Personalized research fit calculations use these keywords and affiliations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                value={draft.fullName}
                onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                placeholder="e.g. Dr. Jane Doe"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Academic Designation */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Academic Designation</label>
              <input
                type="text"
                value={draft.designation}
                onChange={(e) => setDraft({ ...draft, designation: e.target.value })}
                placeholder="e.g. Associate Professor / PhD Candidate"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Institution */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Institution / University</label>
              <input
                type="text"
                value={draft.institution}
                onChange={(e) => setDraft({ ...draft, institution: e.target.value })}
                placeholder="e.g. Department of Computer Science"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Department / Faculty</label>
              <input
                type="text"
                value={draft.department}
                onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                placeholder="e.g. Faculty of Engineering & Technology"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                placeholder="e.g. researcher@university.edu"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Country */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Country</label>
              <input
                type="text"
                value={draft.country}
                onChange={(e) => setDraft({ ...draft, country: e.target.value })}
                placeholder="e.g. United States, United Kingdom, Pakistan..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

          </div>

          {/* Research Areas */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Research Areas (Comma-separated)
            </label>
            <input
              type="text"
              value={researchAreasStr}
              onChange={(e) => setResearchAreasStr(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              placeholder="e.g. Artificial Intelligence, Media and Communication, Digital Marketing..."
            />
          </div>

          {/* Keywords */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Research Keywords (Used for journal fit scoring)
            </label>
            <input
              type="text"
              value={keywordsStr}
              onChange={(e) => setKeywordsStr(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              placeholder="e.g. AI in Media, Digital Media, Advertising, Generative AI, Media Education..."
            />
          </div>

          {/* Academic Identifiers Section */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-3">
              Academic Profiles &amp; Persistent Identifiers
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ORCID ID</label>
                <input
                  type="text"
                  value={draft.orcid}
                  onChange={(e) => setDraft({ ...draft, orcid: e.target.value })}
                  placeholder="0000-0002-xxxx-xxxx"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Google Scholar Profile URL</label>
                <input
                  type="text"
                  value={draft.googleScholarUrl}
                  onChange={(e) => setDraft({ ...draft, googleScholarUrl: e.target.value })}
                  placeholder="https://scholar.google.com/citations?user=..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Scopus Author ID</label>
                <input
                  type="text"
                  value={draft.scopusAuthorId}
                  onChange={(e) => setDraft({ ...draft, scopusAuthorId: e.target.value })}
                  placeholder="5720xxxxxxx"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Web of Science ResearcherID</label>
                <input
                  type="text"
                  value={draft.wosResearcherId}
                  onChange={(e) => setDraft({ ...draft, wosResearcherId: e.target.value })}
                  placeholder="ABC-xxxx-2024"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-mono text-xs"
                />
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClearProfile}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Profile Form</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {showSavedNotification ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Profile Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>SAVE PROFILE</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
