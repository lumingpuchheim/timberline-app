import { writeFile } from 'fs/promises';
import { join } from 'path';

type Position = {
  symbol: string;
  issuer: string;
  percentage: string;
  valueThousands?: number;
};

const MANAGER_URL =
  'https://13f.info/manager/0001709323-himalaya-capital-management-llc';
const BASE_URL = 'https://13f.info';
const LATEST_FILE = join(__dirname, '..', 'data', 'himalaya-latest.json');
const LAST_QUARTER_FILE = join(
  __dirname,
  '..',
  'data',
  'himalaya-last-quarter.json',
);

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

async function fetchFilingPaths(): Promise<string[]> {
  const res = await httpGet(MANAGER_URL);
  const html = await res.text();

  const matches = [...html.matchAll(/href="(\/13f\/[^"]+)"/gi)];
  const paths = matches.map((m) => m[1]);
  if (paths.length === 0) {
    throw new Error('Could not find any 13F filing links on 13f.info');
  }
  return paths;
}

async function fetchDataUrlForFiling(filingPath: string): Promise<string> {
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

async function fetchPositionsFrom13fInfo(
  filingPath: string,
): Promise<{
  positions: Position[];
  totalValueThousands?: number;
}> {
  const dataPath = await fetchDataUrlForFiling(filingPath);
  const dataUrl = dataPath.startsWith('http')
    ? dataPath
    : `${BASE_URL}${dataPath}`;

  const res = await httpGet(dataUrl);
  const json: any = await res.json();

  const rows: any[] = Array.isArray(json?.data) ? json.data : [];

  let totalValueThousands = 0;

  const positions: Position[] = rows.map((row: any) => {
    if (Array.isArray(row)) {
      const sym = String(row[0] ?? '').trim();
      const issuer = String(row[1] ?? '').trim();
      const valueThousandsRaw = Number(String(row[4] ?? '').replace(/,/g, ''));
      const pct = String(row[5] ?? '').trim();

      if (Number.isFinite(valueThousandsRaw)) {
        totalValueThousands += valueThousandsRaw;
      }

      return {
        symbol: sym,
        issuer,
        percentage: pct,
        valueThousands: Number.isFinite(valueThousandsRaw)
          ? valueThousandsRaw
          : undefined,
      };
    }

    return {
      symbol: String(row.sym ?? row.symbol ?? '').trim(),
      issuer: String(row.issuer_name ?? row.issuer ?? '').trim(),
      percentage: String(row.pct ?? row.percent ?? row.percentage ?? '').trim(),
    };
  });

  return { positions, totalValueThousands };
}

async function main() {
  const filingPaths = await fetchFilingPaths();
  const latestPath = filingPaths[0];
  const lastQuarterPath = filingPaths[1];

  const { positions: latestPositions, totalValueThousands: latestTotal } =
    await fetchPositionsFrom13fInfo(latestPath);
  await writeFile(
    LATEST_FILE,
    JSON.stringify(
      { totalValueThousands: latestTotal, positions: latestPositions },
      null,
      2,
    ),
    'utf8',
  );
  console.log(`Saved ${latestPositions.length} positions to ${LATEST_FILE}`);

  if (lastQuarterPath) {
    const {
      positions: lastPositions,
      totalValueThousands: lastTotal,
    } = await fetchPositionsFrom13fInfo(lastQuarterPath);
    await writeFile(
      LAST_QUARTER_FILE,
      JSON.stringify(
        { totalValueThousands: lastTotal, positions: lastPositions },
        null,
        2,
      ),
      'utf8',
    );
    console.log(
      `Saved ${lastPositions.length} positions to ${LAST_QUARTER_FILE}`,
    );
  }
}

main().catch((err) => {
  console.error('Failed to update Himalaya data', err);
  process.exit(1);
});


