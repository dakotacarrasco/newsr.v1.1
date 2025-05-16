#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class DenverNewsScraper(BaseCityScraper):
    """Denver-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="denver_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with Denver-specific details and Supabase support
        super().__init__(
            city_code="denver",
            city_name="Denver",
            region="Colorado",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Denver-specific sources
        self.sources = {
            "denverpost": {
                "name": "The Denver Post",
                "url": "https://www.denverpost.com/",
                "article_selector": ".article-title a, .entry-title a",
                "title_selector": ".article-title, .entry-title, h1",
                "content_selector": ".article-body, .entry-content",
                "author_selector": ".author, .byline",
                "date_selector": ".published-date, time",
                "image_selector": ".article-body img, .entry-content img",
                "max_articles": 15
            },
            "9news": {
                "name": "9NEWS",
                "url": "https://www.9news.com/",
                "article_selector": ".card-headline a, .headline a",
                "title_selector": ".article-headline, h1",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".article-meta time, .published-date",
                "image_selector": ".article-content img, .article-hero-image img",
                "max_articles": 15
            },
            "westword": {
                "name": "Westword",
                "url": "https://www.westword.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".body, .content",
                "author_selector": ".author, .byline",
                "date_selector": ".date, time",
                "image_selector": ".body img, .image img",
                "max_articles": 15
            },
            "denverite": {
                "name": "Denverite",
                "url": "https://denverite.com/",
                "article_selector": ".post-card a, .headline a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".entry-content, .post-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .featured-image img",
                "max_articles": 15
            },
            "cpr": {
                "name": "Colorado Public Radio",
                "url": "https://www.cpr.org/",
                "article_selector": ".post-title a, .headline a",
                "title_selector": ".post-title, .headline, h1",
                "content_selector": ".post-content, .content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time, .posted-on",
                "image_selector": ".post-content img, .featured-image img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"Denver News Scraper initialized with {len(self.sources)} sources") 