#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class OklahomaCityNewsScraper(BaseCityScraper):
    """Oklahoma City-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="oklahoma_city_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Oklahoma City-specific details and Supabase support
        super().__init__(
            city_code="oklahoma_city",
            city_name="Oklahoma City",
            region="Oklahoma",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Oklahoma City-specific sources
        self.sources = {
            "oklahoman": {
                "name": "The Oklahoman",
                "url": "https://www.oklahoman.com/",
                "article_selector": ".gnt_m_th a, .gnt_m_flm_a",
                "title_selector": ".gnt_ar_hl, h1",
                "content_selector": ".gnt_ar_b, .article-body",
                "author_selector": ".gnt_ar_by, .byline",
                "date_selector": ".gnt_ar_dt, time",
                "image_selector": ".gnt_ar_b img, .article-body img",
                "max_articles": 15
            },
            "kfor": {
                "name": "KFOR.com",
                "url": "https://kfor.com/",
                "article_selector": ".article-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-content, .story-content",
                "author_selector": ".byline, .author",
                "date_selector": ".posted-date, time",
                "image_selector": ".article-content img, .story-content img",
                "max_articles": 15
            },
            "news9": {
                "name": "News 9",
                "url": "https://www.news9.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            },
            "journalrecord": {
                "name": "The Journal Record",
                "url": "https://journalrecord.com/",
                "article_selector": ".entry-title a, .headline a",
                "title_selector": ".entry-title, .headline, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .article-content img",
                "max_articles": 15
            },
            "okgazette": {
                "name": "Oklahoma Gazette",
                "url": "https://www.okgazette.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Oklahoma City News Scraper initialized with {len(self.sources)} sources") 