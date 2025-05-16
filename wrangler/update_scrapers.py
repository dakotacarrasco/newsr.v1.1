#!/usr/bin/env python3
"""
Script to update all scrapers to work with the new CityDigest system.
This script converts scrapers from the old format to the new format.
"""

import os
import re
import glob
import shutil
from typing import List, Dict, Any

# Base directories
STATES_DIR = "citydigest_v2/services/scraper/scrapers/states"
CITIES_CONFIG = "citydigest_v2/shared/config/cities.py"

# Template for the new scraper format
NEW_SCRAPER_TEMPLATE = '''"""{{city_name}}-specific scrapers for CityDigest."""
from typing import List, Optional
from bs4 import BeautifulSoup

from shared.models.article import Article
from shared.utils.logging import setup_logging
from services.scraper.scrapers.base_scraper import BaseScraper

# Set up logging
logger = setup_logging("scraper")

class {{class_name}}(BaseScraper):
    """Scraper for {{source_name}}."""
    
    def __init__(self):
        """Initialize the scraper."""
        super().__init__(
            city_code="{{city_code}}",
            source_name="{{source_name}}",
            source_url="{{source_url}}"
        )
    
    def scrape(self) -> List[Article]:
        """
        Scrape articles from {{source_name}}.
        
        Returns:
            List[Article]: List of scraped articles
        """
        logger.info(f"Scraping {self.source_name}...")
        
        # Fetch the main page
        html = self.fetch_url(self.source_url)
        if not html:
            logger.error(f"Failed to fetch {self.source_url}")
            return []
        
        # Parse HTML
        soup = BeautifulSoup(html, 'html.parser')
        
        # Find article links (this is a simplified example)
        article_links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            # Customize the link detection logic
            if '{{article_url_pattern}}' in href:
                # Handle relative URLs
                if href.startswith('/'):
                    href = f"{self.source_url.rstrip('/')}{href}"
                article_links.append(href)
        
        # Remove duplicates
        article_links = list(set(article_links))
        
        # Limit to first 10 articles for demo purposes
        article_links = article_links[:10]
        
        # Parse each article
        articles = []
        for url in article_links:
            article = self.parse_article_with_newspaper(url)
            if article:
                # Save article to disk and upload to Supabase
                self.save_article(article)
                articles.append(article)
        
        logger.info(f"Scraped {len(articles)} articles from {self.source_name}")
        return articles
'''

def load_city_config() -> Dict[str, Dict[str, Any]]:
    """Load city configuration data."""
    city_config = {}
    
    # Read the config file
    with open(CITIES_CONFIG, 'r') as f:
        content = f.read()
    
    # Extract city codes and sources
    city_blocks = re.findall(r'"([^"]+)":\s*{\s*"name":\s*"([^"]+)",\s*"state":\s*"([^"]+)",\s*"sources":\s*\[(.*?)\]', content, re.DOTALL)
    
    for city_code, city_name, state, sources_block in city_blocks:
        # Extract sources
        sources = []
        source_matches = re.findall(r'{\s*"name":\s*"([^"]+)",\s*"url":\s*"([^"]+)",\s*"type":\s*"([^"]+)"\s*}', sources_block)
        
        for source_name, source_url, source_type in source_matches:
            sources.append({
                "name": source_name,
                "url": source_url,
                "type": source_type
            })
        
        city_config[city_code] = {
            "name": city_name,
            "state": state,
            "sources": sources
        }
    
    return city_config

def create_scraper_class_name(source_name: str) -> str:
    """Create a class name from a source name."""
    # Remove special characters and spaces
    clean_name = re.sub(r'[^a-zA-Z0-9]', ' ', source_name)
    
    # Title case and remove spaces
    return ''.join(word.capitalize() for word in clean_name.split())

def get_article_url_pattern(source_url: str) -> str:
    """Generate a pattern for article URLs based on the source URL."""
    domain = source_url.split('//')[1].split('/')[0]
    base_domain = '.'.join(domain.split('.')[-2:])
    
    if 'newspaper' in domain or 'tribune' in domain or 'times' in domain or 'post' in domain:
        return '/article/'
    elif 'tv' in domain or 'news' in domain:
        return '/news/'
    else:
        return domain

def clean_old_directories():
    """Clean old directories and prepare for new structure."""
    print("Cleaning old directories...")
    
    # First, check if the states directory exists
    if not os.path.exists(STATES_DIR):
        print("States directory does not exist. Creating it.")
        os.makedirs(STATES_DIR, exist_ok=True)
        return
    
    # Get all subdirectories in the states directory
    state_dirs = [d for d in os.listdir(STATES_DIR) if os.path.isdir(os.path.join(STATES_DIR, d))]
    
    for state_dir in state_dirs:
        state_path = os.path.join(STATES_DIR, state_dir)
        
        # Check if there are Python files directly in the state directory
        py_files = [f for f in os.listdir(state_path) if f.endswith('.py') and f != '__init__.py']
        
        if py_files:
            print(f"Found Python files in {state_path}. Moving to proper subdirectories.")
            
            # Create a temporary directory
            temp_dir = os.path.join(state_path, "temp")
            os.makedirs(temp_dir, exist_ok=True)
            
            # Move Python files to the temp directory
            for py_file in py_files:
                source_path = os.path.join(state_path, py_file)
                dest_path = os.path.join(temp_dir, py_file)
                shutil.move(source_path, dest_path)
                print(f"Moved {source_path} to {dest_path}")
            
            # We'll process these files later when generating new scrapers

def update_scrapers():
    """Update all scrapers to the new format."""
    # Clean old directories first
    clean_old_directories()
    
    city_config = load_city_config()
    
    for city_code, city_data in city_config.items():
        # Create state directory based on the state name
        state_name = city_data["state"].lower().replace(' ', '_')
        state_dir = os.path.join(STATES_DIR, state_name)
        os.makedirs(state_dir, exist_ok=True)
        
        # Create state __init__.py if it doesn't exist
        state_init_file = os.path.join(state_dir, "__init__.py")
        if not os.path.exists(state_init_file):
            with open(state_init_file, 'w') as f:
                f.write(f'"""Scrapers for {city_data["state"]}."""\n')
        
        # Create city directory
        city_dir = os.path.join(state_dir, city_code)
        os.makedirs(city_dir, exist_ok=True)
        
        # Create city __init__.py if it doesn't exist
        city_init_file = os.path.join(city_dir, "__init__.py")
        if not os.path.exists(city_init_file):
            with open(city_init_file, 'w') as f:
                f.write(f'"""Scrapers for {city_data["name"]}, {city_data["state"]}."""\n')
        
        # Create a scraper file for each source
        for source in city_data["sources"]:
            class_name = create_scraper_class_name(source["name"]) + "Scraper"
            source_name_underscore = source["name"].lower().replace(' ', '_')
            
            scraper_file = os.path.join(city_dir, f"{source_name_underscore}_scraper.py")
            
            # Generate article URL pattern
            article_url_pattern = get_article_url_pattern(source["url"])
            
            # Fill in the template
            scraper_content = NEW_SCRAPER_TEMPLATE.replace('{{city_name}}', city_data["name"])
            scraper_content = scraper_content.replace('{{class_name}}', class_name)
            scraper_content = scraper_content.replace('{{source_name}}', source["name"])
            scraper_content = scraper_content.replace('{{city_code}}', city_code)
            scraper_content = scraper_content.replace('{{source_url}}', source["url"])
            scraper_content = scraper_content.replace('{{article_url_pattern}}', article_url_pattern)
            
            # Write the scraper file
            with open(scraper_file, 'w') as f:
                f.write(scraper_content)
            
            print(f"Created scraper: {scraper_file}")
    
    print("\nAll scrapers have been updated to the new format.")
    print(f"Total cities: {len(city_config)}")
    print(f"Total sources: {sum(len(city_data['sources']) for city_data in city_config.values())}")

if __name__ == "__main__":
    update_scrapers() 