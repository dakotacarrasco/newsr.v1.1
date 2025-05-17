'use client';

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, ChevronRight, Droplets, Wind, Sun } from 'lucide-react';
import DigestViewer from './DigestViewer';
import SubscribeModal from './subscribe/SubscribeModal';
import CityButton from './CityButton';
import { supabase } from '@/app/lib/supabase/client';
import LocalArticles from './components/LocalArticles';

// Define City interface
interface City {
  name: string;
  code: string;
  state: string;
  active?: boolean;
  lastUpdated?: string;
}

interface LocalArticle {
  id: string
  title: string
  description: string
  image: string
  category: string
  author: string
  date: string
  location: string
}

// Weather data interface
interface WeatherData {
  temp: number;
  temp_min: number;
  temp_max: number;
  condition: string;
  wind_speed: number;
  rain_chance: number;
  uv_index: number;
}

// Weather API token - in a real app this would be in environment variables
const WEATHER_API_TOKEN = "a1b2c3d4e5f6g7h8i9j0";

export default function LocalNewsPage() {
  const searchParams = useSearchParams()
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  
  // Static fallback cities
  const fallbackCities = [
    { name: 'Denver', code: 'denver', state: 'CO' },
    { name: 'Dallas', code: 'dallas', state: 'TX' },
    { name: 'Houston', code: 'houston', state: 'TX' },
    { name: 'Chicago', code: 'chicago', state: 'IL' },
    { name: 'Seattle', code: 'seattle', state: 'WA' },
    { name: 'Boston', code: 'boston', state: 'MA' }
  ];
  
  // State management
  const [selectedCity, setSelectedCity] = useState<City>(fallbackCities[0]);
  const [cities, setCities] = useState<City[]>(fallbackCities);
  const [articles, setArticles] = useState<LocalArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  // Format the date for display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Initialize with the location from URL if present
  useEffect(() => {
    const locationParam = searchParams.get('location')
    if (locationParam) {
      const matchingCity = fallbackCities.find(city => 
        city.name.toLowerCase() === locationParam.toLowerCase() || 
        city.code.toLowerCase() === locationParam.toLowerCase()
      );
      
      if (matchingCity) {
        setSelectedCity(matchingCity);
      }
    }
  }, [searchParams])

  // Fetch cities from Supabase
  useEffect(() => {
    let isMounted = true;
    
    async function fetchCities() {
      try {
        // Fetch from Supabase with digest status
        const { data, error } = await supabase
          .from('city_digests')
          .select('city_code, city_name, region, active, date')
          .order('city_name');
        
        if (error) {
          console.error('Error fetching cities:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          // Process to remove duplicates and track newest digests
          const cityMap = new Map();
          const cityStatusMap = new Map();
          
          data.forEach(item => {
            const existing = cityMap.get(item.city_code);
            
            // Track if a city has an active digest
            if (item.active) {
              cityStatusMap.set(item.city_code, {
                hasActiveDigest: true,
                lastUpdated: item.date
              });
            } else if (!cityStatusMap.has(item.city_code)) {
              cityStatusMap.set(item.city_code, {
                hasActiveDigest: false,
                lastUpdated: item.date
              });
            }
            
            if (!existing || (item.active && !existing.active)) {
              cityMap.set(item.city_code, {
                name: item.city_name,
                code: item.city_code,
                state: item.region || 'TX', // Default to TX if region not present
                active: item.active,
                lastUpdated: item.date
              });
            }
          });
          
          // Convert Map to array
          const uniqueCities = Array.from(cityMap.values());
          
          // Group cities by region
          const citiesByRegion = uniqueCities.reduce((acc, city) => {
            if (!acc[city.state]) {
              acc[city.state] = [];
            }
            acc[city.state].push(city);
            return acc;
          }, {});
          
          // Sort each region's cities alphabetically
          Object.keys(citiesByRegion).forEach(region => {
            citiesByRegion[region].sort((a: City, b: City) => a.name.localeCompare(b.name));
          });
          
          if (isMounted) {
            setCities(uniqueCities);
            
            // Set default city (Denver if available, otherwise first city)
            const defaultCity = uniqueCities.find((c: City) => c.name === 'Denver') || uniqueCities[0];
            if (defaultCity) {
              setSelectedCity(defaultCity);
            }
          }
        } else {
          console.log('No cities found, using fallback cities');
          // We're already using fallback cities initialized in state
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
        // We're already using fallback cities initialized in state
      }
    }
    
    fetchCities();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Fetch weather data based on selected location
  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsWeatherLoading(true);
      
      try {
        // In a real application, we would make an API call to a weather service
        // For this mock implementation, we'll create data based on the city
        console.log(`Fetching weather data for ${selectedCity.name}`);
        
        // Simulate API call with slight delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Generate temperature with some randomization based on city code
        const cityHash = selectedCity.code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const baseTemp = 70 + (cityHash % 30); // Base temp between 70-99
        
        // Generate various weather conditions based on the hash
        const weatherConditions = ['Sunny', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Thunderstorms', 'Clear'];
        const condition = weatherConditions[cityHash % weatherConditions.length];
        
        // Create mock weather data based on the city
        const mockWeatherData: WeatherData = {
          temp: baseTemp,
          temp_min: baseTemp - (10 + (cityHash % 10)), // min temp 10-20 below base
          temp_max: baseTemp + (5 + (cityHash % 8)),  // max temp 5-12 above base
          condition: condition,
          wind_speed: 5 + (cityHash % 15),  // Wind 5-19 MPH
          rain_chance: condition.includes('Rain') || condition.includes('Thunder') ? 30 + (cityHash % 70) : (cityHash % 20),
          uv_index: condition === 'Sunny' ? 7 + (cityHash % 4) : 2 + (cityHash % 5)
        };
        
        setWeatherData(mockWeatherData);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        // Set fallback weather data in case of error
        setWeatherData({
          temp: 72,
          temp_min: 65,
          temp_max: 80,
          condition: 'Partly Cloudy',
          wind_speed: 8,
          rain_chance: 10,
          uv_index: 4
        });
      } finally {
        setIsWeatherLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [selectedCity]);
  
  // Fetch local news based on location
  useEffect(() => {
    const fetchLocalNews = async () => {
      setIsLoading(true)
      
      try {
        console.log(`Fetching news for ${selectedCity.name}`);
        
        // Basic fetch from Supabase for non-article components that still need it
        // Main articles are handled by LocalArticles component
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('city', selectedCity.name)
          .order('published_at', { ascending: false })
          .limit(6);
        
        if (error) {
          console.error('Error fetching local news:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          // Map the returned data to the LocalArticle format
          const articles = data.map(article => ({
            id: article.id,
            title: article.title,
            description: article.description || "",
            image: article.image_url || '/images/placeholder.jpg',
            category: article.category || 'Local',
            author: article.author_id, // Ideally we'd fetch the author name
            date: article.published_at,
            location: selectedCity.name
          }));
          
          setArticles(articles);
        } else {
          console.log('No articles found for this location, trying topic field');
          
          // Try fetching by topic field which may contain the city name
          const { data: topicData, error: topicError } = await supabase
            .from('articles')
            .select('*')
            .eq('topic', selectedCity.name)
            .order('published_at', { ascending: false })
            .limit(6);
            
          if (!topicError && topicData && topicData.length > 0) {
            const articles = topicData.map(article => ({
              id: article.id,
              title: article.title,
              description: article.description || "",
              image: article.image_url || '/images/placeholder.jpg',
              category: article.category || 'Local',
              author: article.author_id,
              date: article.published_at,
              location: selectedCity.name
            }));
            
            setArticles(articles);
          } else {
            console.log('No articles found for this location');
            setArticles([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch local news:', err);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLocalNews()
  }, [selectedCity])
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Handle subscribe button click
  const handleSubscribe = () => {
    setIsSubscribeModalOpen(true);
  };

  // Filter cities based on search query
  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(citySearchQuery.toLowerCase()) || 
    city.code.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
    city.state.toLowerCase().includes(citySearchQuery.toLowerCase())
  );
  
  // Group filtered cities by region
  const groupedCities = React.useMemo(() => {
    return filteredCities.reduce((groups: Record<string, City[]>, city) => {
      const region = city.state;
      if (!groups[region]) {
        groups[region] = [];
      }
      groups[region].push(city);
      return groups;
    }, {});
  }, [filteredCities]);
  
  // Get all regions with cities
  const regions = React.useMemo(() => {
    return Object.keys(groupedCities).sort();
  }, [groupedCities]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* City Selection Header */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-gray-700 mb-4">Select a Location</h2>
        
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
          {/* State section */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">State</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {regions.map(region => (
                <button 
                  key={region}
                  onClick={() => setSelectedRegion(region === selectedRegion ? null : region)}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-full transition-all ${
                    selectedRegion === region 
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-sm' 
                      : 'bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
          
          {/* Divider when a state is selected */}
          <div className="border-t border-gray-100 my-3"></div>
          
          {/* City section */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">City</span>
            </div>
            <div className="flex flex-wrap gap-2.5 max-h-[200px] overflow-y-auto pr-1 pb-1">
              {cities
                .filter(city => !selectedRegion || city.state === selectedRegion)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((city) => (
                  <button
                    key={city.code}
                    onClick={() => setSelectedCity(city)}
                    className={`
                      relative group px-3.5 py-1.5 rounded-full text-sm font-medium transition-all
                      ${!selectedRegion && 'opacity-80 hover:opacity-100'}
                      ${selectedCity.code === city.code 
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-sm' 
                        : 'bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 hover:shadow-sm'}
                    `}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{city.name}</span>
                      {city.active && (
                        <span 
                          className="flex h-2 w-2 relative"
                          title="Active digest available"
                        >
                          <span className={`
                            animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              selectedCity.code === city.code ? 'bg-white' : 'bg-green-400'
                            }
                          `}></span>
                          <span className={`
                            relative inline-flex rounded-full h-2 w-2 ${
                              selectedCity.code === city.code ? 'bg-white' : 'bg-green-500'
                            }
                          `}></span>
                        </span>
                      )}
                    </span>
                  </button>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* City Digest Component with integrated weather and subscribe button */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {selectedCity.name} Local News
        </h1>
        <div className="text-gray-600 mb-6 flex items-center justify-between">
          <p>{formattedDate}</p>
          <button 
            onClick={handleSubscribe}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition"
          >
            Subscribe to {selectedCity.name} digest
          </button>
        </div>
        
        {/* Subscribe Modal */}
        <SubscribeModal 
          isOpen={isSubscribeModalOpen} 
          onClose={() => setIsSubscribeModalOpen(false)}
          cityName={selectedCity.name}
          stateName={selectedCity.state}
          cityCode={selectedCity.code}
        />
        
        {/* City Digest/Content Section - Full width without sidebar */}
        <div>
          {/* Main digest column */}
          <div>
            <DigestViewer cityCode={selectedCity.code} cityName={selectedCity.name} />
          </div>
        </div>
      </div>
      
      {/* Latest News Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
          Latest from {selectedCity.name}
        </h2>
        <LocalArticles city={selectedCity.name} limit={6} />
      </div>
      
      {/* Weather Section - Moved to bottom */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
          Weather in {selectedCity.name}
        </h2>
        
        <div className="bg-white rounded-xl border overflow-hidden shadow-md">
          <div className="p-6">
            {isWeatherLoading ? (
              <div className="flex flex-col items-center justify-center h-32">
                <div className="animate-pulse w-16 h-16 rounded-full bg-gray-200 mb-2"></div>
                <div className="animate-pulse w-24 h-4 bg-gray-200"></div>
              </div>
            ) : weatherData ? (
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="text-7xl font-bold text-gray-900 mr-6">{weatherData.temp}°</div>
                  <div>
                    <div className="text-xl text-gray-800 font-medium mb-1">{weatherData.condition}</div>
                    <div className="text-gray-600">
                      <span className="text-blue-600">Low: {weatherData.temp_min}°</span>
                      <span className="mx-2">|</span>
                      <span className="text-red-600">High: {weatherData.temp_max}°</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-x-10 gap-y-2 text-sm text-gray-700">
                  <div className="flex items-center">
                    <Droplets className="w-5 h-5 text-blue-500 mr-2" /> 
                    <span>Rain: {weatherData.rain_chance}%</span>
                  </div>
                  <div className="flex items-center">
                    <Wind className="w-5 h-5 text-blue-500 mr-2" />
                    <span>Wind: {weatherData.wind_speed} mph</span>
                  </div>
                  <div className="flex items-center">
                    <Sun className="w-5 h-5 text-orange-500 mr-2" />
                    <span>UV: {weatherData.uv_index}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-6">
                Weather data unavailable
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Call to Action */}
      <div className="text-center py-8">
        <p className="text-lg text-gray-700 mb-4">
          Want to stay updated with {selectedCity.name} news?
        </p>
        <button
          onClick={handleSubscribe}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow hover:shadow-md transition"
        >
          Subscribe to Daily Updates
        </button>
      </div>
      
      {/* Subscribe Modal */}
      <SubscribeModal 
        isOpen={isSubscribeModalOpen} 
        onClose={() => setIsSubscribeModalOpen(false)}
        cityName={selectedCity.name}
        stateName={selectedCity.state}
        cityCode={selectedCity.code}
      />
    </main>
  )
}