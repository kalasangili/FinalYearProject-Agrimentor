import React from 'react';
import DashboardLayout from "../layouts/DashboardLayout";
import { 
  Sun, 
  CloudSun, 
  CloudRain, 
  Droplets, 
  Wind, 
  CloudDrizzle
} from 'lucide-react';

const ForecastCard = ({ day, temp, status, icon: Icon }) => (
  <div className="bg-[#e4eed4] p-6 rounded-xl flex flex-col items-center justify-center min-w-[140px] border border-transparent hover:border-green-300 transition-all cursor-default">
    <span className="text-gray-700 font-bold mb-3">{day}</span>
    <Icon className="text-yellow-600 mb-3" size={32} strokeWidth={1.5} />
    <span className="text-2xl font-bold text-gray-900">{temp}°C</span>
    <span className="text-xs text-gray-500 mt-1">{status}</span>
  </div>
);

const Weather = () => {
  const forecastData = [
    { day: "Tue", temp: 29, status: "Sunny", icon: Sun },
    { day: "Wed", temp: 31, status: "Mostly Sunny", icon: Sun },
    { day: "Thu", temp: 30, status: "Partly Cloudy", icon: CloudSun },
    { day: "Fri", temp: 27, status: "Chance of Showers", icon: CloudDrizzle },
    { day: "Sat", temp: 26, status: "Rainy", icon: CloudRain },
  ];

  return (
    <DashboardLayout>

      {/* Header */}
      <header className="bg-white py-4 px-8 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Weather Forecast</h1>
      </header>

      <div className="p-8 max-w-6xl mx-auto space-y-6">

        {/* Current Weather */}
        <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Current Weather in Central Valley</h2>
            <p className="text-sm text-gray-400">As of 06:50 AM</p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            
            <div className="flex items-center gap-6">
              <Sun className="text-yellow-500" size={64} strokeWidth={1.5} />
              <div>
                <div className="text-6xl font-bold text-gray-900">28°C</div>
                <p className="text-gray-500 mt-2">Sunny with a light breeze</p>
              </div>
            </div>

            <div className="flex gap-12 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-12">
              <div className="flex items-center gap-3">
                <Droplets className="text-gray-400" size={24} />
                <div>
                  <p className="text-xs font-bold text-gray-800">Humidity</p>
                  <p className="text-sm text-gray-500">45%</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Wind className="text-gray-400" size={24} />
                <div>
                  <p className="text-xs font-bold text-gray-800">Wind</p>
                  <p className="text-sm text-gray-500">12 km/h</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Forecast */}
        <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6">5-Day Forecast</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {forecastData.map((item, index) => (
              <ForecastCard key={index} {...item} />
            ))}
          </div>
        </section>

      </div>

    </DashboardLayout>
  );
};

export default Weather;