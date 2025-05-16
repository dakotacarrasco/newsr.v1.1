#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class NashvilleNewsScraper(BaseCityScraper):
    """Nashville-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="nashville_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Nashville-specific details and Supabase support
        super().__init__(
            city_code="nashville",
            city_name="Nashville",
            region="Tennessee",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Nashville-specific sources
        self.sources = {
            "tennessean": {
                "name": "The Tennessean",
                "url": "https://www.tennessean.com/",
                "article_selector": ".gnt_m_th a, .gnt_m_flm_a",
                "title_selector": ".gnt_ar_hl, h1",
                "content_selector": ".gnt_ar_b, .article-body",
                "author_selector": ".gnt_ar_by, .byline",
                "date_selector": ".gnt_ar_dt, time",
                "image_selector": ".gnt_ar_b img, .article-body img",
                "max_articles": 15
            },
            "nashvillescene": {
                "name": "Nashville Scene",
                "url": "https://www.nashvillescene.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".body, .content",
                "author_selector": ".author, .byline",
                "date_selector": ".date, time",
                "image_selector": ".body img, .image img",
                "max_articles": 15
            },
            "newschannel5": {
                "name": "NewsChannel 5 Nashville",
                "url": "https://www.newschannel5.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".article-meta time, .published-date",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "wsmv": {
                "name": "WSMV News 4",
                "url": "https://www.wsmv.com/",
                "article_selector": ".headline a, .story-headline a",
                "title_selector": ".headline, .story-headline, h1",
                "content_selector": ".story-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".story-datetime, time",
                "image_selector": ".story-content img, .article-body img",
                "max_articles": 15
            },
            "nashvillepost": {
                "name": "Nashville Post",
                "url": "https://www.nashvillepost.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-body img, .story-body img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Nashville News Scraper initialized with {len(self.sources)} sources") 