#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class NYCNewsScraper(BaseCityScraper):
    """New York City-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="nyc_news", timeout=30, retry_count=2,
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with NYC-specific details and Supabase support
        super().__init__(
            city_code="nyc",
            city_name="New York City",
            region="New York",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define NYC-specific sources
        self.sources = {
            "nytimes": {
                "name": "The New York Times",
                "url": "https://www.nytimes.com/section/nyregion",
                "article_selector": ".css-ye6x8s a, .story-wrapper a",
                "title_selector": "h1.css-1aw8gu7, h1.e1h9rw200",
                "content_selector": ".css-53u6y8, .StoryBodyCompanionColumn",
                "author_selector": ".css-1baulvz, .last-byline",
                "date_selector": "time, .css-1sbuyqj",
                "image_selector": ".css-rq4mmj img, picture img",
                "max_articles": 15
            },
            "nypost": {
                "name": "New York Post",
                "url": "https://nypost.com/metro/",
                "article_selector": ".story__headline a, .entry-heading a",
                "title_selector": ".headline__text, h1",
                "content_selector": ".entry-content, .single__content",
                "author_selector": ".byline__author, .author-name",
                "date_selector": ".entry-meta time, .published-date",
                "image_selector": ".entry-content img, .article__featured-image",
                "max_articles": 15
            },
            "gothamist": {
                "name": "Gothamist",
                "url": "https://gothamist.com/",
                "article_selector": ".headline a, .entry-title a",
                "title_selector": ".headline, h1",
                "content_selector": ".entry-content, .article-body",
                "author_selector": ".byline, .author",
                "date_selector": ".published-date, time",
                "image_selector": ".entry-content img, .lead-asset img",
                "max_articles": 15
            },
            "ny1": {
                "name": "NY1",
                "url": "https://www.ny1.com/nyc/all-boroughs",
                "article_selector": ".card__headline a, .headline a",
                "title_selector": ".article__headline, h1",
                "content_selector": ".article__body, .story-body",
                "author_selector": ".article__byline, .byline",
                "date_selector": ".published-date, time",
                "image_selector": ".article__body img, .article__hero-image img",
                "max_articles": 15
            },
            "amny": {
                "name": "amNewYork",
                "url": "https://www.amny.com/",
                "article_selector": ".article-title a, .entry-title a",
                "title_selector": ".article-title, h1",
                "content_selector": ".article-content, .entry-content",
                "author_selector": ".byline, .author",
                "date_selector": ".published-date, time",
                "image_selector": ".article-content img, .featured-image img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"NYC News Scraper initialized with {len(self.sources)} sources") 