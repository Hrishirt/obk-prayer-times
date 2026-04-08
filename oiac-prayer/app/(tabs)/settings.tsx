import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  PRAYER_NAMES,
  PRAYER_ICONS,
  type PrayerName,
} from '../../src/constants/theme';
import {
  type NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  getNotificationSettings,
  saveNotificationSettings,
} from '../../src/services/storage';
import { requestNotificationPermissions } from '../../src/services/notifications';
import { fetchPrayerTimes } from '../../src/services/prayerTimes';
import { scheduleAllPrayerNotifications } from '../../src/services/notifications';

const MINUTES_OPTIONS = [0, 5, 10, 15, 20, 30, 45, 60];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getNotificationSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  const updateSettings = useCallback(
    async (updates: Partial<NotificationSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await saveNotificationSettings(newSettings);

      try {
        const data = await fetchPrayerTimes();
        await scheduleAllPrayerNotifications(data.timings);
      } catch {}
    },
    [settings]
  );

  const togglePrayer = useCallback(
    (prayer: PrayerName) => {
      updateSettings({
        perPrayer: {
          ...settings.perPrayer,
          [prayer]: !settings.perPrayer[prayer],
        },
      });
    },
    [settings, updateSettings]
  );

  const handleEnableNotifications = useCallback(async () => {
    if (!settings.enabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive prayer time alerts.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }
    updateSettings({ enabled: !settings.enabled });
  }, [settings, updateSettings]);

  if (!loaded) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Notification Preferences</Text>

        {/* Master Toggle */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🔔</Text>
              <View>
                <Text style={styles.rowTitle}>Prayer Notifications</Text>
                <Text style={styles.rowDescription}>Receive alerts for prayer times</Text>
              </View>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleEnableNotifications}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={settings.enabled ? Colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Minutes Before */}
        {settings.enabled && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Notify Before Prayer</Text>
              <Text style={styles.cardDescription}>
                Get a reminder before each prayer time
              </Text>
              <View style={styles.minutesGrid}>
                {MINUTES_OPTIONS.map((mins) => (
                  <Pressable
                    key={mins}
                    style={[
                      styles.minuteChip,
                      settings.minutesBefore === mins && styles.minuteChipActive,
                    ]}
                    onPress={() => updateSettings({ minutesBefore: mins })}
                  >
                    <Text
                      style={[
                        styles.minuteChipText,
                        settings.minutesBefore === mins && styles.minuteChipTextActive,
                      ]}
                    >
                      {mins === 0 ? 'Off' : `${mins} min`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Per-Prayer Toggles */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Individual Prayers</Text>
              <Text style={styles.cardDescription}>
                Choose which prayers to be notified about
              </Text>
              {PRAYER_NAMES.map((prayer) => (
                <View key={prayer} style={styles.prayerRow}>
                  <View style={styles.prayerRowLeft}>
                    <Text style={styles.prayerIcon}>{PRAYER_ICONS[prayer]}</Text>
                    <Text style={styles.prayerName}>{prayer}</Text>
                  </View>
                  <Switch
                    value={settings.perPrayer[prayer]}
                    onValueChange={() => togglePrayer(prayer)}
                    trackColor={{ false: Colors.border, true: Colors.accent }}
                    thumbColor={settings.perPrayer[prayer] ? Colors.primary : '#f4f3f4'}
                  />
                </View>
              ))}
            </View>

            {/* Iqamah Notification */}
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowIcon}>🕌</Text>
                  <View>
                    <Text style={styles.rowTitle}>Iqamah Notification</Text>
                    <Text style={styles.rowDescription}>
                      Also notify at OIAC's iqamah time
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.notifyAtIqamah}
                  onValueChange={(val) => updateSettings({ notifyAtIqamah: val })}
                  trackColor={{ false: Colors.border, true: Colors.accent }}
                  thumbColor={settings.notifyAtIqamah ? Colors.primary : '#f4f3f4'}
                />
              </View>
            </View>
          </>
        )}

        {/* Info Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Masjid</Text>
            <Text style={styles.infoValue}>Omar Ibn Al Khattab Centre</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>Edmonton, AB</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Calculation</Text>
            <Text style={styles.infoValue}>Muslim World League</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Pressable onPress={() => Linking.openURL('tel:5878823202')}>
              <Text style={[styles.infoValue, styles.link]}>(587) 882-3202</Text>
            </Pressable>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Website</Text>
            <Pressable onPress={() => Linking.openURL('https://www.oiacedmonton.ca')}>
              <Text style={[styles.infoValue, styles.link]}>oiacedmonton.ca</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.footer}>
          Prayer times powered by Aladhan API{'\n'}
          Muslim World League calculation method
        </Text>

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
  title: {
    fontSize: FontSize.hero,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  rowIcon: {
    fontSize: 28,
  },
  rowTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  rowDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  minutesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  minuteChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  minuteChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  minuteChipText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  minuteChipTextActive: {
    color: Colors.textLight,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  prayerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  prayerIcon: {
    fontSize: 22,
  },
  prayerName: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.text,
  },
  link: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  footer: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
    lineHeight: 18,
    paddingHorizontal: Spacing.lg,
  },
});
