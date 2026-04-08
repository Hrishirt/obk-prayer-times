# OIAC Prayer - Omar Ibn Al Khattab Centre

Prayer times notification app for [Omar Ibn Al Khattab Centre](https://www.oiacedmonton.ca/) in Edmonton, AB. Will hopefully be an IOS app soon

## Features

- **Live Prayer Times** — Fetched daily from the Aladhan API using the Muslim World League calculation method (matching OIAC's times)
- **Next Prayer Countdown** — Real-time countdown to the upcoming prayer
- **Iqamah Times** — Shows OIAC's congregation times alongside adhan times
- **Prayer Notifications** — Configurable alerts before each prayer
- **Notification Preferences** — Choose to be notified 5, 10, 15, 20, 30, 45, or 60 minutes before prayer
- **Per-Prayer Control** — Enable/disable notifications individually for each prayer
- **Iqamah Notifications** — Optional alerts at OIAC's iqamah times
- **Jumu'ah Banner** — Shows Friday prayer times on Fridays
- **Monthly Timetable** — Browse prayer times for any month
- **Hijri Date** — Displays the Islamic calendar date

## Running the App

```bash
cd oiac-prayer
npm start
```

Then:
- Press `w` for web
- Press `a` for Android (requires emulator or Expo Go)
- Press `i` for iOS (macOS only, or use Expo Go)

### Running on your phone

1. Install [Expo Go](https://expo.dev/go) on your phone
2. Scan the QR code shown in the terminal
3. The app will open in Expo Go

## Tech Stack

- **Expo** (React Native) with TypeScript
- **expo-router** — File-based navigation
- **expo-notifications** — Native scheduled notifications
- **Aladhan API** — Prayer time calculations (Muslim World League method)
- **AsyncStorage** — Persistent settings

## Project Structure

```
oiac-prayer/
├── app/
│   ├── _layout.tsx              # Root layout
│   └── (tabs)/
│       ├── _layout.tsx          # Tab navigation
│       ├── index.tsx            # Prayer times home screen
│       ├── monthly.tsx          # Monthly timetable
│       └── settings.tsx         # Notification settings
├── src/
│   ├── components/
│   │   ├── HijriDate.tsx        # Islamic date display
│   │   ├── NextPrayerCountdown.tsx  # Countdown widget
│   │   └── PrayerTimeCard.tsx   # Individual prayer card
│   ├── constants/
│   │   └── theme.ts             # Colors, spacing, OIAC config
│   ├── hooks/
│   │   └── usePrayerTimes.ts    # Prayer times data hook
│   └── services/
│       ├── notifications.ts     # Notification scheduling
│       ├── prayerTimes.ts       # Aladhan API + time utilities
│       └── storage.ts           # AsyncStorage wrapper
```
