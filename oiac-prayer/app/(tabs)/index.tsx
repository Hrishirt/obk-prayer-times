import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing, BorderRadius, PRAYER_NAMES, type PrayerName } from '../../src/constants/theme';
import { usePrayerTimes } from '../../src/hooks/usePrayerTimes';
import { formatTime12h, getIqamahTime, parseTimeTo24h } from '../../src/services/prayerTimes';
import { PrayerTimeCard } from '../../src/components/PrayerTimeCard';
import { NextPrayerCountdown, AllPrayersPassed } from '../../src/components/NextPrayerCountdown';
import { HijriDate } from '../../src/components/HijriDate';
import { OIAC_LOCATION } from '../../src/constants/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, error, nextPrayer, refresh } = usePrayerTimes();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (loading && !data) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading prayer times...</Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (!data) return null;

  const now = new Date();
  const isFriday = now.getDay() === 5;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Omar Ibn Al Khattab</Text>
          <Text style={styles.headerSubtitle}>Centre</Text>
        </View>

        {/* Hijri Date */}
        <HijriDate
          hijriDate={data.date.hijri.date}
          hijriMonth={data.date.hijri.month.en}
          hijriYear={data.date.hijri.year}
          gregorianReadable={data.date.readable}
        />

        {/* Next Prayer Countdown */}
        {nextPrayer ? (
          <NextPrayerCountdown
            prayerName={nextPrayer.name}
            prayerTime={nextPrayer.time}
            msUntil={nextPrayer.msUntil}
          />
        ) : (
          <AllPrayersPassed />
        )}

        {/* Jummah Banner (Fridays) */}
        {isFriday && (
          <View style={styles.jummahBanner}>
            <Text style={styles.jummahIcon}>🕌</Text>
            <View>
              <Text style={styles.jummahTitle}>Jumu'ah Today</Text>
              <Text style={styles.jummahTimes}>1st: 2:00 PM  •  2nd: 3:00 PM</Text>
            </View>
          </View>
        )}

        {/* Prayer Times List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Prayer Times</Text>
        </View>

        {PRAYER_NAMES.map((prayer) => {
          const timeStr = data.timings[prayer as keyof typeof data.timings];
          if (!timeStr) return null;

          const formatted = formatTime12h(timeStr);
          const iqamah = getIqamahTime(prayer, timeStr);
          const isNext = nextPrayer?.name === prayer;

          const { hours, minutes } = parseTimeTo24h(timeStr);
          const prayerDate = new Date(now);
          prayerDate.setHours(hours, minutes, 0, 0);
          const isPassed = prayerDate.getTime() < now.getTime() && !isNext;

          return (
            <PrayerTimeCard
              key={prayer}
              name={prayer as PrayerName}
              adhanTime={formatted}
              iqamahTime={iqamah}
              isNext={isNext}
              isPassed={isPassed}
            />
          );
        })}

        {/* Location Footer */}
        <Pressable
          style={styles.locationCard}
          onPress={() => Linking.openURL('https://maps.google.com/?q=53.4298,-113.5005')}
        >
          <Text style={styles.locationIcon}>📍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationTitle}>Omar Ibn Al Khattab Centre</Text>
            <Text style={styles.locationAddress}>{OIAC_LOCATION.address}</Text>
          </View>
          <Text style={styles.locationArrow}>→</Text>
        </Pressable>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryText: {
    color: Colors.textLight,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: FontSize.lg,
    fontWeight: '500',
    color: Colors.primaryLight,
    marginTop: 2,
  },
  jummahBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.accent,
    gap: Spacing.md,
  },
  jummahIcon: {
    fontSize: 32,
  },
  jummahTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  jummahTimes: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  locationIcon: {
    fontSize: 24,
  },
  locationTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  locationAddress: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  locationArrow: {
    fontSize: FontSize.xl,
    color: Colors.textMuted,
  },
});
