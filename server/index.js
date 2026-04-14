/**
 * AgriMentor Backend Server
 * Proxies weather and agriculture market APIs with error handling and caching.
 */
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (server runs from server/ — __dirname/.. is root)
import dotenv from 'dotenv';
import { existsSync } from 'fs';
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });
if (!process.env.OPENWEATHERMAP_API_KEY && !process.env.WEATHER_API_KEY && existsSync(envPath)) {
  console.warn('[env] .env exists but OPENWEATHERMAP_API_KEY / WEATHER_API_KEY not loaded — check file format (no quotes around key=value).');
}
if (!process.env.DATA_GOV_IN_API_KEY && existsSync(envPath)) {
  console.warn('[env] DATA_GOV_IN_API_KEY not set — market prices will use demo data until you add a key from data.gov.in');
}

import weatherRoutes from './routes/weather.js';
import marketRoutes from './routes/market.js';
import diseaseRoutes from './routes/disease.js';
import rotationRoutes from './routes/rotation.js';
import pestRoutes from './routes/pest.js';
import learningRoutes from './routes/learning.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/rotation', rotationRoutes);
app.use('/api/scan-pest', pestRoutes);
app.use('/api/learning', learningRoutes);

// 404
app.use((_, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, _, res, __) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`AgriMentor API running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${PORT} is already in use. Stop the other process or set PORT=3002 in .env\n` +
        `Windows: netstat -ano | findstr :${PORT}  then  taskkill /PID <pid> /F\n`
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
