# AgriMentor

Agriculture assistant app with real-time weather and market price data. Built with React, Vite, and Node.js.

## Run Locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the backend API** (in one terminal)
   ```bash
   npm run server
   ```

3. **Start the frontend** (in another terminal)
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173)

### Optional: Run both together
```bash
npm run dev:all
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Backend port (default: 3001) |
| `OPENWEATHERMAP_API_KEY` or `WEATHER_API_KEY` | **Yes** (Weather) | Same key; set one in `.env` next to `package.json`. [openweathermap.org](https://openweathermap.org/api). New keys may take ~2 hours to activate. |
| `DATA_GOV_IN_API_KEY` | **Yes** (Market) | Get an API key at [data.gov.in](https://data.gov.in) for AGMARKNET market prices. |
| `DATA_GOV_IN_RESOURCE_ID` | No | Resource ID for market data (default: Variety-wise Daily Market Prices). |
| `PLANT_ID_API_KEY` | **Yes** (Disease) | Get a free key at [admin.kindwise.com](https://admin.kindwise.com/signup) for disease detection. |

Crop rotation uses built-in logic (no API key).

### Weather troubleshooting

- **Weather fails / setup errors** — (1) Set `OPENWEATHERMAP_API_KEY=your_key` in `.env` at the project root (same folder as `package.json`). (2) Restart `npm run server`. (3) New OpenWeatherMap keys can take up to ~2 hours to activate. (4) **401 Invalid API key** — verify the key in your OpenWeatherMap account; the app never embeds keys in source (env only).
- **Port 3001 in use** — Stop the other Node process or set `PORT=3002` in `.env`.

### Market (data.gov.in)

- **Live prices** — Set `DATA_GOV_IN_API_KEY` in `.env` (never commit `.env`). Optional `DATA_GOV_IN_RESOURCE_ID` defaults to Variety-wise Daily Market Prices (`35985678-0d79-46b4-9ed6-6f13308a1d24`). Backend calls `https://api.data.gov.in/resource/{id}?api-key=...`
- **401 / invalid key** — Regenerate or verify the key on [data.gov.in](https://data.gov.in); restart `npm run server` after changes.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather?lat=&lon=` or `?location=CityName` | Current weather and 5-day forecast |
| GET | `/api/market` or `?crops=Wheat,Rice,...` | AGMARKNET prices (INR per quintal) |
| POST | `/api/disease` | Analyze leaf image for disease (body: `{ image: "base64..." }`) |
| POST | `/api/rotation` | Crop rotation advice (body: `{ soil, season, history }`) |

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
