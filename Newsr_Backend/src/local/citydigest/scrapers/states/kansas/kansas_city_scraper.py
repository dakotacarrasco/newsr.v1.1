#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class KansasCityNewsScraper(BaseCityScraper):
    """Kansas City-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="kansas_city_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Kansas City-specific details and Supabase support
        super().__init__(
            city_code="kansas_city",
            city_name="Kansas City",
            region="Kansas",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Kansas City-specific sources
        self.sources = {
            "kansascity": {
                "name": "The Kansas City Star",
                "url": "https://www.kansascity.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "kmbc": {
                "name": "KMBC News",
                "url": "https://www.kmbc.com/",
                "article_selector": ".article-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "kshb": {
                "name": "KSHB 41 News",
                "url": "https://www.kshb.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".article-meta time, .published-date",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "kcur": {
                "name": "KCUR",
                "url": "https://www.kcur.org/",
                "article_selector": ".entry-title a, .title a",
                "title_selector": ".entry-title, .title, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .article-content img",
                "max_articles": 15
            },
            "bizjournal": {
                "name": "Kansas City Business Journal",
                "url": "https://www.bizjournals.com/kansascity/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-content, .story-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .story-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Kansas City News Scraper initialized with {len(self.sources)} sources") 