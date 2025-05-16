#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class LasVegasNewsScraper(BaseCityScraper):
    """Las Vegas-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="las_vegas_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Las Vegas-specific details and Supabase support
        super().__init__(
            city_code="las_vegas",
            city_name="Las Vegas",
            region="Nevada",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Las Vegas-specific sources
        self.sources = {
            "reviewjournal": {
                "name": "Las Vegas Review-Journal",
                "url": "https://www.reviewjournal.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".content-body, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".content-body img, .article-body img",
                "max_articles": 15
            },
            "lasvegassun": {
                "name": "Las Vegas Sun",
                "url": "https://lasvegassun.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".story-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".story-content img, .article-body img",
                "max_articles": 15
            },
            "ktnv": {
                "name": "KTNV Las Vegas",
                "url": "https://www.ktnv.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".article-meta time, .published-date",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "8newsnow": {
                "name": "8 News Now",
                "url": "https://www.8newsnow.com/",
                "article_selector": ".article-list a, .story-list a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-content, .rich-text",
                "author_selector": ".article-meta .author, .byline",
                "date_selector": ".article-date, time",
                "image_selector": ".article-featured-image img, .article-content img",
                "max_articles": 15
            },
            "vegasinc": {
                "name": "Vegas Inc",
                "url": "https://vegasinc.lasvegassun.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".story-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".story-content img, .article-body img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Las Vegas News Scraper initialized with {len(self.sources)} sources") 