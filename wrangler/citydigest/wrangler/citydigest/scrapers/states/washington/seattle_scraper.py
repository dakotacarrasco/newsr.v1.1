#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class SeattleNewsScraper(BaseCityScraper):
    """Seattle-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="seattle_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Seattle-specific details and Supabase support
        super().__init__(
            city_code="seattle",
            city_name="Seattle",
            region="Washington",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Seattle-specific sources
        self.sources = {
            "seattletimes": {
                "name": "The Seattle Times",
                "url": "https://www.seattletimes.com/",
                "article_selector": ".article-title a, .entry-title a, .card-title a",
                "title_selector": ".article-title, .entry-title, h1",
                "content_selector": ".article-body, .entry-content, .article-content",
                "author_selector": ".byline, .author-name, .article-byline",
                "date_selector": ".article-date, time, .published-date",
                "image_selector": ".article-body img, .entry-content img, .article-content img",
                "max_articles": 15
            },
            "seattlepi": {
                "name": "Seattle Post-Intelligencer",
                "url": "https://www.seattlepi.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".published-date, time",
                "image_selector": ".article-content img, .story-image img",
                "max_articles": 15
            },
            "thestranger": {
                "name": "The Stranger",
                "url": "https://www.thestranger.com/",
                "article_selector": ".headline a, .article-title a",
                "title_selector": ".headline, .article-title, h1",
                "content_selector": ".article-content, .entry-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .entry-content img",
                "max_articles": 15
            },
            "crosscut": {
                "name": "Crosscut",
                "url": "https://crosscut.com/",
                "article_selector": ".post-title a, .headline a",
                "title_selector": ".post-title, .headline, h1",
                "content_selector": ".post-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".post-content img, .article-body img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Seattle News Scraper initialized with {len(self.sources)} sources") 