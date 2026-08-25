import { useState, useEffect } from 'react';

export const useWeather = (lat?: number, lon?: number) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock weather data fetch
    const fetchWeather = async () => {
      setLoading(true);
      await new Promise(res => setTimeout(res, 1000));
      setData({ temp: 28, condition: 'Sunny', humidity: 65 });
      setLoading(false);
    };
    fetchWeather();
  }, [lat, lon]);

  return { data, loading };
};
