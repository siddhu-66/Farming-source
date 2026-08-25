'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Cloud, Droplets, Wind, Sun, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

export const WeatherWidget = ({ lat = 28.6139, lon = 77.2090 }: { lat?: number; lon?: number }) => {
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const [currentRes, forecastRes] = await Promise.all([
          api.get(`/weather/current?lat=${lat}&lon=${lon}`),
          api.get(`/weather/forecast?lat=${lat}&lon=${lon}`)
        ]);

        if (currentRes.data.success) {
          setWeather(currentRes.data.data.weather);
        }
        if (forecastRes.data.success) {
          setForecast(forecastRes.data.data.forecast);
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [lat, lon]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center h-full text-gray-400">
          <Cloud className="w-12 h-12 mb-4 animate-pulse text-blue-300" />
          <p>Loading weather data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="h-full border-red-200">
        <CardContent className="p-6 flex flex-col items-center justify-center h-full text-red-500">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <p className="text-sm text-center">Weather service currently unavailable</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border-none shadow-md overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>{weather.city}, {weather.country}</span>
          <div className="flex items-center text-blue-600 dark:text-blue-400">
            <span className="text-3xl font-bold">{Math.round(weather.temperature)}°C</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm font-medium capitalize text-gray-600 dark:text-gray-300 mb-4">{weather.description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span>Humidity: {weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Wind className="w-4 h-4 text-teal-500" />
              <span>Wind: {weather.windSpeed} m/s</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Sun className="w-4 h-4 text-orange-400" />
              <span>UV Index: Mod</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Cloud className="w-4 h-4 text-gray-400" />
              <span>Pressure: {weather.pressure} hPa</span>
            </div>
          </div>
        </div>

        {forecast.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-3 tracking-wider">5-Day Forecast</h4>
            <div className="flex justify-between">
              {forecast.slice(0, 5).map((day, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <div className="my-1">
                    <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt="icon" className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-bold">{Math.round(day.tempMax)}°</span>
                  <span className="text-[10px] text-gray-500">{Math.round(day.tempMin)}°</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
