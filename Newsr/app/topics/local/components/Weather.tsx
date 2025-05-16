import { useState, useEffect } from 'react';
import { Droplets, Thermometer, Wind, Sun, CloudRain } from 'lucide-react';

interface WeatherProps {
  city: string;
}

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    icon: string;
    uv: number;
    wind_mph: number;
    wind_dir: string;
    precipChance: number;
  };
  location: {
    name: string;
    region: string;
  };
  forecast: {
    high: number;
    low: number;
  };
}

export function Weather({ city }: WeatherProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback only for current temp and condition if API fails
  const fallbackTemps = {
    'seattle': { temp: 52, condition: 'Overcast' },
    'denver': { temp: 53, condition: 'Partly cloudy' },
    'dallas': { temp: 65, condition: 'Sunny' },
    'houston': { temp: 68, condition: 'Partly cloudy' },
    'tucson': { temp: 80, condition: 'Sunny' }
  };
  
  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        
        // Fetch from API
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        setWeatherData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError('Could not load weather data');
        
        // Only use fallback for current temp and condition
        const cityKey = city.toLowerCase();
        const fallback = fallbackTemps[cityKey as keyof typeof fallbackTemps] || fallbackTemps.denver;
        
        setWeatherData({
          current: {
            temp: fallback.temp,
            condition: fallback.condition,
            icon: '/cloud.svg',
            uv: 0,
            wind_mph: 0,
            wind_dir: 'N',
            precipChance: 0
          },
          location: {
            name: city,
            region: cityKey === 'seattle' ? 'WA' : cityKey === 'denver' ? 'CO' : 'TX'
          },
          forecast: {
            high: 0,
            low: 0
          }
        });
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [city]);

  if (loading) return <div className="animate-pulse h-12 bg-gray-200 w-full"></div>;
  if (!weatherData) return <div className="text-gray-500">No weather data available</div>;

  // Function to get UV index description
  const getUVDescription = (uv: number) => {
    if (uv <= 2) return "Low";
    if (uv <= 5) return "Moderate";
    if (uv <= 7) return "High";
    if (uv <= 10) return "Very High";
    return "Extreme";
  };

  return (
    <div className="flex items-center w-full relative">
      {/* Current temperature and condition */}
      <div className="flex items-center gap-2">
        {weatherData.current.icon && (
          <img 
            src={weatherData.current.icon} 
            alt={weatherData.current.condition}
            className="w-12 h-12"
          />
        )}
        
        <div>
          <div className="text-3xl font-bold text-gray-800">
            {Math.round(weatherData.current.temp)}°F
          </div>
          
          <div className="text-sm text-gray-600 mt-1">
            {weatherData.current.condition}
          </div>
        </div>
      </div>
      
      {/* High/Low temperatures (stacked vertically) - increased size */}
      {weatherData.forecast && (
        <div className="ml-4 flex flex-col">
          <div className="text-red-600 text-lg font-medium">
            {Math.round(weatherData.forecast.high)}°
          </div>
          <div className="text-blue-600 text-lg font-medium">
            {Math.round(weatherData.forecast.low)}°
          </div>
        </div>
      )}
      
      {/* Weather details - moved to the left */}
      <div className="ml-8">
        <div className="flex items-center text-sm text-gray-600">
          <Wind size={14} className="mr-1" />
          <span>Wind: {weatherData.current.wind_mph} MPH</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <CloudRain size={14} className="mr-1" />
          <span>Rain: {weatherData.current.precipChance}%</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Sun size={14} className="mr-1" />
          <span>UV: {weatherData.current.uv} ({getUVDescription(weatherData.current.uv)})</span>
        </div>
      </div>
    </div>
  );
} 