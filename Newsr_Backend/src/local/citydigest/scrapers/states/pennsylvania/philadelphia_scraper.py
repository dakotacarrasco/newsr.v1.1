#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class PhiladelphiaNewsScraper(BaseCityScraper):
    """Philadelphia-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="philadelphia_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Philadelphia-specific details and Supabase support
        super().__init__(
            city_code="philadelphia",
            city_name="Philadelphia",
            region="Pennsylvania",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Philadelphia-specific sources
        self.sources = {
            "inquirer": {
                "name": "The Philadelphia Inquirer",
                "url": "https://www.inquirer.com/",
                "article_selector": ".headline a, .article__headline a",
                "title_selector": ".headline, h1.nh-headline",
                "content_selector": ".story-body, .article__body",
                "author_selector": ".byline, .article__byline",
                "date_selector": ".timestamp, time",
                "image_selector": ".story-body img, .article__body img",
                "max_articles": 15
            },
            "phillymag": {
                "name": "Philadelphia Magazine",
                "url": "https://www.phillymag.com/",
                "article_selector": ".article-title a, .entry-title a",
                "title_selector": ".article-title, .entry-title, h1",
                "content_selector": ".article-content, .entry-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .entry-content img",
                "max_articles": 15
            },
            "whyy": {
                "name": "WHYY",
                "url": "https://whyy.org/",
                "article_selector": ".entry-title a, .article-title a",
                "title_selector": ".entry-title, .article-title, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".published-date, time",
                "image_selector": ".entry-content img, .featured-image img",
                "max_articles": 15
            },
            "nbc10": {
                "name": "NBC10 Philadelphia",
                "url": "https://www.nbcphiladelphia.com/",
                "article_selector": ".story-link, .article-link",
                "title_selector": ".article-title, h1",
                "content_selector": ".article-content, .entry-content",
                "author_selector": ".byline, .author",
                "date_selector": ".published-date, time",
                "image_selector": ".article-content img, .featured-image img",
                "max_articles": 15
            },
            "phillytrib": {
                "name": "The Philadelphia Tribune",
                "url": "https://www.phillytrib.com/",
                "article_selector": ".headline a, .tnt-headline a",
                "title_selector": ".headline, .tnt-headline, h1",
                "content_selector": ".article-body, .tnt-content",
                "author_selector": ".byline, .tnt-byline",
                "date_selector": ".article-date, time",
                "image_selector": ".article-body img, .tnt-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Philadelphia News Scraper initialized with {len(self.sources)} sources") 