#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class BostonNewsScraper(BaseCityScraper):
    """Boston-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="boston_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Boston-specific details and Supabase support
        super().__init__(
            city_code="boston",
            city_name="Boston",
            region="Massachusetts",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Boston-specific sources
        self.sources = {
            "bostonglobe": {
                "name": "The Boston Globe",
                "url": "https://www.bostonglobe.com/",
                "article_selector": ".headline a, .article-title a",
                "title_selector": ".headline, .article-title, h1",
                "content_selector": ".article-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".article-date, time",
                "image_selector": ".article-content img, .article-image img",
                "max_articles": 15
            },
            "wbur": {
                "name": "WBUR",
                "url": "https://www.wbur.org/",
                "article_selector": ".card__title a, .headline a",
                "title_selector": ".article-title, .headline, h1",
                "content_selector": ".article-content, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .story-featured-image img",
                "max_articles": 15
            },
            "bostonherald": {
                "name": "Boston Herald",
                "url": "https://www.bostonherald.com/",
                "article_selector": ".article-title a, .entry-title a",
                "title_selector": ".article-title, .entry-title, h1",
                "content_selector": ".article-body, .entry-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date-published, time",
                "image_selector": ".article-body img, .entry-content img",
                "max_articles": 15
            },
            "wcvb": {
                "name": "WCVB Boston",
                "url": "https://www.wcvb.com/",
                "article_selector": ".article-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".published-date, time",
                "image_selector": ".article-body img, .article-image img",
                "max_articles": 15
            },
            "universalhub": {
                "name": "Universal Hub",
                "url": "https://www.universalhub.com/",
                "article_selector": ".views-field-title a, .field-content a",
                "title_selector": ".node-title, h1.title",
                "content_selector": ".node-content, .field-body",
                "author_selector": ".username, .author",
                "date_selector": ".submitted, time",
                "image_selector": ".node-content img, .field-body img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Boston News Scraper initialized with {len(self.sources)} sources") 