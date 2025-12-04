import https from 'https';
import '../api/load-local-env';

type StoredToken = {
  token: string;
  platform: 'android' | 'ios' | 'unknown';
  registeredAt: string;
};

type TokensResponse = {
  tokens: StoredToken[];
};

type ExpoPushMessage = {
  to: string;
  sound?: 'default' | null;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const TOKENS_URL =
  process.env.PUSH_TOKENS_URL ??
  'https://timberline-app-emj2.vercel.app/api/push-tokens';

if (!ADMIN_API_KEY) {
  throw new Error(
    'ADMIN_API_KEY is not set. Make sure it is available in .env.local or the environment.',
  );
}

function httpRequest(options: https.RequestOptions, body?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk: Buffer) => {
        data += chunk.toString();
      });

      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (err: Error) => {
      reject(err);
    });

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

async function fetchAllTokens(): Promise<string[]> {
  const url = new URL(TOKENS_URL);

  const options: https.RequestOptions = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
      'X-Admin-Api-Key': ADMIN_API_KEY as string,
    },
  };

  const responseText = await httpRequest(options);

  let parsed: TokensResponse;
  try {
    parsed = JSON.parse(responseText) as TokensResponse;
  } catch (e) {
    console.error('Failed to parse tokens JSON:', responseText);
    throw e;
  }

  if (!parsed.tokens || parsed.tokens.length === 0) {
    console.log('No tokens found on backend. Nothing to send.');
    return [];
  }

  return parsed.tokens.map((t) => t.token).filter((t) => !!t);
}

async function sendPush(to: string): Promise<void> {
  const message: ExpoPushMessage = {
    to,
    sound: 'default',
    title: 'New Timberline portfolio update',
    body: 'Open Timberline to see what changed.',
    data: { source: 'manual-script', intent: 'portfolio-update' },
  };

  const payload = JSON.stringify(message);

  const options: https.RequestOptions = {
    hostname: 'exp.host',
    path: '/--/api/v2/push/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const responseText = await httpRequest(options, payload);
  //console.log(`Sent to ${to}:`);
  //console.log(responseText);
}

async function main(): Promise<void> {
  try {
    const tokens = await fetchAllTokens();

    if (tokens.length === 0) {
      return;
    }

    console.log(`Sending notifications to ${tokens.length} token(s)...`);

    for (const token of tokens) {
      // eslint-disable-next-line no-await-in-loop
      await sendPush(token);
    }

    console.log('Done sending notifications.');
  } catch (e) {
    console.error('Failed to send portfolio update notifications:', e);
    process.exitCode = 1;
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();


