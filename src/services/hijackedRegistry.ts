/**
 * SHODH SETU AI - Hijacked & Cloned Journal Registry
 * Academic Concept & Direction: Dr. Rubaid Ashfaq
 * 
 * Curated registry of known hijacked and cloned academic serials documented by
 * Retraction Watch, Cabells, ISSN International Centre, and scientific watchdogs.
 */

export interface HijackedRecord {
  officialTitle: string;
  issn: string;
  eIssn?: string;
  officialPublisher: string;
  officialWebsite: string;
  officialCountry: string;
  authenticScope: string;
  hijackedDomains: string[];
  hijackedTitleVariants: string[];
  hijackingTactics: string;
  evidenceSource: string;
}

export const KNOWN_HIJACKED_REGISTRY: HijackedRecord[] = [
  {
    officialTitle: 'Cineforum',
    issn: '0009-7039',
    officialPublisher: 'Federazione Italiana dei Cineforum (FIC)',
    officialWebsite: 'https://cineforum.it/',
    officialCountry: 'Italy',
    authenticScope: 'Italian Cinema Studies, Film Criticism, Film Theory & Culture (Quarterly cultural publication)',
    hijackedDomains: [
      'revistadecineforum.com',
      'revistadecineforum.org',
      'cineforum-journal.com',
      'cineforum.org',
    ],
    hijackedTitleVariants: [
      'Revista de Cineforum',
      'Cineforum Journal',
      'Revista de Cineforum Multidisciplinary',
    ],
    hijackingTactics: 'Fraudulent domain steals ISSN 0009-7039 from the legitimate Italian film publication. Sets up a counterfeit Open Journal Systems (OJS) portal (index.php/cf), falsely claims a multidisciplinary scope, and charges steep APCs for rapid acceptance within 1–2 weeks with no genuine peer review.',
    evidenceSource: 'Retraction Watch Hijacked Journal Checker, ISSN International Portal, Federazione Italiana dei Cineforum',
  },
  {
    officialTitle: 'Wulfenia',
    issn: '1561-882X',
    officialPublisher: 'Kärntner Landesmuseum',
    officialWebsite: 'https://www.landesmuseum.ktn.gv.at/',
    officialCountry: 'Austria',
    authenticScope: 'Botany, Plant Biology, Alpine Flora, Taxonomy',
    hijackedDomains: [
      'wulfeniajournal.com',
      'wulfenia.org',
      'wulfeniajournal.org',
    ],
    hijackedTitleVariants: [
      'Wulfenia Journal Multidisciplinary',
      'Wulfenia Journal International',
    ],
    hijackingTactics: 'High-profile hijacked serial mimicking the Austrian regional botanical journal. Fraudulent site accepts non-botanical papers across medicine and engineering, claiming fake impact factors.',
    evidenceSource: 'Retraction Watch, Austrian Botanical Society, Web of Science alerts',
  },
  {
    officialTitle: 'Annals of Forest Research',
    issn: '1844-8135',
    eIssn: '2065-2445',
    officialPublisher: 'National Institute for Research and Development in Forestry (INCDS "Marin Drăcea")',
    officialWebsite: 'https://www.e-afr.org',
    officialCountry: 'Romania',
    authenticScope: 'Forestry, Silviculture, Forest Ecology',
    hijackedDomains: [
      'annalsofforestresearch.com',
      'annalsofforest.com',
    ],
    hijackedTitleVariants: [
      'Annals of Forest Research International',
    ],
    hijackingTactics: 'Counterfeit website uses .com domain while legitimate journal operates at e-afr.org. Collects thousands of dollars from unsuspecting authors.',
    evidenceSource: 'INCDS Marin Drăcea Official Statement, Retraction Watch',
  },
  {
    officialTitle: 'Cadmo - Giornale Italiano di Pedagogia Sperimentale',
    issn: '1122-5165',
    eIssn: '1972-5019',
    officialPublisher: 'FrancoAngeli',
    officialWebsite: 'https://www.francoangeli.it/riviste/scheda-rivista/rivista/cad',
    officialCountry: 'Italy',
    authenticScope: 'Experimental Pedagogy, Educational Research and Methodology',
    hijackedDomains: [
      'cadmojournal.com',
      'cadmo-journal.org',
    ],
    hijackedTitleVariants: [
      'Cadmo Journal',
      'Cadmo International',
    ],
    hijackingTactics: 'Spoofs FrancoAngeli\'s educational journal. Uses lookalike domain to solicit manuscripts across unrelated computer science and commerce fields.',
    evidenceSource: 'FrancoAngeli Publisher Warning, ANVUR Advisory',
  },
  {
    officialTitle: 'Sylwan',
    issn: '0039-7660',
    officialPublisher: 'Polskie Towarzystwo Leśne (Polish Forest Society)',
    officialWebsite: 'https://sylwan.ibles.org',
    officialCountry: 'Poland',
    authenticScope: 'Forestry Sciences, Wood Technology',
    hijackedDomains: [
      'sylwan.org',
      'sylwan-journal.com',
    ],
    hijackedTitleVariants: [
      'Sylwan Journal',
      'Sylwan English Edition',
    ],
    hijackingTactics: 'One of the oldest forestry journals in the world. Fraudulent operators bought expired or lookalike domain to hijack submissions.',
    evidenceSource: 'Polish Academy of Sciences, Retraction Watch',
  },
  {
    officialTitle: 'Jökull',
    issn: '0449-0576',
    officialPublisher: 'Iceland Glaciological Society & Geoscience Society of Iceland',
    officialWebsite: 'https://jokulljournal.is',
    officialCountry: 'Iceland',
    authenticScope: 'Glaciology, Volcanology, Geoscience in the North Atlantic',
    hijackedDomains: [
      'jokulljournal.com',
      'jokull.org',
    ],
    hijackedTitleVariants: [
      'Jökull Journal',
    ],
    hijackingTactics: 'Targeted print/national serial. Fake domain publishes multidisciplinary articles unrelated to Icelandic geoscience.',
    evidenceSource: 'Geoscience Society of Iceland, Retraction Watch',
  },
  {
    officialTitle: 'Schweizerische Zeitschrift für Kommunikationsforschung',
    issn: '1420-9438',
    officialPublisher: 'Universitätsverlag Bern / Swiss Academy',
    officialWebsite: 'https://ub.unibe.ch/szk',
    officialCountry: 'Switzerland',
    authenticScope: 'Communication Science, Media Research',
    hijackedDomains: [
      'swiss-review-informatics-journal.com',
    ],
    hijackedTitleVariants: [
      'Swiss Review of Communication & Informatics',
    ],
    hijackingTactics: 'Altered English title variant spoofing legitimate print-only Swiss academy publication.',
    evidenceSource: 'ISSN International Register, Bern University Library',
  },
  {
    officialTitle: 'Vikalpa: The Journal for Decision Makers',
    issn: '0256-0909',
    eIssn: '2395-3799',
    officialPublisher: 'SAGE Publications / Indian Institute of Management Ahmedabad (IIMA)',
    officialWebsite: 'https://journals.sagepub.com/home/vik',
    officialCountry: 'India',
    authenticScope: 'Management, Economics, Strategic Decision Making',
    hijackedDomains: [
      'vikalpa-journal.org',
      'vikalpajournal.com',
      'vikalparesearch.com',
    ],
    hijackedTitleVariants: [
      'Vikalpa International Journal',
      'Vikalpa Multidisciplinary Research',
    ],
    hijackingTactics: 'Counterfeit portal hijacks IIM Ahmedabad\'s flagship journal. Promises rapid acceptance within 48 hours for a $250 publication fee.',
    evidenceSource: 'IIMA Integrity Advisory, Retraction Watch',
  },
  {
    officialTitle: 'Asian Journal of Chemistry',
    issn: '0970-7077',
    eIssn: '0975-427X',
    officialPublisher: 'Chemical Publishing Co.',
    officialWebsite: 'https://asianjournalofchemistry.co.in',
    officialCountry: 'India',
    authenticScope: 'Inorganic, Organic, Physical, Analytical Chemistry',
    hijackedDomains: [
      'asianjournalchemistry.com',
      'asianchemistryjournal.org',
    ],
    hijackedTitleVariants: [
      'Asian Journal of Chemistry & Engineering',
    ],
    hijackingTactics: 'Spoofs genuine chemistry serial by cloning layout, editorial board names, and claiming fraudulent Web of Science indexing.',
    evidenceSource: 'Retraction Watch Hijacked Journal List',
  },
  {
    officialTitle: 'Journal of Engineering and Applied Sciences',
    issn: '1816-949X',
    officialPublisher: 'Medwell Publications',
    officialWebsite: 'https://medwelljournals.com/journalhome.php?jid=1816-949x',
    officialCountry: 'Pakistan / UAE',
    authenticScope: 'Engineering, Applied Physics, Computational Sciences',
    hijackedDomains: [
      'jeasonline.com',
      'jeas-journal.org',
    ],
    hijackedTitleVariants: [
      'JEAS Online International',
    ],
    hijackingTactics: 'Clone portal mimics Medwell title, misrepresenting discontinued indexing status as active Scopus Q1.',
    evidenceSource: 'Cabells Predatory Reports, Retraction Watch',
  },
];

/**
 * Searches the registry for matches by submitted URL, hostname, title, or ISSN.
 */
export function lookupHijackedRegistry(input: string): {
  isHijackedDomain: boolean;
  isAuthenticDomain: boolean;
  record?: HijackedRecord;
  matchedDomain?: string;
} {
  const cleanInput = input.trim().toLowerCase();
  
  // Extract hostname if input looks like a URL
  let hostname = '';
  try {
    if (cleanInput.startsWith('http://') || cleanInput.startsWith('https://')) {
      hostname = new URL(cleanInput).hostname.replace(/^www\./, '');
    } else if (cleanInput.includes('.') && !cleanInput.includes(' ')) {
      hostname = new URL(`https://${cleanInput}`).hostname.replace(/^www\./, '');
    }
  } catch {
    hostname = cleanInput;
  }

  // Check against known hijacked domains
  for (const record of KNOWN_HIJACKED_REGISTRY) {
    // 1. Check if input is a hijacked domain
    for (const hDomain of record.hijackedDomains) {
      if (
        (hostname && (hostname === hDomain || hostname.endsWith(`.${hDomain}`))) ||
        cleanInput.includes(hDomain)
      ) {
        return {
          isHijackedDomain: true,
          isAuthenticDomain: false,
          record,
          matchedDomain: hDomain,
        };
      }
    }

    // 2. Check if input is the authentic domain
    try {
      const authHost = new URL(record.officialWebsite).hostname.replace(/^www\./, '');
      if (
        (hostname && (hostname === authHost || hostname.endsWith(`.${authHost}`))) ||
        cleanInput.includes(authHost)
      ) {
        return {
          isHijackedDomain: false,
          isAuthenticDomain: true,
          record,
          matchedDomain: authHost,
        };
      }
    } catch {
      // url parse
    }

    // 3. Check by ISSN
    const cleanIssn = cleanInput.replace(/[^0-9xX]/g, '');
    const recIssn = record.issn.replace(/[^0-9xX]/g, '');
    if (cleanIssn && cleanIssn.length === 8 && cleanIssn === recIssn) {
      return {
        isHijackedDomain: false,
        isAuthenticDomain: false, // User queried by ISSN, need to provide clone awareness
        record,
      };
    }

    // 4. Check by Title or Title Variant
    if (
      cleanInput === record.officialTitle.toLowerCase() ||
      record.hijackedTitleVariants.some(v => cleanInput === v.toLowerCase() || cleanInput.includes(v.toLowerCase()))
    ) {
      return {
        isHijackedDomain: record.hijackedTitleVariants.some(v => cleanInput === v.toLowerCase()),
        isAuthenticDomain: cleanInput === record.officialTitle.toLowerCase(),
        record,
      };
    }
  }

  return {
    isHijackedDomain: false,
    isAuthenticDomain: false,
  };
}
