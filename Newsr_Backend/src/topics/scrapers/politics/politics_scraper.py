#!/usr/bin/env python3
from src.topics.scrapers.base_topic_scraper import BaseTopicScraper
import logging
import time
from datetime import datetime
from bs4 import BeautifulSoup
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from urllib.parse import urlparse

# Configure logging
logger = logging.getLogger("politics_scraper")

class PoliticsNewsScraper(BaseTopicScraper):
    """Specialized scraper for political news"""
    
    def __init__(self, topic_code="politics", headless=True, output_dir=None):
        super().__init__(topic_code, headless, output_dir)
        
        # Expanded list of specialized sources for politics news
        self.specialized_sources = [
            # Original sources
            "https://www.politico.com/",
            "https://thehill.com/",
            "https://www.rollcall.com/",
            "https://www.washingtonpost.com/politics/",
            "https://www.nytimes.com/section/politics",
            
            # Additional mainstream sources
            "https://www.foxnews.com/politics",
            "https://www.cnn.com/politics",
            "https://www.npr.org/sections/politics/",
            "https://www.bbc.com/news/world/us_and_canada",
            "https://www.reuters.com/politics/",
            "https://apnews.com/hub/politics",
            
            # Political analysis and specialized sites
            "https://www.politifact.com/",
            "https://www.realclearpolitics.com/",
            "https://www.bloomberg.com/politics",
            "https://www.axios.com/politics",
            "https://fivethirtyeight.com/politics/",
            "https://www.theatlantic.com/politics/",
            "https://www.vox.com/policy-and-politics",
            
            # Additional specialized political reporting
            "https://talkingpointsmemo.com/",
            "https://www.nationalreview.com/politics/",
            "https://www.motherjones.com/politics/",
            "https://reason.com/politics/",
            "https://www.breitbart.com/politics/",
            "https://www.huffpost.com/news/politics"
        ]
    
    def scrape_all_sources(self):
        """Scrape political news from all configured sources"""
        self.articles = []
        
        # Scrape each specialized source
        for source_url in self.specialized_sources:
            try:
                logger.info(f"Scraping politics news from: {source_url}")
                
                # Navigate to the page
                self.driver.get(source_url)
                
                # Wait for the page to load
                time.sleep(2)
                
                # Get the page source and parse with BeautifulSoup
                soup = BeautifulSoup(self.driver.page_source, 'html.parser')
                
                # Find article links
                article_links = []
                
                # Look for common article patterns
                for a in soup.find_all('a'):
                    href = a.get('href')
                    if not href:
                        continue
                    
                    # Skip social media links, javascript, etc.
                    if href.startswith('#') or href.startswith('javascript:') or href.startswith('mailto:'):
                        continue
                    
                    # Make absolute URL if relative
                    if not href.startswith('http'):
                        # Extract domain from source URL
                        domain = urlparse(source_url).scheme + '://' + urlparse(source_url).netloc
                        
                        # Handle different relative URL formats
                        if href.startswith('//'):
                            href = 'https:' + href
                        elif href.startswith('/'):
                            href = domain + href
                        else:
                            href = domain + '/' + href
                    
                    # Check if the URL is from a known source
                    if self.is_from_known_source(href):
                        article_links.append(href)
                
                # Remove duplicates
                article_links = list(set(article_links))
                
                # Limit number of articles per source
                article_links = article_links[:10]
                
                # Process each article
                for url in article_links:
                    try:
                        logger.info(f"Processing article: {url}")
                        
                        # Navigate to the article page
                        self.driver.get(url)
                        
                        # Wait for the page to load
                        time.sleep(2)
                        
                        # Get the page source and parse with BeautifulSoup
                        article_soup = BeautifulSoup(self.driver.page_source, 'html.parser')
                        
                        # Extract title
                        title_elem = article_soup.find('h1')
                        title = title_elem.text.strip() if title_elem else "No title found"
                        
                        # Extract domain for source identification
                        domain = urlparse(url).netloc.replace('www.', '')
                        
                        # Extract content - try different strategies
                        # First, look for article or main content tags
                        content_elem = article_soup.find('article')
                        
                        # If no article tag, try main tag
                        if not content_elem:
                            content_elem = article_soup.find('main')
                        
                        # Extract content text
                        content = ""
                        if content_elem:
                            # Get all paragraphs within the content
                            paragraphs = content_elem.find_all('p')
                            content = "\n\n".join([p.text.strip() for p in paragraphs])
                        
                        # If still no content, take a more aggressive approach
                        if not content:
                            paragraphs = article_soup.find_all('p')
                            content = "\n\n".join([p.text.strip() for p in paragraphs if len(p.text.strip()) > 100])
                        
                        # Extract source name from URL
                        source = domain
                        
                        # Create article object
                        article = {
                            'url': url,
                            'title': title,
                            'content': content or "No content extracted",
                            'source': source,
                            'topic': 'politics',
                            'scraped_at': self.get_current_datetime()
                        }
                        
                        # Check if article is relevant
                        if self.is_relevant_to_topic(title + " " + content):
                            self.articles.append(article)
                            logger.info(f"Added article: {title}")
                        else:
                            logger.info(f"Skipped irrelevant article: {title}")
                        
                    except Exception as e:
                        logger.error(f"Error processing article {url}: {str(e)}")
                
            except Exception as e:
                logger.error(f"Error scraping {source_url}: {str(e)}")
        
        # Save articles to file
        self.save_articles()
        
        return self.articles
    
    def get_current_datetime(self):
        """Get current datetime as ISO string"""
        return datetime.now().isoformat()