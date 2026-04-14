/**
 * Maps weather icon names from API to Lucide React icons
 */
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudRainWind,
} from 'lucide-react';

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

export function getWeatherIcon(iconName) {
  return ICON_MAP[iconName] || CloudSun;
}
