import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius, PRAYER_ICONS, type PrayerName } from '../constants/theme';

interface PrayerTimeCardProps {
  name: PrayerName;
  adhanTime: string;
  iqamahTime?: string;
  isNext: boolean;
  isPassed: boolean;
}

export function PrayerTimeCard({ name, adhanTime, iqamahTime, isNext, isPassed }: PrayerTimeCardProps) {
  return (
    <View style={[styles.card, isNext && styles.cardActive, isPassed && styles.cardPassed]}>
      <View style={styles.left}>
        <Text style={styles.icon}>{PRAYER_ICONS[name]}</Text>
        <View>
          <Text style={[styles.name, isNext && styles.nameActive, isPassed && styles.namePassed]}>
            {name}
          </Text>
          {iqamahTime && name !== 'Sunrise' && (
            <Text style={[styles.iqamahLabel, isPassed && styles.textPassed]}>
              Iqamah: {iqamahTime}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.time, isNext && styles.timeActive, isPassed && styles.timePassed]}>
          {adhanTime}
        </Text>
        {isNext && (
          <View style={styles.nextBadge}>
            <Text style={styles.nextBadgeText}>NEXT</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardPassed: {
    opacity: 0.5,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  nameActive: {
    color: Colors.textLight,
  },
  namePassed: {
    color: Colors.textMuted,
  },
  iqamahLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  textPassed: {
    color: Colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  timeActive: {
    color: Colors.textLight,
  },
  timePassed: {
    color: Colors.textMuted,
  },
  nextBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: 4,
  },
  nextBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 1,
  },
});
