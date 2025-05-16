#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class PortlandNewsScraper(BaseCityScraper):
    """Portland-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="portland_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Portland-specific details and Supabase support
        super().__init__(
            city_code="portland",
            city_name="Portland",
            region="Oregon",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Portland-specific sources
        self.sources = {
            "oregonian": {
                "name": "The Oregonian",
                "url": "https://www.oregonlive.com/",
                "article_selector": ".headline a, .entry-title a",
                "title_selector": ".headline, .entry-title, h1",
                "content_selector": ".entry-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".published-date, time",
                "image_selector": ".entry-content img, .article-body img",
                "max_articles": 15
            },
            "portlandmercury": {
                "name": "Portland Mercury",
                "url": "https://www.portlandmercury.com/",
                "article_selector": ".headline a, .article-title a",
                "title_selector": ".headline, .article-title, h1",
                "content_selector": ".post-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".post-content img, .article-body img",
                "max_articles": 15
            },
            "kgw": {
                "name": "KGW News",
                "url": "https://www.kgw.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".published-date, time",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "koin": {
                "name": "KOIN 6 News",
                "url": "https://www.koin.com/",
                "article_selector": ".article-list a, .story-list a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-content, .rich-text",
                "author_selector": ".article-meta .author, .byline",
                "date_selector": ".article-date, time",
                "image_selector": ".article-featured-image img, .article-content img",
                "max_articles": 15
            },
            "wweek": {
                "name": "Willamette Week",
                "url": "https://www.wweek.com/",
                "article_selector": ".article-title a, .headline a",
                "title_selector": ".article-title, .headline, h1",
                "content_selector": ".article-content, .entry-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .entry-content img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Portland News Scraper initialized with {len(self.sources)} sources") 