'use client'

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bell, Calendar, CloudRain, Sun, Cloud, CloudLightning, Thermometer, Wind, Droplets, Gauge } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CityDigest } from '@/lib/supabase';
import './DigestViewer.css';

interface WeatherData {
  temp: number;
  temp_min: number;
  temp_max: number;
  condition: string;
  wind_speed: number;
  rain_chance: number;
  uv_index: number;
}

interface DigestViewerProps {
  cityCode?: string;
  cityName?: string;
  cityState?: string;
  weatherData?: WeatherData | null;
  isWeatherLoading?: boolean;
  onSubscribe?: () => void;
}

function DigestViewer({ 
  cityCode = 'dallas', 
  cityName: propCityName,
  cityState,
  weatherData, 
  isWeatherLoading = false,
  onSubscribe
}: DigestViewerProps) {
  const [digest, setDigest] = useState<CityDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Get city name properly capitalized
  const cityName = propCityName || cityCode.charAt(0).toUpperCase() + cityCode.slice(1);

  // Helper function to get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    const lowercaseCondition = condition.toLowerCase();
    let icon;
    
    if (lowercaseCondition.includes('rain') || lowercaseCondition.includes('drizzle')) {
      icon = <CloudRain size={24} className="text-blue-500" />;
    } else if (lowercaseCondition.includes('thunder')) {
      icon = <CloudLightning size={24} className="text-purple-500" />;
    } else if (lowercaseCondition.includes('cloud') || lowercaseCondition.includes('overcast')) {
      icon = <Cloud size={24} className="text-gray-500" />;
    } else if (lowercaseCondition.includes('sun') || lowercaseCondition.includes('clear')) {
      icon = <Sun size={24} className="text-yellow-400" />;
    } else {
      icon = <Thermometer size={24} className="text-red-400" />;
    }
    
    return icon;
  };

  useEffect(() => {
    async function fetchDigest() {
      try {
        setLoading(true);
        setError(null);
        setIsConfigError(false);
        setDebugInfo(null);
        
        console.log(`Fetching digest for city: ${cityCode}`);
        
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('city_digests')
          .select('*')
          .eq('city_code', cityCode)
          .eq('active', true)
          .order('date', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          console.error('Supabase error:', error);
          
          // Check if this is a configuration error
          if (error.code === 'auth/invalid-api-key' || 
              error.code === 'auth/missing-api-key' ||
              error.message.includes('API key')) {
            setIsConfigError(true);
          }
          
          setDebugInfo({
            code: error.code,
            message: error.message,
            details: error.details
          });
          
          throw new Error(`Failed to fetch digest: ${error.message}`);
        }
        
        if (data) {
          console.log('Digest fetched successfully:', data);
          setDigest(data);
        } else {
          throw new Error(`No digest found for ${cityName}`);
        }
      } catch (err) {
        console.error('Error in fetchDigest:', err);
        setError(err instanceof Error ? err.message : 'Failed to load digest');
        setDigest(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDigest();
    
    return () => {
      // Cleanup function
      console.log('DigestViewer cleanup for city:', cityCode);
    };
  }, [cityCode, cityName]);

  if (loading) {
    return (
      <div className="digest-container">
        <div className="digest-loading">
          <div className="digest-spinner"></div>
          <p className="text-gray-600 font-medium">Loading daily digest for {cityName}...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    if (isConfigError) {
      return (
        <div className="digest-container">
          <div className="digest-error bg-yellow-50 border-l-4 border-yellow-400 p-6">
            <p className="font-bold text-lg mb-2">Configuration Error</p>
            <p>There's an issue with the database configuration. The API key appears to be invalid or missing.</p>
            <p className="text-sm mt-4">For developers: Please check the environment variables and ensure API credentials are correctly configured.</p>
            
            {debugInfo && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-blue-600">Debug Information</summary>
                <pre className="bg-gray-100 p-2 mt-2 overflow-auto max-h-[200px]">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="digest-container">
        <div className="digest-error p-6 border-l-4 border-red-500 bg-red-50">
          <p className="font-bold text-lg mb-2">Error loading digest</p>
          <p>{error}</p>
          
          {debugInfo && (
            <details className="mt-4 text-xs">
              <summary className="cursor-pointer text-blue-600">Debug Information</summary>
              <pre className="bg-gray-100 p-2 mt-2 overflow-auto max-h-[200px]">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
  
  if (!digest) {
    return (
      <div className="digest-container">
        <div className="digest-empty">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-lg font-medium mb-2">No digest available</p>
          <p className="text-gray-600">There is currently no daily digest available for {cityName}.</p>
        </div>
      </div>
    );
  }

  // Remove the headline in brackets from the content if it exists
  let cleanedContent = digest.content.replace(/^\*\*\[(.*?)\]\*\*/, '').trim();
  
  // Format section headers (all caps words followed by colon)
  cleanedContent = cleanedContent.replace(
    /^([A-Z][A-Z\s&]+):/gm, 
    '## $1'
  );
  
  // Bold the greeting line
  cleanedContent = cleanedContent.replace(
    /(Good morning.*?!)/,
    '**$1**'
  );

  // Format lists in the QUICK NOTES section
  cleanedContent = cleanedContent.replace(
    /^(\* )/gm,
    '- '
  );

  // Format the date for display
  const formattedDate = new Date(digest.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="digest-container">
      {/* Header section with title and date/location */}
      <div className="digest-header-container">
        <div className="digest-title-section">
          <h1>{digest.headline || `${cityName} Daily Digest`}</h1>
          <div className="flex items-center justify-between">
            <div className="digest-location-date">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <span className="digest-date">{formattedDate}</span>
            </div>
          </div>
        </div>
        
        {/* Weather display section with loading state */}
        {isWeatherLoading ? (
          <div className="digest-weather-loading">
            <div className="digest-spinner digest-spinner-small"></div>
            <span>Loading weather information...</span>
          </div>
        ) : weatherData && (
          <div className="digest-weather-card">
            <div className="digest-weather-left">
              <div className="digest-weather-icon-container">
                {getWeatherIcon(weatherData.condition)}
                <div className="digest-weather-temp">{weatherData.temp}°</div>
              </div>
              
              <div className="digest-weather-info">
                <div className="digest-weather-condition">{weatherData.condition}</div>
                <div className="digest-weather-highlow">
                  <span className="digest-weather-high">H: {weatherData.temp_max}°</span>
                  <span className="digest-weather-low">L: {weatherData.temp_min}°</span>
                </div>
              </div>
            </div>
            
            <div className="digest-weather-metrics">
              <div className="digest-weather-metric">
                <Wind size={14} className="text-gray-500" />
                <span>{weatherData.wind_speed}mph</span>
              </div>
              <div className="digest-weather-metric">
                <Droplets size={14} className="text-blue-400" />
                <span>{weatherData.rain_chance}%</span>
              </div>
              <div className="digest-weather-metric">
                <Gauge size={14} className="text-orange-400" />
                <span>UV:{weatherData.uv_index}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="digest-content">
        <ReactMarkdown 
          components={{
            h2: ({node, ...props}) => (
              <h2 className="text-blue-800 font-bold text-lg" {...props} />
            ),
            a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal" {...props} />,
            blockquote: ({node, ...props}) => <blockquote {...props} />,
            p: ({node, ...props}) => <p {...props} />
          }}
        >
          {cleanedContent}
        </ReactMarkdown>
      </div>
      
      {/* Bottom subscribe button */}
      {onSubscribe && (
        <button onClick={onSubscribe} className="digest-subscribe-btn-bottom">
          <div className="flex items-center">
            <Bell size={16} className="mr-2" />
            <span>Subscribe to Updates</span>
          </div>
        </button>
      )}
      
      {/* Footer divider */}
      <div className="digest-footer"></div>
    </div>
  );
}

export default DigestViewer; 