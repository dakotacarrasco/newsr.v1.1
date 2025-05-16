#!/usr/bin/env python3
import os
import time
import json
import logging
import random
import re
from datetime import datetime
from pathlib import Path
import importlib
from urllib.parse import urlparse

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup

# Import topic configuration system
from ..config.topics import TOPICS, get_topic_config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("topic_scraper")

class BaseTopicScraper:
    """Base class for topic-based news scrapers"""
    
    def __init__(self, topic_code, headless=True, output_dir=None):
        """Initialize the topic scraper with configuration"""
        self.topic_code = topic_code
        self.topic_config = get_topic_config(topic_code)
        
        if not self.topic_config:
            raise ValueError(f"No configuration found for topic: {topic_code}")
        
        self.topic_name = self.topic_config["name"]
        self.keywords = self.topic_config.get("keywords", [])
        self.sources = self.topic_config.get("sources", [])
        
        self.headless = headless
        self.driver = None
        
        # Set up output directory
        if output_dir:
            self.output_dir = output_dir
        else:
            today_str = datetime.now().strftime("%Y-%m-%d")
            self.output_dir = os.path.join("output", f"{topic_code}_news", today_str)
        
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Initialize the articles list
        self.articles = []
        
        # Initialize the webdriver
        self.initialize_driver()
    
    def initialize_driver(self):
        """Initialize the Selenium webdriver"""
        options = Options()
        
        if self.headless:
            options.add_argument("--headless")
        
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-notifications")
        options.add_argument("--disable-popup-blocking")
        
        # Add user agent
        options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36")
        
        self.driver = webdriver.Chrome(options=options)
        self.driver.set_page_load_timeout(30)
        
        logger.info("Initialized Chrome webdriver")
    
    def close_driver(self):
        """Close the webdriver"""
        if self.driver:
            self.driver.quit()
            self.driver = None
            logger.info("Closed Chrome webdriver")
    
    def is_relevant_to_topic(self, text):
        """Check if the text is relevant to the topic based on keywords"""
        if not text:
            return False
        
        # Convert to lowercase for case-insensitive matching
        text = text.lower()
        
        # Check if any of the keywords appear in the text
        for keyword in self.keywords:
            if keyword.lower() in text:
                return True
        
        return False
    
    def is_from_known_source(self, url):
        """Check if the URL is from a known source for this topic"""
        if not url:
            return False
        
        # Extract domain from URL
        domain = urlparse(url).netloc.lower()
        domain = domain.replace('www.', '')
        
        for source in self.sources:
            if source.lower() in domain:
                return True
        return False
    
    def scrape_all_sources(self):
        """Scrape articles from all relevant sources"""
        # This method should be implemented by specific topic scrapers
        logger.warning(f"Base scrape_all_sources method called for {self.topic_name}. Implement in subclass.")
        return []
    
    def save_articles(self):
        """Save articles to JSON file"""
        if not self.articles:
            logger.warning(f"No articles to save for {self.topic_name}")
            return
        
        # Convert Article objects to dictionaries
        articles_dict = [
            article if isinstance(article, dict) else article.__dict__ 
            for article in self.articles
        ]
        
        # Create filename
        source_slug = "general_sources"
        filename = f"{self.topic_code}_{source_slug}_articles.json"
        filepath = os.path.join(self.output_dir, filename)
        
        # Save to file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(articles_dict, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Saved {len(self.articles)} articles to {filepath}")
        
        return filepath
    
    def clean_text(self, text):
        """Clean text by removing extra whitespace and special characters"""
        if not text:
            return ""
        
        # Replace multiple spaces, newlines and tabs with a single space
        text = re.sub(r'\s+', ' ', text)
        
        # Remove leading/trailing whitespace
        text = text.strip()
        
        return text