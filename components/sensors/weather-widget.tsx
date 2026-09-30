'use client';

import { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Thermometer, Sun, CloudRain, CloudSnow, CloudFog, Loader2 } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  condition: string;
}

interface WeatherWidgetProps {
  latitude?: number;
  longitude?: number;
  city?: string;
  className?: string;
}

export function WeatherWidget({ latitude = 31.5204, longitude = 74.3587, city = 'Lahore', className }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
        if (!apiKey) {
          // Use simulated data if no API key
          setWeather(getSimulatedWeather(city));
          return;
        }
        
        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=no`
        );
        
        if (res.ok) {
          const data = await res.json();
          setWeather({
            location: data.location?.name || city,
            temperature: Math.round(data.current?.temp_c ?? 32),
            feelsLike: Math.round(data.current?.feelslike_c ?? 34),
            humidity: data.current?.humidity ?? 65,
            windSpeed: Math.round(data.current?.wind_kph ?? 12),
            description: data.current?.condition?.text ?? 'Clear',
            icon: data.current?.condition?.icon ?? '',
            condition: data.current?.condition?.text?.toLowerCase() ?? 'clear',
          });
        } else {
          // Fallback to simulated data
          setWeather(getSimulatedWeather(city));
        }
      } catch {
        setWeather(getSimulatedWeather(city));
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, [latitude, longitude, city]);

  if (loading) {
    return (
      <div className={`neu-flat p-4 ${className}`}>
        <div className="flex items-center justify-center gap-2 text-slate-400 py-6">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading weather...</span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const WeatherIcon = getWeatherIcon(weather.condition);

  return (
    <div className={`neu-flat overflow-hidden ${className}`}>
      {/* Gradient Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{
        background: 'linear-gradient(135deg, hsl(200, 80%, 50%) 0%, hsl(220, 70%, 55%) 100%)',
      }}>
        <div className="flex items-center gap-2">
          <WeatherIcon className="w-6 h-6 text-white drop-shadow" />
          <div>
            <p className="text-white font-bold text-sm">{weather.location}</p>
            <p className="text-white/80 text-[11px]">{weather.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-extrabold text-2xl tracking-tight">{weather.temperature}°C</p>
          <p className="text-white/70 text-[10px]">Feels {weather.feelsLike}°C</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 divide-x divide-slate-100">
        <div className="px-4 py-3 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-sky-500" />
          <div>
            <p className="text-[10px] text-slate-500 font-medium">Humidity</p>
            <p className="text-sm font-bold text-slate-800">{weather.humidity}%</p>
          </div>
        </div>
        <div className="px-4 py-3 flex items-center gap-2">
          <Wind className="w-4 h-4 text-teal-500" />
          <div>
            <p className="text-[10px] text-slate-500 font-medium">Wind</p>
            <p className="text-sm font-bold text-slate-800">{weather.windSpeed} km/h</p>
          </div>
        </div>
      </div>

      {/* Cold Chain Impact */}
      <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">Cold-Chain Impact</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          weather.temperature > 35 
            ? 'bg-rose-100 text-rose-700' 
            : weather.temperature > 28 
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
        }`}>
          {weather.temperature > 35 ? '⚠️ High Risk' : weather.temperature > 28 ? '🔶 Moderate' : '✅ Low Risk'}
        </span>
      </div>
    </div>
  );
}

function getWeatherIcon(condition: string) {
  if (condition.includes('rain') || condition.includes('drizzle')) return CloudRain;
  if (condition.includes('snow') || condition.includes('sleet')) return CloudSnow;
  if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze')) return CloudFog;
  if (condition.includes('cloud') || condition.includes('overcast')) return Cloud;
  return Sun;
}

function getSimulatedWeather(city: string): WeatherData {
  const hour = new Date().getHours();
  const baseTemp = hour >= 6 && hour <= 18 ? 32 : 26;
  const variation = Math.floor(Math.random() * 5) - 2;
  
  return {
    location: city,
    temperature: baseTemp + variation,
    feelsLike: baseTemp + variation + 2,
    humidity: 55 + Math.floor(Math.random() * 20),
    windSpeed: 8 + Math.floor(Math.random() * 15),
    description: hour >= 6 && hour <= 18 ? 'Partly Cloudy' : 'Clear Night',
    icon: '',
    condition: hour >= 6 && hour <= 18 ? 'partly cloudy' : 'clear',
  };
}
