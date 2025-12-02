import { readFile } from 'fs/promises';
import { join } from 'path';

type Position = {
  symbol: string;
  issuer: string;
  percentage: string;
  valueThousands?: number;
};

type Snapshot = {
  positions: Position[];
  totalValueThousands?: number;
};

const DATA_FILE = join(__dirname, '..', 'data', 'himalaya-last-quarter.json');

export async function fetchLastQuarterSnapshot(): Promise<Snapshot> {
  const raw = await readFile(DATA_FILE, 'utf8');
  const parsed = JSON.parse(raw) as Snapshot | Position[];

  if (Array.isArray(parsed)) {
    return { positions: parsed };
  }

  if (parsed && Array.isArray(parsed.positions)) {
    return parsed;
  }

  throw new Error('Invalid data format in himalaya-last-quarter.json');
}

export default async function handler(req: any, res: any) {
  try {
    const snapshot = await fetchLastQuarterSnapshot();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(snapshot);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to load Himalaya positions';
    console.error('Failed to load last-quarter Himalaya positions', err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: message });
  }
}


