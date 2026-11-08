/**
 * SHODH SETU AI - Privacy & Delete My Data Modal
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 */

import React from 'react';
import { X, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        <div className="p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            Delete My Researcher Data
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            In compliance with academic privacy principles, Shodh Setu AI stores your profile, journal watchlist, notes, and verification history locally on your device in your browser.
          </p>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left">
            <p className="font-semibold mb-1">This action will immediately wipe:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
              <li>Custom Researcher Profile &amp; Keywords</li>
              <li>Saved Journals &amp; Watchlist entries</li>
              <li>Personal Submission Notes &amp; Tags</li>
              <li>Cached Verification Audit History</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            CONFIRM DELETE ALL DATA
          </button>
        </div>

      </div>
    </div>
  );
};
