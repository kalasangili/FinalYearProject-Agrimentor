/**
 * Weather service - OpenWeatherMap API
 * https://openweathermap.org/api
 * Keys: OPENWEATHERMAP_API_KEY or WEATHER_API_KEY in .env
 */
const OWM_BASE = 'https://api.openweathermap.org';
const RETRY_ATTEMPTS = 2;

/** Map OpenWeatherMap condition ids to descriptions and icons */
const OWM_ICONS = {
  2: { desc: 'Thunderstorm', icon: 'thunderstorm' },
  3: { desc: 'Drizzle', icon: 'drizzle' },
  5: { desc: 'Rain', icon: 'rain' },
  6: { desc: 'Snow', icon: 'snow' },
  7: { desc: 'Atmosphere', icon: 'fog' },
  700: { desc: 'Mist/Haze', icon: 'fog' },
  8: { desc: 'Clear', icon: 'clear' },
  800: { desc: 'Clear sky', icon: 'clear' },
  801: { desc: 'Few clouds', icon: 'partly-cloudy' },
  802: { desc: 'Scattered clouds', icon: 'partly-cloudy' },
  803: { desc: 'Broken clouds', icon: 'cloudy' },
  804: { desc: 'Overcast', icon: 'cloudy' },
};

function getWeatherInfo(id) {
  if (!id) return { desc: 'Unknown', icon: 'cloudy' };
  return OWM_ICONS[id] || OWM_ICONS[Math.floor(id / 100) * 100] || OWM_ICONS[8] || { desc: 'Unknown', icon: 'cloudy' };
}

/**
 * OpenWeatherMap key — never hardcode; only from process.env (loaded via dotenv in server/index.js)
 */
function getApiKey() {
  const raw = process.env.OPENWEATHERMAP_API_KEY || process.env.WEATHER_API_KEY;
  const key = typeof raw === 'string' ? raw.trim() : '';
  const invalidPlaceholders = ['', 'your-openweathermap-api-key', 'your_key_here', 'REPLACE_ME'];
  if (!key || invalidPlaceholders.includes(key.toLowerCase())) {
    const err = new Error(
      'Weather API key is missing. Set OPENWEATHERMAP_API_KEY (or WEATHER_API_KEY) in .env at the project root and restart the server.'
    );
    err.code = 'MISSING_API_KEY';
    err.statusCode = 503;
    err.hint = 'Get a free key at https://openweathermap.org/api — add OPENWEATHERMAP_API_KEY=your_key to .env';
    throw err;
  }
  return key;
}

/** Map OpenWeatherMap HTTP/body errors to user-facing messages */
function mapOpenWeatherError(status, json) {
  const bodyMsg = json?.message || '';
  if (status === 401) {
    return {
      message: 'Invalid or inactive OpenWeatherMap API key. Check OPENWEATHERMAP_API_KEY in .env (new keys can take up to 2 hours to activate).',
      code: 'INVALID_API_KEY',
      statusCode: 401,
      hint: 'https://openweathermap.org/faq#error401',
    };
  }
  if (status === 429) {
    return {
      message: 'OpenWeatherMap rate limit reached. Try again in a few minutes.',
      code: 'RATE_LIMIT',
      statusCode: 429,
    };
  }
  if (status === 404) {
    return {
      message: bodyMsg || 'OpenWeatherMap endpoint not found.',
      code: 'NOT_FOUND',
      statusCode: 404,
    };
  }
  return {
    message: bodyMsg || `Weather service error (${status})`,
    code: 'WEATHER_API_ERROR',
    statusCode: status >= 500 ? 502 : status,
  };
}

/**
 * OpenWeatherMap returns cod as number 200 OR string "200" (forecast uses string).
 * Treating only non-200 as failure fixes generic "Weather API error".
 */
function isOpenWeatherSuccess(json) {
  if (Array.isArray(json)) return true;
  const cod = json?.cod;
  if (cod === undefined || cod === null) return true;
  return cod === 200 || cod === '200';
}

async function fetchWithRetry(url, retries = RETRY_ATTEMPTS) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const mapped = mapOpenWeatherError(res.status, json);
        const e = new Error(mapped.message);
        e.statusCode = mapped.statusCode;
        e.code = mapped.code;
        e.hint = mapped.hint;
        throw e;
      }
      if (!isOpenWeatherSuccess(json)) {
        const msg = json.message || `Unexpected response (cod: ${json.cod})`;
        throw Object.assign(new Error(msg), { statusCode: 502, code: 'BAD_RESPONSE' });
      }
      return json;
    } catch (err) {
      lastError = err;
      if (err.code === 'INVALID_API_KEY' || err.statusCode === 401) throw err;
      if (err.code === 'LOCATION_NOT_FOUND') throw err;
      if (err.statusCode === 429) throw err;
      if (i < retries) await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

async function geocode(location) {
  const apiKey = getApiKey();
  const url = `${OWM_BASE}/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
  const data = await fetchWithRetry(url);
  if (!Array.isArray(data) || data.length === 0) {
    const err = new Error(`Location not found: "${location}". Try a different city or region.`);
    err.statusCode = 404;
    err.code = 'LOCATION_NOT_FOUND';
    throw err;
  }
  const { lat, lon, name } = data[0];
  return { lat, lon, name: name || location };
}

export async function fetchWeatherByCoords(lat, lon, locationName = null) {
  const apiKey = getApiKey();
  const place = locationName || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;

  const [currentRes, forecastRes] = await Promise.all([
    fetchWithRetry(`${OWM_BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
    fetchWithRetry(`${OWM_BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=40`),
  ]);

  const weather = currentRes.weather?.[0];
  const weatherInfo = getWeatherInfo(weather?.id);
  const main = currentRes.main || {};
  const wind = currentRes.wind || {};
  const rain = currentRes.rain || {};
  const snow = currentRes.snow || {};

  const dailyMap = new Map();
  (forecastRes.list || []).forEach((item) => {
    const date = item.dt_txt?.split(' ')[0] || new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { temps: [], precip: 0, codes: [] });
    }
    const day = dailyMap.get(date);
    day.temps.push(item.main?.temp);
    day.precip += item.rain?.['3h'] || item.snow?.['3h'] || 0;
    day.codes.push(item.weather?.[0]?.id);
  });

  const forecast = Array.from(dailyMap.entries())
    .slice(0, 5)
    .map(([date, day]) => {
      const temps = day.temps.filter((t) => typeof t === 'number' && !isNaN(t));
      const avgTemp = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;
      const code = day.codes[0];
      const info = getWeatherInfo(code);
      return {
        date,
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.round(avgTemp),
        tempMax: temps.length ? Math.round(Math.max(...temps)) : 0,
        tempMin: temps.length ? Math.round(Math.min(...temps)) : 0,
        precipitation: Math.round(day.precip * 10) / 10,
        weatherCode: code,
        description: info.desc,
        icon: info.icon,
      };
    });

  return {
    provider: 'openweathermap',
    location: place,
    updatedAt: new Date().toISOString(),
    current: {
      temperature: Math.round(main.temp ?? 0),
      humidity: main.humidity ?? 0,
      precipitation: rain['1h'] ?? snow['1h'] ?? 0,
      windSpeed: Math.round((wind.speed ?? 0) * 3.6),
      weatherCode: weather?.id,
      description: weatherInfo.desc,
      icon: weatherInfo.icon,
    },
    forecast,
  };
}

export async function fetchWeatherByLocation(location) {
  const { lat, lon, name } = await geocode(location);
  return fetchWeatherByCoords(lat, lon, name);
}
