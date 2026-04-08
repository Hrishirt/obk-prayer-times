export const Colors = {
  primary: '#5C1A1B',
  primaryDark: '#3D1112',
  primaryLight: '#7A2E2F',
  accent: '#C9A96E',
  accentLight: '#E0CC9D',
  background: '#FAF7F2',
  surface: '#FFFFFF',
  surfaceElevated: '#FFF8F0',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textLight: '#FFFFFF',
  textMuted: '#9B9B9B',
  border: '#E8E0D5',
  success: '#2E7D32',
  warning: '#F57C00',
  divider: '#F0EBE3',
  cardShadow: 'rgba(92, 26, 27, 0.08)',
  overlay: 'rgba(61, 17, 18, 0.5)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  hero: 34,
};

export const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
export type PrayerName = (typeof PRAYER_NAMES)[number];

export const PRAYER_ICONS: Record<PrayerName, string> = {
  Fajr: '🌙',
  Sunrise: '🌅',
  Dhuhr: '☀️',
  Asr: '🌤️',
  Maghrib: '🌇',
  Isha: '🌃',
};

export const OIAC_LOCATION = {
  latitude: 53.4298,
  longitude: -113.5005,
  city: 'Edmonton',
  country: 'Canada',
  timezone: 'America/Edmonton',
  address: '110 - 1011 Parsons Rd SW, Edmonton, AB T6X 0X2',
};
