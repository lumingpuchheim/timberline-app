import express from 'express';
import { fetchLatestPositions } from './himalaya-latest';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.get('/himalaya-latest', async (_req: any, res: any) => {
  try {
    const positions = await fetchLatestPositions();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(positions);
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


