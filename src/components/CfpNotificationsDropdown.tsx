/**
 * Shodh Setu AI - Researcher Profile CfP Notifications Dropdown
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Delivers alerts for newly discovered, verified Call for Papers
 * closely matching researcher keywords and research areas.
 */

import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  ExternalLink, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Trash2,
  X
} from 'lucide-react';
import { CfpNotificationItem } from '../types';

interface CfpNotificationsDropdownProps {
  notifications: CfpNotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll?: () => void;
  onNavigateCfp?: () => void;
}

export const CfpNotificationsDropdown: React.FC<CfpNotificationsDropdownProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onNavigateCfp,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
        title="Call for Papers Opportunities tailored to your Profile"
        aria-label="Call for Papers Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scholarly Opportunities</span>
                </div>
                <h3 className="font-extrabold text-sm">
                  Matched Call for Papers
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-[11px] font-semibold text-blue-300 hover:text-white underline cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2 text-slate-500 dark:text-slate-400 text-xs">
                  <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    No active notifications yet
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Set your research keywords in your Profile to automatically receive verified Call for Papers matches.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 space-y-2 transition-colors ${
                      notif.isRead 
                        ? 'bg-white dark:bg-slate-900 opacity-80' 
                        : 'bg-blue-50/60 dark:bg-blue-950/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                        MATCH: {notif.matchScore}%
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Deadline: {notif.deadline}</span>
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {notif.title}
                    </h4>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      <strong>{notif.journalName}</strong> · {notif.publisher}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{notif.scopusStatus}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={notif.originalCfpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onMarkRead(notif.id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>VIEW CFP</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {onNavigateCfp && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateCfp();
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Explore All Verified Call for Papers &rarr;
                </button>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
};
