/**
 * Shodh Setu AI - Intelligence Alerts & Notices Log View
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Displays full stream of research intelligence alerts with priority filters:
 * - Info, Action Required, Critical
 * - Delisting, Cloned Domain, Indexing, and Volume surge notices
 */

import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  Filter, 
  ExternalLink 
} from 'lucide-react';
import { IntelligenceAlert } from '../../types';
import { getStoredIntelligenceAlerts } from '../../services/researchIntelligenceService';

interface AlertsLogViewProps {
  onVerifyJournal: (query: string) => void;
}

export const AlertsLogView: React.FC<AlertsLogViewProps> = ({
  onVerifyJournal,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const alerts = getStoredIntelligenceAlerts();

  const filteredAlerts = alerts.filter(a => {
    const p = a.priority || a.type;
    if (filterPriority === 'all') return true;
    return p === filterPriority;
  });

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
            Critical
          </span>
        );
      case 'action_required':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
            Action Required
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
            Info
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Scholarly Integrity Alerts &amp; Regulatory Notices
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time feed of hijacked domain detections, index delistings, and volume anomaly flags.
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1.5 px-2.5"
          >
            <option value="all">All Priorities ({alerts.length})</option>
            <option value="critical">Critical Only</option>
            <option value="action_required">Action Required</option>
            <option value="info">Informational</option>
          </select>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {filteredAlerts.map((a) => (
          <div 
            key={a.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                {getPriorityBadge(a.priority || a.type)}
                <span className="text-[11px] font-semibold text-slate-400">
                  {a.timestamp}
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {a.journalTitle || a.journalName || a.title}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {a.message}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => onVerifyJournal(a.journalTitle || a.journalName || a.title)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                Inspect Journal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
