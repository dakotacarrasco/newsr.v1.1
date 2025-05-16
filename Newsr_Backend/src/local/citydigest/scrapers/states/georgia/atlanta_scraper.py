#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class AtlantaNewsScraper(BaseCityScraper):
    """Atlanta-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="atlanta_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Atlanta-specific details and Supabase support
        super().__init__(
            city_code="atlanta",
            city_name="Atlanta",
            region="Georgia",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Atlanta-specific sources
        self.sources = {
            "ajc": {
                "name": "The Atlanta Journal-Constitution",
                "url": "https://www.ajc.com/",
                "article_selector": ".headline a, .tease-headline a",
                "title_selector": ".headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".published-date, time",
                "image_selector": ".article-body img, .lead-art img",
                "max_articles": 15
            },
            "atlbusinesschronicle": {
                "name": "Atlanta Business Chronicle",
                "url": "https://www.bizjournals.com/atlanta/",
                "article_selector": ".title a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-content, .content-well",
                "author_selector": ".author-byline, .byline",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .featured-image img",
                "max_articles": 15
            },
            "11alive": {
                "name": "11Alive",
                "url": "https://www.11alive.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".article-meta time, .published-date",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "fox5atlanta": {
                "name": "FOX 5 Atlanta",
                "url": "https://www.fox5atlanta.com/",
                "article_selector": ".story-list a, .title-link a",
                "title_selector": ".headline, .story-headline, h1",
                "content_selector": ".story-content, .article-body",
                "author_selector": ".author, .byline",
                "date_selector": ".updated-date, time",
                "image_selector": ".story-content img, .article-body img",
                "max_articles": 15
            },
            "creativeloafing": {
                "name": "Creative Loafing Atlanta",
                "url": "https://creativeloafing.com/",
                "article_selector": ".article-title a, .headline a",
                "title_selector": ".article-title, h1",
                "content_selector": ".article-content, .post-content",
                "author_selector": ".author, .byline",
                "date_selector": ".date, time",
                "image_selector": ".article-content img, .article-featured-image img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Atlanta News Scraper initialized with {len(self.sources)} sources") 