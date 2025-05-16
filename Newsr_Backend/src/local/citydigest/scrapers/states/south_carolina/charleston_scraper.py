#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class CharlestonNewsScraper(BaseCityScraper):
    """Charleston-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="charleston_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Charleston-specific details and Supabase support
        super().__init__(
            city_code="charleston",
            city_name="Charleston",
            region="South Carolina",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Charleston-specific sources
        self.sources = {
            "postandcourier": {
                "name": "The Post and Courier",
                "url": "https://www.postandcourier.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "live5news": {
                "name": "Live 5 News WCSC",
                "url": "https://www.live5news.com/",
                "article_selector": ".headline a, .story-link",
                "title_selector": ".headline, .story-title, h1",
                "content_selector": ".story-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".story-content img, .article-body img",
                "max_articles": 15
            },
            "counton2": {
                "name": "Count on 2 WCBD",
                "url": "https://www.counton2.com/",
                "article_selector": ".article-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-content, .story-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .story-content img",
                "max_articles": 15
            },
            "charlestoncitypaper": {
                "name": "Charleston City Paper",
                "url": "https://charlestoncitypaper.com/",
                "article_selector": ".entry-title a, .headline a",
                "title_selector": ".entry-title, .headline, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .article-content img",
                "max_articles": 15
            },
            "charlestonbusiness": {
                "name": "Charleston Regional Business Journal",
                "url": "https://charlestonbusiness.com/",
                "article_selector": ".entry-title a, .headline a",
                "title_selector": ".entry-title, .headline, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .article-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Charleston News Scraper initialized with {len(self.sources)} sources") 