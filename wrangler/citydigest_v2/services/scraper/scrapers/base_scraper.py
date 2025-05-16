"""Base scraper class for CityDigest."""
import os
import time
import requests
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
from newspaper import Article as NewspaperArticle
from bs4 import BeautifulSoup

from shared.models.article import Article
from shared.utils.logging import setup_logging
from shared.utils.helpers import save_json, get_date_str
from shared.config.settings import CITIES_DATA_DIR
from shared.db.supabase_integration import SupabaseClient

# Set up logging
logger = setup_logging("scraper")

class BaseScraper(ABC):
    """Base class for all scrapers."""
    
    def __init__(self, city_code: str, source_name: str, source_url: str):
        """
        Initialize the scraper.
        
        Args:
            city_code (str): City code
            source_name (str): Source name
            source_url (str): Source URL
        """
        self.city_code = city_code
        self.source_name = source_name
        self.source_url = source_url
        self.date = get_date_str()
        
        # Set up city data directory
        self.city_dir = os.path.join(CITIES_DATA_DIR, city_code)
        self.news_dir = os.path.join(self.city_dir, "news")
        self.source_dir = os.path.join(self.news_dir, self._get_source_dirname())
        self.date_dir = os.path.join(self.source_dir, self.date)
        
        # Create necessary directories
        os.makedirs(self.date_dir, exist_ok=True)
        
        # Initialize Supabase client
        self.supabase = SupabaseClient()
    
    def _get_source_dirname(self) -> str:
        """
        Get directory name for the source.
        
        Returns:
            str: Directory name
        """
        return self.source_name.lower().replace(' ', '_')
    
    def save_article(self, article: Article) -> str:
        """
        Save an article to disk and upload to Supabase.
        
        Args:
            article (Article): Article to save
            
        Returns:
            str: Path to the saved article
        """
        # Generate filename
        filename = f"{int(time.time())}_{article.title[:30].replace(' ', '_')}.json"
        file_path = os.path.join(self.date_dir, filename)
        
        # Save article to disk
        save_json(article.to_dict(), file_path)
        logger.info(f"Saved article to disk: {article.title[:50]}...")
        
        # Upload to Supabase
        try:
            response = self.supabase.insert_article(article.to_dict())
            if response and hasattr(response, 'data') and response.data:
                logger.info(f"Uploaded article to Supabase: {article.title[:50]}...")
            else:
                logger.warning(f"Failed to upload article to Supabase: {article.title[:50]}...")
        except Exception as e:
            logger.error(f"Error uploading article to Supabase: {str(e)}")
        
        return file_path
    
    def fetch_url(self, url: str) -> Optional[str]:
        """
        Fetch content from a URL.
        
        Args:
            url (str): URL to fetch
            
        Returns:
            Optional[str]: HTML content or None if failed
        """
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            return response.text
        except Exception as e:
            logger.error(f"Error fetching URL {url}: {str(e)}")
            return None
    
    def parse_article_with_newspaper(self, url: str) -> Optional[Article]:
        """
        Parse an article using the newspaper library.
        
        Args:
            url (str): Article URL
            
        Returns:
            Optional[Article]: Parsed article or None if failed
        """
        try:
            article = NewspaperArticle(url)
            article.download()
            article.parse()
            
            return Article(
                title=article.title,
                url=url,
                source_name=self.source_name,
                city_code=self.city_code,
                published_at=article.publish_date,
                content=article.text,
                summary=article.summary,
                author=article.authors[0] if article.authors else None,
                image_url=article.top_image
            )
        except Exception as e:
            logger.error(f"Error parsing article {url} with newspaper: {str(e)}")
            return None
    
    @abstractmethod
    def scrape(self) -> List[Article]:
        """
        Scrape articles from the source.
        
        Returns:
            List[Article]: List of scraped articles
        """
        pass 