import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHimalayaLatestPositions } from '@/hooks/use-himalaya-positions';

export default function HomeScreen() {
  const positionsState = useHimalayaLatestPositions();

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

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📈 Why this portfolio
          </ThemedText>
          <ThemedText>
            Timberline mirrors the disclosed holdings of Himalaya Capital Management LLC, run by Li
            Lu, whom Charlie Munger trusted to manage his family&apos;s money. It is a real-money,
            long-term value portfolio, not a theoretical model.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📊 How it tries to make money
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

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🧭 What this means for you
          </ThemedText>
          <ThemedText>
            You see a small, concentrated U.S. stock reference portfolio with very few changes over
            time. The idea is to own a handful of carefully chosen businesses, avoid constant
            handovers, and give yourself room to sit still instead of reacting to market noise.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Latest Himalaya 13F positions
          </ThemedText>
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
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  titleContainer: {
    marginBottom: 16,
  },
  titleText: {
    color: '#1f2937', // deep slate / trustworthy dark
  },
  subtitleText: {
    color: '#4b5563',
  },
  section: {
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
});
