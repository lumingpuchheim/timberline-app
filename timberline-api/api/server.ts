import express from 'express';
import { fetchLatestSnapshot } from './himalaya-latest';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.get('/himalaya-latest', async (_req: any, res: any) => {
  try {
    const snapshot = await fetchLatestSnapshot();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(snapshot);
  } catch (err: any) {
    const message =
      err instanceof Error ? err.message : 'Failed to load Himalaya positions';
    console.error('Failed to load Himalaya positions (server)', err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Timberline API listening on http://localhost:${PORT}`);
});


