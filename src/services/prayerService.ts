import { Coordinates, CalculationMethod, PrayerTimes, Qibla } from 'adhan';

export interface PrayerTimeInfo {
  name: string;
  time: Date;
  id: string;
}

export function getPrayerTimes(coords: { lat: number; lng: number }, date: Date = new Date()): PrayerTimeInfo[] {
  const coordinates = new Coordinates(coords.lat, coords.lng);
  const params = CalculationMethod.MuslimWorldLeague();
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  return [
    { id: 'fajr', name: 'Фаджр', time: prayerTimes.fajr },
    { id: 'sunrise', name: 'Восход', time: prayerTimes.sunrise },
    { id: 'dhuhr', name: 'Зухр', time: prayerTimes.dhuhr },
    { id: 'asr', name: 'Аср', time: prayerTimes.asr },
    { id: 'maghrib', name: 'Магриб', time: prayerTimes.maghrib },
    { id: 'isha', name: 'Иша', time: prayerTimes.isha },
  ];
}

export function getNextPrayer(prayers: PrayerTimeInfo[]): PrayerTimeInfo | null {
  const now = new Date();
  return prayers.find(p => p.time > now) || null;
}

export function calculateQibla(coords: { lat: number; lng: number }): number {
  const coordinates = new Coordinates(coords.lat, coords.lng);
  return Qibla(coordinates);
}
