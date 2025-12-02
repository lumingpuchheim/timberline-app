import { useEffect, useState } from 'react';

export type HimalayaPosition = {
  symbol: string;
  issuer: string;
  percentage: string;
  valueThousands?: number;
};

type Snapshot = {
  positions: HimalayaPosition[];
  totalValueThousands?: number;
};

type State =
  | { status: 'idle' | 'loading' }
  | {
      status: 'success';
      positions: HimalayaPosition[];
      totalValueThousands?: number;
      previousPositions: HimalayaPosition[];
      previousTotalValueThousands?: number;
    }
  | { status: 'error'; error: string };

const API_URL =
  'https://timberline-app-emj2.vercel.app/api/himalaya-latest';

const LAST_SNAPSHOT: Snapshot = require('./himalaya-last-quarter.json');

async function fetchLatestPositions(): Promise<Snapshot> {
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
  return data as Snapshot;
}

export function useHimalayaLatestPositions(): State {
  const [state, setState] = useState<State>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    fetchLatestPositions()
      .then((snapshot) => {
        if (cancelled) return;
        setState({
          status: 'success',
          positions: snapshot.positions,
          totalValueThousands: snapshot.totalValueThousands,
          previousPositions: LAST_SNAPSHOT.positions,
          previousTotalValueThousands: LAST_SNAPSHOT.totalValueThousands,
        });
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


