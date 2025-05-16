"""Digest generator implementation for CityDigest."""
import os
import glob
import json
from typing import List, Dict, Any, Optional
from datetime import datetime

from shared.models.article import Article
from shared.models.digest import Digest
from shared.utils.logging import setup_logging
from shared.utils.helpers import save_json, load_json, get_date_str
from shared.config.settings import CITIES_DATA_DIR
from services.digest.llm.mixtral_client import MixtralClient
from shared.db.supabase_integration import SupabaseClient

# Set up logging
logger = setup_logging("digest")

class DigestGenerator:
    """Generator for city news digests."""
    
    def __init__(self, city_code: str):
        """
        Initialize the digest generator.
        
        Args:
            city_code (str): City code
        """
        self.city_code = city_code
        
        # Set up paths
        self.city_dir = os.path.join(CITIES_DATA_DIR, city_code)
        self.news_dir = os.path.join(self.city_dir, "news")
        self.digests_dir = os.path.join(self.city_dir, "digests")
        
        # Create necessary directories
        os.makedirs(self.digests_dir, exist_ok=True)
        
        # Initialize LLM client
        self.llm = MixtralClient()
        
        # Initialize Supabase client
        self.supabase = SupabaseClient()
    
    def get_articles_for_date(self, date: str) -> List[Article]:
        """
        Get all articles for a specific date.
        
        Args:
            date (str): Date in YYYY-MM-DD format
            
        Returns:
            List[Article]: List of articles
        """
        articles = []
        
        # Try to get articles from Supabase first
        try:
            supabase_articles = self.supabase.get_articles_for_city(self.city_code, date)
            if supabase_articles and len(supabase_articles) > 0:
                logger.info(f"Found {len(supabase_articles)} articles in Supabase for {self.city_code} on {date}")
                for article_data in supabase_articles:
                    try:
                        article = Article.from_dict(article_data)
                        articles.append(article)
                    except Exception as e:
                        logger.error(f"Error parsing article from Supabase: {str(e)}")
        except Exception as e:
            logger.error(f"Error fetching articles from Supabase: {str(e)}")
        
        # If no articles found in Supabase, try local filesystem
        if not articles:
            logger.info(f"No articles found in Supabase, checking local filesystem")
            
            # Find all source directories
            source_dirs = glob.glob(os.path.join(self.news_dir, "*"))
            
            for source_dir in source_dirs:
                # Check if date directory exists
                date_dir = os.path.join(source_dir, date)
                if not os.path.exists(date_dir):
                    continue
                
                # Find all article JSON files
                article_files = glob.glob(os.path.join(date_dir, "*.json"))
                
                for article_file in article_files:
                    try:
                        # Load article data
                        article_data = load_json(article_file)
                        if article_data:
                            article = Article.from_dict(article_data)
                            articles.append(article)
                            
                            # Upload to Supabase if not already there
                            try:
                                self.supabase.insert_article(article_data)
                                logger.info(f"Uploaded article from local file to Supabase: {article.title[:50]}...")
                            except Exception as e:
                                logger.error(f"Error uploading article to Supabase: {str(e)}")
                    except Exception as e:
                        logger.error(f"Error loading article from {article_file}: {str(e)}")
        
        logger.info(f"Found {len(articles)} articles for {self.city_code} on {date}")
        return articles
    
    def get_digest_path(self, date: str) -> str:
        """
        Get the path to a digest file.
        
        Args:
            date (str): Date in YYYY-MM-DD format
            
        Returns:
            str: Path to the digest file
        """
        return os.path.join(self.digests_dir, f"{date}.json")
    
    def get(self, date: str) -> Optional[Digest]:
        """
        Get a digest for a specific date.
        
        Args:
            date (str): Date in YYYY-MM-DD format
            
        Returns:
            Optional[Digest]: Digest or None if not found
        """
        # Try to get digest from Supabase first
        try:
            supabase_digest = self.supabase.get_digest_for_city(self.city_code, date)
            if supabase_digest:
                logger.info(f"Found digest in Supabase for {self.city_code} on {date}")
                return Digest.from_dict(supabase_digest)
        except Exception as e:
            logger.error(f"Error fetching digest from Supabase: {str(e)}")
        
        # If not found in Supabase, check local filesystem
        digest_path = self.get_digest_path(date)
        
        if not os.path.exists(digest_path):
            return None
        
        try:
            digest_data = load_json(digest_path)
            if digest_data:
                digest = Digest.from_dict(digest_data)
                
                # Upload to Supabase if not already there
                try:
                    self.supabase.insert_digest(digest_data)
                    logger.info(f"Uploaded digest from local file to Supabase: {digest.title}")
                except Exception as e:
                    logger.error(f"Error uploading digest to Supabase: {str(e)}")
                
                return digest
        except Exception as e:
            logger.error(f"Error loading digest from {digest_path}: {str(e)}")
        
        return None
    
    def generate(self, date: str, force: bool = False) -> Digest:
        """
        Generate a digest for a specific date.
        
        Args:
            date (str): Date in YYYY-MM-DD format
            force (bool, optional): Force generation even if digest already exists
            
        Returns:
            Digest: Generated digest
        """
        # Check if digest already exists
        if not force:
            existing_digest = self.get(date)
            if existing_digest:
                logger.info(f"Digest already exists for {self.city_code} on {date}")
                return existing_digest
        
        # Get articles
        articles = self.get_articles_for_date(date)
        
        if not articles:
            logger.warning(f"No articles found for {self.city_code} on {date}")
            raise Exception(f"No articles found for {self.city_code} on {date}")
        
        # Categorize articles
        categories = self._categorize_articles(articles)
        
        # Generate digest content
        title = f"{self.city_code.title()} News Digest for {date}"
        content = self._generate_content(articles, categories, date)
        summary = self._generate_summary(articles, date)
        
        # Create digest
        digest = Digest(
            city_code=self.city_code,
            date=date,
            title=title,
            content=content,
            summary=summary,
            categories=categories
        )
        
        # Save digest to disk
        digest_path = self.get_digest_path(date)
        save_json(digest.to_dict(), digest_path)
        logger.info(f"Generated digest and saved to disk for {self.city_code} on {date}")
        
        # Upload to Supabase
        try:
            response = self.supabase.insert_digest(digest.to_dict())
            if response and hasattr(response, 'data') and response.data:
                logger.info(f"Uploaded digest to Supabase for {self.city_code} on {date}")
            else:
                logger.warning(f"Failed to upload digest to Supabase for {self.city_code} on {date}")
        except Exception as e:
            logger.error(f"Error uploading digest to Supabase: {str(e)}")
        
        return digest
    
    def _categorize_articles(self, articles: List[Article]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Categorize articles.
        
        Args:
            articles (List[Article]): List of articles
            
        Returns:
            Dict[str, List[Dict[str, Any]]]: Categorized articles
        """
        # TODO: Implement actual categorization with LLM
        # This is a simplified placeholder implementation
        
        categories = {
            "politics": [],
            "crime": [],
            "business": [],
            "health": [],
            "other": []
        }
        
        for article in articles:
            # Simple keyword-based categorization for demo purposes
            title_lower = article.title.lower()
            content_lower = article.content.lower()
            
            category = "other"
            
            if any(word in title_lower or word in content_lower for word in ["mayor", "council", "governor", "vote", "election"]):
                category = "politics"
            elif any(word in title_lower or word in content_lower for word in ["crime", "arrest", "police", "shooting", "murder"]):
                category = "crime"
            elif any(word in title_lower or word in content_lower for word in ["business", "company", "market", "stock", "economy"]):
                category = "business"
            elif any(word in title_lower or word in content_lower for word in ["health", "hospital", "doctor", "covid", "virus"]):
                category = "health"
            
            categories[category].append({
                "title": article.title,
                "url": str(article.url),
                "source": article.source_name,
                "summary": article.summary if article.summary else ""
            })
        
        # Remove empty categories
        categories = {k: v for k, v in categories.items() if v}
        
        return categories
    
    def _generate_content(self, articles: List[Article], categories: Dict[str, List[Dict[str, Any]]], date: str) -> str:
        """
        Generate digest content.
        
        Args:
            articles (List[Article]): List of articles
            categories (Dict[str, List[Dict[str, Any]]]): Categorized articles
            date (str): Date in YYYY-MM-DD format
            
        Returns:
            str: Digest content
        """
        # TODO: Implement actual content generation with LLM
        # This is a simplified placeholder implementation
        
        content = f"# {self.city_code.title()} News Digest\n\n"
        content += f"Date: {date}\n\n"
        
        content += "## Summary\n\n"
        content += f"Today's digest includes {len(articles)} articles from various sources covering {self.city_code.title()}.\n\n"
        
        for category, category_articles in categories.items():
            content += f"## {category.title()}\n\n"
            
            for article in category_articles:
                content += f"### {article['title']}\n\n"
                content += f"Source: {article['source']}\n\n"
                content += f"{article['summary']}\n\n"
                content += f"[Read more]({article['url']})\n\n"
        
        return content
    
    def _generate_summary(self, articles: List[Article], date: str) -> str:
        """
        Generate digest summary.
        
        Args:
            articles (List[Article]): List of articles
            date (str): Date in YYYY-MM-DD format
            
        Returns:
            str: Digest summary
        """
        # TODO: Implement actual summary generation with LLM
        # This is a simplified placeholder implementation
        
        return f"This digest includes {len(articles)} articles about {self.city_code.title()} for {date}."
 