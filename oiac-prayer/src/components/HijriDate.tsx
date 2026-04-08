import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../constants/theme';

interface HijriDateProps {
  hijriDate: string;
  hijriMonth: string;
  hijriYear: string;
  gregorianReadable: string;
}

export function HijriDate({ hijriDate, hijriMonth, hijriYear, gregorianReadable }: HijriDateProps) {
  const hijriDay = hijriDate ? hijriDate.split('-')[0] : '';

  return (
    <View style={styles.container}>
      <Text style={styles.hijri}>
        {hijriDay} {hijriMonth} {hijriYear} AH
      </Text>
      <Text style={styles.gregorian}>{gregorianReadable}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  hijri: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  gregorian: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
