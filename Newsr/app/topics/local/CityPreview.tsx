import React from 'react';
import { CityDigest } from '@/lib/supabase';
import { Calendar } from 'lucide-react';

interface CityPreviewProps {
  digest: CityDigest | null;
  loading: boolean;
  error: string | null;
}

const CityPreview: React.FC<CityPreviewProps> = ({ digest, loading, error }) => {
  if (loading) {
    return (
      <div className="city-preview-content">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="city-preview-content">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="city-preview-content">
        <p className="text-sm text-gray-500">No digest available for this city.</p>
      </div>
    );
  }

  // Format the date
  const formattedDate = new Date(digest.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Get excerpt from content (first 100 characters)
  const excerpt = digest.content.length > 100 
    ? `${digest.content.substring(0, 100).trim()}...` 
    : digest.content;

  return (
    <div className="city-preview-content">
      <h4 className="text-sm font-semibold">{digest.headline || `${digest.city_name} Daily Digest`}</h4>
      <div className="flex items-center text-xs text-gray-500 mt-1 mb-2">
        <Calendar size={12} className="mr-1" />
        <span>{formattedDate}</span>
      </div>
      <p className="text-xs line-clamp-3">{excerpt}</p>
    </div>
  );
};

export default CityPreview; 