import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHimalayaLatestPositions } from '@/hooks/use-himalaya-positions';

export default function HomeScreen() {
  const positionsState = useHimalayaLatestPositions();

  const topPositions =
    positionsState.status === 'success'
      ? positionsState.positions.slice(0, 6)
      : [];

  const formatPercentage = (value: string) => {
    const trimmed = value?.toString().trim();
    if (!trimmed) return '';
    return trimmed.endsWith('%') ? trimmed : `${trimmed}%`;
  };

  const formatTotalValue = (thousands?: number) => {
    if (!thousands || !Number.isFinite(thousands)) return '';
    const dollars = thousands * 1000;
    if (dollars >= 1e9) {
      return `$${(dollars / 1e9).toFixed(2)} B`;
    }
    if (dollars >= 1e6) {
      return `$${(dollars / 1e6).toFixed(2)} M`;
    }
    return `$${dollars.toLocaleString()}`;
  };

  const derivePositionValueThousands = (
    p: { percentage: string; valueThousands?: number },
    totalThousands?: number,
  ) => {
    if (p.valueThousands && Number.isFinite(p.valueThousands)) {
      return p.valueThousands;
    }
    const pctNumber = parseFloat(p.percentage.replace('%', '').trim());
    if (!totalThousands || !Number.isFinite(totalThousands) || !Number.isFinite(pctNumber)) {
      return undefined;
    }
    return (totalThousands * pctNumber) / 100;
  };

  const getPreviousFor = (
    symbol: string,
  ): { percentage: string; valueThousands?: number } | undefined => {
    if (positionsState.status !== 'success') return undefined;
    return positionsState.previousPositions.find((q) => q.symbol === symbol);
  };

  const getRemovedPositions = () => {
    if (positionsState.status !== 'success') return [];
    const currentSymbols = new Set(
      positionsState.positions.map((p) => p.symbol),
    );
    return positionsState.previousPositions.filter(
      (p) => !currentSymbols.has(p.symbol),
    );
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={styles.titleText}>
            Timberline
          </ThemedText>
          <ThemedText style={styles.subtitleText}>
            Invest like Buffett, without the noise.
          </ThemedText>
        </ThemedView>

        <ThemedView style={[styles.section, styles.firstSection]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Why this portfolio
          </ThemedText>
          <ThemedText>
            Timberline mirrors the disclosed holdings of Himalaya Capital Management LLC, run by Li
            Lu, whom Charlie Munger trusted to manage his family&apos;s money. It is a real-money,
            long-term value portfolio, not a theoretical model.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.divider} />

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            How it tries to make money
          </ThemedText>
          <ThemedText>
            • Focus on quality – businesses with strong balance sheets, durable cash flows, and
            rational, honest management.{'\n'}
            • Value discipline – paying sensible prices with a margin of safety instead of chasing
            short-term moves.{'\n'}
            • Long-term compounding – thinking in years and decades, letting a few good companies do
            the heavy lifting.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.divider} />

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            How you can use this as a private investor
          </ThemedText>
          <ThemedText>
            Use Timberline as a simple, stable reference: a short list of businesses that a
            long-term value investor actually owns. You can compare your own ideas to this list,
            borrow from it when you don&apos;t have time to research, and avoid the stress of
            constant trading by checking in only when the portfolio updates each quarter.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.divider} />

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Latest Himalaya 13F positions
          </ThemedText>
          <ThemedText style={styles.asOfText}>
            Latest disclosed holdings based on Himalaya Capital&apos;s quarterly 13F filing.
          </ThemedText>
          {positionsState.status === 'success' &&
            typeof positionsState.totalValueThousands === 'number' && (
              <ThemedText style={styles.totalValueText}>
                Total disclosed value:{' '}
                {formatTotalValue(positionsState.totalValueThousands)}
              </ThemedText>
            )}
          {positionsState.status === 'loading' && (
            <ThemedText>Loading latest positions…</ThemedText>
          )}
          {positionsState.status === 'error' && (
            <ThemedText>
              Unable to load positions right now. Please check your connection and try again later.
            </ThemedText>
          )}
          {positionsState.status === 'success' && (
            <ThemedView style={styles.grid}>
              {topPositions.map((p) => {
                const valueThousands = derivePositionValueThousands(
                  p,
                  positionsState.totalValueThousands,
                );
                const prev = getPreviousFor(p.symbol);
                const prevValueThousands = prev
                  ? derivePositionValueThousands(
                      prev,
                      positionsState.previousTotalValueThousands,
                    )
                  : undefined;
                const pctNow = parseFloat(p.percentage.replace('%', '').trim());
                const pctPrev = prev
                  ? parseFloat(prev.percentage.replace('%', '').trim())
                  : NaN;
                const pctDelta =
                  Number.isFinite(pctNow) && Number.isFinite(pctPrev)
                    ? pctNow - pctPrev
                    : NaN;
                const valueDeltaThousands =
                  typeof valueThousands === 'number' &&
                  typeof prevValueThousands === 'number'
                    ? valueThousands - prevValueThousands
                    : undefined;

                return (
                  <ThemedView key={p.symbol} style={styles.tile}>
                    <ThemedView style={styles.tileHeader}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={styles.symbolText}>
                        {p.symbol}
                      </ThemedText>
                      <ThemedText style={styles.rowValue}>
                        {formatPercentage(p.percentage)}
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.tileSubHeader}>
                      <ThemedText style={styles.issuerText}>{p.issuer}</ThemedText>
                      {typeof valueThousands === 'number' && (
                        <ThemedText style={styles.valueText}>
                          {formatTotalValue(valueThousands)}
                        </ThemedText>
                      )}
                    </ThemedView>
                    {positionsState.status === 'success' && (
                      <>
                        {Number.isFinite(pctDelta) && (
                          <ThemedText style={styles.deltaText}>
                            {pctDelta > 0 ? '+' : ''}
                            {pctDelta.toFixed(1)}% vs. last quarter
                          </ThemedText>
                        )}
                        {typeof valueDeltaThousands === 'number' &&
                          Math.abs(valueDeltaThousands) > 0 && (
                            <ThemedText style={styles.deltaText}>
                              {valueDeltaThousands > 0 ? '+' : '-'}
                              {formatTotalValue(Math.abs(valueDeltaThousands))}
                              {' value vs. last quarter'}
                            </ThemedText>
                          )}
                        {!prev && (
                          <ThemedText style={styles.addedText}>
                            Added this quarter
                          </ThemedText>
                        )}
                      </>
                    )}
                  </ThemedView>
                );
              })}
            </ThemedView>
          )}
        </ThemedView>

        {positionsState.status === 'success' && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Exited positions since last quarter
            </ThemedText>
            {getRemovedPositions().length === 0 && (
              <ThemedText style={styles.asOfText}>
                No positions were fully exited compared to last quarter.
              </ThemedText>
            )}
            {getRemovedPositions().map((p) => {
              const prevValueThousands = derivePositionValueThousands(
                p,
                positionsState.previousTotalValueThousands,
              );
              return (
                <ThemedView key={p.symbol} style={styles.removedRow}>
                  <ThemedText type="defaultSemiBold" style={styles.symbolText}>
                    {p.symbol}
                  </ThemedText>
                  <ThemedText style={styles.issuerText}>{p.issuer}</ThemedText>
                  <ThemedText style={styles.removedDetail}>
                    Was {formatPercentage(p.percentage)}
                    {typeof prevValueThousands === 'number' &&
                      ` (${formatTotalValue(prevValueThousands)} value)`}{' '}
                    – exited this quarter
                  </ThemedText>
                </ThemedView>
              );
            })}
          </ThemedView>
        )}

        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Timberline is a reference portfolio, not personalized investment advice. Always consider
            your own situation before acting.
          </ThemedText>
          <ThemedText style={styles.footerText}>
            Data source: public 13F filings for Himalaya Capital, aggregated via 13f.info.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 20,
  },
  titleContainer: {
    marginBottom: 16,
  },
  titleText: {
    // Warm, timber-like brown for the main title
    color: '#5b3410',
    fontFamily: 'serif',
  },
  subtitleText: {
    color: '#7c4a21',
  },
  section: {
    gap: 8,
    marginBottom: 16,
  },
  firstSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    // Slightly lighter brown for section headings
    color: '#6b3b16',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  asOfText: {
    color: '#6b7280',
    fontSize: 12,
  },
  totalValueText: {
    color: '#374151',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  tile: {
    width: '48%',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    gap: 4,
  },
  symbolText: {
    color: '#111827',
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tileSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowValue: {
    minWidth: 64,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    color: '#14532d',
    marginTop: 2,
  },
  valueText: {
    textAlign: 'right',
    fontSize: 12,
    color: '#374151',
  },
  deltaText: {
    fontSize: 11,
    color: '#4b5563',
  },
  addedText: {
    fontSize: 11,
    color: '#14532d',
  },
  removedRow: {
    marginTop: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  removedDetail: {
    fontSize: 12,
    color: '#4b5563',
  },
  issuerText: {
    fontSize: 12,
    color: '#4b5563',
  },
  footer: {
    marginTop: 12,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
