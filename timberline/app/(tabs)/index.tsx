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
              {topPositions.map((p) => (
                <ThemedView key={p.symbol} style={styles.tile}>
                  <ThemedText type="defaultSemiBold" style={styles.symbolText}>
                    {p.symbol}
                  </ThemedText>
                  <ThemedText style={styles.issuerText}>{p.issuer}</ThemedText>
                  <ThemedText style={styles.rowValue}>{p.percentage}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </ThemedView>

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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  tile: {
    width: '48%',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    gap: 2,
  },
  symbolText: {
    color: '#111827',
  },
  rowValue: {
    minWidth: 64,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    color: '#14532d',
    marginTop: 2,
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
