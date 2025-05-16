#!/usr/bin/env python3
import os
import json
import logging
from datetime import datetime
import argparse
from supabase import create_client
from dotenv import load_dotenv

# Import city configuration
from ..config.cities import get_city_config, CITIES

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("supabase.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("supabase_integration")

class SupabaseIntegration:
    def __init__(self):
        """Initialize Supabase connection"""
        # Get environment variables
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL and Key must be provided in environment variables")
        
        # Initialize Supabase client
        self.client = create_client(self.supabase_url, self.supabase_key)
        logger.info("Supabase client initialized")
    
    def create_city_collection(self, city_code):
        """Create a collection for a city if it doesn't exist"""
        city_config = get_city_config(city_code)
        if not city_config:
            logger.error(f"No configuration found for city: {city_code}")
            return False
        
        try:
            # Check if collection exists
            # Note: This is pseudo-code; actual implementation depends on Supabase API
            # You may need to use a different approach depending on your Supabase setup
            collections = self.client.storage.list_buckets()
            if not any(collection['name'] == city_code for collection in collections):
                # Create collection
                self.client.storage.create_bucket(city_code)
                logger.info(f"Created collection for {city_config['name']}")
            
            return True
        except Exception as e:
            logger.error(f"Error creating collection for {city_code}: {str(e)}")
            return False
    
    def add_city_to_database(self, city_code):
        """Add a city to the Supabase cities table"""
        # Get city config
        city_config = CITIES.get(city_code)
        if not city_config:
            logger.error(f"No configuration found for city: {city_code}")
            return False
        
        try:
            # Check if city already exists
            city_check = self.client.table('cities').select('*').eq('city_code', city_code).execute()
            if city_check.data:
                logger.info(f"City {city_code} already exists in database")
                return True
            
            # Prepare city data
            city_data = {
                'city_code': city_code,
                'name': city_config.get('name', ''),
                'region': city_config.get('region', ''),
                'keywords': city_config.get('keywords', []),
                'scraper_class': city_config.get('scraper_class', ''),
                'scrape_frequency': city_config.get('scrape_frequency', 'daily'),
                'active': city_config.get('active', True)
            }
            
            # Insert city
            result = self.client.table('cities').insert(city_data).execute()
            logger.info(f"Added {city_config['name']} to cities table")
            return True
        except Exception as e:
            logger.error(f"Error adding {city_code} to cities table: {str(e)}")
            return False
    
    def upload_digest(self, digest, city_code=None):
        """Upload a digest to Supabase"""
        try:
            # Ensure city exists in cities table
            city_code = digest.get('city_code', city_code)
            
            # Check if city exists in cities table and add it if not
            city_check = self.client.table('cities').select('*').eq('city_code', city_code).execute()
            if not city_check.data:
                success = self.add_city_to_database(city_code)
                if not success:
                    logger.error(f"Failed to add city {city_code} to database")
                    return False
                
                # Fetch city data again after creating it
                city_check = self.client.table('cities').select('*').eq('city_code', city_code).execute()
            
            # Get city data from database or config
            city_data = city_check.data[0] if city_check.data else None
            
            # If we don't have city data from the database, get it from config
            if not city_data:
                city_config = get_city_config(city_code)
                if not city_config:
                    logger.error(f"No configuration found for city: {city_code}")
                    return False
                city_name = city_config.get('name', '')
                region = city_config.get('region', '')
            else:
                city_name = city_data.get('name', '')
                region = city_data.get('region', '')
            
            # Format the digest for upload - include required fields with fallbacks
            upload_data = {
                'city_code': city_code,
                'city_name': digest.get('city_name', city_name),  # Fallback to city data
                'region': digest.get('region', region),           # Fallback to city data
                'date': digest.get('date', datetime.now().strftime('%Y-%m-%d')),
                'headline': digest.get('headline', ''),
                'content': digest.get('content', ''),
                'sources': digest.get('sources', []),
                'article_count': digest.get('article_count', 0),
                'status': digest.get('status', 'active')
            }
            
            # Make sure no required fields are NULL
            for field in ['city_name', 'region']:
                if not upload_data[field]:
                    upload_data[field] = f"{city_code} {field.replace('_', ' ')}"  # Last resort placeholder
            
            logger.info(f"Uploading digest for {city_code} ({upload_data['city_name']}, {upload_data['region']})")
            
            # Upload to Supabase
            result = self.client.table('city_digests').insert(upload_data).execute()
            
            # Check for success
            if result.data:
                logger.info(f"Successfully uploaded digest for {city_code}")
                
                # Get the ID of the inserted digest
                digest_id = result.data[0].get('id')
                
                # Now try to update with optional fields in separate operations
                try_update_fields = [
                    ('sections', digest.get('sections')),
                    ('featured_image', digest.get('featured_image')),
                    ('featured_image_context', digest.get('featured_image_context')),
                    ('image_gallery', digest.get('image_gallery')),
                    ('weather', digest.get('weather'))
                ]
                
                for field_name, field_value in try_update_fields:
                    if field_value is not None:
                        try:
                            update_data = {field_name: field_value}
                            self.client.table('city_digests').update(update_data).eq('id', digest_id).execute()
                        except Exception as field_error:
                            logger.warning(f"Could not update {field_name} field: {str(field_error)}")
                
                return True
            else:
                logger.error(f"No data returned from Supabase after digest upload for {city_code}")
                return False
            
        except Exception as e:
            logger.error(f"Error uploading digest for {city_code}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())  # Add stack trace for better debugging
            return False
    
    def get_latest_digest(self, city_code):
        """Get the latest digest for a city"""
        try:
            # Query the latest digest
            result = self.client.table('city_digests') \
                .select('*') \
                .eq('city_code', city_code) \
                .eq('active', True) \
                .order('date', desc=True) \
                .limit(1) \
                .execute()
            
            if result.data:
                return result.data[0]
            else:
                logger.warning(f"No digests found for {city_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving latest digest for {city_code}: {str(e)}")
            return None
    
    def list_city_digests(self, city_code, limit=10):
        """List digests for a city"""
        try:
            # Query digests
            result = self.client.table('city_digests') \
                .select('*') \
                .eq('city_code', city_code) \
                .eq('active', True) \
                .order('date', desc=True) \
                .limit(limit) \
                .execute()
            
            return result.data
                
        except Exception as e:
            logger.error(f"Error listing digests for {city_code}: {str(e)}")
            return []
    
    def store_articles(self, articles, city_code, is_used=False, digest_id=None):
        """Store articles in archive table, marking their usage status"""
        try:
            # Get current date for grouping
            current_date = datetime.now().strftime('%Y-%m-%d')
            current_time = datetime.now().isoformat()
            
            # Format articles for bulk upload
            upload_data = []
            for article in articles:
                # Convert article to dict if needed
                if not isinstance(article, dict):
                    if hasattr(article, 'asdict'):
                        article = article.asdict()
                    else:
                        article = vars(article)
                
                # Add metadata
                article_data = {
                    'city_code': city_code,
                    'archived_date': current_date,
                    'title': article.get('title', ''),
                    'url': article.get('url', ''),
                    'source': article.get('source', ''),
                    'published_date': article.get('published_date'),
                    'content_preview': article.get('content', '')[:500] if article.get('content') else '',
                    'created_at': current_time,
                    'is_used': is_used,
                    'used_in_digest_id': digest_id if is_used else None,
                    'used_at': current_time if is_used else None,
                    'category': article.get('category', '')
                }
                upload_data.append(article_data)
            
            # Batch upload to save API calls
            if upload_data:
                # Handle conflict on unique constraint - update if article already exists
                conflict_target = ['url']
                conflict_resolution = {}
                
                if is_used:
                    conflict_resolution = {
                        'is_used': True,
                        'used_in_digest_id': digest_id,
                        'used_at': current_time
                    }
                
                # Use batches of 50 to avoid payload size limits
                batch_size = 50
                for i in range(0, len(upload_data), batch_size):
                    batch = upload_data[i:i+batch_size]
                    result = self.client.table('article_archive').upsert(
                        batch,
                        on_conflict=conflict_target
                    ).execute()
                
                action = "Archived" if not is_used else "Stored used"
                logger.info(f"{action} {len(upload_data)} articles for {city_code}")
                return True
            return False
        
        except Exception as e:
            logger.error(f"Error storing articles for {city_code}: {str(e)}")
            return False 
    
    def archive_digest(self, digest_id):
        """Archive a digest after its active period"""
        try:
            # First, fetch the digest to archive
            result = self.client.table('city_digests').select('*').eq('id', digest_id).execute()
            
            if not result.data:
                logger.error(f"No digest found with ID {digest_id}")
                return False
            
            digest = result.data[0]
            
            # Create an archive record
            archive_data = {
                'original_digest_id': digest_id,
                'city_code': digest['city_code'],
                'city_name': digest['city_name'],
                'region': digest['region'],
                'digest_date': digest['date'],
                'headline': digest.get('headline', ''),
                'content': digest['content'],
                'sources': digest['sources'],
                'article_count': digest['article_count'],
                'featured_image': digest.get('featured_image', ''),
                'featured_image_context': digest.get('featured_image_context', {}),
                'image_gallery': digest.get('image_gallery', []),
                'weather': digest.get('weather', {}),
                'performance_metrics': {}, # Could be populated with analytics data
                'archived_at': datetime.now().isoformat()
            }
            
            # Insert into archive
            archive_result = self.client.table('city_digest_archive').insert(archive_data).execute()
            
            # Update status of original digest
            update_result = self.client.table('city_digests').update({'status': 'archived'}).eq('id', digest_id).execute()
            
            logger.info(f"Archived digest {digest_id} for {digest['city_name']}")
            return True
            
        except Exception as e:
            logger.error(f"Error archiving digest {digest_id}: {str(e)}")
            return False 

    def get_articles_for_city(self, city_code, date=None, limit=100):
        """Fetch articles for a specific city from Supabase"""
        try:
            query = self.client.table('article_archive').select('*').eq('city_code', city_code)
            
            if date:
                query = query.eq('archived_date', date)
            
            # Order by creation date, most recent first
            query = query.order('created_at', desc=True).limit(limit)
            
            result = query.execute()
            
            if result.data:
                logger.info(f"Retrieved {len(result.data)} articles for {city_code} from Supabase")
                return result.data
            else:
                logger.info(f"No articles found for {city_code} in Supabase")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching articles for {city_code} from Supabase: {str(e)}")
            return []

    def get_unused_articles_for_city(self, city_code, limit=50):
        """Fetch unused articles for a specific city from Supabase"""
        try:
            result = self.client.table('article_archive')\
                        .select('*')\
                        .eq('city_code', city_code)\
                        .eq('is_used', False)\
                        .order('created_at', desc=True)\
                        .limit(limit)\
                        .execute()
            
            if result.data:
                logger.info(f"Retrieved {len(result.data)} unused articles for {city_code} from Supabase")
                return result.data
            else:
                logger.info(f"No unused articles found for {city_code} in Supabase")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching unused articles for {city_code} from Supabase: {str(e)}")
            return [] 