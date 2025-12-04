import https from 'https';

// Replace this with the latest token from your backend when needed.
const expoPushToken =
  'ExponentPushToken[UE2mLnFC_ZpOC62UXhSM_K]';

type ExpoPushMessage = {
  to: string;
  sound?: 'default' | null;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

const message: ExpoPushMessage = {
  to: expoPushToken,
  sound: 'default',
  title: 'New Timberline portfolio update',
  body: 'Li Lu has filed a new 13F. Open Timberline to see what changed.',
  data: { source: 'serious-test', intent: 'portfolio-update' },
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

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk: Buffer) => {
    data += chunk.toString();
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (err: Error) => {
  console.error('Error sending push:', err);
});

req.write(payload);
req.end();


