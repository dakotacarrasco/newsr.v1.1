#!/usr/bin/env python3
import os
import time
import json
import logging
import schedule
import argparse
from pathlib import Path
from datetime import datetime, timedelta
import importlib
import glob

# Import from city configuration
from ..config.cities import CITIES, get_active_cities, get_cities_by_frequency
from ..digest.digest_generator import DigestGenerator
from ..db.supabase_integration import SupabaseIntegration
from ..models.article import Article

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scheduler.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("city_scheduler")

class CityScheduler:
    def __init__(self, use_supabase=True):
        """Initialize the City Scheduler"""
        self.use_supabase = use_supabase
        
        # Initialize digest generator
        self.digest_generator = DigestGenerator()
        
        # Initialize Supabase integration if enabled
        if self.use_supabase:
            try:
                self.supabase = SupabaseIntegration()
            except Exception as e:
                logger.error(f"Error initializing Supabase: {str(e)}")
                self.use_supabase = False
        
        # Create standard output directories with consistent paths
        self.project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
        self.output_dir = os.path.join(self.project_root, "src", "local", "output")
        self.digests_dir = os.path.join(self.project_root, "digests")
        
        # Ensure directories exist
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.digests_dir, exist_ok=True)
        
        logger.info("City Scheduler initialized")
    
    def get_previous_urls(self, city_code, days=1):
        """Get URLs from previous days to avoid duplication"""
        urls = set()
        
        # Look for URLs in previous day directories
        for i in range(1, days+1):
            day = datetime.now() - timedelta(days=i)
            day_str = day.strftime("%Y-%m-%d")
            
            # Check regular output directory
            url_files = [
                os.path.join("output", f"{city_code}_news", day_str, "*_urls.json"),
                os.path.join("output", f"{city_code}_news", "*_urls.json"),
                os.path.join("output", f"{city_code}_continuous", day_str, "*_urls.json")
            ]
            
            for pattern in url_files:
                for file_path in glob.glob(pattern):
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            file_urls = json.load(f)
                            if isinstance(file_urls, list):
                                urls.update(file_urls)
                    except Exception as e:
                        logger.error(f"Error loading URLs from {file_path}: {str(e)}")
        
        return urls
    
    def get_scraper_module(self, city_code, city_config):
        """Get the correct scraper module based on the city's region"""
        region = city_config['region'].lower().replace(' ', '_')
        try:
            return importlib.import_module(
                f"..scrapers.states.{region}.{city_code}_scraper",
                package=__package__
            )
        except ImportError as e:
            raise ImportError(f"Could not import scraper for {city_code} from {region}: {str(e)}")
    
    def scrape_city(self, city_code, output_dir=None, target_date=None):
        """Scrape news for a specific city with duplication prevention"""
        # Get previously seen URLs to avoid
        previous_urls = self.get_previous_urls(city_code, days=2)
        
        city_config = CITIES.get(city_code)
        if not city_config:
            logger.error(f"No configuration found for city: {city_code}")
            return False
        
        if not city_config.get("active", False):
            logger.warning(f"City {city_code} is not active, skipping")
            return False
        
        try:
            # Dynamically import the city-specific scraper class
            scraper_module = self.get_scraper_module(city_code, city_config)
            scraper_class = getattr(scraper_module, city_config["scraper_class"])
            
            # Initialize and run the scraper
            if output_dir is None:
                output_dir = os.path.join(self.output_dir, f"{city_code}_news")
            
            # Ensure output directory exists
            os.makedirs(output_dir, exist_ok=True)
            
            # Initialize scraper with Supabase if enabled
            scraper = scraper_class(
                headless=True,
                output_dir=output_dir,
                timeout=30,
                retry_count=2,
                use_supabase=self.use_supabase,
                supabase_client=self.supabase.client if self.use_supabase else None,
                safe_json_handling=True
            )
            
            # Run the scraper
            articles = scraper.scrape_all_sources()
            
            # Log successful scrape
            logger.info(f"Successfully scraped {len(articles)} articles for {city_config['name']}")
            
            # Return success
            return True
        except Exception as e:
            logger.error(f"Error scraping {city_code}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return False
    
    def generate_digest_for_city(self, city_code, input_dir=None):
        """Generate a digest for a specific city"""
        try:
            # Get city configuration
            city_config = CITIES.get(city_code)
            if not city_config:
                logger.error(f"No configuration found for city: {city_code}")
                return False
            
            logger.info(f"Generating digest for {city_config['name']}")
            
            # Initialize articles list
            articles = []
            
            # Try to get articles from Supabase first if enabled
            if self.use_supabase:
                logger.info(f"Attempting to retrieve articles from Supabase for {city_code}")
                db_articles = self.supabase.get_unused_articles_for_city(city_code)
                
                if db_articles:
                    # Convert dictionaries to Article objects
                    for article_dict in db_articles:
                        article = Article(
                            url=article_dict.get('url', ''),
                            title=article_dict.get('title', ''),
                            content=article_dict.get('content_preview', ''),
                            author=article_dict.get('author', ''),
                            published_date=article_dict.get('published_date', ''),
                            source=article_dict.get('source', ''),
                            category=article_dict.get('category', 'news'),
                            city=city_config.get('name', ''),
                            region=city_config.get('region', '')
                        )
                        articles.append(article)
                    
                    logger.info(f"Retrieved {len(articles)} articles from Supabase for {city_code}")
            
            # If no articles from Supabase or not using Supabase, try local files
            if not articles:
                # Determine input directory
                if input_dir is None:
                    input_dir = os.path.join(self.output_dir, f"{city_code}_news")
                
                # Ensure the directory exists
                if not os.path.exists(input_dir):
                    logger.error(f"Input directory does not exist: {input_dir}")
                    os.makedirs(input_dir, exist_ok=True)
                
                # Check if there are any articles in the directory before proceeding
                article_pattern = os.path.join(input_dir, "*_articles.json")
                article_files = glob.glob(article_pattern)
                combined_file = os.path.join(input_dir, f"all_{city_code}_articles.json")
                
                # If no articles found, try to scrape them first
                if not article_files and not os.path.exists(combined_file):
                    logger.warning(f"No articles found for {city_code}. Attempting to scrape articles first.")
                    scrape_success = self.scrape_city(city_code, output_dir=input_dir)
                    if not scrape_success:
                        logger.error(f"Failed to scrape articles for {city_code}")
                        # Create a sample article to avoid empty digest
                        sample_article = {
                            'url': 'https://example.com/sample',
                            'title': f'Sample Article for {city_config["name"]}',
                            'content': f'This is a sample article for {city_config["name"]} to demonstrate the digest format.',
                            'source': 'Sample News Source',
                            'city': city_config["name"],
                            'region': city_config["region"]
                        }
                        sample_file = os.path.join(input_dir, f"sample_{city_code}_articles.json")
                        os.makedirs(os.path.dirname(sample_file), exist_ok=True)
                        with open(sample_file, 'w') as f:
                            json.dump([sample_article], f)
                
                # Load articles
                articles = self.digest_generator.load_articles_from_directory(input_dir)
                logger.info(f"Loaded {len(articles)} articles for {city_config['name']}")
                
                # If still no articles, use a fallback
                if not articles:
                    logger.warning(f"No articles found for {city_code} even after scraping. Using fallback.")
                    articles = [{
                        'url': 'https://example.com/fallback',
                        'title': f'No News Available for {city_config["name"]}',
                        'content': f'No news articles were found for {city_config["name"]} today. This is a placeholder digest.',
                        'source': 'System Message',
                        'city': city_config["name"],
                        'region': city_config["region"]
                    }]
            
            # Generate the digest
            digest = self.digest_generator.generate_digest_for_city(articles, city_code, city_config)
            
            if not digest:
                logger.error(f"Failed to generate digest for {city_code}")
                return False
            
            # Save the digest locally
            digest_date = datetime.now().strftime("%Y-%m-%d")
            digest_filename = f"{city_code}_digest_{digest_date}.json"
            digest_path = os.path.join(self.digests_dir, digest_filename)
            
            os.makedirs(os.path.dirname(digest_path), exist_ok=True)
            with open(digest_path, 'w', encoding='utf-8') as f:
                json.dump(digest, f, ensure_ascii=False, indent=2)
            
            logger.info(f"Saved digest to {digest_path}")
            
            # Upload to Supabase if enabled
            if self.use_supabase:
                try:
                    upload_success = self.supabase.upload_digest(digest, city_code)
                    if upload_success:
                        logger.info(f"Successfully uploaded digest for {city_config['name']} to Supabase")
                        
                        # Get the digest ID from Supabase
                        latest_digest = self.supabase.get_latest_digest(city_code)
                        if latest_digest and 'id' in latest_digest:
                            digest_id = latest_digest['id']
                            
                            # Archive the articles used in the digest
                            self.supabase.store_articles(articles, city_code, is_used=True, digest_id=digest_id)
                            logger.info(f"Archived {len(articles)} articles used in digest {digest_id}")
                    else:
                        logger.error(f"Failed to upload digest for {city_config['name']} to Supabase")
                except Exception as e:
                    logger.error(f"Error uploading digest to Supabase: {str(e)}")
                    import traceback
                    logger.error(traceback.format_exc())
            
            return True
        except Exception as e:
            logger.error(f"Error generating digest for {city_code}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return False
    
    def run_weekday_tasks(self, include_weekend=False):
        """Run weekday scraping and digest generation tasks"""
        logger.info(f"Running weekday tasks {'with weekend recap' if include_weekend else ''}")
        
        # Get cities with daily frequency
        daily_cities = get_cities_by_frequency("daily")
        
        for city_code in daily_cities:
            try:
                success = False
                
                # For Monday, include weekend news (scrape if needed)
                if include_weekend:
                    weekend_output_dir = os.path.join("output", f"{city_code}_weekend_news")
                    os.makedirs(weekend_output_dir, exist_ok=True)
                    
                    # Get weekend dates
                    today = datetime.now()
                    saturday = today - timedelta(days=2)
                    sunday = today - timedelta(days=1)
                    weekend_dates = [saturday, sunday]
                    
                    # Add weekend scraping and capture success state
                    for date in weekend_dates:
                        date_str = date.strftime("%Y-%m-%d")
                        specific_output_dir = os.path.join(weekend_output_dir, date_str)
                        os.makedirs(specific_output_dir, exist_ok=True)
                        
                        # Scrape news for this specific date (focus on weekend content)
                        success |= self.scrape_city(city_code, output_dir=specific_output_dir, target_date=date)
                    
                    # Generate digest including weekend content
                    if success:
                        self.generate_digest_for_city(city_code, input_dir=weekend_output_dir)
                
                # Now handle regular weekday scraping
                yesterday = datetime.now() - timedelta(days=1)
                yesterday_str = yesterday.strftime("%Y-%m-%d")
                weekday_output_dir = os.path.join("output", f"{city_code}_news", yesterday_str)
                os.makedirs(weekday_output_dir, exist_ok=True)
                
                # Scrape news focused on previous day
                scrape_success = self.scrape_city(city_code, output_dir=weekday_output_dir, 
                                                target_date=yesterday)
                
                if scrape_success:
                    # Generate digest
                    self.generate_digest_for_city(city_code, input_dir=weekday_output_dir)
                
            except Exception as e:
                logger.error(f"Error processing daily tasks for {city_code}: {str(e)}")
    
    def scrape_without_digest(self):
        """Scrape cities continuously throughout the day without generating digests"""
        logger.info("Running continuous scraping")
        
        # Get active cities
        active_cities = get_active_cities()
        
        for city_code in active_cities:
            try:
                # Use today's date for continuous scraping
                today = datetime.now()
                today_str = today.strftime("%Y-%m-%d")
                scraping_output_dir = os.path.join("output", f"{city_code}_continuous", today_str)
                os.makedirs(scraping_output_dir, exist_ok=True)
                
                # Scrape without generating digest
                self.scrape_city(city_code, output_dir=scraping_output_dir, target_date=today)
                
            except Exception as e:
                logger.error(f"Error in continuous scraping for {city_code}: {str(e)}")
    
    def schedule_tasks(self):
        """Schedule recurring tasks"""
        # Schedule weekday digests (Mon-Fri) at 7 AM to ensure 9 AM delivery
        schedule.every().monday.at("07:00").do(self.run_weekday_tasks, include_weekend=True)
        schedule.every().tuesday.at("07:00").do(self.run_weekday_tasks)
        schedule.every().wednesday.at("07:00").do(self.run_weekday_tasks)
        schedule.every().thursday.at("07:00").do(self.run_weekday_tasks)
        schedule.every().friday.at("07:00").do(self.run_weekday_tasks)
        
        # Schedule continuous scraping throughout the day
        for hour in [9, 12, 15, 18, 21]:
            schedule.every().day.at(f"{hour:02d}:00").do(self.scrape_without_digest)
        
        # Add daily archiving at midnight
        schedule.every().day.at("00:05").do(self.archive_old_digests)
        
        logger.info("Tasks scheduled")
    
    def run_continuously(self):
        """Run the scheduler continuously"""
        self.schedule_tasks()
        
        logger.info("Starting scheduler loop")
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def archive_old_digests(self):
        """Archive digests that are older than the threshold (1 day)"""
        if not self.use_supabase:
            return
        
        try:
            # Calculate the cutoff date (digests older than this should be archived)
            cutoff_date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            
            # Fetch active digests older than the cutoff date
            result = self.supabase.client.table('city_digests') \
                .select('id') \
                .eq('status', 'active') \
                .lt('date', cutoff_date) \
                .execute()
            
            if not result.data:
                logger.info("No digests to archive")
                return
            
            # Archive each digest
            for digest in result.data:
                self.supabase.archive_digest(digest['id'])
            
            logger.info(f"Archived {len(result.data)} old digests")
            
        except Exception as e:
            logger.error(f"Error in digest archiving process: {str(e)}")

    def run_daily_tasks(self):
        """Run daily tasks for all active cities - this is an alias for run_weekday_tasks for backward compatibility"""
        logger.info("Running daily tasks for all active cities")
        
        # Get active cities
        active_cities = get_active_cities()
        
        for city_code in active_cities:
            try:
                # Determine if this is a Monday to include weekend content
                today = datetime.now()
                is_monday = today.weekday() == 0
                
                if is_monday:
                    # If Monday, include weekend content
                    self.run_weekday_tasks(include_weekend=True)
                else:
                    # Regular weekday processing
                    yesterday = datetime.now() - timedelta(days=1)
                    yesterday_str = yesterday.strftime("%Y-%m-%d")
                    output_dir = os.path.join("output", f"{city_code}_news", yesterday_str)
                    os.makedirs(output_dir, exist_ok=True)
                    
                    # Scrape news focused on previous day
                    scrape_success = self.scrape_city(city_code, output_dir=output_dir, 
                                                   target_date=yesterday)
                    
                    if scrape_success:
                        # Generate digest
                        self.generate_digest_for_city(city_code, input_dir=output_dir)
                    
            except Exception as e:
                logger.error(f"Error processing daily tasks for {city_code}: {str(e)}")
        
        return True

def main():
    """Main entry point for the City Scheduler"""
    parser = argparse.ArgumentParser(description="Schedule city scraping and digest generation")
    parser.add_argument("--no-supabase", action="store_true", help="Disable Supabase integration")
    parser.add_argument("--run-now", action="store_true", help="Run tasks immediately instead of scheduling")
    parser.add_argument("--city", type=str, help="Run tasks for a specific city")
    parser.add_argument("--scrape-only", action="store_true", help="Only scrape, don't generate digest")
    parser.add_argument("--digest-only", action="store_true", help="Only generate digest, don't scrape")
    parser.add_argument("--archive-all", action="store_true", help="Archive all active digests")
    args = parser.parse_args()
    
    # Initialize the scheduler
    scheduler = CityScheduler(use_supabase=not args.no_supabase)
    
    if args.archive_all:
        logger.info("Archiving all active digests")
        scheduler.archive_old_digests()
        return
    
    if args.run_now:
        if args.city:
            # Run tasks for a specific city
            if not args.digest_only:
                scheduler.scrape_city(args.city)
            if not args.scrape_only:
                scheduler.generate_digest_for_city(args.city)
        else:
            # Run tasks for all active cities
            scheduler.run_weekday_tasks()
    else:
        # Run scheduler continuously
        scheduler.run_continuously()

if __name__ == "__main__":
    main() 