import axios from 'axios';
import { logger } from '../config/logger';

const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
const AGROMONITORING_BASE = 'https://api.agromonitoring.com/agro/1.0';

export const getCurrentWeather = async (lat: number, lon: number) => {
  const { data } = await axios.get(`${OPENWEATHER_BASE}/weather`, {
    params: {
      lat,
      lon,
      appid: process.env.OPENWEATHER_API_KEY,
      units: 'metric',
    },
  });

  return {
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    pressure: data.main.pressure,
    visibility: data.visibility,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    lat: data.coord.lat,
    lon: data.coord.lon,
    city: data.name,
    country: data.sys.country,
    timestamp: data.dt,
  };
};

export const getWeatherForecast = async (lat: number, lon: number) => {
  const { data } = await axios.get(`${OPENWEATHER_BASE}/forecast`, {
    params: {
      lat,
      lon,
      appid: process.env.OPENWEATHER_API_KEY,
      units: 'metric',
      cnt: 40, // 5 days * 8 per day
    },
  });

  // Aggregate daily forecasts
  const dailyMap = new Map<string, any>();
  for (const item of data.list) {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        tempMin: item.main.temp_min,
        tempMax: item.main.temp_max,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        rainChance: Math.round((item.pop || 0) * 100),
      });
    } else {
      const existing = dailyMap.get(date);
      existing.tempMin = Math.min(existing.tempMin, item.main.temp_min);
      existing.tempMax = Math.max(existing.tempMax, item.main.temp_max);
    }
  }

  return Array.from(dailyMap.values()).slice(0, 7);
};

export const getWeatherByCity = async (city: string) => {
  const { data } = await axios.get(`${OPENWEATHER_BASE}/weather`, {
    params: {
      q: `${city},IN`,
      appid: process.env.OPENWEATHER_API_KEY,
      units: 'metric',
    },
  });

  return getCurrentWeather(data.coord.lat, data.coord.lon);
};

export const getSoilData = async (polygonId: string) => {
  try {
    const { data } = await axios.get(`${AGROMONITORING_BASE}/soil`, {
      params: {
        polyid: polygonId,
        appid: process.env.AGROMONITORING_API_KEY,
      },
    });
    return data;
  } catch (error) {
    logger.warn('AgroMonitoring soil data unavailable:', error);
    return null;
  }
};
