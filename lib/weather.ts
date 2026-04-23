const WEATHER_CODES_ES: Record<number, string> = {
  0:  'Despejado',
  1:  'Mayormente despejado',
  2:  'Parcialmente nublado',
  3:  'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna leve',
  53: 'Llovizna moderada',
  55: 'Llovizna intensa',
  61: 'Lluvia leve',
  63: 'Lluvia moderada',
  65: 'Lluvia intensa',
  71: 'Nieve leve',
  73: 'Nieve moderada',
  75: 'Nieve intensa',
  80: 'Chubascos leves',
  81: 'Chubascos moderados',
  82: 'Chubascos fuertes',
  95: 'Tormenta eléctrica',
  99: 'Tormenta con granizo',
}

const WEATHER_CODES_EN: Record<number, string> = {
  0:  'Clear sky',
  1:  'Mainly clear',
  2:  'Partly cloudy',
  3:  'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  99: 'Thunderstorm with heavy hail',
}

export async function fetchWeather(lat: number, lon: number, locale: string = 'es-CO') {
  const isCelsius = !['en-US', 'US'].includes(locale)
  const unit = isCelsius ? 'celsius' : 'fahrenheit'
  const unitLabel = isCelsius ? '°C' : '°F'
  const codes = (locale.startsWith('en') || locale === 'US') ? WEATHER_CODES_EN : WEATHER_CODES_ES
  
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('current', [
    'temperature_2m',
    'weather_code',
    'wind_speed_10m',
    'relative_humidity_2m',
    'apparent_temperature',
  ].join(','))
  url.searchParams.set('daily', [
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_probability_max',
    'weather_code',
  ].join(','))
  url.searchParams.set('temperature_unit', unit)
  url.searchParams.set('wind_speed_unit', 'kmh')
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '5')
  
  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 }  // Cache 1 hora
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data')
  }
  
  const data = await response.json()
  
  return {
    current: {
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      condition: codes[data.current.weather_code] ?? 'Variable',
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      code: data.current.weather_code,
      unit: unitLabel,
    },
    forecast: data.daily.time.slice(1, 5).map((date: string, i: number) => ({
      date,
      max: Math.round(data.daily.temperature_2m_max[i + 1]),
      min: Math.round(data.daily.temperature_2m_min[i + 1]),
      precipProb: data.daily.precipitation_probability_max[i + 1],
      code: data.daily.weather_code[i + 1],
    })),
    unit: unitLabel,
  }
}

export function getWeatherIcon(code: number) {
  if (code === 0) return 'Sun'
  if (code <= 2)  return 'CloudSun'
  if (code <= 3)  return 'Cloud'
  if (code <= 48) return 'CloudFog'
  if (code <= 55) return 'CloudDrizzle'
  if (code <= 65) return 'CloudRain'
  if (code <= 75) return 'CloudSnow'
  if (code <= 82) return 'CloudRain'
  return 'Zap'
}
