import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  NOTIFICATION_SETTINGS: 'oiac_notification_settings',
  CACHED_PRAYER_TIMES: 'oiac_cached_prayer_times',
} as const;

export interface NotificationSettings {
  enabled: boolean;
  minutesBefore: number;
  perPrayer: {
    Fajr: boolean;
    Sunrise: boolean;
    Dhuhr: boolean;
    Asr: boolean;
    Maghrib: boolean;
    Isha: boolean;
  };
  notifyAtIqamah: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  minutesBefore: 20,
  perPrayer: {
    Fajr: true,
    Sunrise: false,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
  notifyAtIqamah: false,
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const json = await AsyncStorage.getItem(KEYS.NOTIFICATION_SETTINGS);
    if (json) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(json) };
    }
  } catch {}
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
}

export interface CachedPrayerTimes {
  date: string;
  timings: Record<string, string>;
  hijriDate: string;
  hijriMonth: string;
  hijriYear: string;
}

export async function getCachedPrayerTimes(): Promise<CachedPrayerTimes | null> {
  try {
    const json = await AsyncStorage.getItem(KEYS.CACHED_PRAYER_TIMES);
    if (json) return JSON.parse(json);
  } catch {}
  return null;
}

export async function cachePrayerTimes(data: CachedPrayerTimes): Promise<void> {
  await AsyncStorage.setItem(KEYS.CACHED_PRAYER_TIMES, JSON.stringify(data));
}
