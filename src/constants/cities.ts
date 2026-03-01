export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
  method: string;
}

export const POPULAR_CITIES: City[] = [
  { name: 'Мекка', country: 'Саудовская Аравия', lat: 21.4225, lng: 39.8262, method: 'UmmAlQura' },
  { name: 'Медина', country: 'Саудовская Аравия', lat: 24.4672, lng: 39.6111, method: 'UmmAlQura' },
  { name: 'Москва', country: 'Россия', lat: 55.7558, lng: 37.6173, method: 'Turkey' },
  { name: 'Казань', country: 'Россия', lat: 55.7887, lng: 49.1221, method: 'Turkey' },
  { name: 'Грозный', country: 'Россия', lat: 43.3177, lng: 45.6982, method: 'Turkey' },
  { name: 'Махачкала', country: 'Россия', lat: 42.9849, lng: 47.5046, method: 'Turkey' },
  { name: 'Ташкент', country: 'Узбекистан', lat: 41.2995, lng: 69.2401, method: 'Turkey' },
  { name: 'Астана', country: 'Казахстан', lat: 51.1605, lng: 71.4704, method: 'Turkey' },
  { name: 'Алматы', country: 'Казахстан', lat: 43.2389, lng: 76.8897, method: 'Turkey' },
  { name: 'Бишкек', country: 'Кыргызстан', lat: 42.8746, lng: 74.5698, method: 'Turkey' },
  { name: 'Душанбе', country: 'Таджикистан', lat: 38.5358, lng: 68.7791, method: 'Turkey' },
  { name: 'Баку', country: 'Азербайджан', lat: 40.4093, lng: 49.8671, method: 'Turkey' },
  { name: 'Стамбул', country: 'Турция', lat: 41.0082, lng: 28.9784, method: 'Turkey' },
  { name: 'Дубай', country: 'ОАЭ', lat: 25.2048, lng: 55.2708, method: 'Dubai' },
  { name: 'Лондон', country: 'Великобритания', lat: 51.5074, lng: -0.1278, method: 'MuslimWorldLeague' },
  { name: 'Нью-Йорк', country: 'США', lat: 40.7128, lng: -74.0060, method: 'NorthAmerica' },
];
