#!/usr/bin/env python3
import os
import sys
import json
import requests
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import uuid
from dotenv import load_dotenv
import time
import hashlib
import random

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")

# Mixtral API configuration
MIXTRAL_API_URL = os.getenv("MIXTRAL_API_ENDPOINT")
MIXTRAL_API_KEY = os.getenv("MIXTRAL_API_KEY")

# Number of articles to scrape per source
ARTICLES_PER_SOURCE = 1  # Reduced to 1 per source

# Number of polls to generate
POLLS_TO_GENERATE = 5

# News sources to scrape with updated selectors - removing problematic sources
SOURCES = [
    {
        "name": "CNN Politics",
        "url": "https://www.cnn.com/politics",
        "article_selector": "div.container__item",
        "title_selector": "span.container__headline-text",
        "link_selector": "a[href^='/']",
        "base_url": "https://www.cnn.com"
    },
    {
        "name": "BBC News US Politics",
        "url": "https://www.bbc.com/news/world/us_and_canada",
        "article_selector": "div.gs-c-promo",
        "title_selector": "h3.gs-c-promo-heading__title",
        "link_selector": "a.gs-c-promo-heading",
        "base_url": "https://www.bbc.com"
    },
    {
        "name": "NPR Politics",
        "url": "https://www.npr.org/sections/politics/",
        "article_selector": "article.item",
        "title_selector": "h2.title",
        "link_selector": "a.title",
        "base_url": "https://www.npr.org"
    },
    {
        "name": "ABC News Politics",
        "url": "https://abcnews.go.com/Politics",
        "article_selector": "article.news-card",
        "title_selector": "h2.news-card__title",
        "link_selector": "a.news-card__title-link",
        "base_url": "https://abcnews.go.com"
    },
    {
        "name": "NBC News Politics",
        "url": "https://www.nbcnews.com/politics",
        "article_selector": "div.tease-card",
        "title_selector": "h2.tease-card__headline",
        "link_selector": "a.tease-card__title-url",
        "base_url": "https://www.nbcnews.com"
    }
]

def get_existing_articles():
    """Get list of existing articles from Supabase to avoid duplicates"""
    try:
        from supabase import create_client
        
        if not supabase_url or not supabase_key:
            print("Supabase credentials not found. Skipping deduplication check.")
            return [], []
            
        supabase_client = create_client(supabase_url, supabase_key)
        
        # Get articles from the last 7 days
        seven_days_ago = (datetime.now() - timedelta(days=7)).isoformat()
        
        # Get existing source URLs
        result = supabase_client.table("political_articles").select("source_url").gte("created_at", seven_days_ago).execute()
        existing_urls = [item["source_url"] for item in result.data] if result.data else []
        
        # Get existing titles
        result = supabase_client.table("political_articles").select("title").gte("created_at", seven_days_ago).execute()
        existing_titles = [item["title"] for item in result.data] if result.data else []
        
        print(f"Found {len(existing_urls)} existing articles in database from the last 7 days")
        return existing_urls, existing_titles
        
    except Exception as e:
        print(f"Error fetching existing articles: {str(e)}")
        return [], []

def get_existing_polls():
    """Get list of existing poll titles from Supabase to avoid duplicates"""
    try:
        from supabase import create_client
        
        if not supabase_url or not supabase_key:
            print("Supabase credentials not found. Skipping poll deduplication check.")
            return []
            
        supabase_client = create_client(supabase_url, supabase_key)
        
        # Get polls from the last 30 days
        thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
        
        # Get existing poll titles
        result = supabase_client.table("political_polls").select("title").gte("created_at", thirty_days_ago).execute()
        existing_poll_titles = [item["title"] for item in result.data] if result.data else []
        
        print(f"Found {len(existing_poll_titles)} existing polls in database from the last 30 days")
        return existing_poll_titles
        
    except Exception as e:
        print(f"Error fetching existing polls: {str(e)}")
        return []

def generate_content_hash(content):
    """Generate a hash of the content to identify similar articles"""
    return hashlib.md5(content.encode('utf-8')).hexdigest()

def is_duplicate(article, existing_urls, existing_titles, content_hashes):
    """Check if an article is a duplicate based on URL, title, or content"""
    # Check URL
    if article["source_url"] in existing_urls:
        return True
        
    # Check title (exact match)
    if article["title"] in existing_titles:
        return True
        
    # Check title (fuzzy match)
    for title in existing_titles:
        if title.lower() in article["title"].lower() or article["title"].lower() in title.lower():
            if len(title) > 20:  # Only consider substantial title matches
                return True
    
    # Check content hash
    content_hash = generate_content_hash(article["content"])
    if content_hash in content_hashes:
        return True
        
    # Add hash to list for future checks
    content_hashes.append(content_hash)
    
    return False

def is_poll_duplicate(poll_title, existing_poll_titles):
    """Check if a poll is a duplicate based on title"""
    # Check title (exact match)
    if poll_title in existing_poll_titles:
        return True
        
    # Check title (fuzzy match)
    for title in existing_poll_titles:
        if title.lower() in poll_title.lower() or poll_title.lower() in title.lower():
            if len(title) > 20:  # Only consider substantial title matches
                return True
    
    return False

def create_content_preview(content, max_length=150):
    """Create a short preview of the content for display"""
    if len(content) <= max_length:
        return content
    
    # Find the last space before max_length to avoid cutting words
    last_space = content[:max_length].rfind(' ')
    if last_space == -1:
        return content[:max_length] + "..."
    
    return content[:last_space] + "..."

def scrape_articles():
    """Scrape political news articles from defined sources"""
    articles = []
    
    # Get existing articles for deduplication
    existing_urls, existing_titles = get_existing_articles()
    content_hashes = []
    
    # Randomize sources to get a good mix
    random.shuffle(SOURCES)
    
    for source in SOURCES:
        try:
            print(f"Scraping {source['name']} from {source['url']}...")
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Cache-Control": "max-age=0"
            }
            
            # Get timeout value or default to 10 seconds
            timeout = source.get("timeout", 10)
            
            try:
                response = requests.get(source["url"], headers=headers, timeout=timeout)
                print(f"Response status: {response.status_code}")
                
                if response.status_code != 200:
                    print(f"Failed to fetch {source['name']}, status code: {response.status_code}")
                    continue
                    
            except requests.exceptions.Timeout:
                print(f"Timeout while fetching {source['name']}")
                continue
            except requests.exceptions.RequestException as e:
                print(f"Request error while fetching {source['name']}: {e}")
                continue
            
            soup = BeautifulSoup(response.content, "html.parser")
            
            article_elements = soup.select(source["article_selector"])
            print(f"Found {len(article_elements)} article elements")
            
            if len(article_elements) == 0:
                print(f"No article elements found for {source['name']}. Skipping source.")
                continue
            
            # Process up to ARTICLES_PER_SOURCE articles per source
            articles_processed = 0
            for element in article_elements:
                if articles_processed >= ARTICLES_PER_SOURCE:
                    break
                try:
                    # Extract title with a timeout
                    title_element = element.select_one(source["title_selector"])
                    if not title_element:
                        continue
                    
                    title = title_element.text.strip()
                    if not title:
                        continue
                        
                    print(f"Found title: {title}")
                    
                    # Extract article URL
                    link_element = element.select_one(source["link_selector"])
                    if not link_element:
                        continue
                    
                    article_url = link_element.get("href")
                    if not article_url:
                        continue
                        
                    if not article_url.startswith("http"):
                        article_url = source["base_url"] + article_url
                    
                    # Check if URL already exists in our database
                    if article_url in existing_urls:
                        print(f"Skipping already scraped article: {title}")
                        continue
                    
                    print(f"Processing article: {title} at {article_url}")
                    
                    # Get article content with timeout
                    try:
                        time.sleep(1)  # Be nice to the server
                        article_response = requests.get(article_url, headers=headers, timeout=timeout)
                        
                        if article_response.status_code != 200:
                            print(f"Failed to fetch article content, status code: {article_response.status_code}")
                            continue
                            
                    except requests.exceptions.Timeout:
                        print(f"Timeout while fetching article content")
                        continue
                    except requests.exceptions.RequestException as e:
                        print(f"Request error while fetching article content: {e}")
                        continue
                    
                    article_soup = BeautifulSoup(article_response.content, "html.parser")
                    
                    # Extract content (this is simplified and might need adjustment for each source)
                    content_paragraphs = article_soup.select("p")
                    content = "\n".join([p.text.strip() for p in content_paragraphs if p.text.strip()])
                    
                    # Extract image if available
                    image_element = article_soup.select_one("img")
                    image_url = image_element.get("src") if image_element else None
                    
                    if not content or len(content) < 200:  # Skip very short content
                        print(f"Insufficient content found for {title}")
                        continue
                    
                    # Truncate content if it's too long
                    if len(content) > 5000:
                        content = content[:5000] + "..."
                    
                    # Create article object - USING SNAKE_CASE for database compatibility
                    article = {
                        "id": str(uuid.uuid4()),
                        "title": title,
                        "content": content,
                        "source": source["name"],
                        "source_url": article_url,  # Changed from sourceUrl to source_url
                        "image_url": image_url,     # Changed from imageUrl to image_url
                        "author": None,
                        "published_at": datetime.now().isoformat(),
                        "created_at": datetime.now().isoformat(),
                        "updated_at": datetime.now().isoformat(),
                        "is_ai_generated": False,   # Changed from isAiGenerated to is_ai_generated
                        "original_content": content,
                        "tags": [],
                        "category": "Politics",
                        "size": "medium",
                        "priority": 0,
                        "content_preview": create_content_preview(content)
                    }
                    
                    # Check for duplicates
                    if not is_duplicate(article, existing_urls, existing_titles, content_hashes):
                        articles.append(article)
                        # Add to our existing lists to prevent duplicates within this run
                        existing_urls.append(article_url)
                        existing_titles.append(title)
                        print(f"Successfully processed article: {title}")
                        articles_processed += 1
                    else:
                        print(f"Skipping duplicate article: {title}")
                        
                except Exception as e:
                    print(f"Error processing article: {str(e)}")
                    continue
            
            print(f"Processed {articles_processed} articles from {source['name']}")
                    
        except Exception as e:
            print(f"Error scraping {source['name']}: {str(e)}")
            continue
    
    print(f"Total unique articles scraped: {len(articles)}")
    return articles

def rewrite_with_mixtral(article):
    """Rewrite article content using Mixtral API"""
    if not MIXTRAL_API_URL or not MIXTRAL_API_KEY:
        print("Mixtral API credentials not found. Skipping content rewriting.")
        return article["content"]
        
    try:
        print(f"Rewriting article: {article['title']}")
        
        # Create prompt for Mixtral
        prompt = f"""
        Rewrite the following political news article in a clear, engaging, and unbiased style. 
        Maintain all factual information but improve readability and flow.

        Title: {article['title']}
        Original Content: {article['content'][:3000]}  # Limit content length for API

        Your rewritten article should:
        1. Have a professional journalistic tone
        2. Be well-structured with clear paragraphs
        3. Present facts without political bias
        4. Be engaging and easy to read
        5. Maintain all key information from the original

        Rewrite the article content only, do not include the title or any additional commentary.
        """
        
        response = requests.post(
            MIXTRAL_API_URL,
            headers={
                "Authorization": f"Bearer {MIXTRAL_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "mistral-large-latest",
                "messages": [
                    {"role": "system", "content": "You are a professional political journalist who rewrites news articles in a clear, engaging, and unbiased style."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 2000,
                "temperature": 0.7
            }
        )
        
        if response.status_code == 200:
            rewritten_content = response.json()["choices"][0]["message"]["content"].strip()
            print(f"Successfully rewrote article: {article['title']}")
            return rewritten_content
        else:
            print(f"Error from Mixtral API: {response.status_code}")
            print(f"Response: {response.text}")
            return article["content"]  # Return original content if rewriting fails
            
    except Exception as e:
        print(f"Error rewriting article: {str(e)}")
        return article["content"]  # Return original content if rewriting fails

def generate_polls_from_articles(articles, num_polls=POLLS_TO_GENERATE):
    """Generate polls based on the scraped articles using Mixtral"""
    if not MIXTRAL_API_URL or not MIXTRAL_API_KEY:
        print("Mixtral API credentials not found. Skipping poll generation.")
        return []
        
    if not articles:
        print("No articles available to generate polls from.")
        return []
    
    polls = []
    existing_poll_titles = get_existing_polls()
    
    # If we have fewer articles than polls to generate, we'll use some articles more than once
    # Otherwise, select a random subset of articles
    if len(articles) < num_polls:
        # Use each article at least once, then repeat some if needed
        poll_candidates = articles.copy()
        while len(poll_candidates) < num_polls:
            poll_candidates.append(random.choice(articles))
    else:
        poll_candidates = random.sample(articles, num_polls)
    
    for article in poll_candidates:
        try:
            print(f"Generating poll from article: {article['title']}")
            
            # Create prompt for Mixtral
            prompt = f"""
            You are a political polling expert. Based on the following political news article, create an engaging poll question with 4-5 possible answer options.

            Article Title: {article['title']}
            Article Content: {article['content'][:1500]}  # Limit content length

            Your task:
            1. Create a thought-provoking poll question related to the main issue in the article
            2. Provide 4-5 distinct answer options that cover the spectrum of possible opinions
            3. Make sure the options are balanced and don't show political bias
            4. Format your response as a JSON object with the following structure:
            {{
                "title": "The poll question",
                "description": "A brief context for the poll (2-3 sentences)",
                "options": [
                    "Option 1",
                    "Option 2",
                    "Option 3",
                    "Option 4",
                    "Option 5 (optional)"
                ]
            }}

            Return ONLY the JSON object with no additional text.
            """
            
            response = requests.post(
                MIXTRAL_API_URL,
                headers={
                    "Authorization": f"Bearer {MIXTRAL_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "mistral-large-latest",
                    "messages": [
                        {"role": "system", "content": "You are a political polling expert who creates balanced, engaging polls based on news articles."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.7
                }
            )
            
            if response.status_code == 200:
                try:
                    poll_text = response.json()["choices"][0]["message"]["content"].strip()
                    
                    # Extract JSON from response (in case there's any extra text)
                    import re
                    json_match = re.search(r'({.*})', poll_text, re.DOTALL)
                    if json_match:
                        poll_text = json_match.group(1)
                    
                    poll_data = json.loads(poll_text)
                    
                    # Validate poll data
                    if not all(key in poll_data for key in ["title", "description", "options"]):
                        print(f"Invalid poll data format: {poll_data}")
                        continue
                        
                    if len(poll_data["options"]) < 2:
                        print(f"Not enough options in poll: {poll_data}")
                        continue
                    
                    # Check for duplicate poll
                    if is_poll_duplicate(poll_data["title"], existing_poll_titles):
                        print(f"Skipping duplicate poll: {poll_data['title']}")
                        continue
                    
                    # Create poll object - USING SNAKE_CASE for database compatibility
                    poll = {
                        "id": str(uuid.uuid4()),
                        "title": poll_data["title"],
                        "description": poll_data["description"],
                        "options": [{"id": str(uuid.uuid4()), "text": option, "votes": 0} for option in poll_data["options"]],
                        "start_date": datetime.now().isoformat(),  # Changed from startDate to start_date
                        "end_date": (datetime.now() + timedelta(days=7)).isoformat(),  # Changed from endDate to end_date
                        "created_at": datetime.now().isoformat(),  # Changed from createdAt to created_at
                        "updated_at": datetime.now().isoformat(),  # Changed from updatedAt to updated_at
                        "is_active": True,  # Changed from isActive to is_active
                        "total_votes": 0,  # Changed from totalVotes to total_votes
                        "size": "medium",
                        "priority": 0,
                        "poll_type": "multiple_choice"
                    }
                    
                    polls.append(poll)
                    existing_poll_titles.append(poll_data["title"])  # Add to existing titles to prevent duplicates
                    print(f"Successfully generated poll: {poll['title']}")
                    
                except json.JSONDecodeError as e:
                    print(f"Error parsing poll JSON: {e}")
                    print(f"Raw response: {poll_text}")
                    continue
                except Exception as e:
                    print(f"Error processing poll data: {str(e)}")
                    continue
            else:
                print(f"Error from Mixtral API: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"Error generating poll from article: {str(e)}")
            continue
    
    print(f"Generated {len(polls)} polls from articles")
    return polls

def save_to_supabase(articles):
    """Save scraped articles to Supabase"""
    if not articles:
        print("No articles to save.")
        return
        
    if not supabase_url or not supabase_key:
        print("Supabase credentials not found. Skipping article saving.")
        return
        
    try:
        from supabase import create_client
        supabase_client = create_client(supabase_url, supabase_key)
        
        for article in articles:
            try:
                # Rewrite content with Mixtral
                rewritten_content = rewrite_with_mixtral(article)
                
                # Update article with rewritten content
                article["content"] = rewritten_content
                article["is_ai_generated"] = True
                
                # Update content preview with rewritten content
                article["content_preview"] = create_content_preview(rewritten_content)
                
                # Insert into Supabase
                result = supabase_client.table("political_articles").insert(article).execute()
                print(f"Saved article: {article['title']}")
            except Exception as e:
                print(f"Error saving article to Supabase: {str(e)}")
                continue
                
    except ImportError:
        print("Supabase Python client not installed. Skipping article saving.")
    except Exception as e:
        print(f"Error initializing Supabase client: {str(e)}")

def save_polls_to_supabase(polls):
    """Save generated polls to Supabase"""
    if not polls:
        print("No polls to save.")
        return
        
    if not supabase_url or not supabase_key:
        print("Supabase credentials not found. Skipping poll saving.")
        return
        
    try:
        from supabase import create_client
        supabase_client = create_client(supabase_url, supabase_key)
        
        for poll in polls:
            try:
                # Format the poll data for Supabase
                poll_data = {
                    "id": poll["id"],
                    "title": poll["title"],
                    "description": poll["description"],
                    "options": json.dumps(poll["options"]),  # Convert to JSON string
                    "start_date": poll["start_date"],
                    "end_date": poll["end_date"],
                    "created_at": poll["created_at"],
                    "updated_at": poll["updated_at"],
                    "is_active": poll["is_active"],
                    "total_votes": poll["total_votes"],
                    "size": poll["size"],
                    "priority": poll["priority"],
                    "poll_type": poll["poll_type"]
                }
                
                # Insert into Supabase
                result = supabase_client.table("political_polls").insert(poll_data).execute()
                print(f"Saved poll: {poll['title']}")
            except Exception as e:
                print(f"Error saving poll to Supabase: {str(e)}")
                continue
                
    except ImportError:
        print("Supabase Python client not installed. Skipping poll saving.")
    except Exception as e:
        print(f"Error initializing Supabase client: {str(e)}")

def main():
    print("Starting political news scraping...")
    articles = scrape_articles()
    print(f"Scraped {len(articles)} articles")
    
    if articles:
        # Save articles to Supabase
        save_to_supabase(articles)
        
        # Generate and save polls - now generating POLLS_TO_GENERATE polls
        polls = generate_polls_from_articles(articles, POLLS_TO_GENERATE)
        if polls:
            save_polls_to_supabase(polls)
        
        print("Finished processing and saving articles and polls")
    else:
        print("No articles found to process")

if __name__ == "__main__":
    main() 