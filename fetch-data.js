import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEFARIA_API_BASE = 'https://www.sefaria.org/api';
const CHOK_COLLECTION_SLUG = 'חק-לישראל';

async function fetchJSON(url) {
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}

async function getCollection(slug) {
  const url = `${SEFARIA_API_BASE}/collections/${encodeURIComponent(slug)}`;
  return fetchJSON(url);
}

async function getSheet(sheetId) {
  const url = `${SEFARIA_API_BASE}/sheets/${sheetId}`;
  return fetchJSON(url);
}

function extractTextFromSource(source) {
  let he = '';
  let en = '';
  if (source.text) {
    if (typeof source.text === 'string') {
      he = source.text;
    } else if (source.text.he) {
      he = Array.isArray(source.text.he) ? source.text.he.flat().join(' ') : source.text.he;
      en = Array.isArray(source.text.en) ? source.text.en.flat().join(' ') : source.text.en || '';
    } else {
      he = source.outsideText || '';
      en = source.outsideBiText?.en || '';
    }
  } else {
    he = source.outsideText || '';
    en = source.outsideBiText?.en || '';
  }
  const comment = source.comment || '';
  const ref = source.ref || '';
  return { he: String(he), en: String(en), comment: String(comment), ref: String(ref) };
}

async function main() {
  try {
    console.log('Fetching Chok LeYisrael collection...');
    const collection = await getCollection(CHOK_COLLECTION_SLUG);
    console.log(`Found ${collection.sheets.length} sheets`);
    console.log('Sheet titles:', collection.sheets.map(s => s.title).slice(0, 10)); // first 10

    const targetParshas = ['ויגש', 'ויחי', 'שמות'];
    const parshaMap = {
      'ויגש': 'Vayigash',
      'ויחי': 'Vayechi',
      'שמות': 'Shemos'
    };
    const relevantSheets = collection.sheets.filter(sheet =>
      targetParshas.some(parsha => sheet.title.includes(parsha))
    );
    console.log(`Found ${relevantSheets.length} relevant sheets`);

    const csvRows = [['Parsha', 'Sheet Title', 'Source Index', 'Ref', 'Hebrew Text', 'English Text', 'Comment']];

    for (const sheet of relevantSheets) {
      console.log(`Fetching sheet: ${sheet.title}`);
      const sheetData = await getSheet(sheet.id);

      const parsha = targetParshas.find(p => sheet.title.includes(p)) || 'Unknown';
      const parshaEnglish = parshaMap[parsha] || parsha;

      sheetData.sources.forEach((source, index) => {
        const { he, en, comment, ref } = extractTextFromSource(source);
        csvRows.push([parshaEnglish, sheet.title, index + 1, ref, he, en, comment]);
      });
    }

    // Write to CSV
    const csvContent = csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const outputPath = path.join(__dirname, 'chok_collection_data.csv');
    fs.writeFileSync(outputPath, csvContent, 'utf8');
    console.log(`Data written to ${outputPath}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();