#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class CharlotteNewsScraper(BaseCityScraper):
    """Charlotte-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="charlotte_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Charlotte-specific details and Supabase support
        super().__init__(
            city_code="charlotte",
            city_name="Charlotte",
            region="North Carolina",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Charlotte-specific sources
        self.sources = {
            "charlotteobserver": {
                "name": "The Charlotte Observer",
                "url": "https://www.charlotteobserver.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".published-date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "wcnc": {
                "name": "WCNC Charlotte",
                "url": "https://www.wcnc.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".article-meta time, .published-date",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "qcitymetro": {
                "name": "QCity Metro",
                "url": "https://qcitymetro.com/",
                "article_selector": ".entry-title a, .article-title a",
                "title_selector": ".entry-title, .article-title, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .article-content img",
                "max_articles": 15
            },
            "wsoctv": {
                "name": "WSOC-TV",
                "url": "https://www.wsoctv.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "charlotteagenda": {
                "name": "Charlotte Agenda",
                "url": "https://charlotte.axios.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-content, .story-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .story-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Charlotte News Scraper initialized with {len(self.sources)} sources") 