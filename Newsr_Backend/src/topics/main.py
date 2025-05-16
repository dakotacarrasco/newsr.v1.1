#!/usr/bin/env python3
import os
import sys
import argparse
import logging
import importlib
import glob
from datetime import datetime
from pathlib import Path
import json
from .rewrite.article_rewriter import ArticleRewriter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("topics_cli")

def scrape_topic(topic_code, output_dir=None, upload=False):
    """Scrape news for a specific topic"""
    from .config.topics import get_topic_config
    
    topic_config = get_topic_config(topic_code)
    if not topic_config:
        logger.error(f"No configuration found for topic: {topic_code}")
        return False
    
    # Set up output directory
    if not output_dir:
        today_str = datetime.now().strftime("%Y-%m-%d")
        output_dir = os.path.join("output", f"{topic_code}_news", today_str)
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Get scraper class name
    scraper_class_name = topic_config.get("scraper_class")
    if not scraper_class_name:
        logger.error(f"No scraper class defined for topic: {topic_code}")
        return False
    
    try:
        # Dynamically import the scraper class based on topic
        if topic_code == "politics":
            # Direct import for politics
            from .scrapers.politics.politics_scraper import PoliticsNewsScraper
            scraper_class = PoliticsNewsScraper
        else:
            # Try importing from scrapers module dynamically
            try:
                # First try nested directory structure
                module_name = f".scrapers.{topic_code}.{topic_code}_scraper"
                module = importlib.import_module(module_name, package="src.topics")
                scraper_class = getattr(module, scraper_class_name)
            except ModuleNotFoundError:
                # Fall back to flat structure
                module_name = f".scrapers.{topic_code}_scraper"
                module = importlib.import_module(module_name, package="src.topics")
                scraper_class = getattr(module, scraper_class_name)
        
        # Create scraper instance
        scraper = scraper_class(topic_code=topic_code, headless=True, output_dir=output_dir)
        
        try:
            # Scrape news
            articles = scraper.scrape_all_sources()
            
            if not articles:
                logger.warning(f"No articles found for {topic_config['name']}")
                return False
            
            logger.info(f"Scraped {len(articles)} articles for {topic_config['name']}")
            
            # Upload articles to Supabase if requested
            if upload:
                try:
                    from .db.supabase_integration import SupabaseIntegration
                    
                    # Create Supabase client
                    supabase = SupabaseIntegration()
                    
                    # Upload articles
                    for article in articles:
                        supabase.upload_article(article, topic_code)
                    logger.info(f"Uploaded {len(articles)} articles for {topic_config['name']} to Supabase")
                    
                except Exception as e:
                    logger.error(f"Failed to upload articles to Supabase: {str(e)}")
                    return False
            
            return True
            
        finally:
            # Always close the driver
            scraper.close_driver()
            
    except Exception as e:
        logger.error(f"Error scraping topic {topic_code}: {str(e)}")
        return False

def generate_digest(topic_code, input_dir=None, output_dir=None, upload=False):
    """Generate news digest for a specific topic"""
    from .config.topics import get_topic_config
    from .digest.topic_digest_generator import TopicDigestGenerator
    
    topic_config = get_topic_config(topic_code)
    if not topic_config:
        logger.error(f"No configuration found for topic: {topic_code}")
        return False
    
    try:
        # Handle input directory paths
        if input_dir:
            if not os.path.isabs(input_dir) and not os.path.exists(input_dir):
                alt_path = os.path.join(os.getcwd(), input_dir)
                if os.path.exists(alt_path):
                    input_dir = alt_path
        
        # Default input directory if not provided
        if not input_dir or not os.path.exists(input_dir):
            today_str = datetime.now().strftime("%Y-%m-%d")
            input_dir = os.path.join("output", f"{topic_code}_news", today_str)
            
            # Check if input directory exists
            if not os.path.exists(input_dir):
                logger.error(f"Input directory does not exist: {input_dir}")
                return False
        
        # Set default output directory if not provided
        if not output_dir:
            output_dir = os.path.join("output", "digests")
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # Initialize digest generator
        digest_generator = TopicDigestGenerator()
        
        # Generate digest from the input directory
        result = digest_generator.generate_from_directory(input_dir, topic_code, output_dir)
        
        if not result:
            logger.error(f"Failed to generate digest for {topic_code}")
            return False
        
        logger.info(f"Generated digest for {topic_config['name']}")
        
        # Upload to Supabase if requested
        if upload:
            try:
                from .db.supabase_integration import SupabaseIntegration
                
                # Load the digest file
                with open(result, 'r', encoding='utf-8') as f:
                    digest = json.load(f)
                
                # Create Supabase client
                supabase = SupabaseIntegration()
                
                # Upload digest
                supabase.upload_digest(digest, topic_code)
                logger.info(f"Uploaded digest for {topic_config['name']} to Supabase")
                
            except Exception as e:
                logger.error(f"Failed to upload digest to Supabase: {str(e)}")
                return False
        
        return True
        
    except Exception as e:
        logger.error(f"Error generating digest: {str(e)}")
        return False

def run_scheduler(run_now=False, topic_code=None, continuous=False, use_supabase=True):
    """Run the topic scheduler"""
    try:
        from .scheduler.topic_scheduler import TopicScheduler
        
        # Create scheduler
        scheduler = TopicScheduler(use_supabase=use_supabase)
        
        if run_now:
            if topic_code:
                success = scheduler.run_once(topic_code)
                logger.info(f"Scheduler ran once for topic {topic_code}: {'Success' if success else 'Failed'}")
            else:
                success = scheduler.run_once()
                logger.info(f"Scheduler ran once for all topics: {'Success' if success else 'Failed'}")
        
        if continuous:
            scheduler.run_continuously()
            # This will run indefinitely until interrupted
        
        return True
        
    except Exception as e:
        logger.error(f"Error running scheduler: {str(e)}")
        return False

def rewrite_articles(topic_code, input_dir=None, upload=True):
    """Rewrite already scraped articles for a specific topic"""
    from .config.topics import get_topic_config
    from .db.supabase_integration import SupabaseIntegration
    
    # Get topic configuration
    topic_config = get_topic_config(topic_code)
    if not topic_config:
        logger.error(f"No configuration found for topic: {topic_code}")
        return False
    
    topic_name = topic_config.get("name", topic_code)
    logger.info(f"Rewriting articles for topic: {topic_name}")
    
    # Set default input directory if not provided
    if not input_dir:
        current_date = datetime.now().strftime("%Y-%m-%d")
        input_dir = os.path.join("output", f"{topic_code}_news", current_date)
    
    # Ensure input directory exists
    if not os.path.exists(input_dir):
        logger.error(f"Input directory does not exist: {input_dir}")
        return False
    
    try:
        # Load articles from files in the directory
        articles = []
        json_files = glob.glob(os.path.join(input_dir, "*.json"))
        
        for file_path in json_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Handle both list and dict formats
                if isinstance(data, list):
                    articles.extend(data)
                elif isinstance(data, dict) and "articles" in data:
                    articles.extend(data["articles"])
                elif isinstance(data, dict):
                    # Add single article
                    articles.append(data)
            except Exception as e:
                logger.error(f"Error loading {file_path}: {str(e)}")
        
        if not articles:
            logger.warning(f"No articles found in {input_dir}")
            return False
        
        logger.info(f"Found {len(articles)} articles to process for rewriting")
        
        # Initialize rewriter
        rewriter = ArticleRewriter()
        
        # Initialize Supabase integration if uploading
        supabase = None
        if upload:
            supabase = SupabaseIntegration()
        
        # Rewrite and upload articles
        rewritten_articles = rewriter.rewrite_and_upload(articles, supabase)
        
        logger.info(f"Successfully rewrote and uploaded {len(rewritten_articles)} articles")
        
        return len(rewritten_articles) > 0
        
    except Exception as e:
        logger.error(f"Error rewriting articles: {str(e)}")
        return False

def main():
    """Main entry point for Topics CLI"""
    parser = argparse.ArgumentParser(description="Topics - A topic-based news aggregation system")
    
    # Main subcommands
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Scrape command
    scrape_parser = subparsers.add_parser("scrape", help="Scrape news for a topic")
    scrape_parser.add_argument("topic", help="Topic code to scrape")
    scrape_parser.add_argument("--output", help="Output directory for scraped articles")
    scrape_parser.add_argument("--upload", action="store_true", help="Upload scraped articles to Supabase")
    
    # Digest command
    digest_parser = subparsers.add_parser("digest", help="Generate digest for a topic")
    digest_parser.add_argument("topic", help="Topic code to generate digest for")
    digest_parser.add_argument("--input", help="Input directory containing articles")
    digest_parser.add_argument("--output", help="Output directory for generated digest")
    digest_parser.add_argument("--upload", action="store_true", help="Upload digest to Supabase")
    
    # Rewrite command (NEW)
    rewrite_parser = subparsers.add_parser("rewrite", help="Rewrite scraped articles in various styles")
    rewrite_parser.add_argument("topic", help="Topic code to rewrite articles for")
    rewrite_parser.add_argument("--input", help="Input directory containing scraped articles")
    rewrite_parser.add_argument("--no-upload", action="store_true", help="Do not upload rewritten articles to Supabase")
    
    # Scheduler command
    scheduler_parser = subparsers.add_parser("scheduler", help="Run topic scheduler")
    scheduler_parser.add_argument("--run-now", action="store_true", help="Run scheduler immediately")
    scheduler_parser.add_argument("--topic", help="Process specific topic")
    scheduler_parser.add_argument("--continuous", action="store_true", help="Run scheduler continuously")
    scheduler_parser.add_argument("--no-supabase", action="store_true", help="Disable Supabase integration")
    
    # Parse arguments
    args = parser.parse_args()
    
    # Handle commands
    if args.command == "scrape":
        success = scrape_topic(args.topic, args.output, args.upload)
        sys.exit(0 if success else 1)
    
    elif args.command == "digest":
        success = generate_digest(args.topic, args.input, args.output, args.upload)
        sys.exit(0 if success else 1)
    
    elif args.command == "rewrite":  # NEW command handler
        success = rewrite_articles(args.topic, args.input, not args.no_upload)
        sys.exit(0 if success else 1)
    
    elif args.command == "scheduler":
        success = run_scheduler(args.run_now, args.topic, args.continuous, not args.no_supabase)
        sys.exit(0 if success else 1)
    
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()