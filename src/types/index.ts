// Sefaria API Types
export interface SefariaTextVersion {
  versionTitle: string;
  versionSource: string;
  language: 'he' | 'en';
  text: string | string[] | string[][];
}

export interface SefariaTextResponse {
  ref: string;
  heRef: string;
  title: string;
  book: string;
  categories: string[];
  versions: SefariaTextVersion[];
  sectionRef?: string;
  indexTitle?: string;
  heIndexTitle?: string;
}

export interface SefariaCalendarItem {
  title: {
    en: string;
    he: string;
  };
  displayValue: {
    en: string;
    he: string;
  };
  url: string;
  ref?: string;
  order?: number;
  category?: string;
  extraDetails?: {
    aliyot?: string[];
  };
}

export interface SefariaCalendarsResponse {
  date: string;
  timezone: string;
  calendar_items: SefariaCalendarItem[];
}

// Sefaria Collection/Sheet Types
export interface SefariaSheetSource {
  ref?: string;
  heRef?: string;
  text?: {
    he?: string;
    en?: string;
  };
  comment?: string;
  outsideText?: string;
  outsideBiText?: {
    he?: string;
    en?: string;
  };
}

export interface SefariaSheet {
  id: number;
  title: string;
  status: string;
  summary?: string;
  sources: SefariaSheetSource[];
  dateCreated: string;
  dateModified: string;
  owner: number;
  ownerName: string;
  views: number;
  tags: string[];
}

export interface SefariaCollection {
  name: string;
  slug: string;
  description?: string;
  sheets: SefariaCollectionSheet[];
  memberCount: number;
  sheetCount: number;
  lastModified: string;
}

export interface SefariaCollectionSheet {
  id: number;
  title: string;
  status: string;
  views: number;
  topics: { slug: string; asTyped: string }[];
  order?: number;
}

// Chok LeYisrael Types
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'shabbat';

export interface ChokSection {
  id: string;
  title: {
    en: string;
    he: string;
  };
  type: 'torah' | 'rashi' | 'haftarah' | 'mishnah' | 'gemara' | 'zohar' | 'halacha' | 'mussar';
  ref: string;
  content?: {
    he?: string | string[];
    en?: string | string[];
  };
  isCompleted: boolean;
}

export interface DailyChok {
  parsha: string;
  parshaHe: string;
  dayOfWeek: DayOfWeek;
  dayNumber: number; // 1-7
  hebrewDate: string;
  gregorianDate: string;
  sections: ChokSection[];
}

// Progress Tracking Types
export interface SectionProgress {
  sectionId: string;
  completedAt: string;
  timeSpentSeconds: number;
}

export interface DayProgress {
  date: string;
  parsha: string;
  dayNumber: number;
  sections: SectionProgress[];
  isCompleted: boolean;
}

export interface UserProgress {
  totalDaysCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalSectionsCompleted: number;
  lastCompletedDate: string | null;
  history: DayProgress[];
  // Gamification - future expansion
  points: number;
  level: number;
  achievements: string[];
}

// Parsha data
export interface ParshaInfo {
  name: {
    en: string;
    he: string;
  };
  book: string;
  ref: string;
  aliyot: string[];
  haftarah: string;
}

export const DAYS_OF_WEEK: { en: DayOfWeek; he: string }[] = [
  { en: 'sunday', he: 'יום ראשון' },
  { en: 'monday', he: 'יום שני' },
  { en: 'tuesday', he: 'יום שלישי' },
  { en: 'wednesday', he: 'יום רביעי' },
  { en: 'thursday', he: 'יום חמישי' },
  { en: 'friday', he: 'יום שישי' },
  { en: 'shabbat', he: 'שבת' },
];
