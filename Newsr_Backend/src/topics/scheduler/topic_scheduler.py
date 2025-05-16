#!/usr/bin/env python3
import os
import json
import logging
import glob
from datetime import datetime, timedelta
import schedule
import time
import threading
from pathlib import Path

# Import topic configuration system
from src.topics.config.topics import TOPICS, get_topic_config, get_active_topics, get_topics_by_frequency

# Import the new TopicDigestGenerator
from src.topics.digest.topic_digest_generator import TopicDigestGenerator

# Import database integration (assuming we'll adapt this for topics)
from src.topics.db.supabase_integration import SupabaseIntegration

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("topic_scheduler.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("topic_scheduler")

class TopicScheduler:
    def __init__(self, use_supabase=True):
        """Initialize the topic scheduler"""
        # Create necessary directories
        self.output_dir = os.path.join("output")
        self.digests_dir = os.path.join(self.output_dir, "topic_digests")
        
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.digests_dir, exist_ok=True)
        
        # Initialize digest generator
        self.digest_generator = TopicDigestGenerator()
        
        # Initialize Supabase integration if enabled
        self.use_supabase = use_supabase
        if use_supabase:
            try:
                self.supabase = SupabaseIntegration()
                logger.info("Initialized Supabase integration")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase integration: {str(e)}")
                self.use_supabase = False
        else:
            logger.info("Supabase integration disabled")
            self.supabase = None
    
    def run_continuously(self):
        """Run the scheduler continuously"""
        logger.info("Starting topic scheduler")
        
        # Schedule daily tasks
        schedule.every().day.at("06:00").do(self.run_daily_tasks)
        
        # Schedule special weekend summary
        schedule.every().sunday.at("08:00").do(self.run_weekend_summary)
        
        logger.info("Topic scheduler started")
        
        # Run in a separate thread to allow for KeyboardInterrupt
        cease_continuous_run = threading.Event()
        
        class ScheduleThread(threading.Thread):
            @classmethod
            def run(cls):
                while not cease_continuous_run.is_set():
                    schedule.run_pending()
                    time.sleep(60)
        
        continuous_thread = ScheduleThread()
        continuous_thread.start()
        
        try:
            # Keep the main thread alive
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Stopping topic scheduler")
            cease_continuous_run.set()
            continuous_thread.join()
            logger.info("Topic scheduler stopped")
    
    def run_daily_tasks(self):
        """Run daily tasks for all active topics"""
        logger.info("Running daily tasks for all active topics")
        
        # Get active topics
        active_topics = get_active_topics()
        
        for topic_code in active_topics:
            try:
                # Set up the output directory for today
                today = datetime.now()
                today_str = today.strftime("%Y-%m-%d")
                output_dir = os.path.join("output", f"{topic_code}_news", today_str)
                os.makedirs(output_dir, exist_ok=True)
                
                # Scrape news for the topic
                self.scrape_topic(topic_code, output_dir=output_dir)
                
                # Generate digest
                self.generate_digest_for_topic(topic_code, input_dir=output_dir)
                
            except Exception as e:
                logger.error(f"Error processing daily tasks for {topic_code}: {str(e)}")
        
        return True
    
    def run_weekend_summary(self):
        """Generate a summary of the week's news for each topic"""
        logger.info("Running weekend summary for all active topics")
        
        # Get active topics
        active_topics = get_active_topics()
        
        for topic_code in active_topics:
            try:
                # Calculate date range for the past week
                today = datetime.now()
                week_ago = today - timedelta(days=7)
                
                # Collect all articles from the past week
                week_articles = []
                
                # Look through directories for the past 7 days
                for i in range(7):
                    date = today - timedelta(days=i)
                    date_str = date.strftime("%Y-%m-%d")
                    date_dir = os.path.join("output", f"{topic_code}_news", date_str)
                    
                    if os.path.exists(date_dir):
                        articles = self.digest_generator.load_articles_from_directory(date_dir)
                        week_articles.extend(articles)
                
                if not week_articles:
                    logger.warning(f"No articles found for {topic_code} in the past week")
                    continue
                
                # Generate a weekly digest
                topic_config = get_topic_config(topic_code)
                digest = self.digest_generator.generate_digest_for_topic(week_articles, topic_code, topic_config)
                
                if digest:
                    # Add weekly indicator to the digest
                    digest["is_weekly"] = True
                    digest["date_range"] = f"{week_ago.strftime('%Y-%m-%d')} to {today.strftime('%Y-%m-%d')}"
                    
                    # Save the digest
                    filename = f"{topic_code}_weekly_{today.strftime('%Y-%m-%d')}.json"
                    filepath = os.path.join(self.digests_dir, filename)
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        json.dump(digest, f, ensure_ascii=False, indent=2)
                    
                    logger.info(f"Saved weekly digest for {topic_config['name']} to {filepath}")
                    
                    # Upload to Supabase if enabled
                    if self.use_supabase:
                        try:
                            self.supabase.upload_digest(digest, topic_code)
                            logger.info(f"Uploaded weekly digest for {topic_config['name']} to Supabase")
                        except Exception as e:
                            logger.error(f"Failed to upload weekly digest to Supabase: {str(e)}")
                
            except Exception as e:
                logger.error(f"Error generating weekly digest for {topic_code}: {str(e)}")
        
        return True
    
    def scrape_topic(self, topic_code, output_dir=None):
        """Scrape news for a topic"""
        try:
            # Import here to avoid circular imports
            from ..scrapers.base_topic_scraper import BaseTopicScraper
            
            # Create the topic scraper
            scraper = BaseTopicScraper.create_scraper(
                topic_code=topic_code,
                headless=True,
                output_dir=output_dir
            )
            
            try:
                # Initialize the driver
                scraper.init_driver()
                
                # Run the scraper
                articles = scraper.scrape_all_sources()
                
                logger.info(f"Scraped {len(articles)} articles for {scraper.topic_name}")
                return True
                
            finally:
                # Always close the driver
                scraper.close_driver()
                
        except Exception as e:
            logger.error(f"Error scraping topic {topic_code}: {str(e)}")
            return False
    
   # ... continuing from previous code ...

    def generate_digest_for_topic(self, topic_code, input_dir=None):
        """Generate a digest for a specific topic"""
        try:
            # Get topic configuration
            topic_config = get_topic_config(topic_code)
            if not topic_config:
                logger.error(f"No configuration found for topic: {topic_code}")
                return False
            
            logger.info(f"Generating digest for {topic_config['name']}")
            
            # Initialize articles list
            articles = []
            
            # Try to load articles from input directory
            if input_dir and os.path.exists(input_dir):
                articles = self.digest_generator.load_articles_from_directory(input_dir)
            
            # If no articles found and we have Supabase integration, try to get from database
            if not articles and self.use_supabase:
                try:
                    db_articles = self.supabase.get_recent_articles_by_topic(topic_code)
                    if db_articles:
                        articles = db_articles
                        logger.info(f"Loaded {len(articles)} articles for {topic_config['name']} from database")
                except Exception as e:
                    logger.error(f"Error loading articles from database: {str(e)}")
            
            # If still no articles, use a fallback
            if not articles:
                logger.warning(f"No articles found for {topic_code} even after scraping. Using fallback.")
                articles = [{
                    'url': 'https://example.com/fallback',
                    'title': f'No News Available for {topic_config["name"]}',
                    'content': f'No news articles were found for {topic_config["name"]} today. This is a placeholder digest.',
                    'source': 'System Message'
                }]
            
            # Generate the digest
            digest = self.digest_generator.generate_digest_for_topic(articles, topic_code, topic_config)
            
            if not digest:
                logger.error(f"Failed to generate digest for {topic_code}")
                return False
            
            # Save the digest locally
            digest_date = datetime.now().strftime("%Y-%m-%d")
            digest_filename = f"{topic_code}_digest_{digest_date}.json"
            digest_path = os.path.join(self.digests_dir, digest_filename)
            
            os.makedirs(os.path.dirname(digest_path), exist_ok=True)
            with open(digest_path, 'w', encoding='utf-8') as f:
                json.dump(digest, f, ensure_ascii=False, indent=2)
            
            logger.info(f"Saved digest to {digest_path}")
            
            # Upload to Supabase if enabled
            if self.use_supabase:
                try:
                    self.supabase.upload_digest(digest, topic_code)
                    logger.info(f"Uploaded digest for {topic_config['name']} to Supabase")
                except Exception as e:
                    logger.error(f"Failed to upload digest to Supabase: {str(e)}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error generating digest for {topic_code}: {str(e)}")
            return False
    
    def run_once(self, topic_code=None):
        """Run the scheduler once for specified topic or all topics"""
        if topic_code:
            # Run for specific topic
            topic_config = get_topic_config(topic_code)
            if not topic_config:
                logger.error(f"No configuration found for topic: {topic_code}")
                return False
            
            logger.info(f"Processing topic: {topic_config['name']}")
            
            # Set up output directory
            today_str = datetime.now().strftime("%Y-%m-%d")
            output_dir = os.path.join("output", f"{topic_code}_news", today_str)
            os.makedirs(output_dir, exist_ok=True)
            
            # Scrape news for this topic
            self.scrape_topic(topic_code, output_dir=output_dir)
            
            # Generate digest
            return self.generate_digest_for_topic(topic_code, input_dir=output_dir)
        else:
            # Run for all active topics
            success = True
            for topic in get_active_topics():
                if not self.run_once(topic):
                    success = False
            return success


def main():
    """Main entry point for the topic scheduler"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Topic-based news scheduler")
    parser.add_argument("--run-now", action="store_true", help="Run scheduler immediately")
    parser.add_argument("--topic", help="Process specific topic")
    parser.add_argument("--no-supabase", action="store_true", help="Disable Supabase integration")
    parser.add_argument("--continuous", action="store_true", help="Run scheduler continuously")
    
    args = parser.parse_args()
    
    # Initialize scheduler
    use_supabase = not args.no_supabase
    scheduler = TopicScheduler(use_supabase=use_supabase)
    
    if args.run_now:
        if args.topic:
            scheduler.run_once(args.topic)
        else:
            scheduler.run_once()
    
    if args.continuous:
        scheduler.run_continuously()


if __name__ == "__main__":
    main()