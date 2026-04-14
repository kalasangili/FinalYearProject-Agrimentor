/**
 * API client for AgriMentor backend
 * In dev, Vite proxies /api to the backend. In production, set VITE_API_URL.
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  
  // Prepare headers - only set JSON if not FormData
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Fetch weather by coordinates (lat, lon)
 */
export async function fetchWeatherByCoords(lat, lon) {
  return request(`/api/weather?lat=${lat}&lon=${lon}`);
}

/**
 * Fetch weather by location name (e.g. "Berlin", "Mumbai")
 */
export async function fetchWeatherByLocation(location) {
  return request(`/api/weather?location=${encodeURIComponent(location)}`);
}

/**
 * Fetch weather - auto-detect: use lat/lon if available, else location
 */
export async function fetchWeather({ lat, lon, location } = {}) {
  if (lat != null && lon != null) {
    return fetchWeatherByCoords(lat, lon);
  }
  if (location && String(location).trim()) {
    return fetchWeatherByLocation(String(location).trim());
  }
  throw new Error('Provide lat/lon or location');
}

/**
 * Fetch commodity prices (optional crops: array of symbols)
 */
export async function fetchMarketPrices(crops = null) {
  const q = crops?.length ? `?crops=${crops.join(',')}` : '';
  return request(`/api/market${q}`);
}

/**
 * Analyze leaf image for disease detection
 * @param {File|string} imageData - File object or base64 (File preferred for multipart)
 */
export async function analyzeDisease(imageData) {
  if (imageData instanceof File) {
    const formData = new FormData();
    formData.append('image', imageData);
    return request('/api/disease', {
      method: 'POST',
      body: formData,
    });
  }

  // Fallback for base64 (though the backend now prefers multipart)
  return request('/api/disease', {
    method: 'POST',
    body: JSON.stringify({ image: imageData }),
  });
}

/**
 * Analyze scan for pests and diseases (AR Scanner)
 * @param {Blob} imageBlob - Captured frame from camera
 */
export async function scanPest(imageBlob) {
  const formData = new FormData();
  formData.append('file', imageBlob, 'scan.jpg');
  return request('/api/scan-pest', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Get crop rotation recommendations
 * @param {{ soil: string, season: string, history: string }} params
 */
export async function getRotationAdvice({ soil, season, history }) {
  return request('/api/rotation', {
    method: 'POST',
    body: JSON.stringify({ soil, season, history }),
  });
}
