#!/usr/bin/env python3
import os
import time
import json
import logging
import random
import re
from datetime import datetime
from dataclasses import dataclass, asdict
from pathlib import Path
import traceback

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait           
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

@dataclass
class Article:
    url: str
    title: str
    content: str
    author: str = None
    published_date: str = None
    description: str = None
    category: str = "news"
    source: str = ""
    image_urls: list = None
    scraped_at: str = None
    slug: str = ""
    city: str = ""  # Add city field to standardize article metadata
    region: str = ""  # Add region field (state/province)
    
    def __post_init__(self):
        if self.image_urls is None:
            self.image_urls = []
        if self.scraped_at is None:
            self.scraped_at = datetime.now().isoformat()

class BaseCityScraper:
    """Base class for city-specific news scrapers"""
    
    def __init__(self, city_code, city_name, region, headless=True, output_dir=None, timeout=30, retry_count=2, use_supabase=False, supabase_client=None, safe_json_handling=True):
        """Initialize the Base City Scraper

        Args:
            city_code: Code/identifier for the city (e.g., 'abq', 'tucson')
            city_name: Full name of the city (e.g., 'Albuquerque', 'Tucson')
            region: State or region (e.g., 'New Mexico', 'Arizona')
            headless: Whether to run browser in headless mode
            output_dir: Directory to save outputs
            timeout: Page load timeout in seconds
            retry_count: Number of retries for failed requests
            use_supabase: Whether to use Supabase for storage
            supabase_client: Supabase client for storage
            safe_json_handling: Whether to safely handle JSON serialization for Supabase responses
        """
        self.city_code = city_code
        self.city_name = city_name
        self.region = region
        self.headless = headless
        self.timeout = timeout
        self.retry_count = retry_count
        self.failed_urls = []
        self.use_supabase = use_supabase
        self.supabase_client = supabase_client
        self.safe_json_handling = safe_json_handling

        # Set up output directory with consistent path
        if output_dir is None:
            # Use standard path relative to src/local
            src_local_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            output_dir = os.path.join(src_local_path, "output", f"{city_code}_news")
        else:
            # If path is relative (doesn't start with drive letter or slash)
            if not os.path.isabs(output_dir):
                src_local_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                output_dir = os.path.join(src_local_path, output_dir)

        self.output_dir = output_dir

        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)

        # Configure logging
        log_filename = f"{city_code}_scraper.log"
        logging.basicConfig(
            level=logging.INFO,                      
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(os.path.join(output_dir, log_filename)),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(f"{city_code}_scraper")

        # Define sources (to be overridden by subclasses)
        self.sources = {}

        self.logger.info(f"{self.city_name} News Scraper initialized")


 def init_driver(self):
        """Initialize the Chrome WebDriver."""
        try:
            # Set up Chrome options
            options = webdriver.ChromeOptions()
            options.add_argument("--headless")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1920,1080")
            
            # Use the specific chromedriver we know works with Chrome 135
            driver_path = "/app/chromedriver-linux64/chromedriver"
            
            if os.path.exists(driver_path) and os.access(driver_path, os.X_OK):
                self.logger.info(f"Using chromedriver at: {driver_path}")
                service = ChromeService(executable_path=driver_path)
                self.driver = webdriver.Chrome(service=service, options=options)
            else:
                # Fallback to default initialization if our specific driver isn't found
                self.logger.warning(f"Chromedriver not found at {driver_path}, using default initialization")
                self.driver = webdriver.Chrome(options=options)
        except Exception as e:
            error_msg = str(e)
            self.logger.error(f"Error initializing WebDriver: {error_msg}")
            raise Exception(f"Failed to initialize WebDriver: {error_msg}")
   



    
    def close_driver(self):
        """Close the webdriver"""
        if hasattr(self, 'driver'):
            self.driver.quit()
            self.logger.info("Chrome webdriver closed")


    
    def clean_content(self, content):
        """Clean article content to make it more usable"""
        # Implementation from the original function
        # ... (Keep the existing implementation)
        if not content:
            return ""

        # Remove excessive whitespace
        content = re.sub(r'\n\s*\n', '\n\n', content)

        # Remove common navigation text
        nav_patterns = [     
            r'Prev(?:ious)?.*?Next(?:\s+Up)?',
            r'Next(?:\s+Up)?.*?Prev(?:ious)?',
            r'Share\s+on\s+(?:Facebook|Twitter|WhatsApp|SMS|Email)',
            r'(?:Facebook|Twitter|WhatsApp|SMS|Email)',
            r'Author\s+(?:email|linkedin|twitter)',
            r'Updated\s+\d+\s+(?:mins|hours|days)\s+ago',
            r'Published\s+\d+:\d+\s+[ap]m\s+\w+\s+\d+,\s+\d{4}',
            r'Posted\s+at\s+\d+:\d+\s+[AP]M,\s+\w+\s+\d+,\s+\d{4}',
            r'Copyright\s+\d{4}.*?All\s+rights\s+reserved',
            r'Terms\s+of\s+(?:Use|Service)',
            r'Privacy\s+Policy',
            r'Do\s+Not\s+Sell\s+My\s+Info',
            r'Powered\s+by\s+[A-Za-z0-9\s]+',
            r'Advertisement',
            r'Subscribe\s+to\s+our\s+newsletter',
            r'Sign\s+up\s+for\s+our\s+newsletter',
            r'Follow\s+us\s+on\s+(?:Facebook|Twitter|Instagram)',
            r'Related\s+(?:Stories|Articles|Content)',
            r'Recommended\s+for\s+you',
            r'Most\s+(?:Popular|Read|Viewed)',
            r'Top\s+Stories',
            r'Breaking\s+News',
            r'Featured',
            r'Comments',
            r'Click\s+here\s+to\s+(?:read|view)',
            r'Read\s+more',
            r'Continue\s+reading',
            r'Load\s+(?:more|comments)',
        ]
        
        # Apply all patterns
        for pattern in nav_patterns:
            content = re.sub(pattern, '', content, flags=re.IGNORECASE)
        
        # Remove lines that are too short (likely navigation/UI elements)
        lines = content.split('\n')
        filtered_lines = []
        for line in lines:
            line = line.strip()
            # Keep lines that have substantial content
            if len(line) > 20 or (len(line) > 0 and line[0].isdigit() and '.' in line):  # Keep numbered lists
                filtered_lines.append(line)
        
        # Rejoin the content
        content = '\n'.join(filtered_lines)
        
        # Remove duplicate paragraphs (common in scraped content)
        paragraphs = content.split('\n\n')
        unique_paragraphs = []
        seen = set()
        for p in paragraphs:
            p_clean = p.strip().lower()
            if p_clean and len(p_clean) > 20 and p_clean not in seen:
                seen.add(p_clean)
                unique_paragraphs.append(p)
        
        content = '\n\n'.join(unique_paragraphs)
        
        # Final cleanup
        content = re.sub(r'\s{2,}', ' ', content)  # Replace multiple spaces with single space
        content = re.sub(r'^\s+|\s+$', '', content, flags=re.MULTILINE)  # Trim each line
        
        return content.strip()
    
    def clean_text(self, text):
        """Clean text by removing problematic characters
        
        Args:
            text: Text to clean
            
        Returns:
            str: Cleaned text
        """
        if not text:
            return ""
        
        # Replace narrow non-breaking spaces with regular spaces
        text = text.replace('\u202f', ' ')
        
        # Remove other problematic unicode characters if needed
        text = text.replace('\u2028', ' ')  # Line separator
        text = text.replace('\u2029', ' ')  # Paragraph separator
        
        return text
    
    # Add all other common methods from ABQNewsScraper
    # extract_text, extract_images, scroll_page, handle_popups, etc.
    
    def extract_text(self, selector):
        """Extract text from elements matching the selector"""
        try:
            elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
            if elements:
                # Get text from all matching elements
                texts = [el.text.strip() for el in elements if el.text.strip()]
                return " ".join(texts)
            return ""
        except:
            return ""
    
    def extract_images(self, selector):
        """Extract image URLs from elements matching the selector"""
        try:
            elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
            image_urls = []
            
            for element in elements:
                try:
                    src = element.get_attribute("src")
                    if src and src.startswith("http") and not src.endswith(".svg"):
                        image_urls.append(src)
                except:
                    continue
            
            return image_urls
        except:
            return []
    
    def scroll_page(self, num_scrolls=3):
        """Scroll down the page to load more content"""
        for _ in range(num_scrolls):
            self.driver.execute_script("window.scrollBy(0, window.innerHeight);")
            time.sleep(1)
    
    def handle_popups(self):
        """Handle common cookie/privacy popups"""
        selectors = [
            "#onetrust-accept-btn-handler", 
            ".modal-close", 
            ".close-button", 
            ".consent-button", 
            ".accept-cookies",
            ".privacy-alert button", "#onetrust-accept-btn-handler"
        ]
        
        for selector in selectors:
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    if element.is_displayed():
                        try:
                            element.click()
                            self.logger.info(f"Clicked popup/consent element: {selector}")
                            time.sleep(0.5)
                        except:
                            # Try JavaScript click as fallback
                            try:
                                self.driver.execute_script("arguments[0].click();", element)
                                self.logger.info(f"JS-clicked popup/consent element: {selector}")
                                time.sleep(0.5)
                            except:
                                pass
            except:
                continue
    
    def extract_slug_from_url(self, url):
        """Extract a slug from the URL for reference"""
        try:
            # Parse the URL
            parsed = urlparse(url)
            
            # Get the path
            path = parsed.path
            
            # Extract the last part of the path (usually the slug)
            parts = [p for p in path.split('/') if p]
            if parts:
                # Return the last meaningful part
                return parts[-1]
            return ""
        except:
            return ""
    
    def scrape_source(self, source_id, source_config):
        """Scrape a specific news source"""
        articles = []
        source_failed_urls = []
        
        # Store current source_id for use in other methods
        self.current_source_id = source_id
        
        try:
            # Navigate to the source URL with retry
            success = False
            for attempt in range(self.retry_count):
                try:
                    self.driver.get(source_config["url"])
                    self.logger.info(f"Navigated to {source_config['url']}")
                    success = True
                    break
                except Exception as e:
                    self.logger.warning(f"Attempt {attempt+1} failed to navigate to {source_config['url']}: {str(e)}")
                    time.sleep(2)
            
            if not success:
                self.logger.error(f"Failed to navigate to {source_config['url']} after {self.retry_count} attempts")
                return articles
            
            # Handle cookie/privacy popups
            self.handle_popups()
            
            # Scroll down to load more content
            self.scroll_page(4)
            
            # Find article links
            article_links = []
            
            # Try multiple selectors if the primary one fails
            selectors = [
                source_config["article_selector"],
                "a.headline, a.title, a.article-title, h2 a, h3 a",  # Generic fallback selectors
                "article a, .story a, .post a, .entry a"  # More generic fallback
            ]
            
            for selector in selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    self.logger.info(f"Found {len(elements)} elements with selector: {selector}")
                    for element in elements:
                        try:
                            href = element.get_attribute("href")
                            if href and href.startswith("http") and "/tag/" not in href and "/category/" not in href:
                                article_links.append(href)
                        except:
                            continue
                    
                    if article_links:
                        break
            
            # Deduplicate links
            article_links = list(set(article_links))
            
            # Limit the number of articles to process
            max_articles = source_config.get("max_articles", 15)
            article_links = article_links[:max_articles]
            
            self.logger.info(f"Found {len(article_links)} article links for {source_config['name']}")
            
            # Batch check URLs in a single request where possible
            if self.use_supabase and article_links:
                try:
                    # Create a comma-separated list of URLs for the 'in' operator
                    url_list = ",".join([f"'{url}'" for url in article_links])
                    
                    # Get status of all URLs in one request
                    query = f"url.in.({url_list}),status.eq.scraped"
                    response = self.supabase_client.table('scraped_urls')\
                        .select('url')\
                        .or_(query)\
                        .execute()
                    
                    # Create a set of already scraped URLs for fast lookups
                    scraped_urls = {item['url'] for item in response.data} if response.data else set()
                    
                except Exception as e:
                    self.logger.warning(f"Error batch checking URLs: {str(e)}")
                    scraped_urls = set()
            else:
                scraped_urls = set()
            
            # Process each article link
            for url in article_links:
                # Skip already scraped URLs
                if url in scraped_urls:
                    self.logger.info(f"Skipping already scraped URL: {url}")
                    continue
                
                try:
                    # Scrape the article
                    article = self.scrape_article(url, source_config)
                    
                    if article:
                        # Add metadata
                        article.source = source_config["name"]
                        article.city = self.city_name
                        article.region = self.region
                        
                        # Save article to Supabase if enabled
                        if self.use_supabase:
                            self.save_article_to_supabase(article)
                        
                        articles.append(article)
                except Exception as e:
                    self.logger.error(f"Error scraping article {url}: {str(e)}")
                    source_failed_urls.append(url)
            
            # Add failed URLs to the overall list
            self.failed_urls.extend(source_failed_urls)
            
            return articles
        except Exception as e:
            self.logger.error(f"Error scraping source {source_id}: {str(e)}")
            return articles
    
    def scrape_article(self, url, source_config):
        """Scrape a single article with retry logic and deduplication"""
        # Check if URL is in the blocklist
        if self.is_url_blocklisted(url):
            self.logger.warning(f"Skipping blocklisted URL: {url}")
            return None
        
        # Check if we've already scraped this URL recently
        if self.is_duplicate_url(url):
            self.logger.info(f"Skipping already scraped URL: {url}")
            return None
        
        # Attempt to scrape with retry logic
        for attempt in range(self.retry_count):
            try:
                # Navigate to the article URL
                self.driver.get(url)
                self.logger.info(f"Navigating to article: {url}")
                
                # Handle cookie/privacy popups
                self.handle_popups()
                
                # Wait for the content to load
                try:
                    # Try multiple selectors for content
                    selectors = [
                        source_config["title_selector"],
                        "h1, .headline, .title, .article-title",  # Generic fallback
                    ]
                    
                    for selector in selectors:
                        try:
                            WebDriverWait(self.driver, 10).until(
                                EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                            )
                            break
                        except:
                            continue
                except TimeoutException:
                    self.logger.warning(f"Timeout waiting for article content: {url}")
                    if attempt < self.retry_count - 1:
                        self.logger.info(f"Retrying article {url}, attempt {attempt+2}/{self.retry_count}")
                        time.sleep(2)
                        continue
                
                # Extract article information
                title = self.extract_text(source_config["title_selector"]) or self.extract_text("h1, .headline, .title")
                content = self.extract_text(source_config["content_selector"]) or self.extract_text(".content, .article-body, .entry-content")
                author = self.extract_text(source_config["author_selector"]) or self.extract_text(".author, .byline")
                published_date = self.extract_text(source_config["date_selector"]) or self.extract_text(".date, time, .published")
                
                # Extract images
                image_urls = self.extract_images(source_config["image_selector"]) or self.extract_images("img")
                
                # If no title or content, try to extract from page source
                if not title or not content:
                    soup = BeautifulSoup(self.driver.page_source, 'html.parser')
                    
                    # Try to find title
                    if not title:
                        title_tag = soup.find('h1') or soup.find('title')
                        if title_tag:
                            title = title_tag.text.strip()
                    
                    # Try to find content
                    if not content:
                        content_tags = soup.find_all(['p', 'article', 'div'], class_=['content', 'article', 'entry', 'story'])
                        if content_tags:
                            content = "\n\n".join([tag.text.strip() for tag in content_tags if tag.text.strip()])
                
                # Skip if still no title or content
                if not title or not content:
                    self.logger.warning(f"Skipping article with no title or content: {url}")
                    if attempt < self.retry_count - 1:
                        self.logger.info(f"Retrying article {url}, attempt {attempt+2}/{self.retry_count}")
                        time.sleep(2)
                        continue
                    return None
                
                # Clean the content
                content = self.clean_content(content)
                
                # Extract slug from URL for reference
                slug = self.extract_slug_from_url(url)
                
                # Create article object with city metadata
                article = Article(
                    url=url,
                    title=title,
                    content=content,
                    author=author,
                    published_date=published_date,
                    source=source_config["name"],
                    image_urls=image_urls,
                    slug=slug,
                    city=self.city_name,
                    region=self.region
                )
                
                # New: Add the content similarity check
                if self.is_similar_to_existing_article(title, content):
                    self.logger.info(f"Skipping article with similar content: {url}")
                    return None
                
                return article
                
            except Exception as e:
                self.logger.error(f"Error scraping article {url} (attempt {attempt+1}/{self.retry_count}): {str(e)}")
                if attempt == self.retry_count - 1:
                    # Track consistently failing URL
                    self.track_failed_url(url)
                
                if attempt < self.retry_count - 1:
                    time.sleep(2)
                    continue
                return None
        
        return None
    
    def is_url_blocklisted(self, url):
        """Check if URL is in the blocklist"""
        blocklist_path = os.path.join(self.output_dir, "blocklist.json")
        if not os.path.exists(blocklist_path):
            return False
        
        try:
            with open(blocklist_path, 'r', encoding='utf-8') as f:
                blocklist = json.load(f)
            return url in blocklist
        except:
            return False
    
    def track_failed_url(self, url):
        """Track a failed URL and potentially add to blocklist"""
        failed_tracking_path = os.path.join(self.output_dir, "failed_url_count.json")
        
        # Load existing tracking data
        if os.path.exists(failed_tracking_path):
            try:
                with open(failed_tracking_path, 'r', encoding='utf-8') as f:
                    failed_counts = json.load(f)
            except:
                failed_counts = {}
        else:
            failed_counts = {}
        
        # Update count
        failed_counts[url] = failed_counts.get(url, 0) + 1
        
        # Save updated tracking
        with open(failed_tracking_path, 'w', encoding='utf-8') as f:
            json.dump(failed_counts, f, ensure_ascii=False, indent=2)
        
        # If a URL has failed more than 5 times, add to blocklist
        if failed_counts[url] >= 5:
            self.add_to_blocklist(url)
    
    def add_to_blocklist(self, url):
        """Add a URL to the blocklist"""
        blocklist_path = os.path.join(self.output_dir, "blocklist.json")
        
        # Load existing blocklist
        if os.path.exists(blocklist_path):
            try:
                with open(blocklist_path, 'r', encoding='utf-8') as f:
                    blocklist = json.load(f)
            except:
                blocklist = []
        else:
            blocklist = []
        
        # Add URL if not already in blocklist
        if url not in blocklist:
            blocklist.append(url)
        
        # Save updated blocklist
        with open(blocklist_path, 'w', encoding='utf-8') as f:
            json.dump(blocklist, f, ensure_ascii=False, indent=2)
        
        self.logger.warning(f"Added URL to blocklist after repeated failures: {url}")
    
    def is_duplicate_url(self, url):
        """Check if URL has been recently scraped"""
        # Path to store previously scraped URLs
        scraped_urls_path = os.path.join(self.output_dir, "scraped_urls.json")
        
        # Load existing scraped URLs
        if os.path.exists(scraped_urls_path):
            try:
                with open(scraped_urls_path, 'r', encoding='utf-8') as f:
                    scraped_data = json.load(f)
            except:
                scraped_data = {"urls": {}}
        else:
            scraped_data = {"urls": {}}
        
        # Check if URL exists and is recent (within last 48 hours)
        current_time = datetime.now().timestamp()
        if url in scraped_data["urls"]:
            timestamp = scraped_data["urls"][url]
            time_diff = current_time - timestamp
            if time_diff < 172800:  # 48 hours in seconds
                return True
        
        # Record this URL as scraped
        scraped_data["urls"][url] = current_time
        
        # Prune old entries (older than 1 week)
        for scraped_url in list(scraped_data["urls"].keys()):
            if current_time - scraped_data["urls"][scraped_url] > 604800:  # 7 days in seconds
                del scraped_data["urls"][scraped_url]
        
        # Save updated scraped URLs
        with open(scraped_urls_path, 'w', encoding='utf-8') as f:
            json.dump(scraped_data, f, ensure_ascii=False, indent=2)
        
        return False
    
    def is_similar_to_existing_article(self, title, content):
        """Check if article content is similar to existing articles"""
        # Path to store content hashes for similarity detection
        content_hashes_path = os.path.join(self.output_dir, "content_hashes.json")
        
        # Create a simple hash of title and first 500 chars of content
        import hashlib
        content_sample = (title + " " + content[:500]).lower()
        content_hash = hashlib.md5(content_sample.encode()).hexdigest()
        
        # For more advanced similarity detection, implement a function that:
        # 1. Tokenizes content
        # 2. Removes stop words
        # 3. Creates a TF-IDF or word embedding representation
        # 4. Compares using cosine similarity
        # But this simple hash approach works for exact duplicates
        
        # Load existing content hashes
        if os.path.exists(content_hashes_path):
            try:
                with open(content_hashes_path, 'r', encoding='utf-8') as f:
                    hash_data = json.load(f)
            except:
                hash_data = {"hashes": [], "timestamps": []}
        else:
            hash_data = {"hashes": [], "timestamps": []}
        
        # Check if similar content exists (within last 48 hours)
        current_time = datetime.now().timestamp()
        
        # Prune old entries first (older than 48 hours)
        while hash_data["timestamps"] and current_time - hash_data["timestamps"][0] > 172800:
            hash_data["hashes"].pop(0)
            hash_data["timestamps"].pop(0)
        
        # Check for similarity
        if content_hash in hash_data["hashes"]:
            return True
        
        # Store new hash
        hash_data["hashes"].append(content_hash)
        hash_data["timestamps"].append(current_time)
        
        # Save updated hashes
        with open(content_hashes_path, 'w', encoding='utf-8') as f:
            json.dump(hash_data, f, ensure_ascii=False, indent=2)
        
        return False
    
    def save_articles(self, articles, filename):
        """Save articles to a JSON file and/or Supabase"""
        if not articles:
            self.logger.warning(f"No articles to save to {filename}")
            return
        
        # Save to Supabase if enabled
        if self.use_supabase and self.supabase_client:
            self.save_articles_to_supabase(articles, self.city_code)
        
        # Still save locally for backward compatibility
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump([asdict(article) for article in articles], f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"Saved {len(articles)} articles to {filepath}")
    
    def save_article_urls(self, urls, filename):
        """Save article URLs to a JSON file"""
        if not urls:
            self.logger.warning(f"No URLs to save to {filename}")
            return
        
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(urls, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"Saved {len(urls)} URLs to {filepath}")
    
    def save_urls_to_supabase(self, urls, source_id):
        """Save article URLs to Supabase scraped_urls table"""
        if not self.use_supabase or not self.supabase_client or not urls:
            return False
            
        try:
            current_time = datetime.now().isoformat()
            
            # Prepare data for bulk insertion
            url_data = []
            for url in urls:
                url_data.append({
                    'url': url,
                    'city_code': self.city_code,
                    'source_id': source_id,
                    'first_seen_at': current_time,
                    'last_seen_at': current_time,
                    'status': 'pending'
                })
            
            # Use upsert to avoid duplicates, update last_seen_at for existing urls
            if url_data:
                # Insert in batches to avoid payload limits
                batch_size = 50
                for i in range(0, len(url_data), batch_size):
                    batch = url_data[i:i+batch_size]
                    result = self.supabase_client.table('scraped_urls').upsert(
                        batch,
                        on_conflict=['url'],
                        resolution={'last_seen_at': current_time}
                    ).execute()
                
                self.logger.info(f"Stored {len(url_data)} URLs for {source_id} in Supabase")
                return True
            return False
            
        except Exception as e:
            self.logger.error(f"Error storing URLs to Supabase: {str(e)}")
            return False
    
    def update_url_status_in_supabase(self, url, status, source_id=None, metadata=None, content_hash=None):
        """Update the status of a URL in Supabase
        
        Args:
            url (str): The URL to update
            status (str): The new status ('scraped', 'failed', etc.)
            source_id (str, optional): ID of the source
            metadata (dict, optional): Additional metadata to store
            content_hash (str, optional): Hash of the content for deduplication
        
        Returns:
            bool: Success status
        """
        if not self.use_supabase or not self.supabase_client:
            return False
            
        try:
            # Extract source from metadata if available
            meta = metadata or {}
            source_name = meta.get('source', '')
            
            # Derive source_id from source_name if not provided
            if not source_id and source_name:
                # Convert source name to lowercase and remove spaces for a simple ID
                source_id = source_name.lower().replace(' ', '_')
            
            # Default source_id if still empty
            if not source_id:
                # Use the current source being scraped or a fallback
                current_source_id = getattr(self, 'current_source_id', None)
                source_id = current_source_id or 'unknown_source'
            
            current_time = datetime.now().isoformat()
            
            # Check if the URL already exists
            try:
                response = self.supabase_client.table('scraped_urls')\
                    .select('*')\
                    .eq('url', url)\
                    .execute()
                
                url_exists = response.data and len(response.data) > 0
            except Exception as e:
                self.logger.warning(f"Error checking if URL exists: {str(e)}")
                url_exists = False
            
            if url_exists:
                # Update existing record
                data = {
                    'url': url,
                    'status': status,
                    'last_seen_at': current_time,
                    'last_scrape_attempt_at': current_time,
                    'updated_at': current_time
                }
                
                # Update counts based on status
                if status == 'scraped' or status == 'success':
                    data['success_count'] = response.data[0].get('success_count', 0) + 1
                elif status == 'error' or status == 'failed':
                    data['failure_count'] = response.data[0].get('failure_count', 0) + 1
                
                # Increment scrape count
                data['scrape_count'] = response.data[0].get('scrape_count', 0) + 1
                
                # Add content hash if available
                if content_hash:
                    data['content_hash'] = content_hash
                    
                # Add source if available
                if source_name:
                    data['source'] = source_name
                    
                # Add metadata if available
                if meta:
                    data['metadata'] = meta
                    
                try:
                    self.supabase_client.table('scraped_urls')\
                        .update(data)\
                        .eq('url', url)\
                        .execute()
                    
                    self.logger.info(f"Updated URL status in Supabase: {url} -> {status}")
                    return True
                except Exception as update_error:
                    self.logger.warning(f"Error updating URL: {str(update_error)}")
                    return False
            else:
                # Insert new record
                data = {
                    'url': url,
                    'city_code': self.city_code,
                    'source_id': source_id,
                    'first_seen_at': current_time,
                    'last_seen_at': current_time,
                    'last_scrape_attempt_at': current_time,
                    'status': status,
                    'scrape_count': 1,
                    'success_count': 1 if status == 'scraped' or status == 'success' else 0,
                    'failure_count': 1 if status == 'error' or status == 'failed' else 0,
                    'updated_at': current_time
                }
                
                # Add content hash if available
                if content_hash:
                    data['content_hash'] = content_hash
                    
                # Add source if available
                if source_name:
                    data['source'] = source_name
                    
                # Add metadata if available
                if meta:
                    data['metadata'] = meta
                    
                try:
                    self.supabase_client.table('scraped_urls')\
                        .insert(data)\
                        .execute()
                    
                    self.logger.info(f"Inserted new URL in Supabase: {url} -> {status}")
                    return True
                except Exception as insert_error:
                    self.logger.warning(f"Error inserting URL: {str(insert_error)}")
                    return False
                
            # Don't downgrade status from 'scraped' to 'failed'
            if status == 'failed' or status == 'error':
                # Check current status first
                try:
                    response = self.supabase_client.table('scraped_urls')\
                        .select('status')\
                        .eq('url', url)\
                        .execute()
                    
                    if response.data and response.data[0]['status'] == 'scraped':
                        self.logger.info(f"Not downgrading URL status from 'scraped' to '{status}': {url}")
                        return True
                except Exception as check_error:
                    self.logger.warning(f"Error checking URL status: {str(check_error)}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error updating URL status in Supabase: {str(e)}")
            return False
    
    def save_articles_to_supabase(self, articles, city_code):
        """Save articles to Supabase article_archive table"""
        if not self.use_supabase or not self.supabase_client:
            self.logger.warning("Supabase integration not configured for direct storage")
            return False
            
        try:
            # Format articles for upload
            current_date = datetime.now().strftime('%Y-%m-%d')
            current_time = datetime.now().isoformat()
            
            upload_data = []
            for article in articles:
                # Convert article to dict if needed
                if not isinstance(article, dict):
                    if hasattr(article, 'asdict'):
                        article = article.asdict()
                    else:
                        article = vars(article)
                
                # Generate content hash for deduplication
                content_hash = None
                if article.get('content'):
                    content_to_hash = f"{article.get('title', '')}{article.get('content', '')}"
                    content_hash = self.generate_content_hash(content_to_hash)
                
                # Add metadata
                article_data = {
                    'city_code': city_code,
                    'archived_date': current_date,
                    'title': article.get('title', ''),
                    'url': article.get('url', ''),
                    'source': article.get('source', ''),
                    'published_date': article.get('published_date'),
                    'content_preview': article.get('content', '')[:500] if article.get('content') else '',
                    'full_content': article.get('content'),
                    'created_at': current_time,
                    'is_used': False,
                    'category': article.get('category', ''),
                    'content_hash': content_hash,
                    'image_urls': article.get('image_urls', []),
                    'slug': article.get('slug', '')
                }
                upload_data.append(article_data)
            
            # Batch upload to save API calls
            if upload_data:
                # Use batches of 50 to avoid payload size limits
                batch_size = 50
                for i in range(0, len(upload_data), batch_size):
                    batch = upload_data[i:i+batch_size]
                    result = self.supabase_client.table('article_archive').upsert(
                        batch, 
                        on_conflict=['url'], 
                    ).execute()
                
                self.logger.info(f"Stored {len(upload_data)} articles for {city_code} directly to Supabase")
                return True
            return False
        
        except Exception as e:
            self.logger.error(f"Error storing articles to Supabase for {city_code}: {str(e)}")
            return False
    
    def generate_content_hash(self, content):
        """Generate a hash of the content for deduplication"""
        import hashlib
        # Create a hash of the content
        return hashlib.md5(content.encode('utf-8')).hexdigest()
    
    def save_article_to_supabase(self, article):
        """Save article to Supabase"""
        if not self.use_supabase or not self.supabase_client:
            return False
            
        try:
            # Convert article to dict
            if hasattr(article, 'asdict'):
                article_data = article.asdict()
            elif hasattr(article, '__dict__'):
                # Fall back to __dict__ if asdict not available
                article_data = article.__dict__.copy()
            else:
                article_data = dict(article)  # Try direct conversion
            
            # Add additional fields if needed
            if 'city' not in article_data or not article_data['city']:
                article_data['city'] = self.city_name
            
            if 'region' not in article_data or not article_data['region']:
                article_data['region'] = self.region
            
            # Convert image_urls to JSON string if it's a list
            if 'image_urls' in article_data and isinstance(article_data['image_urls'], list):
                # Convert to JSON string only if needed
                article_data['image_urls'] = json.dumps(article_data['image_urls'])
            
            # Make sure we're not trying to pass any complex objects
            for key, value in list(article_data.items()):
                if not isinstance(value, (str, int, float, bool, list, dict, type(None))):
                    # Convert complex objects to strings
                    article_data[key] = str(value)
            
            # Clean text fields to prevent encoding issues
            for field in ['title', 'content', 'summary', 'author']:
                if field in article_data and article_data[field]:
                    article_data[field] = self.clean_text(article_data[field])
            
            # Insert into scraped_articles table
            response = self.supabase_client.table('scraped_articles').upsert(
                article_data,
                on_conflict='url'
            ).execute()
            
            self.logger.info(f"Saved article to Supabase: {article_data.get('title', '')}")
            
            # Only update URL status ONCE after saving the article
            # Don't call the update function multiple times
            if 'url' in article_data:
                # Generate source_id from source name
                source = article_data.get('source', '')
                source_id = source.lower().replace(' ', '_') if source else self.current_source_id
                
                # Calculate content hash for deduplication
                content_hash = None
                if article_data.get('title') and article_data.get('content'):
                    import hashlib
                    content_sample = (article_data['title'] + " " + article_data['content'][:500]).lower()
                    content_hash = hashlib.md5(content_sample.encode()).hexdigest()
                
                # Only update status once with success
                self.update_url_status_in_supabase(
                    url=article_data['url'],
                    status='scraped',
                    source_id=source_id,
                    content_hash=content_hash,
                    metadata={
                        'title': article_data.get('title', ''),
                        'source': article_data.get('source', ''),
                        'published_date': article_data.get('published_date', ''),
                        'scraped_at': datetime.now().isoformat()
                    }
                )
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error saving article to Supabase: {str(e)}")
            return False
    
    @classmethod
    def create_scraper(cls, city_code, headless=True, output_dir=None, timeout=30, retry_count=2):
        """Factory method to create a city-specific scraper instance
        
        Args:
            city_code: Code/identifier for the city (e.g., 'abq', 'tucson')
            headless: Whether to run browser in headless mode
            output_dir: Directory to save outputs
            timeout: Page load timeout in seconds
            retry_count: Number of retries for failed requests
            
        Returns:
            An instance of the appropriate city scraper class
        """
        try:
            # Import the city configuration
            from citydigest.config.cities import get_city_config
            
            # Get the city configuration
            city_config = get_city_config(city_code)
            if not city_config:
                raise ValueError(f"No configuration found for city: {city_code}")
            
            # Set default output directory if not provided
            if not output_dir:
                output_dir = os.path.join("output", f"{city_code}_news")
            
            # Import the city-specific scraper module
            import importlib
            
            # Try importing from the state-based structure first
            region = city_config.get('region', '').lower().replace(' ', '_')
            module_path = f"citydigest.scrapers.states.{region}.{city_code}_scraper"
            
            try:
                scraper_module = importlib.import_module(module_path)
            except ImportError:
                # Fallback to the flat structure if state-based import fails
                module_path = f"citydigest.scrapers.{city_code}_scraper"
                scraper_module = importlib.import_module(module_path)
            
            # Get the scraper class
            scraper_class = getattr(scraper_module, city_config["scraper_class"])
            
            # Create and return an instance of the scraper
            return scraper_class(
                headless=headless,
                output_dir=output_dir,
                timeout=timeout,
                retry_count=retry_count
            )
        except Exception as e:
            logging.error(f"Error creating scraper for {city_code}: {str(e)}")
            raise
def restart_browser(self):
    """Restart the Chrome browser to free memory"""
    self.logger.info("Restarting Chrome browser to free memory")
    
    # Close existing browser if it exists
    if hasattr(self, 'driver') and self.driver:
        try:
            self.driver.quit()
        except Exception as e:
            self.logger.warning(f"Error closing browser: {str(e)}")
    
    options = webdriver.ChromeOptions()
    
    # Add memory-saving options
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")
    options.add_argument("--disable-notifications")
    options.add_argument("--headless")
    options.add_argument("--disable-features=NetworkService")
    options.add_argument("--disable-features=VizDisplayCompositor")
    options.add_argument("--disable-features=IsolateOrigins,site-per-process")
    options.add_argument("--disable-site-isolation-trials")
    options.add_argument("--disable-web-security")
    options.add_argument("--disable-features=SharedArrayBuffer")
    
    # Add ignore-certificate-errors for compatibility
    options.add_argument("--ignore-certificate-errors")
    
    # IMPORTANT CHANGE: Always try to use the known working chromedriver first
    driver_path = "/usr/local/bin/chromedriver"
    if os.path.exists(driver_path) and os.access(driver_path, os.X_OK):
        self.logger.info(f"Using installed chromedriver at: {driver_path}")
        service = Service(executable_path=driver_path)
        try:
            self.driver = webdriver.Chrome(service=service, options=options)
            self.logger.info("Successfully initialized Chrome with installed chromedriver")
            return
        except Exception as e:
            self.logger.warning(f"Installed chromedriver failed: {str(e)}")
    else:
        self.logger.warning(f"Chromedriver not found at {driver_path}")
    
    # If we got here, the known path didn't work - try other approaches
    try:
        # Let Selenium use its built-in driver manager
        self.driver = webdriver.Chrome(options=options)
        self.logger.info("Successfully initialized Chrome with Selenium's driver manager")
        return
    except Exception as e:
        self.logger.warning(f"Default Chrome initialization failed: {str(e)}")
    
    try:
        # Manual webdriver-manager installation with careful executable detection
        from webdriver_manager.chrome import ChromeDriverManager
        
        # Get the chromedriver directory path
        driver_manager = ChromeDriverManager()
        driver_path = driver_manager.install()
        
        # Make sure we're not using a license file
        if "LICENSE" in driver_path or "NOTICE" in driver_path or "THIRD_PARTY" in driver_path:
            driver_dir = os.path.dirname(driver_path)
            self.logger.warning(f"Driver manager returned a license file: {driver_path}")
            
            # Look explicitly for chromedriver executable, not license files
            for file in os.listdir(driver_dir):
                if (file == "chromedriver" or file.endswith(".exe")) and not file.startswith("LICENSE") and not file.startswith("NOTICE") and not "THIRD_PARTY" in file:
                    executable_path = os.path.join(driver_dir, file)
                    if os.access(executable_path, os.X_OK):
                        self.logger.info(f"Found executable chromedriver at: {executable_path}")
                        service = Service(executable_path=executable_path)
                        self.driver = webdriver.Chrome(service=service, options=options)
                        return
            
            # If no executable found yet, try to look in subdirectories
            for root, dirs, files in os.walk(driver_dir):
                for file in files:
                    if (file == "chromedriver" or file.endswith(".exe")) and not file.startswith("LICENSE") and not file.startswith("NOTICE") and not "THIRD_PARTY" in file:
                        executable_path = os.path.join(root, file)
                        if os.access(executable_path, os.X_OK):
                            self.logger.info(f"Found executable chromedriver in subdirectory at: {executable_path}")
                            service = Service(executable_path=executable_path)
                            self.driver = webdriver.Chrome(service=service, options=options)
                            return
        else:
            # Use the path directly if it's not a license file
            self.logger.info(f"Using driver manager chromedriver at: {driver_path}")
            service = Service(executable_path=driver_path)
            self.driver = webdriver.Chrome(service=service, options=options)
            return
            
        raise Exception(f"Could not find executable chromedriver in {driver_dir}")
    
    except Exception as e:
        error_msg = f"Failed to restart browser: {str(e)}"
        self.logger.error(error_msg)
        # At this point, we have to give up - no driver could be initialized
        raise Exception(error_msg)

    def scrape_all_sources(self):
        """Scrape all news sources for this city"""
        all_articles = []
        
        # Initialize browser at the beginning
        if not hasattr(self, 'driver'):
            try:
                self.restart_browser()
            except Exception as e:
                self.logger.error(f"Failed to initialize browser: {str(e)}")
        
        # Rest of the method remains the same...
        # ... existing code ...

    def store_articles_to_supabase(self, articles, city_code=None):
        """Store a list of articles to Supabase
        
        Args:
            articles: List of Article objects
            city_code: City code override
            
        Returns:
            bool: Success status
        """
        if not self.use_supabase or not self.supabase_client:
            return False
        
        try:
            city = city_code or self.city_code
            
            for article in articles:
                # Save articles one by one using our existing method
                success = self.save_article_to_supabase(article)
                if not success:
                    self.logger.warning(f"Failed to save article: {getattr(article, 'title', 'Unknown title')}")
            
            return True
        except Exception as e:
            self.logger.error(f"Error storing articles to Supabase for {city}: {str(e)}")
            return False
