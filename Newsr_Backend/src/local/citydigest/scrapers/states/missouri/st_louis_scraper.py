#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class StLouisNewsScraper(BaseCityScraper):
    """St. Louis-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="st_louis_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with St. Louis-specific details and Supabase support
        super().__init__(
            city_code="st_louis",
            city_name="St. Louis",
            region="Missouri",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define St. Louis-specific sources
        self.sources = {
            "stltoday": {
                "name": "St. Louis Post-Dispatch",
                "url": "https://www.stltoday.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "riverfronttimes": {
                "name": "Riverfront Times",
                "url": "https://www.riverfronttimes.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-content, .story-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .story-content img",
                "max_articles": 15
            },
            "ksdk": {
                "name": "KSDK News",
                "url": "https://www.ksdk.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".article-meta time, .published-date",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "stlpr": {
                "name": "St. Louis Public Radio",
                "url": "https://news.stlpublicradio.org/",
                "article_selector": ".entry-title a, .title a",
                "title_selector": ".entry-title, .title, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .article-content img",
                "max_articles": 15
            },
            "stlbusinessjournal": {
                "name": "St. Louis Business Journal",
                "url": "https://www.bizjournals.com/stlouis/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-content, .story-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .story-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"St. Louis News Scraper initialized with {len(self.sources)} sources") 