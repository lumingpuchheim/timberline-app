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
const API_URL_LAST_QUARTER =
  'https://timberline-app-emj2.vercel.app/api/himalaya-last-quarter';

async function fetchSnapshot(url: string): Promise<Snapshot> {
  const res = await fetch(url);
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
    throw new Error(`Failed to load positions (${res.status})${details}`);
  }
  const data = await res.json();
  return data as Snapshot;
}

export function useHimalayaLatestPositions(): State {
  const [state, setState] = useState<State>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    Promise.all([
      fetchSnapshot(API_URL),
      fetchSnapshot(API_URL_LAST_QUARTER),
    ])
      .then(([latest, previous]) => {
        if (cancelled) return;
        setState({
          status: 'success',
          positions: latest.positions,
          totalValueThousands: latest.totalValueThousands,
          previousPositions: previous.positions,
          previousTotalValueThousands: previous.totalValueThousands,
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


