import { OIAC_LOCATION } from '../constants/theme';
import { cachePrayerTimes, getCachedPrayerTimes, type CachedPrayerTimes } from './storage';

const ALADHAN_BASE = 'https://api.aladhan.com/v1';
const METHOD = 3; // Muslim World League (Fajr 18°, Isha 17°) — matches OIAC

export interface PrayerTimesData {
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    Sunset: string;
    Imsak: string;
    Midnight: string;
  };
  date: {
    readable: string;
    gregorian: {
      date: string;
      day: string;
      month: { number: number; en: string };
      year: string;
      weekday: { en: string };
    };
    hijri: {
      date: string;
      day: string;
      month: { number: number; en: string; ar: string };
      year: string;
      weekday: { en: string; ar: string };
    };
  };
}

export interface IqamahTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Jummah1: string;
  Jummah2: string;
}

export const OIAC_IQAMAH_TIMES: IqamahTimes = {
  Fajr: '06:15 AM',
  Dhuhr: '02:00 PM',
  Asr: '06:15 PM',
  Maghrib: '+5',
  Isha: '+5',
  Jummah1: '02:00 PM',
  Jummah2: '03:00 PM',
};

function getTodayDateString(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export async function fetchPrayerTimes(dateStr?: string): Promise<PrayerTimesData> {
  const date = dateStr || getTodayDateString();
  const { latitude, longitude } = OIAC_LOCATION;

  const cached = await getCachedPrayerTimes();
  if (cached && cached.date === date) {
    return {
      timings: cached.timings as PrayerTimesData['timings'],
      date: {
        readable: date,
        gregorian: {
          date,
          day: date.split('-')[0],
          month: { number: parseInt(date.split('-')[1]), en: '' },
          year: date.split('-')[2],
          weekday: { en: '' },
        },
        hijri: {
          date: '',
          day: '',
          month: { number: 0, en: cached.hijriMonth, ar: '' },
          year: cached.hijriYear,
          weekday: { en: '', ar: '' },
        },
      },
    };
  }

  const url = `${ALADHAN_BASE}/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=${METHOD}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch prayer times: ${response.status}`);
  }

  const json = await response.json();
  const data: PrayerTimesData = json.data;

  await cachePrayerTimes({
    date,
    timings: data.timings,
    hijriDate: data.date.hijri.date,
    hijriMonth: data.date.hijri.month.en,
    hijriYear: data.date.hijri.year,
  });

  return data;
}

export function formatTime12h(time24: string): string {
  const [hourStr, minuteStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute} ${ampm}`;
}

export function getIqamahTime(prayer: string, adhanTime: string): string {
  const iqamah = OIAC_IQAMAH_TIMES[prayer as keyof IqamahTimes];
  if (!iqamah) return '';

  if (iqamah.startsWith('+')) {
    const offsetMinutes = parseInt(iqamah.substring(1), 10);
    const [hourStr, minuteStr] = adhanTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hourStr, 10), parseInt(minuteStr, 10), 0, 0);
    date.setMinutes(date.getMinutes() + offsetMinutes);
    const h = date.getHours();
    const m = String(date.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${m} ${ampm}`;
  }

  return iqamah;
}

export function parseTimeTo24h(timeStr: string): { hours: number; minutes: number } {
  const clean = timeStr.trim().toUpperCase();
  const hasAMPM = clean.includes('AM') || clean.includes('PM');

  if (hasAMPM) {
    const isPM = clean.includes('PM');
    const timePart = clean.replace(/(AM|PM)/i, '').trim();
    const [h, m] = timePart.split(':').map(Number);
    let hours = h;
    if (isPM && h !== 12) hours += 12;
    if (!isPM && h === 12) hours = 0;
    return { hours, minutes: m };
  }

  const [h, m] = clean.split(':').map(Number);
  return { hours: h, minutes: m };
}

export function getNextPrayer(timings: PrayerTimesData['timings']): {
  name: string;
  time: string;
  msUntil: number;
} | null {
  const now = new Date();
  const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

  for (const prayer of prayers) {
    const timeStr = timings[prayer];
    if (!timeStr) continue;
    const { hours, minutes } = parseTimeTo24h(timeStr);
    const prayerDate = new Date(now);
    prayerDate.setHours(hours, minutes, 0, 0);
    const diff = prayerDate.getTime() - now.getTime();
    if (diff > 0) {
      return { name: prayer, time: timeStr, msUntil: diff };
    }
  }

  return null;
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

export async function fetchMonthlyPrayerTimes(
  month: number,
  year: number
): Promise<PrayerTimesData[]> {
  const { latitude, longitude } = OIAC_LOCATION;
  const url = `${ALADHAN_BASE}/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${METHOD}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch monthly times: ${response.status}`);
  const json = await response.json();
  return json.data;
}
