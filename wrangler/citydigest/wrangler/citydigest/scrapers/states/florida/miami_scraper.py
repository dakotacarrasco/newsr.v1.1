#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class MiamiNewsScraper(BaseCityScraper):
    """Miami-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="miami_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Miami-specific details and Supabase support
        super().__init__(
            city_code="miami",
            city_name="Miami",
            region="Florida",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Miami-specific sources
        self.sources = {
            "miamiherald": {
                "name": "Miami Herald",
                "url": "https://www.miamiherald.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".story-body, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".published-date, time",
                "image_selector": ".story-body img, .article-body img",
                "max_articles": 15
            },
            "miaminewtimes": {
                "name": "Miami New Times",
                "url": "https://www.miaminewtimes.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".content, .body",
                "author_selector": ".author, .byline",
                "date_selector": ".date, time",
                "image_selector": ".content img, .image img",
                "max_articles": 15
            },
            "wlrn": {
                "name": "WLRN",
                "url": "https://www.wlrn.org/",
                "article_selector": ".title a, .headline a",
                "title_selector": ".title, .headline, h1",
                "content_selector": ".rich-text, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".rich-text img, .story-featured-image img",
                "max_articles": 15
            },
            "local10": {
                "name": "Local 10 News",
                "url": "https://www.local10.com/",
                "article_selector": ".headline a, .card-headline a",
                "title_selector": ".headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .image-container img",
                "max_articles": 15
            },
            "thenextmiami": {
                "name": "The Next Miami",
                "url": "https://www.thenextmiami.com/",
                "article_selector": ".entry-title a, .headline a",
                "title_selector": ".entry-title, .headline, h1",
                "content_selector": ".entry-content, .post-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .featured-image img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Miami News Scraper initialized with {len(self.sources)} sources") 