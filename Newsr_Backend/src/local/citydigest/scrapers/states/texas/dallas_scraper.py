#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class DallasNewsScraper(BaseCityScraper):
    """Dallas-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="dallas_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Dallas-specific details and Supabase support
        super().__init__(
            city_code="dallas",
            city_name="Dallas",
            region="Texas",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Dallas-specific sources
        self.sources = {
            "dallasnews": {
                "name": "The Dallas Morning News",
                "url": "https://www.dallasnews.com/",
                "article_selector": ".headline a, .article-headline a",
                "title_selector": ".headline, .article-headline, h1",
                "content_selector": ".article-body, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .article-image img",
                "max_articles": 15
            },
            "dmagazine": {
                "name": "D Magazine",
                "url": "https://www.dmagazine.com/",
                "article_selector": ".article-title a, .entry-title a",
                "title_selector": ".article-title, .entry-title, h1",
                "content_selector": ".article-content, .entry-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .entry-content img",
                "max_articles": 15
            },
            "wfaa": {
                "name": "WFAA",
                "url": "https://www.wfaa.com/",
                "article_selector": ".card a, .headline a",
                "title_selector": ".headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .article-image img",
                "max_articles": 15
            },
            "nbcdfw": {
                "name": "NBC DFW",
                "url": "https://www.nbcdfw.com/",
                "article_selector": ".story-link, .article-link",
                "title_selector": ".article-title, h1",
                "content_selector": ".article-content, .entry-content",
                "author_selector": ".byline, .author",
                "date_selector": ".published-date, time",
                "image_selector": ".article-content img, .featured-image img",
                "max_articles": 15
            },
            "advocatemag": {
                "name": "Advocate Magazine",
                "url": "https://lakewood.advocatemag.com/",
                "article_selector": ".post-title a, .entry-title a",
                "title_selector": ".post-title, .entry-title, h1",
                "content_selector": ".post-content, .entry-content",
                "author_selector": ".author, .byline",
                "date_selector": ".date, time",
                "image_selector": ".post-content img, .entry-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Dallas News Scraper initialized with {len(self.sources)} sources") 