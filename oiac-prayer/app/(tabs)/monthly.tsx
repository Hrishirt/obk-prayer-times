import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { fetchMonthlyPrayerTimes, formatTime12h, type PrayerTimesData } from '../../src/services/prayerTimes';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MonthlyScreen() {
  const insets = useSafeAreaInsets();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<PrayerTimesData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchMonthlyPrayerTimes(month, year);
      setData(result);
    } catch {
      setData([]);
    }
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    load();
  }, [load]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const todayStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Monthly Timetable</Text>

      <View style={styles.monthNav}>
        <Pressable onPress={prevMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>←</Text>
        </Pressable>
        <Text style={styles.monthTitle}>
          {MONTH_NAMES[month - 1]} {year}
        </Text>
        <Pressable onPress={nextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>→</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          contentContainerStyle={styles.tableWrapper}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Table Header */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeader, styles.colDay]}>Day</Text>
              <Text style={[styles.tableHeader, styles.colTime]}>Fajr</Text>
              <Text style={[styles.tableHeader, styles.colTime]}>Sunrise</Text>
              <Text style={[styles.tableHeader, styles.colTime]}>Dhuhr</Text>
              <Text style={[styles.tableHeader, styles.colTime]}>Asr</Text>
              <Text style={[styles.tableHeader, styles.colTime]}>Maghrib</Text>
              <Text style={[styles.tableHeader, styles.colTime]}>Isha</Text>
            </View>

            {data.map((day, idx) => {
              const isToday = day.date.gregorian.date === todayStr;
              return (
                <View
                  key={idx}
                  style={[styles.tableRow, isToday && styles.tableRowToday, idx % 2 === 0 && styles.tableRowEven]}
                >
                  <Text style={[styles.tableCell, styles.colDay, isToday && styles.tableCellToday]}>
                    {parseInt(day.date.gregorian.day, 10)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colTime, isToday && styles.tableCellToday]}>
                    {formatTime12h(day.timings.Fajr.split(' ')[0])}
                  </Text>
                  <Text style={[styles.tableCell, styles.colTime, isToday && styles.tableCellToday]}>
                    {formatTime12h(day.timings.Sunrise.split(' ')[0])}
                  </Text>
                  <Text style={[styles.tableCell, styles.colTime, isToday && styles.tableCellToday]}>
                    {formatTime12h(day.timings.Dhuhr.split(' ')[0])}
                  </Text>
                  <Text style={[styles.tableCell, styles.colTime, isToday && styles.tableCellToday]}>
                    {formatTime12h(day.timings.Asr.split(' ')[0])}
                  </Text>
                  <Text style={[styles.tableCell, styles.colTime, isToday && styles.tableCellToday]}>
                    {formatTime12h(day.timings.Maghrib.split(' ')[0])}
                  </Text>
                  <Text style={[styles.tableCell, styles.colTime, isToday && styles.tableCellToday]}>
                    {formatTime12h(day.timings.Isha.split(' ')[0])}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: FontSize.xl,
    color: Colors.primary,
    fontWeight: '700',
  },
  monthTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableWrapper: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  tableRowEven: {
    backgroundColor: Colors.surfaceElevated,
  },
  tableRowToday: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },
  tableHeader: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCell: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  tableCellToday: {
    color: Colors.textLight,
    fontWeight: '600',
  },
  colDay: {
    width: 40,
    textAlign: 'center',
  },
  colTime: {
    width: 85,
    textAlign: 'center',
  },
});
