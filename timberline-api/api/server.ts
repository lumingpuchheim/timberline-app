import express from 'express';
import { fetchLatestSnapshot } from './himalaya-latest';
import {
  addTokenHandler,
  deleteAllTokensHandler,
  deleteTokenHandler,
  tokensCountHandler,
  tokensListHandler,
} from './push-tokens';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(express.json());

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

// Push token management routes (same behavior as on Vercel).
app.post('/api/add-token', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  addTokenHandler(req, res);
});

app.delete('/api/token/:id', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  deleteTokenHandler(req, res);
});

app.delete('/api/tokens/all', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  deleteAllTokensHandler(req, res);
});

app.get('/api/tokens/count', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  tokensCountHandler(req, res);
});

app.get('/api/tokens', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  tokensListHandler(req, res);
});

app.listen(PORT, () => {
  console.log(`Timberline API listening on http://localhost:${PORT}`);
});

