import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Spacing, BorderRadius, PRAYER_ICONS, type PrayerName } from '../constants/theme';
import { formatCountdown, formatTime12h } from '../services/prayerTimes';

interface NextPrayerCountdownProps {
  prayerName: string;
  prayerTime: string;
  msUntil: number;
}

export function NextPrayerCountdown({ prayerName, prayerTime, msUntil }: NextPrayerCountdownProps) {
  const icon = PRAYER_ICONS[prayerName as PrayerName] || '🕌';

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.topRow}>
        <Text style={styles.label}>Next Prayer</Text>
        <Text style={styles.mosque}>🕌 OIAC</Text>
      </View>

      <View style={styles.centerRow}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.prayerName}>{prayerName}</Text>
        <Text style={styles.prayerTime}>{formatTime12h(prayerTime)}</Text>
      </View>

      <View style={styles.countdownContainer}>
        <Text style={styles.countdownLabel}>Time remaining</Text>
        <Text style={styles.countdown}>{formatCountdown(msUntil)}</Text>
      </View>
    </LinearGradient>
  );
}

export function AllPrayersPassed() {
  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.icon}>🌙</Text>
      <Text style={styles.prayerName}>All prayers completed</Text>
      <Text style={styles.allDoneText}>
        May Allah accept your prayers. See you at Fajr!
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.accentLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  mosque: {
    fontSize: FontSize.sm,
    color: Colors.accentLight,
    fontWeight: '500',
  },
  centerRow: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  prayerName: {
    fontSize: FontSize.hero,
    fontWeight: '800',
    color: Colors.textLight,
    marginBottom: 4,
  },
  prayerTime: {
    fontSize: FontSize.xl,
    color: Colors.accentLight,
    fontWeight: '600',
  },
  countdownContainer: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  countdownLabel: {
    fontSize: FontSize.xs,
    color: Colors.accentLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  countdown: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textLight,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  allDoneText: {
    fontSize: FontSize.md,
    color: Colors.accentLight,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
});
