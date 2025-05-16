#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class AustinNewsScraper(BaseCityScraper):
    """Austin-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="austin_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Austin-specific details and Supabase support
        super().__init__(
            city_code="austin",
            city_name="Austin",
            region="Texas",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Austin-specific sources
        self.sources = {
            "statesman": {
                "name": "Austin American-Statesman",
                "url": "https://www.statesman.com/",
                "article_selector": ".gnt_m_th a, .gnt_m_flm_a",
                "title_selector": ".gnt_ar_hl, h1",
                "content_selector": ".gnt_ar_b, .article-body",
                "author_selector": ".gnt_ar_by, .byline",
                "date_selector": ".gnt_ar_dt, time",
                "image_selector": ".gnt_ar_b img, .article-body img",
                "max_articles": 15
            },
            "kvue": {
                "name": "KVUE",
                "url": "https://www.kvue.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".article-meta time, .published-date",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "austinchronicle": {
                "name": "Austin Chronicle",
                "url": "https://www.austinchronicle.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".body, .article-body",
                "author_selector": ".author, .byline",
                "date_selector": ".date, time",
                "image_selector": ".body img, .article-image img",
                "max_articles": 15
            },
            "austinmonitor": {
                "name": "Austin Monitor",
                "url": "https://www.austinmonitor.com/",
                "article_selector": ".entry-title a, .article-title a",
                "title_selector": ".entry-title, h1",
                "content_selector": ".entry-content, .article-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .article-featured-image img",
                "max_articles": 15
            },
            "kxan": {
                "name": "KXAN",
                "url": "https://www.kxan.com/",
                "article_selector": ".article-list a, .story-list a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-content, .rich-text",
                "author_selector": ".article-meta .author, .byline",
                "date_selector": ".article-date, time",
                "image_selector": ".article-featured-image img, .article-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Austin News Scraper initialized with {len(self.sources)} sources") 