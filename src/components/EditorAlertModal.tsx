/**
 * SHODH SETU AI - Editor Integrity Alert Modal
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Generates and dispatches a formal forensic warning to authentic journal editors & publishers
 * alerting them that their journal identity, title, and ISSN are being hijacked by a predatory clone.
 * Integrates directly with the Email Alert Service.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Mail, 
  ShieldAlert, 
  Copy, 
  Check, 
  Send, 
  AlertTriangle, 
  ExternalLink,
  History,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { VerificationResult, ResearcherProfile, EmailDispatchMethod, SentEditorAlertRecord } from '../types';
import { 
  buildForensicEmailAlert, 
  sendWarningAlert, 
  copyAlertToClipboard,
  hasAlertBeenDispatched,
  buildMailtoUrl,
  buildGmailComposeUrl,
  buildOutlookComposeUrl
} from '../services/emailAlertService';

interface EditorAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: VerificationResult | null;
  profile?: ResearcherProfile;
}

export const EditorAlertModal: React.FC<EditorAlertModalProps> = ({
  isOpen,
  onClose,
  result,
  profile,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentRecord, setSentRecord] = useState<SentEditorAlertRecord | null>(null);
  const [lastDispatchedUrl, setLastDispatchedUrl] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<EmailDispatchMethod>('mailto');
  const [customNotes, setCustomNotes] = useState('');

  // Form field states
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [cleanHost, setCleanHost] = useState('');
  const [counterfeitHost, setCounterfeitHost] = useState('');

  // Initialize or re-populate template whenever result changes or modal opens
  useEffect(() => {
    if (result && isOpen) {
      const templateData = buildForensicEmailAlert(result, profile, customNotes);
      setRecipients(templateData.recipients);
      setSubject(templateData.subject);
      setBodyText(templateData.body);
      setCleanHost(templateData.cleanCanonicalHost);
      setCounterfeitHost(templateData.counterfeitHost);
      setSentRecord(null);
      setLastDispatchedUrl('');
    }
  }, [result, isOpen]);

  // Compute live direct URLs for each service so native links are always valid and clickable
  const mailtoUrl = useMemo(() => buildMailtoUrl(recipients, subject, bodyText), [recipients, subject, bodyText]);
  const gmailUrl = useMemo(() => buildGmailComposeUrl(recipients, subject, bodyText), [recipients, subject, bodyText]);
  const outlookUrl = useMemo(() => buildOutlookComposeUrl(recipients, subject, bodyText), [recipients, subject, bodyText]);

  const activeDirectUrl = selectedMethod === 'mailto' 
    ? mailtoUrl 
    : selectedMethod === 'gmail' 
      ? gmailUrl 
      : outlookUrl;

  if (!isOpen || !result) return null;

  const { journal } = result;
  const alreadyWarned = hasAlertBeenDispatched(journal.issn || journal.title);

  // Reset template to default pre-defined forensic format
  const handleResetTemplate = () => {
    const templateData = buildForensicEmailAlert(result, profile, customNotes);
    setRecipients(templateData.recipients);
    setSubject(templateData.subject);
    setBodyText(templateData.body);
  };

  // Copy full forensic dossier
  const handleCopy = async () => {
    const fullText = `To: ${recipients}\nSubject: ${subject}\n\n${bodyText}`;
    const success = await copyAlertToClipboard(fullText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Main Action: Send Warning via Email Alert Service
  const handleSendWarning = () => {
    setIsSending(true);

    try {
      const { record, dispatchUrl } = sendWarningAlert({
        result,
        recipients,
        subject,
        body: bodyText,
        method: selectedMethod,
        profile
      });

      setSentRecord(record);
      setLastDispatchedUrl(dispatchUrl);
    } catch (err) {
      console.error('Failed to dispatch warning alert:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-alert-title"
    >
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-rose-700 via-rose-800 to-red-900 text-white px-6 py-5 rounded-t-3xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 text-white flex items-center justify-center backdrop-blur-xs border border-white/20">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-rose-100">
                  Forensic Email Alert Service
                </span>
                <span className="text-xs text-rose-200">Concept &amp; Direction: Dr. Rubaid Ashfaq · Co-creator: Zeba Nabi</span>
              </div>
              <h2 id="editor-alert-title" className="text-lg font-extrabold text-white">
                Alert Authentic Journal Editors of Predatory Clone
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-rose-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto text-xs sm:text-sm">
          
          {/* Prior Warning Notification Badge if already alerted */}
          {alreadyWarned && !sentRecord && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900 font-medium">
              <History className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Notice:</strong> An alert record for this journal already exists in your local audit log. You can send another update or warning if new evidence has emerged.
              </span>
            </div>
          )}

          {/* Alert Overview Card */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <h4 className="font-bold text-rose-950">
                Official Publisher &amp; Editorial Board Notification
              </h4>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              When predatory actors clone an academic journal or hijack an authentic ISSN, notifying the legitimate editorial office equips them with verified registry evidence to initiate registrar DMCA takedowns, alert indexing bodies (WoS, Scopus, DOAJ), and protect researchers from fraud.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono">
              <span className="text-rose-900"><strong>Authentic Target:</strong> {journal.title}</span>
              <span className="text-rose-700"><strong>Cloned Host:</strong> {counterfeitHost}</span>
              <span className="text-rose-700"><strong>Canonical Host:</strong> {cleanHost}</span>
            </div>
          </div>

          {/* Form Fields: Recipients, Subject, and Forensic Dossier */}
          <div className="space-y-4">
            
            {/* Recipient Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Editorial &amp; Ethics Email(s)
                </label>
                <span className="text-[11px] text-slate-500">
                  Derived from canonical publisher ({cleanHost})
                </span>
              </div>
              <input
                type="text"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="editor@official-domain.org, editorial@..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 font-mono text-xs focus:bg-white focus:border-rose-500 focus:outline-hidden transition-colors"
              />
            </div>

            {/* Subject Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Forensic Warning Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-semibold focus:bg-white focus:border-rose-500 focus:outline-hidden transition-colors"
              />
            </div>

            {/* Email Body Preview & Editor with Pre-Defined Forensic Template */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pre-Defined Forensic Warning Template
                </label>
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  title="Restore original pre-defined forensic evidence template"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Forensic Template</span>
                </button>
              </div>
              <textarea
                rows={11}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-slate-300 bg-slate-50/50 font-mono text-[11px] sm:text-xs leading-relaxed focus:bg-white focus:border-rose-500 focus:outline-hidden transition-colors"
              />
            </div>

          </div>

          {/* Dispatch Channel Selector & Send Warning Action Area */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Choose Dispatch Method:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('mailto')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedMethod === 'mailto'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Default Email App
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('gmail')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedMethod === 'gmail'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Gmail Web
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('outlook')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedMethod === 'outlook'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Outlook Web
                </button>
              </div>
            </div>

            {/* Primary Action Buttons: Send Warning & Copy Dossier */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              
              {/* PRIMARY 'Send Warning' BUTTON */}
              <button
                type="button"
                onClick={handleSendWarning}
                disabled={isSending}
                className="flex-1 px-5 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 active:scale-[0.99] text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Dispatching...' : 'Send Warning'}</span>
              </button>

              {/* Direct Clickable Native Link (Guaranteed to work even if popups are blocked) */}
              <a
                href={activeDirectUrl}
                target={selectedMethod === 'mailto' ? undefined : '_blank'}
                rel="noopener noreferrer"
                onClick={() => {
                  copyAlertToClipboard(`To: ${recipients}\nSubject: ${subject}\n\n${bodyText}`).catch(() => {});
                }}
                className="px-4 py-3 rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Direct link guaranteed to open your email provider directly in a new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Link Directly</span>
              </a>

              {/* Copy Full Text Button */}
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 border ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Full Text</span>
                  </>
                )}
              </button>

            </div>

            {/* Quick 1-Click Direct Links Strip */}
            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 font-medium">Quick Direct Web Compose Links:</span>
              <div className="flex items-center gap-2">
                <a
                  href={gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => copyAlertToClipboard(`To: ${recipients}\nSubject: ${subject}\n\n${bodyText}`).catch(() => {})}
                  className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold border border-red-200 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Gmail Compose ↗</span>
                </a>
                <a
                  href={outlookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => copyAlertToClipboard(`To: ${recipients}\nSubject: ${subject}\n\n${bodyText}`).catch(() => {})}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Outlook Compose ↗</span>
                </a>
                <a
                  href={mailtoUrl}
                  onClick={() => copyAlertToClipboard(`To: ${recipients}\nSubject: ${subject}\n\n${bodyText}`).catch(() => {})}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-300 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Mailto App ↗</span>
                </a>
              </div>
            </div>

            {/* Success Confirmation Banner upon clicking Send Warning */}
            {sentRecord && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Warning Alert Initialized &amp; Recorded in Audit Log!</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    {sentRecord.id}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Target: <strong className="font-mono">{sentRecord.recipients.join(', ')}</strong> · Method: <span className="uppercase font-semibold">{sentRecord.dispatchMethod}</span> · Full forensic report copied to clipboard.
                </p>
                {lastDispatchedUrl && (
                  <div className="pt-1">
                    <a
                      href={lastDispatchedUrl}
                      target={selectedMethod === 'mailto' ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 underline hover:text-emerald-900"
                    >
                      <span>Click here if the email window did not open automatically ↗</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Academic Attribution Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Academic Concept &amp; Direction: <strong className="text-slate-700">Dr. Rubaid Ashfaq</strong> · Co-creator: <strong className="text-slate-700">Zeba Nabi</strong></span>
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Done / Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
