type Position = {
  symbol: string;
  issuer: string;
  percentage: string;
};

const MANAGER_URL =
  'https://13f.info/manager/0001709323-himalaya-capital-management-llc';
const BASE_URL = 'https://13f.info';

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

  // First 13F filing link on the manager page.
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

export async function fetchLatestPositions(): Promise<Position[]> {
  const dataPath = await fetchDataUrlForLatestFiling();
  const dataUrl = dataPath.startsWith('http')
    ? dataPath
    : `${BASE_URL}${dataPath}`;

  const res = await httpGet(dataUrl);
  const json: any = await res.json();

  // We don't know the exact JSON shape; try to handle common patterns.
  // If json.data is an array of rows where each row is an array,
  // assume [sym, issuer, _, _, _, pct, ...].
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

    // Fallback if rows are objects with keys.
    return {
      symbol: String(row.sym ?? row.symbol ?? '').trim(),
      issuer: String(row.issuer_name ?? row.issuer ?? '').trim(),
      percentage: String(row.pct ?? row.percent ?? row.percentage ?? '').trim(),
    };
  });

  return positions;
}

// Default handler kept for potential serverless usage, not used by local Express server.
export default async function handler(req: any, res: any) {
  try {
    const positions = await fetchLatestPositions();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(positions);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to load Himalaya positions';
    console.error('Failed to load Himalaya positions', err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: message });
  }
}

