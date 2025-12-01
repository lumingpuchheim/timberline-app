type Position = {
  symbol: string;
  issuer: string;
  percentage: string;
};

const MANAGER_URL =
  'https://13f.info/manager/0001709323-himalaya-capital-management-llc';

async function fetchLatestFilingUrl(): Promise<string> {
  const res = await fetch(MANAGER_URL);
  if (!res.ok) {
    throw new Error(`Failed to load manager page (${res.status})`);
  }
  const html = await res.text();

  // Pick the first 13F filing link from the manager page
  const match = html.match(/href="(\/13f\/[^"]+)"/i);
  if (!match) {
    throw new Error('Could not find latest 13F filing link');
  }

  const path = match[1];
  return new URL(path, MANAGER_URL).toString();
}

function parseHoldingsFromHtml(html: string): Position[] {
  // Very simple parser: first table that looks like holdings
  const tableMatch = html.match(/<table[\s\S]*?<\/table>/i);
  if (!tableMatch) {
    throw new Error('Could not find holdings table');
  }

  const tableHtml = tableMatch[0];
  const rows = tableHtml.split(/<tr[\s\S]*?>/i).slice(1);
  if (rows.length === 0) {
    throw new Error('Holdings table has no rows');
  }

  // Header row
  const headerCells = rows[0].split(/<t[hd][\s\S]*?>/i).slice(1);
  const headers = headerCells.map((cell) =>
    cell
      .replace(/<\/t[hd]>.*/i, '')
      .replace(/<[^>]+>/g, '')
      .trim()
      .toLowerCase(),
  );

  const symbolIndex = headers.findIndex((h) => h.includes('symbol'));
  const issuerIndex =
    headers.findIndex((h) => h.includes('issuer')) !== -1
      ? headers.findIndex((h) => h.includes('issuer'))
      : headers.findIndex((h) => h.includes('company'));
  const percentIndex = headers.findIndex(
    (h) => h.includes('%') || h.includes('percent'),
  );

  if (symbolIndex === -1 || issuerIndex === -1 || percentIndex === -1) {
    throw new Error('Could not locate Symbol/Issuer/Percent columns');
  }

  const positions: Position[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const cells = row.split(/<t[hd][\s\S]*?>/i).slice(1);
    if (cells.length === 0) continue;

    const extractText = (cell: string) =>
      cell
        .replace(/<\/t[hd]>.*/i, '')
        .replace(/<[^>]+>/g, '')
        .trim();

    const symbol = extractText(cells[symbolIndex] ?? '');
    const issuer = extractText(cells[issuerIndex] ?? '');
    const percentage = extractText(cells[percentIndex] ?? '');

    if (!symbol) continue;

    positions.push({ symbol, issuer, percentage });
  }

  return positions;
}

async function fetchLatestPositions(): Promise<Position[]> {
  const filingUrl = await fetchLatestFilingUrl();
  const res = await fetch(filingUrl);
  if (!res.ok) {
    throw new Error(`Failed to load latest filing (${res.status})`);
  }
  const html = await res.text();
  return parseHoldingsFromHtml(html);
}

// Use untyped request/response to avoid needing @vercel/node types locally.
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


