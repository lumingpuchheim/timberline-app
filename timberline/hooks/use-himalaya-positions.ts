import { useEffect, useState } from 'react';

export type HimalayaPosition = {
  symbol: string;
  issuer: string;
  percentage: string;
};

type State =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; positions: HimalayaPosition[] }
  | { status: 'error'; error: string };

const API_URL =
  'https://timberline-app-emj2.vercel.app/api/himalaya-latest';

async function fetchLatestPositions(): Promise<HimalayaPosition[]> {
  const res = await fetch(API_URL);
  if (!res.ok) {
    let details = '';
    try {
      const body = await res.json();
      if (body && typeof body.error === 'string') {
        details = `: ${body.error}`;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(`Failed to load latest positions (${res.status})${details}`);
  }
  const data = await res.json();
  return data as HimalayaPosition[];
}

export function useHimalayaLatestPositions(): State {
  const [state, setState] = useState<State>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    fetchLatestPositions()
      .then((positions) => {
        if (cancelled) return;
        setState({ status: 'success', positions });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : 'Unknown error loading positions';
        console.error('Failed to load Himalaya positions in app', err);
        setState({ status: 'error', error: message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}


