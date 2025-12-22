import type { ChokSection, DailyChok, DayOfWeek } from '../types';
import { getCurrentParsha, type ParshaData } from '../data/parshiyot';
import sefariaService from './sefaria';

// Map day number (0-6, Sunday-Saturday) to Chok day (1-7)
function getDayNumber(): number {
  const day = new Date().getDay();
  return day === 0 ? 1 : day + 1; // Sunday = 1, Monday = 2, ..., Saturday = 7
}

function getDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'shabbat'];
  return days[new Date().getDay()];
}

// Build Chok LeYisrael sections for a given day
export function buildChokSections(parsha: ParshaData, dayNumber: number): ChokSection[] {
  const aliyahIndex = dayNumber - 1; // 0-indexed
  const sections: ChokSection[] = [];

  // 1. Torah portion (Aliyah for the day)
  sections.push({
    id: `torah-${dayNumber}`,
    title: { en: 'Torah - Chumash', he: 'תורה - חומש' },
    type: 'torah',
    ref: parsha.aliyot[aliyahIndex] || parsha.aliyot[0],
    isCompleted: false,
  });

  // 2. Rashi on the Torah portion
  sections.push({
    id: `rashi-${dayNumber}`,
    title: { en: 'Rashi Commentary', he: 'פירוש רש"י' },
    type: 'rashi',
    ref: `Rashi on ${parsha.aliyot[aliyahIndex] || parsha.aliyot[0]}`,
    isCompleted: false,
  });

  // 3. Haftarah (only on Shabbat/day 7, but we can show a portion each day)
  if (dayNumber === 7) {
    sections.push({
      id: `haftarah-${dayNumber}`,
      title: { en: 'Haftarah', he: 'הפטרה' },
      type: 'haftarah',
      ref: parsha.haftarah,
      isCompleted: false,
    });
  }

  // 4. Mishnah
  sections.push({
    id: `mishnah-${dayNumber}`,
    title: { en: 'Mishnah', he: 'משנה' },
    type: 'mishnah',
    ref: parsha.mishnayot[aliyahIndex] || parsha.mishnayot[0],
    isCompleted: false,
  });

  // 5. Gemara (simplified - would need actual schedule)
  sections.push({
    id: `gemara-${dayNumber}`,
    title: { en: 'Gemara', he: 'גמרא' },
    type: 'gemara',
    ref: 'Berakhot 2a:1-5', // Placeholder - would need actual daily assignment
    isCompleted: false,
  });

  // 6. Zohar (if available)
  if (parsha.zohar) {
    sections.push({
      id: `zohar-${dayNumber}`,
      title: { en: 'Zohar', he: 'זוהר' },
      type: 'zohar',
      ref: parsha.zohar,
      isCompleted: false,
    });
  }

  // 7. Halacha
  sections.push({
    id: `halacha-${dayNumber}`,
    title: { en: 'Halacha', he: 'הלכה' },
    type: 'halacha',
    ref: 'Shulchan Arukh, Orach Chayim 1:1', // Placeholder
    isCompleted: false,
  });

  // 8. Mussar
  sections.push({
    id: `mussar-${dayNumber}`,
    title: { en: 'Mussar', he: 'מוסר' },
    type: 'mussar',
    ref: 'Orchot Tzadikim, Introduction', // Placeholder
    isCompleted: false,
  });

  return sections;
}

export async function getDailyChok(): Promise<DailyChok> {
  const parsha = getCurrentParsha();
  const dayNumber = getDayNumber();
  const dayOfWeek = getDayOfWeek();

  const sections = buildChokSections(parsha, dayNumber);

  // Get Hebrew date from Sefaria calendars
  let hebrewDate = '';
  try {
    const calendars = await sefariaService.getCalendars();
    hebrewDate = calendars.date || '';
  } catch {
    // Use fallback
  }

  return {
    parsha: parsha.name.en,
    parshaHe: parsha.name.he,
    dayOfWeek,
    dayNumber,
    hebrewDate,
    gregorianDate: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    sections,
  };
}

export async function fetchSectionContent(section: ChokSection): Promise<ChokSection> {
  try {
    const response = await sefariaService.getText(section.ref);
    return {
      ...section,
      content: {
        he: sefariaService.getHebrewText(response),
        en: sefariaService.getEnglishText(response),
      },
    };
  } catch (error) {
    console.error(`Failed to fetch content for ${section.ref}:`, error);
    return {
      ...section,
      content: {
        he: ['טקסט לא זמין / Text not available'],
        en: ['Content could not be loaded. Please try again.'],
      },
    };
  }
}

// Get Chok for a specific day of the week
export function getChokForDay(parsha: ParshaData, dayNumber: number): ChokSection[] {
  return buildChokSections(parsha, dayNumber);
}
