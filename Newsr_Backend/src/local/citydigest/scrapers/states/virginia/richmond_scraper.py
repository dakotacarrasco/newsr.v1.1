#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class RichmondNewsScraper(BaseCityScraper):
    """Richmond-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="richmond_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Richmond-specific details and Supabase support
        super().__init__(
            city_code="richmond",
            city_name="Richmond",
            region="Virginia",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Richmond-specific sources
        self.sources = {
            "timesdispatch": {
                "name": "Richmond Times-Dispatch",
                "url": "https://richmond.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "styleweekly": {
                "name": "Style Weekly",
                "url": "https://www.styleweekly.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-content, .story-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .story-content img",
                "max_articles": 15
            },
            "nbc12": {
                "name": "NBC 12 News",
                "url": "https://www.nbc12.com/",
                "article_selector": ".headline a, .story-link",
                "title_selector": ".headline, .story-title, h1",
                "content_selector": ".story-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".story-content img, .article-body img",
                "max_articles": 15
            },
            "wric": {
                "name": "WRIC ABC 8News",
                "url": "https://www.wric.com/",
                "article_selector": ".article-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-content, .story-content",
                "author_selector": ".byline, .author",
                "date_selector": ".article-date, time",
                "image_selector": ".article-content img, .story-content img",
                "max_articles": 15
            },
            "richmondbizsense": {
                "name": "Richmond BizSense",
                "url": "https://richmondbizsense.com/",
                "article_selector": ".entry-title a, .headline a",
                "title_selector": ".entry-title, .headline, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .article-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Richmond News Scraper initialized with {len(self.sources)} sources") 