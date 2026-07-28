// ---------------------------------------------------------------------------
// Greek-islands weather: near-term forecast parsing + seasonal climate averages
// ---------------------------------------------------------------------------

export interface DayWeather {
  source: 'forecast' | 'seasonal';
  emoji: string;
  label: string;        // short conditions, e.g. 'Sunny', 'Partly cloudy'
  tempMaxC?: number;
  tempMinC?: number;
  windKmh?: number;     // forecast: max wind speed
  windLabel?: string;   // seasonal: typical wind description
  seaTempC?: number;    // seasonal: average sea temperature
  note?: string;        // seasonal: extra context, e.g. 'Meltemi winds likely'
}

// WMO weather-interpretation codes (as returned by Open-Meteo) → emoji + label.
export function wmoInfo(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: '☀️', label: 'Clear' };
  if (code === 1) return { emoji: '🌤️', label: 'Mainly clear' };
  if (code === 2) return { emoji: '⛅', label: 'Partly cloudy' };
  if (code === 3) return { emoji: '☁️', label: 'Overcast' };
  if (code === 45 || code === 48) return { emoji: '🌫️', label: 'Fog' };
  if (code >= 51 && code <= 57) return { emoji: '🌦️', label: 'Drizzle' };
  if (code >= 61 && code <= 67) return { emoji: '🌧️', label: 'Rain' };
  if (code >= 71 && code <= 77) return { emoji: '❄️', label: 'Snow' };
  if (code >= 80 && code <= 82) return { emoji: '🌦️', label: 'Showers' };
  if (code >= 85 && code <= 86) return { emoji: '🌨️', label: 'Snow showers' };
  if (code >= 95) return { emoji: '⛈️', label: 'Thunderstorm' };
  return { emoji: '🌡️', label: 'Mixed' };
}

// Average Greek-islands (Aegean) conditions by calendar month. A reasonable
// approximation across the cruising grounds when a date is beyond forecast range.
interface SeasonalEntry {
  tempMaxC: number;
  tempMinC: number;
  seaTempC: number;
  windLabel: string;
  emoji: string;
  label: string;
  note?: string;
}

const SEASONAL: SeasonalEntry[] = [
  { tempMaxC: 13, tempMinC: 8,  seaTempC: 16, windLabel: 'Variable, occasionally fresh', emoji: '🌥️', label: 'Cool, changeable' },       // Jan
  { tempMaxC: 14, tempMinC: 8,  seaTempC: 15, windLabel: 'Variable, occasionally fresh', emoji: '🌥️', label: 'Cool, changeable' },       // Feb
  { tempMaxC: 16, tempMinC: 9,  seaTempC: 15, windLabel: 'Light to moderate',            emoji: '🌤️', label: 'Mild spring' },            // Mar
  { tempMaxC: 20, tempMinC: 12, seaTempC: 16, windLabel: 'Light to moderate',            emoji: '🌤️', label: 'Mild, mostly sunny' },     // Apr
  { tempMaxC: 24, tempMinC: 16, seaTempC: 19, windLabel: 'Light to moderate',            emoji: '☀️', label: 'Warm and sunny' },         // May
  { tempMaxC: 29, tempMinC: 20, seaTempC: 23, windLabel: 'Meltemi building',             emoji: '☀️', label: 'Hot and sunny', note: 'Meltemi winds building' }, // Jun
  { tempMaxC: 31, tempMinC: 23, seaTempC: 24, windLabel: 'Meltemi, often fresh–strong',  emoji: '☀️', label: 'Hot and sunny', note: 'Strong Meltemi winds likely' }, // Jul
  { tempMaxC: 31, tempMinC: 23, seaTempC: 25, windLabel: 'Meltemi, often fresh–strong',  emoji: '☀️', label: 'Hot and sunny', note: 'Strong Meltemi winds likely' }, // Aug
  { tempMaxC: 27, tempMinC: 20, seaTempC: 24, windLabel: 'Moderate, easing Meltemi',     emoji: '☀️', label: 'Warm and settled' },       // Sep
  { tempMaxC: 23, tempMinC: 16, seaTempC: 22, windLabel: 'Light to moderate',            emoji: '🌤️', label: 'Mild and pleasant' },      // Oct
  { tempMaxC: 18, tempMinC: 13, seaTempC: 20, windLabel: 'Variable, occasionally fresh', emoji: '🌥️', label: 'Mild, changeable' },       // Nov
  { tempMaxC: 15, tempMinC: 10, seaTempC: 18, windLabel: 'Variable, occasionally fresh', emoji: '🌥️', label: 'Cool, changeable' },       // Dec
];

// Seasonal-average weather for an ISO date's month.
export function seasonalWeather(date: string): DayWeather {
  const month = new Date(date + 'T00:00:00').getMonth();
  const s = SEASONAL[Number.isNaN(month) ? 6 : month];
  return {
    source: 'seasonal',
    emoji: s.emoji,
    label: s.label,
    tempMaxC: s.tempMaxC,
    tempMinC: s.tempMinC,
    seaTempC: s.seaTempC,
    windLabel: s.windLabel,
    note: s.note,
  };
}

// Open-Meteo returns daily forecast up to ~16 days out.
export const FORECAST_HORIZON_DAYS = 15;
