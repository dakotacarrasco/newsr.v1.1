#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class MilwaukeeNewsScraper(BaseCityScraper):
    """Milwaukee-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="milwaukee_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Milwaukee-specific details and Supabase support
        super().__init__(
            city_code="milwaukee",
            city_name="Milwaukee",
            region="Wisconsin",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Milwaukee-specific sources
        self.sources = {
            "jsonline": {
                "name": "Milwaukee Journal Sentinel",
                "url": "https://www.jsonline.com/",
                "article_selector": ".gnt_m_th a, .gnt_m_flm_a",
                "title_selector": ".gnt_ar_hl, h1",
                "content_selector": ".gnt_ar_b, .article-body",
                "author_selector": ".gnt_ar_by, .byline",
                "date_selector": ".gnt_ar_dt, time",
                "image_selector": ".gnt_ar_b img, .article-body img",
                "max_articles": 15
            },
            "biztimes": {
                "name": "BizTimes Milwaukee",
                "url": "https://biztimes.com/",
                "article_selector": ".entry-title a, .headline a",
                "title_selector": ".entry-title, .headline, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .article-content img",
                "max_articles": 15
            },
            "tmj4": {
                "name": "TMJ4 News",
                "url": "https://www.tmj4.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".article-meta time, .published-date",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "urbanmilwaukee": {
                "name": "Urban Milwaukee",
                "url": "https://urbanmilwaukee.com/",
                "article_selector": ".headline a, .article-title a",
                "title_selector": ".headline, .article-title, h1",
                "content_selector": ".article-body, .story-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-content img",
                "max_articles": 15
            },
            "shepherdexpress": {
                "name": "Shepherd Express",
                "url": "https://shepherdexpress.com/",
                "article_selector": ".title a, .article-title a",
                "title_selector": ".title, .article-title, h1",
                "content_selector": ".content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".content img, .article-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Milwaukee News Scraper initialized with {len(self.sources)} sources") 