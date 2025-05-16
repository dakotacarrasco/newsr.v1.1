#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class ChicagoNewsScraper(BaseCityScraper):
    """Chicago-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="chicago_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=True):
        # Initialize with Chicago-specific details and Supabase integration
        super().__init__(
            city_code="chicago",
            city_name="Chicago",
            region="Illinois",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Chicago-specific sources
        self.sources = {
            "chicagotribune": {
                "name": "Chicago Tribune",
                "url": "https://www.chicagotribune.com/",
                "article_selector": ".headline a, .story-title a",
                "title_selector": ".headline, .story-title, h1",
                "content_selector": ".article-content, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".dateline, time",
                "image_selector": ".article-content img, .lead-photo img",
                "max_articles": 15
            },
            "suntimes": {
                "name": "Chicago Sun-Times",
                "url": "https://chicago.suntimes.com/",
                "article_selector": ".c-entry-box--compact__title a, .entry-title a",
                "title_selector": ".c-page-title, .entry-title, h1",
                "content_selector": ".c-entry-content, .entry-content",
                "author_selector": ".c-byline__author, .byline",
                "date_selector": ".c-byline__item time, .dateline",
                "image_selector": ".c-entry-content img, .entry-content img",
                "max_articles": 15
            },
            "wbez": {
                "name": "WBEZ Chicago",
                "url": "https://www.wbez.org/",
                "article_selector": ".headline a, .story-title a",
                "title_selector": ".headline, .story-title, h1",
                "content_selector": ".story-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".story-content img, .featured-image img",
                "max_articles": 15
            },
            "wgntv": {
                "name": "WGN-TV",
                "url": "https://wgntv.com/",
                "article_selector": ".entry-title a, .article-title a",
                "title_selector": ".entry-title, .article-title, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".author, .byline",
                "date_selector": ".entry-date, time",
                "image_selector": ".entry-content img, .featured-image img",
                "max_articles": 15
            },
            "blockclubchicago": {
                "name": "Block Club Chicago",
                "url": "https://blockclubchicago.org/",
                "article_selector": ".entry-title a, .article-title a",
                "title_selector": ".entry-title, .article-title, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".entry-date, time",
                "image_selector": ".entry-content img, .article-featured-image img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Chicago News Scraper initialized with {len(self.sources)} sources") 