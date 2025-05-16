'use client';

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, ChevronRight } from 'lucide-react';
import DigestViewer from './DigestViewer';
import SubscribeModal from './subscribe/SubscribeModal';
import CityButton from './CityButton';
import { supabase } from '@/lib/supabase';

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
        console.log(`Fetching news for ${selectedCity.code}`);
        
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('location_id', selectedCity.code)
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
            image: article.image_url || '/placeholder.jpg',
            category: article.category,
            author: article.author_id, // Ideally we'd fetch the author name
            date: article.published_at,
            location: selectedCity.name
          }));
          
          setArticles(articles);
        } else {
          console.log('No articles found for this location');
          setArticles([]);
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
        <DigestViewer 
          cityCode={selectedCity.code}
          cityName={selectedCity.name}
          cityState={selectedCity.state}
          weatherData={weatherData}
          isWeatherLoading={isWeatherLoading}
          onSubscribe={handleSubscribe}
        />
      </div>
      
      {/* Articles Grid */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest News</h2>
          <Link 
            href={`/news?location=${selectedCity.code}`} 
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
          >
            View All
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-black overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 w-5/6 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <Link key={article.id} href={`/articles/${article.id}`}>
                <article className="bg-white dark:bg-gray-800 border border-black overflow-hidden h-full hover:shadow-sm transition-shadow duration-300">
                  <div className="relative h-48">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-0 left-0 bg-blue-600 text-white px-2 py-1 text-xs">
                      {article.category}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
                      {article.description}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span>{article.author}</span>
                      <time dateTime={article.date}>{formatDate(article.date)}</time>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
      
      {/* Local Events Section and Community Resources in 2-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Local Events Section */}
        <section className="bg-white dark:bg-gray-800 border border-black p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Upcoming Events</h2>
            <Link href="/events" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-sm">
              View All
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            <li className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <h3 className="font-medium">{selectedCity.name} Farmers Market</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Every Saturday, 8am - 1pm</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Downtown Plaza</p>
                </div>
                <Link 
                  href="/events/farmers-market"
                  className="mt-2 sm:mt-0 inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 border border-blue-100"
                >
                  Details
                </Link>
              </div>
            </li>
            <li className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <h3 className="font-medium">Community Clean-up Day</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sunday, June 12, 10am - 2pm</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Multiple Locations</p>
                </div>
                <Link 
                  href="/events/community-cleanup"
                  className="mt-2 sm:mt-0 inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 border border-blue-100"
                >
                  Details
                </Link>
              </div>
            </li>
            <li className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <h3 className="font-medium">{selectedCity.name} Summer Music Festival</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">June 24-26, All Day</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Central Park</p>
                </div>
                <Link 
                  href="/events/music-festival"
                  className="mt-2 sm:mt-0 inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 border border-blue-100"
                >
                  Details
                </Link>
              </div>
            </li>
          </ul>
        </section>
        
        {/* Community Resources */}
        <section className="bg-white dark:bg-gray-800 border border-black p-6">
          <h2 className="text-xl font-bold mb-4">Community Resources</h2>
          <ul className="space-y-3">
            <li>
              <Link href="/resources/emergency" className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 p-2">
                <div className="bg-red-50 text-red-600 p-2 mr-3 border border-red-100">🚨</div>
                <div>
                  <div className="font-medium">Emergency Services</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Police, Fire, Medical</div>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/resources/government" className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 p-2">
                <div className="bg-blue-50 text-blue-600 p-2 mr-3 border border-blue-100">🏛️</div>
                <div>
                  <div className="font-medium">City Government</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Services and Information</div>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/resources/education" className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 p-2">
                <div className="bg-yellow-50 text-yellow-600 p-2 mr-3 border border-yellow-100">🏫</div>
                <div>
                  <div className="font-medium">Schools & Education</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">District Information</div>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/resources/health" className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 p-2">
                <div className="bg-green-50 text-green-600 p-2 mr-3 border border-green-100">🏥</div>
                <div>
                  <div className="font-medium">Healthcare</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Hospitals and Clinics</div>
                </div>
              </Link>
            </li>
          </ul>
        </section>
      </div>
      
      {/* Local Job Board - Simplified Version */}
      <section className="bg-white dark:bg-gray-800 border border-black p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Job Opportunities</h2>
          <Link href="/jobs" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
            View All Jobs
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="space-y-4">
          <div className="border border-gray-300 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">Software Developer</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">TechCorp Inc. • {selectedCity.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Full-time • Remote • $120K-$150K</p>
                <p className="text-sm line-clamp-2">Join our team to develop cutting-edge web applications using modern frameworks and tools.</p>
              </div>
              <span className="text-xs bg-green-50 text-green-700 px-2 py-1 border border-green-100">
                New
              </span>
            </div>
          </div>
          
          <div className="border border-gray-300 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">Marketing Coordinator</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Brand Solutions • {selectedCity.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Full-time • In-office • $65K-$80K</p>
                <p className="text-sm line-clamp-2">Looking for a creative marketing professional to join our growing team.</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 border border-blue-100">
                3 days ago
              </span>
            </div>
          </div>
          
          <div className="border border-gray-300 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">Restaurant Server</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Bistro {selectedCity.name} • Downtown</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Part-time • In-person • $20-$30/hr (incl. tips)</p>
                <p className="text-sm line-clamp-2">Seeking friendly, energetic servers for our busy downtown restaurant.</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 border border-blue-100">
                1 week ago
              </span>
            </div>
          </div>
        </div>
      </section>

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