#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class SaltLakeCityNewsScraper(BaseCityScraper):
    """Salt Lake City-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="salt_lake_city_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Salt Lake City-specific details and Supabase support
        super().__init__(
            city_code="salt_lake_city",
            city_name="Salt Lake City",
            region="Utah",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Salt Lake City-specific sources
        self.sources = {
            "sltrib": {
                "name": "The Salt Lake Tribune",
                "url": "https://www.sltrib.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "deseretnews": {
                "name": "Deseret News",
                "url": "https://www.deseret.com/utah",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "ksl": {
                "name": "KSL.com",
                "url": "https://www.ksl.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "fox13": {
                "name": "FOX 13 News Utah",
                "url": "https://www.fox13now.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".article-meta time, .published-date",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "cityweekly": {
                "name": "Salt Lake City Weekly",
                "url": "https://www.cityweekly.net/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Salt Lake City News Scraper initialized with {len(self.sources)} sources") 