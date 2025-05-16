#!/usr/bin/env python3
import os
import logging
import json
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import topic configuration system
from ..config.topics import get_topic_config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("supabase_integration")

class SupabaseIntegration:
    """Integration with Supabase for topic-based news system"""
    
    def __init__(self):
        """Initialize Supabase client"""
        # Get Supabase credentials from environment variables
        self.supabase_url = os.environ.get("SUPABASE_URL")
        self.supabase_key = os.environ.get("SUPABASE_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            logger.error("Supabase URL or key not found in environment variables")
            self.client = None
        else:
            try:
                self.client = create_client(self.supabase_url, self.supabase_key)
                logger.info("Supabase client initialized")
            except Exception as e:
                logger.error(f"Error initializing Supabase client: {str(e)}")
                self.client = None
    
    def upload_digest(self, digest, topic_code):
        """Upload a topic digest to Supabase"""
        if not self.client:
            logger.error("Supabase client not initialized")
            return False
        
        try:
            # Get topic configuration
            topic_config = get_topic_config(topic_code)
            topic_name = topic_config["name"] if topic_config else topic_code
            
            # Format date for database
            date_str = digest.get("date", datetime.now().strftime("%Y-%m-%d"))
            
            # Prepare data for Supabase
            digest_data = {
                "topic_code": topic_code,
                "topic_name": topic_name,
                "date": date_str,
                "content": digest.get("content", ""),
                "article_count": digest.get("article_count", 0),
                "sources": json.dumps(digest.get("sources", [])),
                "created_at": datetime.now().isoformat(),
            }
            
            # Insert data into political_digests table instead of topic_digests
            result = self.client.table("political_digests").insert(digest_data).execute()
            
            if result.data:
                logger.info(f"Uploaded digest for {topic_name} to Supabase")
                return True
            else:
                logger.error(f"Error uploading digest: {result.error}")
                return False
                
        except Exception as e:
            logger.error(f"Error uploading digest to Supabase: {str(e)}")
            return False
    
    def get_latest_digest(self, topic_code):
        """Get the latest digest for a topic from Supabase"""
        if not self.client:
            logger.error("Supabase client not initialized")
            return None
        
        try:
            # Use political_digests table instead of topic_digests
            result = self.client.table("political_digests") \
                .select("*") \
                .eq("topic_code", topic_code) \
                .order("date", {"ascending": False}) \
                .limit(1) \
                .execute()
            
            if result.data:
                logger.info(f"Retrieved latest digest for {topic_code}")
                return result.data[0]
            else:
                logger.info(f"No digest found for {topic_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving digest from Supabase: {str(e)}")
            return None
    
    def get_topic_articles(self, topic_code, limit=50):
        """Get recent articles for a topic from Supabase"""
        if not self.client:
            logger.error("Supabase client not initialized")
            return []
        
        try:
            result = self.client.table("topic_articles") \
                .select("*") \
                .eq("topic_code", topic_code) \
                .order("published_date", {"ascending": False}) \
                .limit(limit) \
                .execute()
            
            if result.data:
                logger.info(f"Retrieved {len(result.data)} articles for topic {topic_code}")
                return result.data
            else:
                logger.info(f"No articles found for topic {topic_code}")
                return []
            
        except Exception as e:
            logger.error(f"Error retrieving articles from Supabase: {str(e)}")
            return []

    def upload_article(self, article_data):
        """Upload an article to Supabase"""
        if not self.client:
            logger.error("Supabase client not initialized")
            return False
        
        try:
            # Insert data into articles table
            result = self.client.table("articles").insert(article_data).execute()
            
            if result.data:
                logger.info(f"Uploaded article: {article_data.get('title', 'Untitled')}")
                return True
            else:
                logger.error(f"Error uploading article: {result.error}")
                return False
            
        except Exception as e:
            logger.error(f"Error uploading article to Supabase: {str(e)}")
            return False