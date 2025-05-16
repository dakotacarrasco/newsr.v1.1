#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class TucsonNewsScraper(BaseCityScraper):
    """Tucson-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="tucson_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Tucson-specific details and Supabase support
        super().__init__(
            city_code="tucson",
            city_name="Tucson",
            region="Arizona",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Tucson-specific sources
        self.sources = {
            "arizonadailystar": {
                "name": "Arizona Daily Star",
                "url": "https://tucson.com/",
                "article_selector": ".headline a, .tnt-headline a",
                "title_selector": ".headline, .tnt-headline, h1",
                "content_selector": ".article-body, .story-body, .entry-content",
                "author_selector": ".byline, .tnt-byline",
                "date_selector": ".article-date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "kgun": {
                "name": "KGUN 9",
                "url": "https://www.kgun9.com/",
                "article_selector": ".card a, .article-headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .article-content",
                "author_selector": ".byline, .author-name",
                "date_selector": ".published-date, time",
                "image_selector": ".article-content img, .article-featured-image img",
                "max_articles": 15
            },
            "tucsonweekly": {
                "name": "Tucson Weekly",
                "url": "https://www.tucsonweekly.com/",
                "article_selector": ".article a, .headline a, .entry-title a",
                "title_selector": ".headline, .entry-title, h1",
                "content_selector": ".article-content, .entry-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .entry-content img",
                "max_articles": 15
            },
            "tucsonsentrinel": {
                "name": "Tucson Sentinel",
                "url": "http://www.tucsonsentinel.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .entry-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .entry-content img",
                "max_articles": 15
            },
            "kvoa": {
                "name": "KVOA News 4 Tucson",
                "url": "https://www.kvoa.com/",
                "article_selector": ".card a, .headline a",
                "title_selector": ".headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".timestamp, time",
                "image_selector": ".article-media img, .lead-media img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Tucson News Scraper initialized with {len(self.sources)} sources") 