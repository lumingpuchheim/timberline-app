import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHimalayaLatestPositions } from '@/hooks/use-himalaya-positions';

export default function HomeScreen() {
  const positionsState = useHimalayaLatestPositions();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Timberline</ThemedText>
        <ThemedText>Invest like Buffett, without the noise.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">📈 Investment approach</ThemedText>
        <ThemedText>
          Data-driven value investing focused on business quality, long-term growth, and sensible
          prices. Timberline mirrors the disclosed holdings of Himalaya Capital Management LLC (Li
          Lu) and applies classic Buffett-style value investing principles.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">📊 Key philosophy</ThemedText>
        <ThemedText>
          • Long-term investment – think in years and decades, not days.{'\n'}
          • Outstanding growth – strong, durable businesses with room to compound.{'\n'}
          • Value investing – focus on intrinsic value and a margin of safety instead of chasing
          short-term market moves.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">🧭 What you see in Timberline</ThemedText>
        <ThemedText>
          A small, concentrated U.S. stock reference portfolio, updated each quarter to match the
          latest Himalaya 13F filing. You see the current holdings and how they changed since the
          last quarter—no trading tools, no charts, and no financial jargon, just a clear reference
          for patient, value-focused investing.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Latest Himalaya 13F positions</ThemedText>
        {positionsState.status === 'loading' && (
          <ThemedText>Loading latest positions…</ThemedText>
        )}
        {positionsState.status === 'error' && (
          <ThemedText>
            Unable to load positions right now. Please check your connection and try again later.
          </ThemedText>
        )}
        {positionsState.status === 'success' &&
          positionsState.positions.map((p) => (
            <ThemedView key={p.symbol} style={styles.row}>
              <ThemedText type="defaultSemiBold">
                {p.symbol} – {p.issuer}
              </ThemedText>
              <ThemedText>{p.percentage}</ThemedText>
            </ThemedView>
          ))}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 16,
  },
  section: {
    gap: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
});
