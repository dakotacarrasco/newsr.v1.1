#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class LouisvilleNewsScraper(BaseCityScraper):
    """Louisville-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="louisville_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Louisville-specific details and Supabase support
        super().__init__(
            city_code="louisville",
            city_name="Louisville",
            region="Kentucky",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Louisville-specific sources
        self.sources = {
            "courier_journal": {
                "name": "The Courier-Journal",
                "url": "https://www.courier-journal.com/",
                "article_selector": ".gnt_m_th a, .gnt_m_flm_a",
                "title_selector": ".gnt_ar_hl, h1",
                "content_selector": ".gnt_ar_b, .article-body",
                "author_selector": ".gnt_ar_by, .byline",
                "date_selector": ".gnt_ar_dt, time",
                "image_selector": ".gnt_ar_b img, .article-body img",
                "max_articles": 15
            },
            "wdrb": {
                "name": "WDRB News",
                "url": "https://www.wdrb.com/",
                "article_selector": ".headline a, .story-link",
                "title_selector": ".headline, .story-title, h1",
                "content_selector": ".story-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".story-content img, .article-body img",
                "max_articles": 15
            },
            "wave3": {
                "name": "WAVE 3 News",
                "url": "https://www.wave3.com/",
                "article_selector": ".headline a, .story-link",
                "title_selector": ".headline, .story-title, h1",
                "content_selector": ".story-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".story-content img, .article-body img",
                "max_articles": 15
            },
            "whas11": {
                "name": "WHAS11 News",
                "url": "https://www.whas11.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".article-meta time, .published-date",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "louisvillebusiness": {
                "name": "Louisville Business First",
                "url": "https://www.bizjournals.com/louisville/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-content, .story-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .story-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Louisville News Scraper initialized with {len(self.sources)} sources") 