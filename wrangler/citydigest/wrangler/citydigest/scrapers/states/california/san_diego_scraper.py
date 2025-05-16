#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class SanDiegoNewsScraper(BaseCityScraper):
    """San Diego-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="san_diego_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with San Diego-specific details and Supabase support
        super().__init__(
            city_code="san_diego",
            city_name="San Diego",
            region="California",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define San Diego-specific sources
        self.sources = {
            "sandiegouniontribune": {
                "name": "San Diego Union-Tribune",
                "url": "https://www.sandiegouniontribune.com/",
                "article_selector": ".headline a, .title a",
                "title_selector": ".headline, .title, h1",
                "content_selector": ".story-body, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date-publish, time",
                "image_selector": ".story-body img, .article-body img",
                "max_articles": 15
            },
            "kpbs": {
                "name": "KPBS",
                "url": "https://www.kpbs.org/",
                "article_selector": ".card__title a, .headline a",
                "title_selector": ".article__title, .headline, h1",
                "content_selector": ".article__body, .story-body",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".article__body img, .lead-image img",
                "max_articles": 15
            },
            "sandiegoreader": {
                "name": "San Diego Reader",
                "url": "https://www.sandiegoreader.com/",
                "article_selector": ".title a, .headline a",
                "title_selector": ".title, .headline, h1",
                "content_selector": ".body, .content",
                "author_selector": ".author, .byline",
                "date_selector": ".date, time",
                "image_selector": ".body img, .content img",
                "max_articles": 15
            },
            "nbcsandiego": {
                "name": "NBC San Diego",
                "url": "https://www.nbcsandiego.com/",
                "article_selector": ".story-link, .article-link",
                "title_selector": ".article-title, h1",
                "content_selector": ".article-content, .entry-content",
                "author_selector": ".byline, .author",
                "date_selector": ".published-date, time",
                "image_selector": ".article-content img, .featured-image img",
                "max_articles": 15
            },
            "voiceofsandiego": {
                "name": "Voice of San Diego",
                "url": "https://www.voiceofsandiego.org/",
                "article_selector": ".entry-title a, .post-title a",
                "title_selector": ".entry-title, .post-title, h1",
                "content_selector": ".entry-content, .post-content",
                "author_selector": ".byline, .author",
                "date_selector": ".date, time",
                "image_selector": ".entry-content img, .featured-image img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"San Diego News Scraper initialized with {len(self.sources)} sources") 