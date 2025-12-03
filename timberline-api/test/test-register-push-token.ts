import '../api/load-local-env';
import express from 'express';
import {
  addTokenHandler,
  deleteAllTokensHandler,
  deleteTokenHandler,
  tokensCountHandler,
  tokensListHandler,
} from '../api/push-tokens';

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}`;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

async function runClientTests() {
  // Helper to pretty-print responses (for non-GET calls where we don't parse JSON)
  async function logResponse(label: string, res: Response) {
    const text = await res.text();
    console.log(`\n=== ${label} (${res.status}) ===`);
    console.log(text || '<empty>');
  }

  async function getCount(label: string, withAuth: boolean): Promise<number> {
    const res = await fetch(`${BASE_URL}/api/tokens/count`, {
      method: 'GET',
      headers: withAuth ? { 'X-Admin-Api-Key': ADMIN_API_KEY } : undefined,
    });

    const text = await res.text();
    console.log(`\n=== ${label} (${res.status}) ===`);
    console.log(text || '<empty>');

    try {
      const json = JSON.parse(text);
      return typeof json.count === 'number' ? json.count : NaN;
    } catch {
      return NaN;
    }
  }

  async function getTokens(
    label: string,
    withAuth: boolean,
  ): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/api/tokens`, {
      method: 'GET',
      headers: withAuth ? { 'X-Admin-Api-Key': ADMIN_API_KEY } : undefined,
    });

    const text = await res.text();
    console.log(`\n=== ${label} (${res.status}) ===`);
    console.log(text || '<empty>');

    try {
      const json = JSON.parse(text);
      return Array.isArray(json.tokens) ? json.tokens : [];
    } catch {
      return [];
    }
  }

  console.log('DELETE all tokens (initial cleanup)…');
  let res = await fetch(`${BASE_URL}/api/tokens/all`, {
    method: 'DELETE',
    headers: { 'X-Admin-Api-Key': ADMIN_API_KEY },
  });
  await logResponse('DELETE (initial)', res);

  // Scenario 0: GET /tokens/count without admin key should be unauthorized.
  console.log('\nScenario 0: GET count without admin key should fail');
  res = await fetch(`${BASE_URL}/api/tokens/count`, { method: 'GET' });
  await logResponse('GET count without auth', res);
  if (res.status === 401) {
    console.log('✅ Scenario 0 passed');
  } else {
    console.error('❌ Scenario 0 failed: expected 401 without admin key');
  }

  // Scenario 1: add a single token and verify count is 1.
  const tokenA = 'ExponentPushToken[TEST-1234567890]';
  console.log('\nScenario 1: add single token and verify count is 1');
  res = await fetch(`${BASE_URL}/api/add-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: tokenA,
      platform: 'android',
    }),
  });
  await logResponse('POST tokenA', res);

  let count = await getCount('GET count after POST tokenA', true);
  if (count === 1) {
    console.log('✅ Scenario 1 passed');
  } else {
    console.error(`❌ Scenario 1 failed: expected count 1, got ${count}`);
  }

  // Scenario 2: add a second token and verify count is 2.
  const tokenB = 'ExponentPushToken[TEST-SECOND]';
  console.log('\nScenario 2: add second token and verify count is 2');
  res = await fetch(`${BASE_URL}/api/add-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: tokenB,
      platform: 'ios',
    }),
  });
  await logResponse('POST tokenB', res);

  count = await getCount('GET count after POST tokenB', true);
  if (count === 2) {
    console.log('✅ Scenario 2 passed');
  } else {
    console.error(`❌ Scenario 2 failed: expected count 2, got ${count}`);
  }

  // Scenario 2b: verify that the exact tokens are stored.
  const tokens = await getTokens('GET tokens after adding A and B', true);
  const tokenStrings = tokens.map((t) => t.token).sort();
  const expected = [tokenA, tokenB].sort();
  if (
    tokenStrings.length === expected.length &&
    tokenStrings.every((t, i) => t === expected[i])
  ) {
    console.log('✅ Scenario 2b passed (tokens list matches exactly)');
  } else {
    console.error(
      `❌ Scenario 2b failed: expected tokens ${JSON.stringify(
        expected,
      )}, got ${JSON.stringify(tokenStrings)}`,
    );
  }

  // Scenario 3: delete a single token and verify count is decremented.
  console.log('\nScenario 3: delete tokenA and verify count is 1');
  res = await fetch(`${BASE_URL}/api/token/${encodeURIComponent(tokenA)}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Api-Key': ADMIN_API_KEY },
  });
  await logResponse('DELETE tokenA', res);

  count = await getCount('GET count after deleting tokenA', true);
  if (count === 1) {
    console.log('✅ Scenario 3 passed');
  } else {
    console.error(`❌ Scenario 3 failed: expected count 1, got ${count}`);
  }

  // Scenario 4: delete all tokens and verify count is 0.
  console.log('\nScenario 4: delete all tokens and verify count is 0');
  res = await fetch(`${BASE_URL}/api/tokens/all`, {
    method: 'DELETE',
    headers: { 'X-Admin-Api-Key': ADMIN_API_KEY },
  });
  await logResponse('DELETE all', res);

  count = await getCount('GET count after DELETE all', true);
  if (count === 0) {
    console.log('✅ Scenario 4 passed');
  } else {
    console.error(`❌ Scenario 4 failed: expected count 0, got ${count}`);
  }
}

async function main() {
  // Ensure the same mechanism for admin auth locally as on Vercel.
  process.env.ADMIN_API_KEY = ADMIN_API_KEY;

  const app = express();
  app.use(express.json());

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

  const server = app.listen(PORT, async () => {
    console.log(`Test server listening on http://localhost:${PORT}`);

    try {
      await runClientTests();
    } finally {
      server.close(() => {
        console.log('Test server stopped.');
      });
    }
  });
}

// Node 18+ has global fetch; if not, this will fail at runtime.
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();