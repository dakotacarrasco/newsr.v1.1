import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CityDigest } from '@/lib/supabase';
import CityPreview from './CityPreview';
import './CityPreview.css';

interface CityButtonProps {
  city: {
    name: string;
    code: string;
    state: string;
    active?: boolean;
    lastUpdated?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const CityButton: React.FC<CityButtonProps> = ({ city, isSelected, onSelect }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewDigest, setPreviewDigest] = useState<CityDigest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMouseEnter = async () => {
    setShowPreview(true);
    if (!previewDigest && !loading && !error) {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('city_digests')
          .select('*')
          .eq('city_code', city.code)
          .eq('active', true)
          .order('date', { ascending: false })
          .limit(1)
          .single();
          
        if (fetchError) {
          console.log('Error fetching digest preview:', fetchError);
          setError('Unable to load digest preview');
        } else if (data) {
          setPreviewDigest(data);
        }
      } catch (err) {
        console.error('Error loading preview:', err);
        setError('Unable to load digest preview');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  return (
    <button
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        city-button p-3 flex flex-col items-start justify-between relative
        ${isSelected
          ? 'bg-blue-100 text-blue-800 border border-blue-300' 
          : 'bg-white hover:bg-gray-50 border border-gray-200'}
        transition-colors
      `}
    >
      <div className="flex justify-between w-full">
        <span className="font-medium">{city.name}</span>
        {city.active && (
          <span className="h-2 w-2 rounded-full bg-green-500" title="Active digest available"></span>
        )}
      </div>
      <div className="flex justify-between w-full">
        <span className="text-xs text-gray-500 mt-1">{city.state}</span>
        {city.lastUpdated && (
          <span className="text-xs text-gray-400 mt-1">
            {new Date(city.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
      
      {/* Preview tooltip */}
      <div className={`city-preview-container ${showPreview ? 'visible' : ''}`}>
        <CityPreview 
          digest={previewDigest} 
          loading={loading} 
          error={error}
        />
      </div>
    </button>
  );
};

export default CityButton; 