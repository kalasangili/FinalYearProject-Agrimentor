import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  Sun,
  CloudSun,
  CloudRain,
  Droplets,
  Wind,
  CloudDrizzle,
  Cloud,
  CloudFog,
  CloudSnow,
  CloudLightning,
  RefreshCw,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { useWeather } from '../hooks/useWeather';

const ICON_MAP = {
  clear: Sun,
  'partly-cloudy': CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  showers: CloudRain,
  snow: CloudSnow,
  thunderstorm: CloudLightning,
};

const ForecastCard = ({ day, temp, status, icon: iconName }) => {
  const Icon = ICON_MAP[iconName] || CloudSun;
  return (
    <div className="bg-[#e4eed4] p-6 rounded-xl flex flex-col items-center justify-center min-w-[140px] border border-transparent hover:border-green-300 transition-all cursor-default">
      <span className="text-gray-700 font-bold mb-3">{day}</span>
      <Icon className="text-yellow-600 mb-3" size={32} strokeWidth={1.5} />
      <span className="text-2xl font-bold text-gray-900">{temp}°C</span>
      <span className="text-xs text-gray-500 mt-1">{status}</span>
    </div>
  );
};

const Weather = () => {
  const [locationInput, setLocationInput] = useState('');
  const {
    data,
    loading,
    error,
    errorCode,
    errorHint,
    refresh,
    location,
    isRefreshing,
  } = useWeather('New Delhi', true);

  const isConfigError =
    errorCode === 'MISSING_API_KEY' || errorCode === 'INVALID_API_KEY';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (locationInput.trim()) refresh(locationInput.trim());
  };

  return (
    <DashboardLayout>
      <header className="bg-white py-4 px-8 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Weather Forecast</h1>
      </header>

      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {/* Location search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] flex items-center gap-2">
              <MapPin size={20} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search location (e.g. Mumbai, London)"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-800 text-white rounded-lg text-sm font-medium hover:bg-green-900 transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => refresh(locationInput || undefined)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading || isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Updating...' : 'Refresh'}
            </button>
          </form>
        </div>

        {/* Error state */}
        {error && (
          <div
            className={`flex flex-wrap items-start gap-3 p-4 rounded-xl border ${
              isConfigError
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <AlertCircle size={24} className="shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">
                {isConfigError ? 'Weather API setup required' : 'Failed to load weather'}
              </p>
              <p className="text-sm mt-1">{error}</p>
              {errorHint && (
                <p className="text-xs mt-2 opacity-90 break-all">
                  {errorHint.startsWith('http') ? (
                    <a href={errorHint} className="underline" target="_blank" rel="noreferrer">
                      {errorHint}
                    </a>
                  ) : (
                    errorHint
                  )}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => refresh(locationInput || undefined)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${
                isConfigError
                  ? 'bg-amber-100 hover:bg-amber-200'
                  : 'bg-red-100 hover:bg-red-200'
              }`}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && !data && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <RefreshCw className="animate-spin mx-auto mb-4 text-green-600" size={40} />
            <p className="text-gray-500">Fetching weather data...</p>
          </div>
        )}

        {/* Current Weather */}
        {!loading && data && (
          <>
            <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Current Weather in {data.location}
                </h2>
                <p className="text-sm text-gray-400">
                  {isRefreshing ? 'Updating...' : `Updated ${new Date(data.updatedAt).toLocaleTimeString()}`}
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  {(() => {
                    const Icon = ICON_MAP[data.current.icon] || Sun;
                    return (
                      <Icon
                        className="text-yellow-500"
                        size={64}
                        strokeWidth={1.5}
                      />
                    );
                  })()}
                  <div>
                    <div className="text-6xl font-bold text-gray-900">
                      {data.current.temperature}°C
                    </div>
                    <p className="text-gray-500 mt-2">
                      {data.current.description}
                    </p>
                  </div>
                </div>

                <div className="flex gap-12 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-12">
                  <div className="flex items-center gap-3">
                    <Droplets className="text-gray-400" size={24} />
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        Humidity
                      </p>
                      <p className="text-sm text-gray-500">
                        {data.current.humidity}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wind className="text-gray-400" size={24} />
                    <div>
                      <p className="text-xs font-bold text-gray-800">Wind</p>
                      <p className="text-sm text-gray-500">
                        {data.current.windSpeed} km/h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CloudRain className="text-gray-400" size={24} />
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        Precipitation
                      </p>
                      <p className="text-sm text-gray-500">
                        {data.current.precipitation ?? 0} mm
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Forecast */}
            <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                5-Day Forecast
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {data.forecast.map((item) => (
                  <ForecastCard
                    key={item.date}
                    day={item.day}
                    temp={item.temp}
                    status={item.description}
                    icon={item.icon}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Weather;
