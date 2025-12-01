import { writeFile } from 'fs/promises';
import { join } from 'path';

type Position = {
  symbol: string;
  issuer: string;
  percentage: string;
};

const MANAGER_URL =
  'https://13f.info/manager/0001709323-himalaya-capital-management-llc';
const BASE_URL = 'https://13f.info';
const DATA_FILE = join(__dirname, '..', 'data', 'himalaya-latest.json');

async function httpGet(url: string): Promise<Response> {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json,text/html,*/*',
    },
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${url}`);
  }
  return res;
}

async function fetchLatestFilingPath(): Promise<string> {
  const res = await httpGet(MANAGER_URL);
  const html = await res.text();

  const match = html.match(/href="(\/13f\/[^"]+)"/i);
  if (!match) {
    throw new Error('Could not find latest 13F filing link on 13f.info');
  }
  return match[1];
}

async function fetchDataUrlForLatestFiling(): Promise<string> {
  const filingPath = await fetchLatestFilingPath();
  const filingUrl = `${BASE_URL}${filingPath}`;

  const res = await httpGet(filingUrl);
  const html = await res.text();

  const tableMatch = html.match(
    /<table[^>]+id="filingAggregated"[^>]*data-url="([^"]+)"/i,
  );
  if (!tableMatch) {
    throw new Error('Could not find data-url for filingAggregated table');
  }

  return tableMatch[1];
}

async function fetchPositionsFrom13fInfo(): Promise<Position[]> {
  const dataPath = await fetchDataUrlForLatestFiling();
  const dataUrl = dataPath.startsWith('http')
    ? dataPath
    : `${BASE_URL}${dataPath}`;

  const res = await httpGet(dataUrl);
  const json: any = await res.json();

  const rows: any[] = Array.isArray(json?.data) ? json.data : [];

  const positions: Position[] = rows.map((row: any) => {
    if (Array.isArray(row)) {
      const sym = String(row[0] ?? '').trim();
      const issuer = String(row[1] ?? '').trim();
      const pct = String(row[5] ?? '').trim();
      return {
        symbol: sym,
        issuer,
        percentage: pct,
      };
    }

    return {
      symbol: String(row.sym ?? row.symbol ?? '').trim(),
      issuer: String(row.issuer_name ?? row.issuer ?? '').trim(),
      percentage: String(row.pct ?? row.percent ?? row.percentage ?? '').trim(),
    };
  });

  return positions;
}

async function main() {
  const positions = await fetchPositionsFrom13fInfo();
  await writeFile(
    DATA_FILE,
    JSON.stringify({ positions }, null, 2),
    'utf8',
  );
  console.log(`Saved ${positions.length} positions to ${DATA_FILE}`);
}

main().catch((err) => {
  console.error('Failed to update Himalaya data', err);
  process.exit(1);
});


