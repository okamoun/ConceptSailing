import { NextRequest, NextResponse } from 'next/server';
import { seasonalWeather, wmoInfo, FORECAST_HORIZON_DAYS, type DayWeather } from '../../../lib/greekWeather';

// Whole days from today (UTC midnight) to the target ISO date.
function daysFromToday(date: string): number {
  const today = new Date();
  const t0 = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const target = new Date(date + 'T00:00:00Z').getTime();
  return Math.round((target - t0) / 86400000);
}

export async function POST(request: NextRequest) {
  const { lat, lng, date } = (await request.json()) as { lat?: number; lng?: number; date?: string };

  if (!date) {
    return NextResponse.json({ error: 'Missing date' }, { status: 400 });
  }

  const diff = daysFromToday(date);
  const canForecast = typeof lat === 'number' && typeof lng === 'number' && diff >= 0 && diff <= FORECAST_HORIZON_DAYS;

  // Beyond the forecast window (or without coordinates) → seasonal average.
  if (!canForecast) {
    return NextResponse.json({ weather: seasonalWeather(date) });
  }

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max` +
      `&wind_speed_unit=kmh&timezone=auto&start_date=${date}&end_date=${date}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`forecast ${res.status}`);
    const data = (await res.json()) as {
      daily?: {
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        weather_code?: number[];
        wind_speed_10m_max?: number[];
      };
    };
    const d = data.daily;
    const code = d?.weather_code?.[0];
    if (!d || typeof code !== 'number') throw new Error('no daily data');

    const info = wmoInfo(code);
    const weather: DayWeather = {
      source: 'forecast',
      emoji: info.emoji,
      label: info.label,
      tempMaxC: typeof d.temperature_2m_max?.[0] === 'number' ? Math.round(d.temperature_2m_max[0]) : undefined,
      tempMinC: typeof d.temperature_2m_min?.[0] === 'number' ? Math.round(d.temperature_2m_min[0]) : undefined,
      windKmh: typeof d.wind_speed_10m_max?.[0] === 'number' ? Math.round(d.wind_speed_10m_max[0]) : undefined,
    };
    return NextResponse.json({ weather });
  } catch {
    // Any forecast failure falls back to the seasonal average — never an error.
    return NextResponse.json({ weather: seasonalWeather(date) });
  }
}
