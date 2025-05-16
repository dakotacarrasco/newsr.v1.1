class Article:
    """Represents a news article"""
    def __init__(self, url="", title="", content="", author="", published_date="", 
                 source="", category="news", city="", region="", description=None,
                 image_urls=None, scraped_at=None, slug=""):
        self.url = url
        self.title = title
        self.content = content
        self.author = author
        self.published_date = published_date
        self.source = source
        self.category = category
        self.city = city
        self.region = region
        self.description = description
        self.image_urls = image_urls or []
        self.scraped_at = scraped_at
        self.slug = slug
    
    def asdict(self):
        """Convert article to dictionary"""
        return {
            'url': self.url,
            'title': self.title,
            'content': self.content,
            'author': self.author,
            'published_date': self.published_date,
            'source': self.source,
            'category': self.category,
            'city': self.city,
            'region': self.region,
            'description': self.description,
            'image_urls': self.image_urls,
            'scraped_at': self.scraped_at,
            'slug': self.slug
        } 