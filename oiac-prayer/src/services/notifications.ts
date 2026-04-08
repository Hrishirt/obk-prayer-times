import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { type PrayerTimesData, parseTimeTo24h, formatTime12h, getIqamahTime } from './prayerTimes';
import { type NotificationSettings, getNotificationSettings } from './storage';
import { type PrayerName } from '../constants/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('prayer-times', {
      name: 'Prayer Times',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5C1A1B',
      sound: 'default',
    });
  }

  return true;
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function getPrayerMessage(prayer: string): string {
  const messages: Record<string, string> = {
    Fajr: 'Time for Fajr prayer. May Allah bless your morning.',
    Sunrise: 'The sun has risen. Time for Ishraq prayer.',
    Dhuhr: 'Time for Dhuhr prayer. Take a moment to connect with Allah.',
    Asr: 'Time for Asr prayer. The afternoon prayer awaits.',
    Maghrib: 'Time for Maghrib prayer. The sun has set.',
    Isha: 'Time for Isha prayer. End your day with remembrance.',
  };
  return messages[prayer] || `Time for ${prayer} prayer.`;
}

export async function scheduleAllPrayerNotifications(
  timings: PrayerTimesData['timings']
): Promise<void> {
  await cancelAllNotifications();

  const settings = await getNotificationSettings();
  if (!settings.enabled) return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const prayers: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const now = new Date();

  for (const prayer of prayers) {
    if (!settings.perPrayer[prayer]) continue;

    const timeStr = timings[prayer];
    if (!timeStr) continue;

    const { hours, minutes } = parseTimeTo24h(timeStr);

    if (settings.minutesBefore > 0) {
      const beforeDate = new Date(now);
      beforeDate.setHours(hours, minutes, 0, 0);
      beforeDate.setMinutes(beforeDate.getMinutes() - settings.minutesBefore);

      if (beforeDate.getTime() > now.getTime()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${prayer} in ${settings.minutesBefore} minutes`,
            body: `${prayer} prayer at OIAC is at ${formatTime12h(timeStr)}. Prepare for salah.`,
            sound: 'default',
            ...(Platform.OS === 'android' && { channelId: 'prayer-times' }),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: beforeDate,
          },
        });
      }
    }

    const atDate = new Date(now);
    atDate.setHours(hours, minutes, 0, 0);

    if (atDate.getTime() > now.getTime()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayer} Prayer Time`,
          body: getPrayerMessage(prayer),
          sound: 'default',
          ...(Platform.OS === 'android' && { channelId: 'prayer-times' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: atDate,
        },
      });
    }

    if (settings.notifyAtIqamah && prayer !== 'Sunrise') {
      const iqamahStr = getIqamahTime(prayer, timeStr);
      if (iqamahStr) {
        const { hours: iqH, minutes: iqM } = parseTimeTo24h(iqamahStr);
        const iqDate = new Date(now);
        iqDate.setHours(iqH, iqM, 0, 0);

        if (iqDate.getTime() > now.getTime()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${prayer} Iqamah at OIAC`,
              body: `Iqamah for ${prayer} is starting now at Omar Ibn Al Khattab Centre.`,
              sound: 'default',
              ...(Platform.OS === 'android' && { channelId: 'prayer-times' }),
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: iqDate,
            },
          });
        }
      }
    }
  }
}
