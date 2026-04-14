/**
 * Weather API routes - OpenWeatherMap (OPENWEATHERMAP_API_KEY or WEATHER_API_KEY in .env)
 */
import express from 'express';
import { fetchWeatherByCoords, fetchWeatherByLocation } from '../services/weatherService.js';

const router = express.Router();

/**
 * GET /api/weather?lat=52.52&lon=13.41
 * GET /api/weather?location=Berlin
 * Current weather + 5-day forecast (OpenWeatherMap)
 */
router.get('/', async (req, res) => {
  try {
    const { lat, lon, location } = req.query;

    if (lat != null && lon != null) {
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);
      if (isNaN(latNum) || isNaN(lonNum)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
      }
      const data = await fetchWeatherByCoords(latNum, lonNum);
      return res.json(data);
    }

    if (location && typeof location === 'string' && location.trim()) {
      const data = await fetchWeatherByLocation(location.trim());
      return res.json(data);
    }

    res.status(400).json({
      error: 'Provide either lat & lon or location query parameters',
    });
  } catch (err) {
    console.error('Weather API error:', err.message);
    const status = err.statusCode || 500;
    const body = {
      error: err.message || 'Failed to fetch weather data',
    };
    if (err.code) body.code = err.code;
    if (err.hint) body.hint = err.hint;
    res.status(status).json(body);
  }
});

export default router;
