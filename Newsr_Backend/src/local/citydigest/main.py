#!/usr/bin/env python3
import argparse
import logging
import importlib
import sys
import os
from pathlib import Path

# Add the package to the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

# Import modules
from .config.cities import CITIES, get_city_config
from .digest.digest_generator import DigestGenerator
from .db.supabase_integration import SupabaseIntegration
from .scheduler.scheduler import CityScheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("citydigest.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("citydigest")

def list_available_cities():
    """List all configured cities"""
    print("Available Cities:")
    print("----------------")
    for code, config in CITIES.items():
        status = "ACTIVE" if config.get("active", False) else "INACTIVE"
        print(f"{code}: {config['name']}, {config['region']} ({status})")
    print()

def scrape_city(city_code, headless=True, output_dir=None):
    """Scrape news for a specific city"""
    try:
        # Use the factory method from BaseCityScraper
        from citydigest.scrapers.base_scraper import BaseCityScraper
        
        scraper = BaseCityScraper.create_scraper(
            city_code=city_code,
            headless=headless,
            output_dir=output_dir
        )
        
        try:
            # Initialize the driver
            scraper.init_driver()
            
            # Run the scraper
            articles = scraper.scrape_all_sources()
            
            logger.info(f"Scraped {len(articles)} articles for {scraper.city_name}")
            return True
            
        finally:
            # Always close the driver
            scraper.close_driver()
            
    except Exception as e:
        logger.error(f"Error scraping city {city_code}: {str(e)}")
        return False

def generate_digest(city_code, input_dir=None, output_dir=None, upload=False):
    """Generate news digest for a specific city"""
    city_config = get_city_config(city_code)
    if not city_config:
        logger.error(f"No configuration found for city: {city_code}")
        return False
    
    try:
        # Handle both relative and absolute paths
        if input_dir:
            # If it's a relative path and doesn't exist, try prepending the current directory
            if not os.path.isabs(input_dir) and not os.path.exists(input_dir):
                # Try from current directory
                alt_path = os.path.join(os.getcwd(), input_dir)
                if os.path.exists(alt_path):
                    input_dir = alt_path
                    logger.info(f"Using alternate path: {input_dir}")
        
        # Add debugging to check directory contents
        logger.info(f"Checking contents of directory: {input_dir}")
        if os.path.exists(input_dir):
            logger.info(f"Directory exists: {input_dir}")
            files = os.listdir(input_dir)
            logger.info(f"Files found: {files}")
        else:
            logger.error(f"Directory does not exist: {input_dir}")
            # Try to suggest where the files might be
            possible_dirs = [
                os.path.join(os.getcwd(), "output", f"{city_code}_news"),
                os.path.join(os.getcwd(), "..", "output", f"{city_code}_news"),
                os.path.join(os.getcwd(), "src", "local", "output", f"{city_code}_news")
            ]
            
            for dir_path in possible_dirs:
                if os.path.exists(dir_path):
                    logger.info(f"Found similar directory: {dir_path}")
                    logger.info(f"Try using: --input {dir_path}")
            return False
        
        # Set default output directory if not provided
        if not output_dir:
            output_dir = os.path.join("output", f"{city_code}_news")
        
        # Initialize digest generator
        digest_generator = DigestGenerator()
        
        # Generate digest
        digest_path = digest_generator.generate_from_directory(
            input_dir,
            city_code=city_code,
            output_dir=output_dir
        )
        
        if not digest_path:
            logger.warning(f"Failed to generate digest for {city_config['name']}")
            return False
        
        logger.info(f"Generated digest for {city_config['name']} at {digest_path}")
        
        # Upload to Supabase if requested
        if upload:
            try:
                logger.info(f"Uploading digest for {city_config['name']} to Supabase...")
                supabase = SupabaseIntegration()
                upload_success = supabase.upload_digest(digest_path, city_code)
                if upload_success:
                    logger.info(f"Successfully uploaded digest for {city_config['name']} to Supabase")
                else:
                    logger.error(f"Failed to upload digest for {city_config['name']} to Supabase")
            except Exception as e:
                logger.error(f"Error uploading digest to Supabase: {str(e)}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error generating digest for {city_config['name']}: {str(e)}")
        return False

def main():
    """Main entry point for the CityDigest system"""
    parser = argparse.ArgumentParser(description="CityDigest - Local News Digest System")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # List cities command
    list_parser = subparsers.add_parser("list", help="List available cities")
    
    # Scrape command
    scrape_parser = subparsers.add_parser("scrape", help="Scrape news for a city")
    scrape_parser.add_argument("city", help="City code to scrape")
    scrape_parser.add_argument("--visible", action="store_true", help="Run browser in visible mode")
    scrape_parser.add_argument("--output", help="Output directory")
    
    # Generate digest command
    digest_parser = subparsers.add_parser("digest", help="Generate digest for a city")
    digest_parser.add_argument("city", help="City code to generate digest for")
    digest_parser.add_argument("--input", help="Input directory with article files")
    digest_parser.add_argument("--output", default="digests", help="Output directory for digest")
    digest_parser.add_argument("--upload", action="store_true", help="Upload digest to Supabase")
    
    # Run scheduler command
    scheduler_parser = subparsers.add_parser("schedule", help="Run the scheduler")
    scheduler_parser.add_argument("--no-supabase", action="store_true", help="Disable Supabase integration")
    scheduler_parser.add_argument("--run-now", action="store_true", help="Run tasks immediately instead of scheduling")
    
    # Parse arguments
    args = parser.parse_args()
    
    # Execute appropriate command
    if args.command == "list":
        list_available_cities()
    elif args.command == "scrape":
        scrape_city(args.city, headless=not args.visible, output_dir=args.output)
    elif args.command == "digest":
        generate_digest(args.city, input_dir=args.input, output_dir=args.output, upload=args.upload)
    elif args.command == "schedule":
        scheduler = CityScheduler(use_supabase=not args.no_supabase)
        if args.run_now:
            scheduler.run_daily_tasks()
        else:
            scheduler.run_continuously()
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 