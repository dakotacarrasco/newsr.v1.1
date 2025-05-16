#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class MinneapolisNewsScraper(BaseCityScraper):
    """Minneapolis-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="minneapolis_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Minneapolis-specific details and Supabase support
        super().__init__(
            city_code="minneapolis",
            city_name="Minneapolis",
            region="Minnesota",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Minneapolis-specific sources
        self.sources = {
            "startribune": {
                "name": "Star Tribune",
                "url": "https://www.startribune.com/local/",
                "article_selector": ".tease-headline a, .headline a",
                "title_selector": ".headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".article-dateline, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "mpr": {
                "name": "MPR News",
                "url": "https://www.mprnews.org/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".story-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".story-content img, .article-body img",
                "max_articles": 15
            },
            "citypages": {
                "name": "City Pages",
                "url": "http://www.citypages.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".body, .content",
                "author_selector": ".author, .byline",
                "date_selector": ".date, time",
                "image_selector": ".body img, .image img",
                "max_articles": 15
            },
            "kare11": {
                "name": "KARE 11",
                "url": "https://www.kare11.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".article-meta time, .published-date",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "minnpost": {
                "name": "MinnPost",
                "url": "https://www.minnpost.com/",
                "article_selector": ".entry-title a, .headline a",
                "title_selector": ".entry-title, .headline, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .article-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Minneapolis News Scraper initialized with {len(self.sources)} sources") 