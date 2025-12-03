import '../load-local-env';
import { kv } from '@vercel/kv';

type StoredToken = {
  token: string;
  platform: 'android' | 'ios' | 'unknown';
  registeredAt: string;
};

const TOKENS_SET_KEY = 'timberline:pushTokens';

// When KV environment variables are not set (local tests), fall back to
// an in-memory store so the API can still be exercised without errors.
const hasKvConfig =
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
const memoryTokens = new Map<string, StoredToken>();

async function listTokens(): Promise<StoredToken[]> {
  if (!hasKvConfig) {
    return Array.from(memoryTokens.values());
  }

  const tokenStrings = (await kv.smembers(TOKENS_SET_KEY)) as string[];

  const tokensRaw = await Promise.all(
    tokenStrings.map((t) =>
      kv.hgetall(`timberline:pushToken:${t}`) as Promise<StoredToken | null>,
    ),
  );

  const tokens = tokensRaw.filter((t): t is StoredToken => !!t && !!t.token);
  return tokens;
}

async function saveToken(record: StoredToken): Promise<void> {
  if (!hasKvConfig) {
    memoryTokens.set(record.token, record);
    return;
  }

  await kv.hset(`timberline:pushToken:${record.token}`, record);
  await kv.sadd(TOKENS_SET_KEY, record.token);
}

async function deleteTokenById(token: string): Promise<void> {
  if (!hasKvConfig) {
    memoryTokens.delete(token);
    return;
  }

  await kv.del(`timberline:pushToken:${token}`);
  await kv.srem(TOKENS_SET_KEY, token);
}

async function clearTokens(): Promise<void> {
  if (!hasKvConfig) {
    memoryTokens.clear();
    return;
  }

  const tokenStrings = (await kv.smembers(TOKENS_SET_KEY)) as string[];

  if (tokenStrings.length > 0) {
    await Promise.all(
      tokenStrings.map((t) => kv.del(`timberline:pushToken:${t}`)),
    );
    await kv.del(TOKENS_SET_KEY);
  }
}

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Admin-Api-Key',
  );
}

function requireAdmin(req: any, res: any): boolean {
  const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

  if (!ADMIN_API_KEY) {
    console.warn('ADMIN_API_KEY is not set; rejecting admin request');
    res.status(500).json({ error: 'Server misconfiguration' });
    return false;
  }

  const headerKey = 'x-admin-api-key';
  const provided = req.headers?.[headerKey];

  if (typeof provided !== 'string' || provided !== ADMIN_API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  return true;
}

export async function addTokenHandler(req: any, res: any) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { token, platform } = req.body ?? {};

    if (typeof token !== 'string' || !token.startsWith('ExponentPushToken[')) {
      res.status(400).json({ error: 'Invalid or missing token' });
      return;
    }

    const platformSafe: StoredToken['platform'] =
      platform === 'android' || platform === 'ios' ? platform : 'unknown';

    const now = new Date().toISOString();

    await saveToken({
      token,
      platform: platformSafe,
      registeredAt: now,
    });

    res.status(204).end();
  } catch (err: any) {
    console.error('Failed to add push token', err);
    res.status(500).json({ error: 'Failed to add push token' });
  }
}

export async function deleteTokenHandler(req: any, res: any) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  const tokenId: string | undefined =
    (req.params && req.params.id) ||
    (typeof req.query?.id === 'string' ? req.query.id : undefined);

  if (!tokenId) {
    res.status(400).json({ error: 'Missing token id' });
    return;
  }

  try {
    await deleteTokenById(tokenId);
    res.status(204).end();
  } catch (err: any) {
    console.error('Failed to delete push token', err);
    res.status(500).json({ error: 'Failed to delete push token' });
  }
}

export async function deleteAllTokensHandler(req: any, res: any) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    await clearTokens();
    res.status(204).end();
  } catch (err: any) {
    console.error('Failed to delete all push tokens', err);
    res.status(500).json({ error: 'Failed to delete all push tokens' });
  }
}

export async function tokensCountHandler(req: any, res: any) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const tokens = await listTokens();
    res.status(200).json({ count: tokens.length });
  } catch (err: any) {
    console.error('Failed to read registered push tokens', err);
    res.status(500).json({ error: 'Failed to read registered push tokens' });
  }
}

export async function tokensListHandler(req: any, res: any) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const tokens = await listTokens();
    res.status(200).json({ tokens });
  } catch (err: any) {
    console.error('Failed to list registered push tokens', err);
    res.status(500).json({ error: 'Failed to list registered push tokens' });
  }
}


