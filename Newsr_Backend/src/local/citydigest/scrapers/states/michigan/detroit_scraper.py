#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class DetroitNewsScraper(BaseCityScraper):
    """Detroit-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="detroit_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Detroit-specific details and Supabase support
        super().__init__(
            city_code="detroit",
            city_name="Detroit",
            region="Michigan",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Detroit-specific sources
        self.sources = {
            "detroitnews": {
                "name": "The Detroit News",
                "url": "https://www.detroitnews.com/",
                "article_selector": ".gnt_m_th a, .gnt_m_flm_a",
                "title_selector": ".gnt_ar_hl, h1",
                "content_selector": ".gnt_ar_b, .article-body",
                "author_selector": ".gnt_ar_by, .byline",
                "date_selector": ".gnt_ar_dt, time",
                "image_selector": ".gnt_ar_b img, .article-body img",
                "max_articles": 15
            },
            "freep": {
                "name": "Detroit Free Press",
                "url": "https://www.freep.com/",
                "article_selector": ".gnt_m_th a, .gnt_m_flm_a",
                "title_selector": ".gnt_ar_hl, h1",
                "content_selector": ".gnt_ar_b, .article-body",
                "author_selector": ".gnt_ar_by, .byline",
                "date_selector": ".gnt_ar_dt, time",
                "image_selector": ".gnt_ar_b img, .article-body img",
                "max_articles": 15
            },
            "metrotimes": {
                "name": "Metro Times",
                "url": "https://www.metrotimes.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".body, .content",
                "author_selector": ".author, .byline",
                "date_selector": ".date, time",
                "image_selector": ".body img, .image img",
                "max_articles": 15
            },
            "wxyz": {
                "name": "WXYZ Detroit",
                "url": "https://www.wxyz.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".article-meta time, .published-date",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "deadlinedetroit": {
                "name": "Deadline Detroit",
                "url": "https://www.deadlinedetroit.com/",
                "article_selector": ".article-title a, .headline a",
                "title_selector": ".article-title, .headline, h1",
                "content_selector": ".article-content, .story-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .story-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Detroit News Scraper initialized with {len(self.sources)} sources") 