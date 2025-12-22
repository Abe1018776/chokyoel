// Parshiyot data with references for Chok LeYisrael
// Each parsha is divided into 7 parts corresponding to the 7 aliyot

export interface ParshaData {
  name: {
    en: string;
    he: string;
  };
  book: string;
  ref: string;
  aliyot: string[]; // 7 aliyot refs
  haftarah: string;
  // Additional sections for Chok LeYisrael
  mishnayot: string[];
  zohar?: string;
}

// This week's parsha (Vayigash) and surrounding parshiyot for navigation
export const CURRENT_PARSHIYOT: ParshaData[] = [
  {
    name: { en: 'Vayigash', he: 'ויגש' },
    book: 'Genesis',
    ref: 'Genesis 44:18-47:27',
    aliyot: [
      'Genesis 44:18-44:30',
      'Genesis 44:31-45:7',
      'Genesis 45:8-45:18',
      'Genesis 45:19-45:27',
      'Genesis 45:28-46:27',
      'Genesis 46:28-47:10',
      'Genesis 47:11-47:27',
    ],
    haftarah: 'Ezekiel 37:15-37:28',
    mishnayot: [
      'Mishnah Berakhot 1',
      'Mishnah Berakhot 2',
      'Mishnah Berakhot 3',
      'Mishnah Berakhot 4',
      'Mishnah Berakhot 5',
      'Mishnah Berakhot 6',
      'Mishnah Berakhot 7',
    ],
    zohar: 'Zohar 1:205a',
  },
  {
    name: { en: 'Vayechi', he: 'ויחי' },
    book: 'Genesis',
    ref: 'Genesis 47:28-50:26',
    aliyot: [
      'Genesis 47:28-48:9',
      'Genesis 48:10-48:16',
      'Genesis 48:17-48:22',
      'Genesis 49:1-49:18',
      'Genesis 49:19-49:26',
      'Genesis 49:27-50:20',
      'Genesis 50:21-50:26',
    ],
    haftarah: 'I Kings 2:1-2:12',
    mishnayot: [
      'Mishnah Berakhot 8',
      'Mishnah Berakhot 9',
      'Mishnah Peah 1',
      'Mishnah Peah 2',
      'Mishnah Peah 3',
      'Mishnah Peah 4',
      'Mishnah Peah 5',
    ],
    zohar: 'Zohar 1:216a',
  },
  {
    name: { en: 'Shemot', he: 'שמות' },
    book: 'Exodus',
    ref: 'Exodus 1:1-6:1',
    aliyot: [
      'Exodus 1:1-1:17',
      'Exodus 1:18-2:10',
      'Exodus 2:11-2:25',
      'Exodus 3:1-3:15',
      'Exodus 3:16-4:17',
      'Exodus 4:18-4:31',
      'Exodus 5:1-6:1',
    ],
    haftarah: 'Isaiah 27:6-28:13',
    mishnayot: [
      'Mishnah Peah 6',
      'Mishnah Peah 7',
      'Mishnah Peah 8',
      'Mishnah Demai 1',
      'Mishnah Demai 2',
      'Mishnah Demai 3',
      'Mishnah Demai 4',
    ],
    zohar: 'Zohar 2:2a',
  },
  {
    name: { en: 'Miketz', he: 'מקץ' },
    book: 'Genesis',
    ref: 'Genesis 41:1-44:17',
    aliyot: [
      'Genesis 41:1-41:14',
      'Genesis 41:15-41:38',
      'Genesis 41:39-41:52',
      'Genesis 41:53-42:18',
      'Genesis 42:19-43:15',
      'Genesis 43:16-43:29',
      'Genesis 43:30-44:17',
    ],
    haftarah: 'I Kings 3:15-4:1',
    mishnayot: [
      'Mishnah Shabbat 1',
      'Mishnah Shabbat 2',
      'Mishnah Shabbat 3',
      'Mishnah Shabbat 4',
      'Mishnah Shabbat 5',
      'Mishnah Shabbat 6',
      'Mishnah Shabbat 7',
    ],
    zohar: 'Zohar 1:193a',
  },
];

// Get current parsha based on date (simplified - in production would use Hebrew calendar)
export function getCurrentParsha(): ParshaData {
  // For now, return Vayigash as the current parsha
  return CURRENT_PARSHIYOT[0];
}

// Get parsha by name
export function getParshaByName(name: string): ParshaData | undefined {
  return CURRENT_PARSHIYOT.find(
    p => p.name.en.toLowerCase() === name.toLowerCase() || p.name.he === name
  );
}
