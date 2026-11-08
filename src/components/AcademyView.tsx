/**
 * SHODH SETU AI - Research Integrity Academy (Learning Centre)
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  ShieldAlert, 
  CopyCheck, 
  Search, 
  Award, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from 'lucide-react';

interface AcademyCard {
  id: string;
  title: string;
  subtitle: string;
  category: 'Predatory Publishing' | 'Cloning & Hijacking' | 'Indexing Databases' | 'Metrics & Verification';
  icon: any;
  content: string[];
  keyTakeaway: string;
}

const ACADEMY_LESSONS: AcademyCard[] = [
  {
    id: 'predatory',
    title: 'What is a Predatory Journal?',
    subtitle: 'Deceptive publishing practices, lack of peer review, and fee-first models',
    category: 'Predatory Publishing',
    icon: ShieldAlert,
    content: [
      'Predatory journals prioritize self-interest and publication fees at the expense of scholarship. They characterize themselves by misleading information, deviation from best editorial practices, a lack of transparency, and the use of aggressive solicitation.',
      'Unlike legitimate open-access journals that charge transparent Article Processing Charges (APCs) to fund editing, peer review, and digital archiving, predatory entities perform little to no peer review, accepting almost all submissions to maximize fee volume.',
      'Articles published in predatory journals can jeopardize academic careers, invalidate grant deliverables, and contaminate scientific literature with unvetted claims.',
    ],
    keyTakeaway: 'Always verify editorial governance and peer-review rigor before submitting. Never judge a journal solely by its official-sounding title.',
  },
  {
    id: 'cloned',
    title: 'What is a Cloned Journal?',
    subtitle: 'Counterfeit websites spoofing authentic academic serials',
    category: 'Cloning & Hijacking',
    icon: CopyCheck,
    content: [
      'A cloned journal is a fraudulent counterfeit website created by cyber-fraudsters that impersonates a legitimate, reputable scholarly journal.',
      'The perpetrators steal the title, ISSN, and often the names of editorial board members from an authentic journal—frequently targeting print-only journals or journals from non-English speaking regions that lack a prominent web presence.',
      'Authors who submit to the cloned site are charged publication fees, but their work is never indexed or archived in legitimate scientific databases, resulting in copyright loss and stolen fees.',
    ],
    keyTakeaway: 'Always cross-check the journal domain with the canonical URL registered in Crossref or ISSN International Centre.',
  },
  {
    id: 'hijacked',
    title: 'What is a Hijacked Journal?',
    subtitle: 'Expired domain takeovers and compromised journal portals',
    category: 'Cloning & Hijacking',
    icon: AlertTriangle,
    content: [
      'While "cloned" refers to creating a lookalike site, "journal hijacking" often involves malicious actors buying an expired domain name of a legitimate academic journal that ceased publication or migrated to a new university server.',
      'Because the old URL may still be linked in old university guides or indexing records, researchers unknowingly land on the hijacked domain and submit papers, which are then accepted within 24–48 hours for a quick wire transfer fee.',
    ],
    keyTakeaway: 'Verify that the journal submission portal links to an active institutional or publisher repository.',
  },
  {
    id: 'scopus',
    title: 'How Does Scopus Indexing Work?',
    subtitle: 'Elsevier curation, CSAB review, and active source coverage',
    category: 'Indexing Databases',
    icon: Award,
    content: [
      'Scopus is an abstract and citation database curated by Elsevier. Inclusion requires rigorous independent evaluation by the Content Selection & Advisory Board (CSAB).',
      'Evaluation criteria include: convincing editorial concept, diversity in geographical distribution of editors and authors, citedness of journal articles, and adherence to publishing ethics.',
      'CRITICAL: Scopus re-evaluates journals periodically. Discontinued titles lose future indexing. An article submitted to a journal that gets discontinued prior to publication will NOT appear in Scopus.',
    ],
    keyTakeaway: 'Always check the live Scopus Source list immediately before manuscript submission.',
  },
  {
    id: 'wos',
    title: 'What is Web of Science (Clarivate)?',
    subtitle: 'Core collection, 24 quality criteria, and impact factors',
    category: 'Indexing Databases',
    icon: Award,
    content: [
      'Web of Science Core Collection (operated by Clarivate) is one of the world\'s most selective citation indexes, encompassing the Science Citation Index Expanded (SCIE), Social Sciences Citation Index (SSCI), Arts & Humanities Citation Index (AHCI), and Emerging Sources Citation Index (ESCI).',
      'Clarivate evaluates journals against 24 rigorous quality criteria (editorial rigor, ethical statements, international peer review) and 4 impact criteria.',
      'Only journals that meet all quality and impact criteria in SCIE/SSCI receive an official Journal Impact Factor (JIF).',
    ],
    keyTakeaway: 'Clarivate Master Journal List is the only official source for WoS indexing.',
  },
  {
    id: 'doaj',
    title: 'What is DOAJ (Directory of Open Access Journals)?',
    subtitle: 'The gold standard for ethical, non-predatory open-access publishing',
    category: 'Indexing Databases',
    icon: CheckCircle2,
    content: [
      'DOAJ is a community-curated online directory that indexes and provides access to high quality, open access, peer-reviewed journals.',
      'To be listed, journals must exercise strict quality control, provide clear licensing terms (e.g. Creative Commons), state APC terms transparently, and have an editorial board with verified affiliations.',
      'The "DOAJ Seal" is awarded to journals that demonstrate outstanding best practices in open-access archiving, permanent identifiers, and copyright retention.',
    ],
    keyTakeaway: 'DOAJ inclusion is one of the strongest initial indicators that an open-access journal is legitimate and not predatory.',
  },
  {
    id: 'issn',
    title: 'What is an ISSN (and what is it NOT)?',
    subtitle: 'An identification number, NOT an endorsement of scientific quality',
    category: 'Metrics & Verification',
    icon: FileText,
    content: [
      'An International Standard Serial Number (ISSN) is an 8-digit code used to uniquely identify a serial publication (print or electronic).',
      'A COMMON MISCONCEPTION: Having an ISSN does NOT mean a journal is peer-reviewed, high-quality, or legitimate. Predatory journals can easily obtain an ISSN simply by registering with their national ISSN agency.',
      'Never cite "Indexed by ISSN" as a qualification—an ISSN is merely a barcode for tracking titles, not an index.',
    ],
    keyTakeaway: 'An ISSN is necessary for a serial, but completely insufficient to prove quality or integrity.',
  },
  {
    id: 'google_scholar',
    title: 'Why Google Scholar is NOT Proof of Indexing',
    subtitle: 'Web crawler vs curated scholarly peer-review index',
    category: 'Metrics & Verification',
    icon: HelpCircle,
    content: [
      'Predatory journals often boast "Indexed in Google Scholar" as their primary credential. This is deeply misleading.',
      'Google Scholar is an automated web crawler, not a curated academic index. It indexes any PDF document that looks like an academic paper hosted on the internet, including student essays, blog posts, press releases, and predatory papers.',
      'Google Scholar has no editorial review board, no peer-review audit, and no quality gate.',
    ],
    keyTakeaway: 'Never accept "Indexed in Google Scholar" as evidence of journal legitimacy or accreditation.',
  },
  {
    id: 'fake_metrics',
    title: 'How to Identify Fake Impact Factors',
    subtitle: 'Universal Impact Factor, Global Impact Factor, Cosmos, and misleading metrics',
    category: 'Metrics & Verification',
    icon: ShieldAlert,
    content: [
      'Because Clarivate\'s Journal Impact Factor (JIF) is prestigious, deceitful companies created counterfeit "impact factors" to charge journals money for fake numbers.',
      'Examples of fake metrics: Universal Impact Factor (UIF), Global Impact Factor (GIF), Cosmos Impact Factor, CiteFactor, Journal Impact Score, International Scientific Indexing (ISI - mimicking Institute for Scientific Information).',
      'Any journal boasting a metric from these entities is engaging in deceptive academic marketing.',
    ],
    keyTakeaway: 'The only authentic Journal Impact Factor (JIF) comes from Clarivate Journal Citation Reports (JCR).',
  },
];

export const AcademyView: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('predatory');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const categories = ['all', 'Predatory Publishing', 'Cloning & Hijacking', 'Indexing Databases', 'Metrics & Verification'];

  const filtered = ACADEMY_LESSONS.filter(l => {
    if (selectedCategory === 'all') return true;
    return l.category === selectedCategory;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Research Integrity Academy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Scholarly Publishing Integrity Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Created by <strong>Dr. Rubaid Ashfaq</strong> · Co-creator: <strong>Zeba Nabi</strong>. Master the distinction between authentic indexing, deceptive marketing, and cloned websites.
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Lessons' : cat}
          </button>
        ))}
      </div>

      {/* Lessons Accordion / Cards Grid */}
      <div className="space-y-4">
        {filtered.map((lesson) => {
          const isExpanded = expandedId === lesson.id;
          const Icon = lesson.icon;

          return (
            <div
              key={lesson.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all"
            >
              <div
                onClick={() => toggleExpand(lesson.id)}
                className="p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        {lesson.category}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {lesson.subtitle}
                    </p>
                  </div>
                </div>

                <div className="p-1 rounded-full text-slate-400 shrink-0">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Expanded Lesson Content */}
              {isExpanded && (
                <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-slate-100 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {lesson.content.map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      {paragraph}
                    </p>
                  ))}

                  {/* Key Takeaway Box */}
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs sm:text-sm">
                    <strong className="font-bold block mb-1">Key Integrity Takeaway:</strong>
                    <span>{lesson.keyTakeaway}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
