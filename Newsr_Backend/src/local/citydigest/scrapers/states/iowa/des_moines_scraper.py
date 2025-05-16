#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class DesMoinesNewsScraper(BaseCityScraper):
    """Des Moines-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="des_moines_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Des Moines-specific details and Supabase support
        super().__init__(
            city_code="des_moines",
            city_name="Des Moines",
            region="Iowa",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Des Moines-specific sources
        self.sources = {
            "dmregister": {
                "name": "Des Moines Register",
                "url": "https://www.desmoinesregister.com/",
                "article_selector": ".gnt_m_th a, .gnt_m_flm_a",
                "title_selector": ".gnt_ar_hl, h1",
                "content_selector": ".gnt_ar_b, .article-body",
                "author_selector": ".gnt_ar_by, .byline",
                "date_selector": ".gnt_ar_dt, time",
                "image_selector": ".gnt_ar_b img, .article-body img",
                "max_articles": 15
            },
            "whotv": {
                "name": "WHO TV NBC 13",
                "url": "https://who13.com/",
                "article_selector": ".article-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-content, .story-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .story-content img",
                "max_articles": 15
            },
            "kcci": {
                "name": "KCCI 8 News",
                "url": "https://www.kcci.com/",
                "article_selector": ".article-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "businessrecord": {
                "name": "Business Record",
                "url": "https://businessrecord.com/",
                "article_selector": ".entry-title a, .headline a",
                "title_selector": ".entry-title, .headline, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .article-content img",
                "max_articles": 15
            },
            "iowacapitaldispatch": {
                "name": "Iowa Capital Dispatch",
                "url": "https://iowacapitaldispatch.com/",
                "article_selector": ".entry-title a, .headline a",
                "title_selector": ".entry-title, .headline, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .article-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Des Moines News Scraper initialized with {len(self.sources)} sources") 