#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class NewOrleansNewsScraper(BaseCityScraper):
    """New Orleans-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="new_orleans_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with New Orleans-specific details and Supabase support
        super().__init__(
            city_code="new_orleans",
            city_name="New Orleans",
            region="Louisiana",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define New Orleans-specific sources
        self.sources = {
            "nola": {
                "name": "NOLA.com | The Times-Picayune",
                "url": "https://www.nola.com/",
                "article_selector": ".headline a, .tnt-headline a",
                "title_selector": ".headline, .tnt-headline, h1",
                "content_selector": ".article-body, .tnt-content",
                "author_selector": ".byline, .tnt-byline",
                "date_selector": ".published-date, time",
                "image_selector": ".article-body img, .tnt-content img",
                "max_articles": 15
            },
            "gambit": {
                "name": "Gambit Weekly",
                "url": "https://www.nola.com/gambit/",
                "article_selector": ".headline a, .tnt-headline a",
                "title_selector": ".headline, .tnt-headline, h1",
                "content_selector": ".article-body, .tnt-content",
                "author_selector": ".byline, .tnt-byline",
                "date_selector": ".article-date, time",
                "image_selector": ".article-body img, .tnt-content img",
                "max_articles": 15
            },
            "wwltv": {
                "name": "WWL-TV",
                "url": "https://www.wwltv.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".article-meta time, .published-date",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "wdsu": {
                "name": "WDSU News",
                "url": "https://www.wdsu.com/",
                "article_selector": ".article-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".published-date, time",
                "image_selector": ".article-body img, .article-image img",
                "max_articles": 15
            },
            "theadvocate": {
                "name": "The Advocate",
                "url": "https://www.theadvocate.com/new_orleans/",
                "article_selector": ".tnt-headline a, .headline a",
                "title_selector": ".tnt-headline, .headline, h1",
                "content_selector": ".tnt-content, .article-body",
                "author_selector": ".tnt-byline, .byline",
                "date_selector": ".tnt-date, time",
                "image_selector": ".tnt-content img, .article-body img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"New Orleans News Scraper initialized with {len(self.sources)} sources") 