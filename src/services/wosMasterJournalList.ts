/**
 * Web of Science Master Journal List source metadata and local verification registry.
 *
 * Clarivate's collection downloads require a Master Journal List login. The
 * registry below is therefore intentionally limited to records verified for
 * this application; it is not a republished copy of the restricted export.
 */

import { WosCoreCollectionType } from '../types';

export const WOS_MASTER_LIST_METADATA = {
  sourceName: 'Clarivate Web of Science Master Journal List',
  sourceUrl: 'https://mjl.clarivate.com/mjl/collection-list-downloads',
  lastUpdated: '2026-10-19',
  accessNote: 'Collection downloads require a free Master Journal List login.',
} as const;

export interface WosMasterJournalRecord {
  collection: WosCoreCollectionType;
  title: string;
  publisher: string;
  issn: string;
}

export const WOS_MASTER_JOURNAL_LIST: readonly WosMasterJournalRecord[] = [
  { collection: 'SSCI', title: 'Digital Journalism', publisher: 'Routledge / Taylor & Francis', issn: '2167-0811' },
  { collection: 'SSCI', title: 'Telematics and Informatics', publisher: 'Elsevier', issn: '0736-5853' },
  { collection: 'SSCI', title: 'New Media & Society', publisher: 'SAGE Publications', issn: '1461-4448' },
  { collection: 'SSCI', title: 'Journal of Computer-Mediated Communication', publisher: 'Oxford University Press / ICA', issn: '1083-6101' },
  { collection: 'ESCI', title: 'AI & Society: Knowledge, Culture and Communication', publisher: 'Springer Nature', issn: '0951-5666' },
  { collection: 'SSCI', title: 'Journalism & Mass Communication Quarterly', publisher: 'SAGE Publications', issn: '1077-6990' },
  { collection: 'SCIE', title: 'Communications of the ACM', publisher: 'ACM', issn: '0001-0782' },
  { collection: 'SSCI', title: 'Information, Communication & Society', publisher: 'Routledge / Taylor & Francis', issn: '1369-118X' },
  { collection: 'SCIE', title: 'IEEE Transactions on Pattern Analysis and Machine Intelligence', publisher: 'IEEE', issn: '0162-8828' },
  { collection: 'SCIE', title: 'Conservation Biology', publisher: 'Wiley-Blackwell', issn: '0888-8892' },
  { collection: 'SCIE', title: 'The Lancet Digital Health', publisher: 'Elsevier', issn: '2589-7500' },
  { collection: 'SCIE', title: 'Nature', publisher: 'Springer Nature', issn: '0028-0836' },
  { collection: 'SCIE', title: 'Science', publisher: 'AAAS', issn: '0036-8075' },
  { collection: 'SSCI', title: 'Computers in Human Behavior', publisher: 'Elsevier', issn: '0747-5632' },
];
