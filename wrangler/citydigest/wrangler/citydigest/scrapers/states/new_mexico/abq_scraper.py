#!/usr/bin/env python3
from ...base_scraper import BaseCityScraper

class ABQNewsScraper(BaseCityScraper):
    """Albuquerque-specific news scraper"""
    
    def __init__(self, headless=True, output_dir="abq_news", timeout=30, retry_count=2, 
                 use_supabase=False, supabase_client=None, safe_json_handling=False):
        # Initialize with ABQ-specific details
        super().__init__(
            city_code="abq",
            city_name="Albuquerque",
            region="New Mexico",
            headless=headless,
            output_dir=output_dir,
            timeout=timeout,
            retry_count=retry_count,
            use_supabase=use_supabase,
            supabase_client=supabase_client,
            safe_json_handling=safe_json_handling
        )
        
        # Define Albuquerque-specific sources
        self.sources = {
            "abqjournal": {
                "name": "Albuquerque Journal",
                "url": "https://www.abqjournal.com/",
                "article_selector": ".headline a, .entry-title a, .tnt-headline a",
                "title_selector": ".headline, .entry-title, .tnt-headline",
                "content_selector": ".entry-content, .asset-content, .tnt-content",
                "author_selector": ".byline, .tnt-byline",
                "date_selector": ".published-date, time, .tnt-date",
                "image_selector": ".entry-content img, .asset-content img, .tnt-content img, .image img",
                "max_articles": 15
            },
            "kob": {
                "name": "KOB 4",
                "url": "https://www.kob.com/",
                "article_selector": ".card a, .article-headline a, .headline a",
                "title_selector": ".article-headline, h1.headline, .card-headline",
                "content_selector": ".article-body, .story-content, .article-content",
                "author_selector": ".article-byline, .byline",
                "date_selector": ".article-date, .published-date, time",
                "image_selector": ".article-body img, .story-content img, .article-featured-image img",
                "max_articles": 15
            },
            "citydesk": {
                "name": "City Desk ABQ",
                "url": "https://citydesk.nm.news/",
                "article_selector": "article h2 a, .featured h2 a, .entry-title a",
                "title_selector": "h1.entry-title, article h2, .featured h2",
                "content_selector": ".entry-content, article .content, .post-content",
                "author_selector": ".author, .byline, article .meta a",
                "date_selector": "time, .date, .meta time",
                "image_selector": ".entry-content img, article img, .featured img",
                "max_articles": 15
            },
            "abqraw": {
                "name": "ABQ RAW",
                "url": "https://abqraw.com/",
                "article_selector": ".post-title a, h4 a, .entry-title a",
                "title_selector": ".post-title, h4, .entry-title, h1",
                "content_selector": ".post-content, .entry-content, article .content",
                "author_selector": ".post-author, .author, .byline",
                "date_selector": ".post-date, time, .date",
                "image_selector": ".post-content img, .entry-content img, article img",
                "max_articles": 15
            },
            "sourcenm": {
                "name": "Source New Mexico",
                "url": "https://sourcenm.com/",
                "article_selector": ".post-title a, .entry-title a, article h2 a",
                "title_selector": ".post-title, .entry-title, article h1",
                "content_selector": ".entry-content, .post-content, article .content",
                "author_selector": ".byline, .author, .meta-author",
                "date_selector": ".post-date, time, .meta-date",
                "image_selector": ".featured-image img, .post-thumbnail img, .entry-content img",
                "max_articles": 15
            },
            "krqe": {
                "name": "KRQE News 13",
                "url": "https://www.krqe.com/",
                "article_selector": ".article-list article a, .story-list .story a",
                "title_selector": "h1.article-headline, .entry-title",
                "content_selector": ".article-content, .entry-content",
                "author_selector": ".author-name, .byline",
                "date_selector": ".article-date, time.entry-date",
                "image_selector": ".article-featured-image img, .wp-post-image",
                "max_articles": 15
            },
            "abqreport": {
                "name": "ABQ Report",
                "url": "https://www.abqreport.com/",
                "article_selector": ".blog-post-title a, .post-title a",
                "title_selector": ".blog-post-title, .post-title",
                "content_selector": ".blog-post-content, .post-content",
                "author_selector": ".blog-post-author, .post-author",
                "date_selector": ".blog-post-date, .post-date",
                "image_selector": ".blog-post-content img, .post-content img",
                "max_articles": 10
            },
            "alibi": {
                "name": "Weekly Alibi",
                "url": "https://alibi.com/",
                "article_selector": ".article-title a, .story-title a",
                "title_selector": ".article-title, .story-title",
                "content_selector": ".article-content, .story-content",
                "author_selector": ".article-author, .story-author",
                "date_selector": ".article-date, .story-date",
                "image_selector": ".article-image img, .story-image img",
                "max_articles": 10
            },
            "koat": {
                "name": "KOAT Action 7 News",
                "url": "https://www.koat.com/local-news/",
                "article_selector": ".article-list a, .card-container a",
                "title_selector": ".article-headline, h1.headline",
                "content_selector": ".article-body, .story-body",
                "author_selector": ".byline",
                "date_selector": ".timestamp, time",
                "image_selector": ".article-media img, .lead-media img",
                "max_articles": 15
            }
        }
        
        self.logger.info(f"ABQ News Scraper initialized with {len(self.sources)} sources") 
