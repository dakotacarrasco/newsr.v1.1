#!/usr/bin/env python3

# Topic configuration dictionary
TOPICS = {
    "politics": {
        "name": "Politics",
        "description": "Political news, elections, government policy and legislation",
        "keywords": [
            "election", "government", "congress", "senate", "president", "legislation", 
            "policy", "democrat", "republican", "vote", "campaign", "political", 
            "bill", "law", "administration", "supreme court", "justice", "parliament"
        ],
        "sources": [
            "politico.com", "thehill.com", "rollcall.com", "washingtonpost.com", 
            "nytimes.com", "wsj.com", "foxnews.com", "cnn.com", "reuters.com", "apnews.com"
        ],
        "scraper_class": "PoliticsNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "business": {
        "name": "Business",
        "description": "Business news, finance, economics, markets, and corporate developments",
        "keywords": [
            "business", "economy", "finance", "market", "stock", "investment", "startup", 
            "entrepreneur", "company", "industry", "trade", "corporate", "CEO", "earnings", 
            "revenue", "profit", "loss", "acquisition", "merger", "IPO"
        ],
        "sources": [
            "bloomberg.com", "cnbc.com", "wsj.com", "ft.com", "forbes.com", 
            "businessinsider.com", "marketwatch.com", "fortune.com", "reuters.com"
        ],
        "scraper_class": "BusinessNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "technology": {
        "name": "Technology",
        "description": "Technology news, innovation, software, gadgets, and digital trends",
        "keywords": [
            "technology", "tech", "software", "hardware", "app", "AI", "artificial intelligence", 
            "machine learning", "blockchain", "cryptocurrency", "bitcoin", "startup", "innovation", 
            "digital", "internet", "cybersecurity", "data", "privacy", "computing", "cloud"
        ],
        "sources": [
            "techcrunch.com", "wired.com", "theverge.com", "arstechnica.com", "cnet.com", 
            "engadget.com", "venturebeat.com", "zdnet.com", "gizmodo.com", "thenextweb.com"
        ],
        "scraper_class": "TechnologyNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "health": {
        "name": "Health",
        "description": "Health news, medical research, wellness, and healthcare systems",
        "keywords": [
            "health", "medical", "medicine", "disease", "treatment", "doctor", "hospital", 
            "research", "study", "wellness", "mental health", "diet", "nutrition", "fitness", 
            "pandemic", "virus", "vaccine", "healthcare", "pharmaceutical", "drug"
        ],
        "sources": [
            "webmd.com", "healthline.com", "medicalnewstoday.com", "nih.gov", "mayoclinic.org", 
            "statnews.com", "medscape.com", "sciencedaily.com", "health.harvard.edu"
        ],
        "scraper_class": "HealthNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    },
    "environment": {
        "name": "Environment",
        "description": "Environmental news, climate change, conservation, and sustainability",
        "keywords": [
            "environment", "climate", "climate change", "global warming", "sustainability", 
            "renewable", "clean energy", "conservation", "biodiversity", "pollution", 
            "ecology", "carbon", "emissions", "green", "recycling", "wildlife", "ecosystem"
        ],
        "sources": [
            "nationalgeographic.com", "theguardian.com/environment", "eenews.net", 
            "grist.org", "insideclimatenews.org", "climatecentral.org", "epa.gov"
        ],
        "scraper_class": "EnvironmentNewsScraper",
        "scrape_frequency": "daily",
        "active": True
    }
}

def get_topic_config(topic_code):
    """Get configuration for a specific topic"""
    return TOPICS.get(topic_code)

def get_active_topics():
    """Get list of active topic codes"""
    return [code for code, config in TOPICS.items() if config.get("active", False)]

def get_topics_by_frequency(frequency):
    """Get list of active topic codes with specified scrape frequency"""
    return [code for code, config in TOPICS.items() 
            if config.get("active", False) and config.get("scrape_frequency") == frequency]