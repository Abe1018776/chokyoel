import type {
  SefariaTextResponse,
  SefariaCalendarsResponse,
  SefariaCollection,
  SefariaSheet
} from '../types';

const SEFARIA_API_BASE = 'https://www.sefaria.org/api';

// The slug for the Chok LeYisrael collection on Sefaria
export const CHOK_COLLECTION_SLUG = 'חק-לישראל';

class SefariaService {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheTTL = 1000 * 60 * 30; // 30 minutes

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getText(ref: string, options?: { version?: string; language?: 'he' | 'en' | 'both' }): Promise<SefariaTextResponse> {
    const cacheKey = `text:${ref}:${JSON.stringify(options)}`;
    const cached = this.getCached<SefariaTextResponse>(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams();
    if (options?.version) {
      params.set('version', options.version);
    }

    const url = `${SEFARIA_API_BASE}/v3/texts/${encodeURIComponent(ref)}?${params.toString()}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch text: ${response.statusText}`);
    }

    const data = await response.json();
    this.setCache(cacheKey, data);
    return data;
  }

  async getCalendars(options?: {
    timezone?: string;
    diaspora?: boolean;
    day?: number;
    month?: number;
    year?: number;
  }): Promise<SefariaCalendarsResponse> {
    const params = new URLSearchParams();
    if (options?.timezone) params.set('timezone', options.timezone);
    if (options?.diaspora !== undefined) params.set('diaspora', options.diaspora ? '1' : '0');
    if (options?.day) params.set('day', options.day.toString());
    if (options?.month) params.set('month', options.month.toString());
    if (options?.year) params.set('year', options.year.toString());

    const cacheKey = `calendars:${params.toString()}`;
    const cached = this.getCached<SefariaCalendarsResponse>(cacheKey);
    if (cached) return cached;

    const url = `${SEFARIA_API_BASE}/calendars?${params.toString()}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calendars: ${response.statusText}`);
    }

    const data = await response.json();
    this.setCache(cacheKey, data);
    return data;
  }

  async getParsha(): Promise<{ ref: string; name: { en: string; he: string }; aliyot?: string[] } | null> {
    const calendars = await this.getCalendars({ diaspora: true });
    const parsha = calendars.calendar_items.find(
      item => item.title.en === 'Parashat Hashavua'
    );

    if (!parsha) return null;

    return {
      ref: parsha.ref || parsha.url.replace('/api/texts/', ''),
      name: {
        en: parsha.displayValue.en,
        he: parsha.displayValue.he
      },
      aliyot: parsha.extraDetails?.aliyot
    };
  }

  // Fetch a collection by slug
  async getCollection(slug: string): Promise<SefariaCollection> {
    const cacheKey = `collection:${slug}`;
    const cached = this.getCached<SefariaCollection>(cacheKey);
    if (cached) return cached;

    const url = `${SEFARIA_API_BASE}/collections/${encodeURIComponent(slug)}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch collection: ${response.statusText}`);
    }

    const data = await response.json();
    this.setCache(cacheKey, data);
    return data;
  }

  // Fetch the Chok LeYisrael collection
  async getChokCollection(): Promise<SefariaCollection> {
    return this.getCollection(CHOK_COLLECTION_SLUG);
  }

  // Fetch a specific sheet by ID
  async getSheet(sheetId: number): Promise<SefariaSheet> {
    const cacheKey = `sheet:${sheetId}`;
    const cached = this.getCached<SefariaSheet>(cacheKey);
    if (cached) return cached;

    const url = `${SEFARIA_API_BASE}/sheets/${sheetId}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }

    const data = await response.json();
    this.setCache(cacheKey, data);
    return data;
  }

  // Find Chok sheets for a specific parsha
  async getChokSheetsForParsha(parshaName: string): Promise<SefariaSheet[]> {
    try {
      const collection = await this.getChokCollection();

      // Filter sheets that match the parsha name (in Hebrew or English)
      const matchingSheets = collection.sheets.filter(sheet => {
        const title = sheet.title.toLowerCase();
        const parshaLower = parshaName.toLowerCase();
        return title.includes(parshaLower) ||
               title.includes('פרשת') ||
               sheet.topics?.some(t => t.asTyped.toLowerCase().includes(parshaLower));
      });

      // Fetch full sheet data for matching sheets
      const sheets = await Promise.all(
        matchingSheets.slice(0, 7).map(s => this.getSheet(s.id))
      );

      return sheets;
    } catch (error) {
      console.error('Failed to fetch Chok sheets:', error);
      return [];
    }
  }

  // Get all Chok sheets organized by day (1-7)
  async getChokSheetsByDay(parshaName: string): Promise<Map<number, SefariaSheet>> {
    const sheets = await this.getChokSheetsForParsha(parshaName);
    const byDay = new Map<number, SefariaSheet>();

    // Try to parse day number from sheet titles (e.g., "יום א", "Day 1", etc.)
    const dayPatterns = [
      /יום\s*([אבגדהוש])/i,  // Hebrew: יום א, יום ב, etc.
      /day\s*(\d)/i,         // English: Day 1, Day 2, etc.
      /(\d)\s*[-–]\s*/,      // Number prefix: 1 - Title
    ];

    const hebrewDayMap: Record<string, number> = {
      'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ש': 7
    };

    sheets.forEach(sheet => {
      for (const pattern of dayPatterns) {
        const match = sheet.title.match(pattern);
        if (match) {
          let dayNum: number;
          if (hebrewDayMap[match[1]]) {
            dayNum = hebrewDayMap[match[1]];
          } else {
            dayNum = parseInt(match[1], 10);
          }
          if (dayNum >= 1 && dayNum <= 7) {
            byDay.set(dayNum, sheet);
            break;
          }
        }
      }
    });

    return byDay;
  }

  async getTextWithRashi(ref: string): Promise<{
    text: SefariaTextResponse;
    rashi: SefariaTextResponse | null;
  }> {
    const text = await this.getText(ref);

    let rashi: SefariaTextResponse | null = null;
    try {
      rashi = await this.getText(`Rashi on ${ref}`);
    } catch {
      // Rashi might not exist for this ref
    }

    return { text, rashi };
  }

  // Helper to extract text array from Sefaria response
  extractTextArray(text: string | string[] | string[][]): string[] {
    if (typeof text === 'string') {
      return [text];
    }
    if (Array.isArray(text)) {
      return text.flat(2).filter(t => typeof t === 'string' && t.length > 0);
    }
    return [];
  }

  // Get Hebrew text from response
  getHebrewText(response: SefariaTextResponse): string[] {
    const heVersion = response.versions.find(v => v.language === 'he');
    if (!heVersion) return [];
    return this.extractTextArray(heVersion.text);
  }

  // Get English text from response
  getEnglishText(response: SefariaTextResponse): string[] {
    const enVersion = response.versions.find(v => v.language === 'en');
    if (!enVersion) return [];
    return this.extractTextArray(enVersion.text);
  }
}

export const sefariaService = new SefariaService();
export default sefariaService;
