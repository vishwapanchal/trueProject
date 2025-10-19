"use client";

import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

const API_URL = 'http://127.0.0.1:8000';

export default function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Call our own backend endpoint
                const response = await fetch(`${API_URL}/weather`);
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || "Weather service is unavailable.");
                }
                const data = await response.json();
                setWeather({
                    temp: Math.round(data.temp),
                    description: data.description,
                    icon: data.icon,
                    city: data.city,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            }
        };

        fetchWeather();
    }, []);

    return (
        <div className="w-48 h-24 rounded-2xl bg-slate-800/50 backdrop-blur-md shadow-lg border border-white/20 flex items-center justify-center p-4 text-white">
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            {!weather && !error && <p className="text-xs">Loading weather...</p>}
            {weather && (
                <div className="flex items-center gap-4">
                    <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.description} className="w-12 h-12" />
                    <div className="text-left">
                        <p className="text-3xl font-bold">{weather.temp}°C</p>
                        <p className="text-xs capitalize">{weather.city}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
