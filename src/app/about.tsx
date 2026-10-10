import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function AboutScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">About</ThemedText>

      <ThemedText type="subtitle" style={styles.heading}>
        Campus Lost &amp; Found
      </ThemedText>

      <ThemedText style={styles.text}>
        This app helps students report lost items and find items that
        others have found on campus.
      </ThemedText>

      <ThemedText style={styles.text}>
        Report an item, browse the list, and contact the owner or finder
        quickly.
      </ThemedText>

      <ThemedText type="small">Version 1.0.0</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  heading: {
    marginTop: 8,
  },
  text: {
    lineHeight: 22,
  },
});