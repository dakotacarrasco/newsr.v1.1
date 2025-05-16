#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class HartfordNewsScraper(BaseCityScraper):
    """Hartford-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="hartford_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Hartford-specific details and Supabase support
        super().__init__(
            city_code="hartford",
            city_name="Hartford",
            region="Connecticut",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Hartford-specific sources
        self.sources = {
            "courant": {
                "name": "Hartford Courant",
                "url": "https://www.courant.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "nbcconnecticut": {
                "name": "NBC Connecticut",
                "url": "https://www.nbcconnecticut.com/",
                "article_selector": ".article-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-content, .story-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .story-content img",
                "max_articles": 15
            },
            "wfsb": {
                "name": "WFSB Channel 3",
                "url": "https://www.wfsb.com/",
                "article_selector": ".headline a, .story-link",
                "title_selector": ".headline, .story-title, h1",
                "content_selector": ".story-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".story-content img, .article-body img",
                "max_articles": 15
            },
            "hartfordbusiness": {
                "name": "Hartford Business Journal",
                "url": "https://www.hartfordbusiness.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-content, .story-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .story-content img",
                "max_articles": 15
            },
            "ctnewsjunkie": {
                "name": "CT News Junkie",
                "url": "https://ctnewsjunkie.com/",
                "article_selector": ".entry-title a, .headline a",
                "title_selector": ".entry-title, .headline, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .article-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Hartford News Scraper initialized with {len(self.sources)} sources") 