#!/usr/bin/env python3
import os
import sys
# Add this line BEFORE any citydigest imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import json
import logging
import re
import glob
import random
from datetime import datetime
import argparse
import requests
from pathlib import Path
from dotenv import load_dotenv
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Add this line to import Article class
from ..scrapers.base_scraper import Article

# Import city configuration system
from ..config.cities import CITIES, get_city_config

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("digest.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("digest_generator")

class DigestGenerator:
    def __init__(self):
        # Load environment variables from the right location
        dotenv_path = Path(__file__).parent.parent / '.env'
        load_dotenv(dotenv_path)
        
        # Check which API to use based on environment variables
        if os.getenv("OPENAI_API_KEY"):
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.api_endpoint = "https://api.openai.com/v1/chat/completions"
            self.model = "gpt-4"
            self.provider = "openai"
        elif os.getenv("MIXTRAL_API_KEY"):
            self.api_key = os.getenv("MIXTRAL_API_KEY")
            self.api_endpoint = os.getenv("MIXTRAL_API_ENDPOINT", "https://api.mistral.ai/v1/chat/completions")
            self.model = "mistral-large-latest"
            self.provider = "mixtral"
        else:
            raise ValueError("No API key found for OpenAI or Mixtral")
        
        # Initialize requests session with retry capability
        self.session = requests.Session()
        retry = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
        self.session.mount('https://', HTTPAdapter(max_retries=retry))
        
        logger.info(f"Digest Generator initialized with provider: {self.provider}")
    
    def load_articles_from_file(self, filepath):
        """Load articles from a JSON file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            articles = json.load(f)
        
        logger.info(f"Loaded {len(articles)} articles from {filepath}")
        return articles
    
    def load_articles_from_directory(self, directory, max_articles=100):
        """Load articles from all JSON files in a directory"""
        all_articles = []
        
        # Only look for files that specifically contain articles
        article_pattern = os.path.join(directory, "*_articles.json")
        article_files = glob.glob(article_pattern)
        
        # Also check for the combined articles file
        city_code = os.path.basename(directory).split("_")[0]
        combined_file = os.path.join(directory, f"all_{city_code}_articles.json")
        if os.path.exists(combined_file) and combined_file not in article_files:
            article_files.append(combined_file)
        
        logger.info(f"Found {len(article_files)} article files in {directory}")
        
        if not article_files:
            logger.warning(f"No article files found in {directory}")
            return []
        
        for json_file in article_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    articles = json.load(f)
                    
                    # Skip files that don't contain a list
                    if not isinstance(articles, list):
                        logger.warning(f"Skipping {json_file}: not a list")
                        continue
                        
                    # Validate each article has the required fields
                    valid_articles = []
                    for item in articles:
                        if isinstance(item, dict) and 'url' in item and 'title' in item and 'content' in item:
                            valid_articles.append(item)
                        else:
                            logger.warning(f"Skipping invalid article in {json_file}")
                    
                    all_articles.extend(valid_articles)
                    logger.info(f"Loaded {len(valid_articles)} valid articles from {json_file}")
                    
            except Exception as e:
                logger.error(f"Error loading articles from {json_file}: {str(e)}")
        
        # Deduplicate articles by URL
        unique_articles = {}
        for article in all_articles:
            if article.get('url') and article.get('url') not in unique_articles:
                unique_articles[article.get('url')] = article
        
        articles_list = list(unique_articles.values())
        
        # Limit to max_articles
        if len(articles_list) > max_articles:
            articles_list = articles_list[:max_articles]
        
        logger.info(f"Loaded a total of {len(articles_list)} unique articles from {len(article_files)} files")
        
        if not articles_list:
            logger.warning("No valid articles found in any of the files")
        
        return articles_list
    
    def load_failed_urls(self, directory):
        """Load failed URLs from JSON files in the directory"""
        failed_urls = []
        failed_url_files = glob.glob(os.path.join(directory, "*failed_urls.json"))
        
        for file_path in failed_url_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    urls = json.load(f)
                    if isinstance(urls, list):
                        failed_urls.extend(urls)
                        logger.info(f"Loaded {len(urls)} failed URLs from {file_path}")
            except Exception as e:
                logger.error(f"Error loading failed URLs from {file_path}: {str(e)}")
        
        # Remove duplicates
        failed_urls = list(dict.fromkeys(failed_urls))
        logger.info(f"Loaded a total of {len(failed_urls)} unique failed URLs")
        return failed_urls
    
    def detect_city_from_articles(self, articles):
        """Detect the city based on article metadata or content"""
        # First try to get city from article metadata
        cities_found = {}
        
        # Count occurrences of each city in article metadata
        for article in articles:
            if article.get("city") and article.get("region"):
                city_key = f"{article.get('city')}, {article.get('region')}"
                cities_found[city_key] = cities_found.get(city_key, 0) + 1
        
        # If city metadata exists in articles, use the most common one
        if cities_found:
            most_common_city = max(cities_found.items(), key=lambda x: x[1])[0]
            city_name, region = most_common_city.split(", ")
            
            # Find the city code from the name and region
            for city_code, config in CITIES.items():
                if config["name"] == city_name and config["region"] == region:
                    return city_code, config
        
        # If no metadata or match found, try content-based detection
        return self.detect_city_from_content(articles)
    
    def detect_city_from_content(self, articles):
        """Detect city based on article content using keywords"""
        city_scores = {city_code: 0 for city_code in CITIES.keys()}
        
        # Process articles to find city keywords
        for article in articles:
            content = (article.get("content", "") + " " + article.get("title", "")).lower()
            
            # Check for keywords from each city
            for city_code, config in CITIES.items():
                keywords = config.get("keywords", [])
                for keyword in keywords:
                    if re.search(r'\b' + re.escape(keyword) + r'\b', content):
                        city_scores[city_code] += 1
        
        # Find city with highest score
        if any(city_scores.values()):
            city_code = max(city_scores, key=city_scores.get)
            return city_code, CITIES[city_code]
        
        # If no clear detection, return None
        return None, None
    
    def make_llm_request(self, prompt):
        """Make a request to the LLM API"""
        try:
            headers = {
                "Content-Type": "application/json"
            }
            
            # Different authentication for different providers
            if self.provider == "openai":
                headers["Authorization"] = f"Bearer {self.api_key}"
                payload = {
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 4000
                }
            elif self.provider == "mixtral":
                headers["Authorization"] = f"Bearer {self.api_key}"
                payload = {
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 4000
                }
            
            logger.info(f"Making request to {self.provider} API")
            response = self.session.post(self.api_endpoint, headers=headers, json=payload, timeout=120)
            response.raise_for_status()  # Raise exception for HTTP errors
            
            data = response.json()
            
            # Extract response text based on provider
            if self.provider == "openai":
                return data["choices"][0]["message"]["content"]
            elif self.provider == "mixtral":
                return data["choices"][0]["message"]["content"]
            
        except Exception as e:
            logger.error(f"Error making LLM request: {str(e)}")
            return None
    
    def categorize_articles(self, articles):
        """Categorize articles into different news sections with improved detection"""
        categories = {
            "breaking": [],
            "crime": [],
            "politics": [],
            "local_events": [],
            "community": [],
            "environment": [],
            "transportation": [],
            "education": [],
            "business": [],
            "health": [],
            "sports": [],
            "other": []
        }
        
        # Keywords for each category
        category_keywords = {
            "breaking": ["emergency", "breaking", "urgent", "alert", "critical", "just in", "developing", "update"],
            "crime": ["arrest", "police", "crime", "criminal", "theft", "robbery", "murder", "shooting", "suspect", "victim", "investigation"],
            "politics": ["mayor", "council", "vote", "election", "candidate", "campaign", "political", "policy", "government", "senator", "representative"],
            "local_events": ["event", "festival", "parade", "concert", "exhibition", "fair", "show", "celebration", "community event"],
            "community": ["community", "resident", "neighborhood", "local", "charity", "volunteer", "donation", "nonprofit", "assistance"],
            "environment": ["environment", "climate", "pollution", "sustainability", "conservation", "wildlife", "park", "green", "ecological"],
            "transportation": ["road", "traffic", "highway", "construction", "bus", "transit", "transportation", "commute", "bridge", "street"],
            "education": ["school", "student", "teacher", "education", "university", "college", "campus", "academic", "scholarship", "classroom"],
            "business": ["business", "company", "store", "restaurant", "shop", "market", "economic", "industry", "commercial", "development"],
            "health": ["health", "hospital", "medical", "doctor", "clinic", "patient", "treatment", "wellness", "disease", "healthcare"],
            "sports": ["sports", "game", "team", "player", "win", "lose", "score", "championship", "tournament", "athletic", "coach", "football", "baseball", "basketball", "soccer", "hockey"]
        }
        
        # Categorize each article
        for article in articles:
            # Get title and content
            title = article.get("title", "").lower()
            content = article.get("content", "").lower()
            combined_text = title + " " + content
            
            # Check for breaking news first (highest priority)
            if any(keyword in combined_text for keyword in category_keywords["breaking"]):
                categories["breaking"].append(article)
                continue
            
            # Check all other categories
            categorized = False
            for category, keywords in category_keywords.items():
                if category == "breaking":
                    continue  # Already checked
                
                if any(keyword in combined_text for keyword in keywords):
                    categories[category].append(article)
                    categorized = True
                    break
            
            # If not categorized, put in "other"
            if not categorized:
                categories["other"].append(article)
        
        return categories

    def generate_section_content(self, section_name, articles, city_name, region, current_weather=None):
        """Generate content for a specific section using targeted prompts"""
        if not articles:
            return None
        
        # Create section-specific prompt
        section_prompts = {
            "headline": f"""
            Create a concise, engaging headline (10 words maximum) for today's {city_name} news digest 
            that captures the most significant local news story. The headline should follow newspaper style 
            and focus on local impact.
            
            Top articles:
            {self.format_articles_brief(articles[:3])}
            """,
            
            "introduction": f"""
            Write a warm, engaging 2-paragraph introduction for today's {city_name}, {region} news digest.
            
            Paragraph 1: Welcome readers and mention the current atmosphere in the city, including a reference to 
            local landmarks or neighborhoods.
            
            Paragraph 2: Briefly allude to the day's top story without details (those will come in later sections).
            
            The introduction should feel personal and specific to {city_name} - avoid generic text that could apply to any city.
            """,
            
            "weather": f"""
            Write a concise weather update paragraph for {city_name}, {region} today.
            
            Weather data: {current_weather if current_weather else 'Not available'}
            
            Include temperature, conditions, and appropriate clothing recommendations. 
            DO NOT suggest jackets or warm clothing if temperatures are above 75°F.
            DO NOT suggest light clothing if temperatures are below 50°F.
            
            Also include brief information about any weather impacts on travel or events.
            
            Keep your response to one focused paragraph.
            """,
            
            "breaking_news": f"""
            Write 2-3 paragraphs covering the most urgent breaking news for {city_name} residents based on these articles:
            
            {self.format_articles_brief(articles)}
            
            Focus on facts that directly impact local residents. DO NOT mention sources, news outlets, or use attribution phrases.
            Keep your writing clear, direct, and informative.
            """,
            
            "crime": f"""
            Write 1-2 paragraphs summarizing recent crime and safety news in {city_name} based on these articles:
            
            {self.format_articles_brief(articles)}
            
            Focus on information that helps residents stay safe. Be factual but not sensationalist.
            DO NOT mention sources, news outlets, or use attribution phrases.
            """,
            
            "politics": f"""
            Write 1-2 paragraphs covering recent political developments in {city_name} based on these articles:
            
            {self.format_articles_brief(articles)}
            
            Focus on local government actions, decisions, or elections that impact residents.
            DO NOT mention sources, news outlets, or use attribution phrases.
            """,
            
            "local_events": f"""
            Write 1-2 paragraphs highlighting upcoming or recent events in {city_name} based on these articles:
            
            {self.format_articles_brief(articles)}
            
            Focus on events that residents might want to attend or should know about.
            Include essential details like time and location when available.
            DO NOT mention sources, news outlets, or use attribution phrases.
            """,
            
            "community": f"""
            Write 1-2 paragraphs about community issues or initiatives in {city_name} based on these articles:
            
            {self.format_articles_brief(articles)}
            
            Focus on neighborhood concerns, community projects, or local initiatives.
            DO NOT mention sources, news outlets, or use attribution phrases.
            """,
            
            "environment": f"""
            Write 1-2 paragraphs about environmental news in {city_name} based on these articles:
            
            {self.format_articles_brief(articles)}
            
            Focus on local environmental issues, conservation efforts, or weather patterns affecting the area.
            DO NOT mention sources, news outlets, or use attribution phrases.
            """,
            
            "transportation": f"""
            Write 1-2 paragraphs about transportation news in {city_name} based on these articles:
            
            {self.format_articles_brief(articles)}
            
            Focus on road conditions, construction, public transit updates, or other transportation issues.
            Include information that helps residents plan their commutes.
            DO NOT mention sources, news outlets, or use attribution phrases.
            """,
            
            "education": f"""
            Write 1-2 paragraphs about education news in {city_name} based on these articles:
            
            {self.format_articles_brief(articles)}
            
            Focus on local schools, universities, educational programs, or student achievements.
            DO NOT mention sources, news outlets, or use attribution phrases.
            """,
            
            "business": f"""
            Write 1-2 paragraphs about business and economic news in {city_name} based on these articles:
            
            {self.format_articles_brief(articles)}
            
            Focus on local businesses, economic developments, job opportunities, or market changes.
            DO NOT mention sources, news outlets, or use attribution phrases.
            """,
            
            "health": f"""
            Write 1-2 paragraphs about health news in {city_name} based on these articles:
            
            {self.format_articles_brief(articles)}
            
            Focus on local health concerns, medical facilities, wellness initiatives, or public health advisories.
            DO NOT mention sources, news outlets, or use attribution phrases.
            """,
            
            "sports": f"""
            Write 1-2 paragraphs about sports news in {city_name} based on these articles:
            
            {self.format_articles_brief(articles)}
            
            Focus on local teams, athletes, games, or sporting events. Include recent results and upcoming matches.
            DO NOT mention sources, news outlets, or use attribution phrases.
            """,
            
            "quick_notes": f"""
            Create 5-6 brief bullet points (one sentence each) about miscellaneous news items relevant to {city_name} residents.
            
            Base your bullet points on these articles:
            {self.format_articles_brief(articles)}
            
            Each point should:
            1. Be directly relevant to {city_name} specifically
            2. Contain actionable or useful information for residents
            3. NOT mention sources, news outlets, or use attribution phrases
            
            Format each point with a bullet (•) at the beginning.
            """,
        }
        
        # Get the appropriate prompt
        prompt = section_prompts.get(section_name)
        if not prompt:
            logger.warning(f"No prompt template found for section: {section_name}")
            return None
        
        # Call the language model
        response = self.call_language_model(prompt)
        
        # Clean up the response
        if response:
            # Remove any "SECTION NAME:" that might have been included
            response = re.sub(r'^[A-Z\s]+:', '', response).strip()
            
            # Add bullet points for quick notes if needed
            if section_name == "quick_notes" and "•" not in response and "-" not in response:
                points = [p.strip() for p in response.split('\n') if p.strip()]
                response = "\n".join(f"• {point}" for point in points)
        
        return response

    def format_articles_brief(self, articles, max_articles=5):
        """Format articles for inclusion in section-specific prompts"""
        if not articles:
            return "No articles available."
        
        # Limit to max_articles
        articles = articles[:max_articles]
        
        formatted = []
        for i, article in enumerate(articles):
            title = article.get("title", "Untitled")
            content = article.get("content", "")
            
            # Truncate content if too long
            if len(content) > 200:
                content = content[:200] + "..."
            
            formatted.append(f"Article {i+1}: {title}\n{content}\n")
        
        return "\n".join(formatted)

    def assemble_digest(self, sections, city_name):
        """Assemble the complete digest from individual sections"""
        # Get headline
        headline = sections.get("headline", f"{city_name} Daily News Update")
        
        # Assemble the digest content
        content_parts = [
            headline,
            f"\nGood morning, {city_name}!\n",
            sections.get("introduction", ""),
            "\nWEATHER UPDATE:\n",
            sections.get("weather", ""),
        ]
        
        # Add breaking news if available
        if sections.get("breaking_news"):
            content_parts.extend([
                "\nBREAKING NEWS:\n",
                sections.get("breaking_news", "")
            ])
        
        # Add regular sections
        section_mapping = {
            "crime": "CRIME & SAFETY",
            "politics": "POLITICS",
            "local_events": "LOCAL EVENTS",
            "community": "COMMUNITY ISSUES",
            "environment": "ENVIRONMENT",
            "transportation": "TRANSPORTATION",
            "education": "EDUCATION",
            "business": "BUSINESS",
            "health": "HEALTH",
            "sports": "SPORTS"
        }
        
        for section_id, section_title in section_mapping.items():
            if sections.get(section_id):
                content_parts.extend([
                    f"\n{section_title}:\n",
                    sections.get(section_id, "")
                ])
        
        # Add quick notes
        if sections.get("quick_notes"):
            content_parts.extend([
                "\nQUICK NOTES:\n",
                sections.get("quick_notes", "")
            ])
        
        # Add closing
        content_parts.append(f"\nStay tuned for more updates, and have a great day, {city_name}!")
        
        # Join all parts
        full_content = "\n".join(content_parts)
        
        return full_content

    def format_sections_for_db(self, sections_dict, headline):
        """Format sections for database storage"""
        formatted_sections = []
        
        # Add introduction
        if sections_dict.get("introduction"):
            formatted_sections.append({
                "title": "Introduction",
                "content": sections_dict.get("introduction"),
                "headline": headline
            })
        
        # Add weather
        if sections_dict.get("weather"):
            formatted_sections.append({
                "title": "Weather",
                "content": sections_dict.get("weather")
            })
        
        # Add breaking news
        if sections_dict.get("breaking_news"):
            formatted_sections.append({
                "title": "Breaking News",
                "content": sections_dict.get("breaking_news")
            })
        
        # Map section IDs to titles
        section_mapping = {
            "crime": "Crime & Safety",
            "politics": "Politics",
            "local_events": "Local Events",
            "community": "Community Issues",
            "environment": "Environment",
            "transportation": "Transportation",
            "education": "Education",
            "business": "Business",
            "health": "Health",
            "sports": "Sports"
        }
        
        # Add remaining sections
        for section_id, section_title in section_mapping.items():
            if sections_dict.get(section_id):
                formatted_sections.append({
                    "title": section_title,
                    "content": sections_dict.get(section_id)
                })
        
        # Add quick notes
        if sections_dict.get("quick_notes"):
            # Parse items from bullet points
            content = sections_dict.get("quick_notes")
            items = []
            
            if "•" in content:
                items = [item.strip().lstrip("•").strip() for item in content.split("\n") if "•" in item]
            elif "-" in content:
                items = [item.strip().lstrip("-").strip() for item in content.split("\n") if "-" in item]
            else:
                # Try to split by newlines if no bullets found
                items = [line.strip() for line in content.split("\n") if line.strip()]
            
            formatted_sections.append({
                "title": "Quick Notes",
                "content": content,
                "items": items
            })
        
        return formatted_sections

    def create_prompt(self, articles, city_name, region, prompt_type="full_digest", section_name=None, current_weather=None):
        """Create a prompt for the LLM to generate content
        
        Args:
            articles: List of article dictionaries to include
            city_name: Name of the city
            region: Region/state of the city
            prompt_type: Either "full_digest" or "section"
            section_name: If prompt_type is "section", the name of the section to generate
            current_weather: Optional weather data to include in the prompt
            
        Returns:
            Formatted prompt string for the LLM
        """
        # Get the current date
        today = datetime.now().strftime('%A, %B %d, %Y')
        
        # Prepare article information for the prompt
        article_info = []
        for i, article in enumerate(articles[:30]):  # Limit to 30 articles
            # Extract article details but don't include source or URL
            title = article.get('title', '')
            content = article.get('content', '')[:500]  # Limit content preview
            
            # Add formatted article to list without source attribution
            article_info.append(f"Article {i+1}:\nTitle: {title}\nContent Preview: {content}\n")
        
        # Join all article information
        articles_text = "\n".join(article_info)
        
        if prompt_type == "full_digest":
            # Create the main prompt with improved instructions for full digest
            prompt = f"""
            You are a local news digest generator for {city_name}, {region}. Today is {today}. 
            
            Create a comprehensive morning news digest for {city_name} residents using the articles provided below.
            
            FORMAT YOUR RESPONSE EXACTLY LIKE THIS EXAMPLE:
            
            **[Headline focused on the most important local news story]**
            
            Good morning, {city_name}!
            
            [1-2 paragraphs describing the atmosphere of the city this morning, mentioning local landmarks and setting the scene]
            
            WEATHER UPDATE:
            
            [One paragraph about the expected weather today. Give temperature-appropriate clothing recommendations (e.g., don't suggest jackets in 85°F weather). Include reliable travel advice based on conditions.]
            
            BREAKING NEWS:
            
            [2-3 paragraphs about the most important or urgent local news stories]
            
            CRIME & SAFETY:
            
            [1-2 paragraphs about recent crime events, safety concerns, or police activities]
            
            LOCAL EVENTS:
            
            [1-2 paragraphs about upcoming or recent community events, festivals, or gatherings]
            
            COMMUNITY ISSUES:
            
            [1-2 paragraphs about neighborhood issues, local initiatives, or community projects]
            
            ENVIRONMENT:
            
            [1-2 paragraphs about environmental news, parks, conservation efforts, or climate impacts]
            
            SPORTS:
            
            [1-2 paragraphs about local sports teams, events, or achievements]
            
            QUICK NOTES:
            
            * [Brief bullet point about another local news item]
            * [Brief bullet point about another local news item]
            * [Brief bullet point about another local news item]
            * [Brief bullet point about another local news item]
            * [Brief bullet point about another local news item]
            
            Stay tuned for more updates, and have a great day, {city_name}!
            
            IMPORTANT INSTRUCTIONS:
            1. Focus EXCLUSIVELY on the provided articles. DO NOT invent news stories.
            2. ONLY include news that directly impacts {city_name} residents. 
            3. DO NOT include national news unless it has a clear local connection to {city_name}.
            4. DO NOT mention article sources or specific media outlets.
            5. Use a friendly, informative tone throughout.
            6. For weather, ensure clothing recommendations match the temperature (e.g., don't suggest jackets for hot weather).
            7. Include local sports news in a dedicated section if available.
            8. Format the QUICK NOTES as bullet points with asterisks (*).
            9. NEVER include URLs or references to where information came from.
            10. Only include sections that have relevant content from the articles. If there's no sports news, don't include the SPORTS section.
            11. Make the headline bold and place it in square brackets.
            """
        
        elif prompt_type == "section" and section_name:
            # Create a section-specific prompt
            if section_name.lower() == "weather":
                # Special handling for weather section
                weather_info = ""
                if current_weather:
                    weather_info = f"""
                    Current conditions: {current_weather.get('description', 'No data')}
                    Temperature: {current_weather.get('temp', 'No data')}°F
                    Feels like: {current_weather.get('feels_like', 'No data')}°F
                    Humidity: {current_weather.get('humidity', 'No data')}%
                    Wind: {current_weather.get('wind_speed', 'No data')} mph
                    """
                
                prompt = f"""
                You are writing the WEATHER UPDATE section for the {city_name}, {region} morning news digest for {today}.
                
                Using the current weather data and any weather-related articles, write ONE engaging paragraph about today's weather.
                Include appropriate clothing recommendations based on the temperature (never suggest wearing jackets if it's over 75°F).
                If there are any weather warnings or advisories, highlight those.
                
                {weather_info}
                
                Your response should be EXACTLY ONE paragraph of 3-5 sentences. Be conversational but informative.
                DO NOT mention sources, URLs, or attribute information to specific outlets.
                """
            
            elif section_name.lower() == "breaking news":
                prompt = f"""
                You are writing the BREAKING NEWS section for the {city_name}, {region} morning news digest for {today}.
                
                Using ONLY the provided articles, write 2-3 paragraphs about the most important or urgent local news stories.
                Focus on stories with the biggest impact on local residents.
                
                Your response should be 2-3 paragraphs. Be factual and informative.
                DO NOT mention sources, URLs, or attribute information to specific outlets.
                ONLY include information from the provided articles - do not invent details.
                """
            
            # Add other section types as needed (sports, crime, events, etc.)
            else:
                # Generic section prompt
                prompt = f"""
                You are writing the {section_name.upper()} section for the {city_name}, {region} morning news digest for {today}.
                
                Using ONLY the provided articles, write 1-2 paragraphs about relevant {section_name.lower()} topics for {city_name} residents.
                
                Your response should be 1-2 paragraphs. Be factual and informative.
                DO NOT mention sources, URLs, or attribute information to specific outlets.
                ONLY include information from the provided articles - do not invent details.
                """
        
        else:
            raise ValueError(f"Invalid prompt_type: {prompt_type}")
        
        # Add articles to the prompt
        full_prompt = f"{prompt}\n\nARTICLES TO USE:\n\n{articles_text}"
        
        return full_prompt

    def generate_digest_content(self, articles, city_name, region, topics=None):
        """Generate the digest content using the LLM with simpler approach focusing just on content"""
        # Create the prompt for the LLM
        prompt = self.create_prompt(articles, city_name, region)
        
        # Call language model
        response = self.call_language_model(prompt)
        
        if not response:
            logger.error("Failed to get response from language model")
            return "No digest content generated.", []
        
        # Extract headline from the response (the part in brackets)
        headline = ""
        first_line = response.strip().split('\n')[0]
        if first_line.startswith('**[') and first_line.endswith(']**'):
            headline = first_line.strip('**[]')
        
        # Create minimal sections array for compatibility
        sections = [
            {
                "title": "Digest Content",
                "content": response,
                "headline": headline
            }
        ]
        
        # Verify digest quality
        issues = self.verify_digest_quality(response, city_name)
        
        # If serious issues found, try regenerating once more
        if any("attribution" in issue for issue in issues) and len(issues) > 2:
            logger.warning("Quality issues detected, regenerating digest...")
            # Add more explicit instructions to address the issues
            reinforced_prompt = prompt + f"\n\nPLEASE NOTE: Do not mention any news sources or media outlets. Focus exclusively on {city_name} local news. Do not include URLs or 'according to' statements."
            response = self.call_language_model(reinforced_prompt)
            
            if response:
                # Re-extract headline
                first_line = response.strip().split('\n')[0]
                if first_line.startswith('**[') and first_line.endswith(']**'):
                    headline = first_line.strip('**[]')
                
                # Update sections
                sections = [
                    {
                        "title": "Digest Content",
                        "content": response,
                        "headline": headline
                    }
                ]
        
        return response, sections

    def generate_digest_for_city(self, articles, city_code, city_config):
        """Generate a digest for a specific city."""
        try:
            # Load fresh articles if none provided
            if not articles:
                self.logger.info(f"No articles provided, loading from Supabase for {city_config['name']}")
                articles = self.load_articles_from_dir(city_code, days_lookback=3)
            
            city_name = city_config["name"]
            region = city_config.get("region", "")
            
            self.logger.info(f"Generating digest for {city_name} from {len(articles)} articles")
            
            # Check if articles list is empty
            if not articles:
                self.logger.error(f"No articles found for {city_name}, cannot generate digest")
                return None
            
            # Early debug checks on the articles
            if len(articles) > 0:
                self.logger.info(f"Sample article title: {articles[0].title}")
            
            try:
                # Convert articles to dictionary format if needed
                article_dicts = self.prepare_articles(articles)
                
                # Create prompt for the AI using existing methods
                prompt = self.create_prompt(article_dicts, city_name, region)
                self.logger.info(f"Generated prompt with {len(prompt)} characters")
                
                # Call language model
                response = self.call_language_model(prompt)
                if not response:
                    self.logger.error("Failed to get response from language model")
                    return None
                
                self.logger.info(f"Received response from language model: {len(response)} characters")
                
                # Create a digest object
                from datetime import datetime
                date = datetime.now().strftime('%Y-%m-%d')
                digest = {
                    "city_code": city_code,
                    "city_name": city_name,
                    "date": date,
                    "content": response,
                    "sections": []  # No sections for now, simplified format
                }
                
                # Try to extract a headline from the response
                import re
                headline_match = re.search(r'\*\*\[(.*?)\]\*\*', response)
                if headline_match:
                    headline = headline_match.group(1)
                    digest["headline"] = headline
                    self.logger.info(f"Extracted headline: {headline}")
                
                return digest
                
            except Exception as e:
                self.logger.error(f"Error in digest generation: {e}")
                import traceback
                self.logger.error(traceback.format_exc())
                return None
            
        except Exception as e:
            self.logger.error(f"Unexpected error in generate_digest_for_city: {e}")
            import traceback
            self.logger.error(traceback.format_exc())
            return None

    def save_digest(self, digest, output_dir="digests"):
        """Save generated digest to file"""
        if not digest:
            logger.warning("No digest to save")
            return None
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Create a filename based on city and date
        filename = f"{digest['city_code']}_{digest['date']}_digest.json"
        filepath = os.path.join(output_dir, filename)
        
        # Save the digest as JSON
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(digest, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Saved digest to {filepath}")
        return filepath
    
    def generate_from_directory(self, directory, city_code=None, output_dir="digests", custom_prefix=""):
        """Generate a digest from articles in a directory"""
        # Make output_dir absolute if it's not already
        if not os.path.isabs(output_dir):
            # Check if we're in a Backend directory structure
            cwd = os.getcwd()
            if 'Backend' in cwd:
                # Use Backend as the root
                output_dir = os.path.join(cwd, output_dir)
            else:
                # Use current directory
                output_dir = os.path.join(os.getcwd(), output_dir)
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Find all JSON files in the directory
        article_files = []
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith(".json") and "articles" in file and "failed" not in file:
                    article_files.append(os.path.join(root, file))
        
        logger.info(f"Found {len(article_files)} article files in {directory}")
        
        # Load articles from each file
        all_articles = []
        for file_path in article_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    articles = json.load(f)
                
                # Filter out non-article content and convert to Article objects if needed
                valid_articles = []
                for article in articles:
                    if isinstance(article, dict) and 'title' in article and 'content' in article:
                        # Check if article is already an Article object
                        if not isinstance(article, Article):
                            # Convert dict to Article object
                            article_obj = Article(**article)
                            valid_articles.append(article_obj)
                        else:
                            valid_articles.append(article)
                
                logger.info(f"Loaded {len(valid_articles)} valid articles from {file_path}")
                all_articles.extend(valid_articles)
            except Exception as e:
                logger.error(f"Error loading articles from {file_path}: {str(e)}")
        
        # Remove duplicates (based on URL)
        unique_urls = set()
        unique_articles = []
        for article in all_articles:
            if article.url not in unique_urls:
                unique_urls.add(article.url)
                unique_articles.append(article)
        
        logger.info(f"Loaded a total of {len(unique_articles)} unique articles from {len(article_files)} files")
        
        # If no city_code provided, try to detect from articles
        if city_code is None:
            city_code, city_config = self.detect_locality(unique_articles)
        else:
            city_config = get_city_config(city_code)
        
        if not city_config:
            logger.error(f"Could not determine city configuration for these articles")
            return None
        
        # Generate the digest
        city_name = city_config["name"]
        region = city_config["region"]
        
        logger.info(f"Generating digest for {city_name}, {region} from {len(unique_articles)} articles")
        
        try:
            # Generate the digest
            digest = self.generate_digest_for_city(city_code, city_name, unique_articles, datetime.datetime.now())
            
            if digest:
                # Save to file
                filename = f"{city_code}_{digest['date']}_digest.json"
                filepath = os.path.join(output_dir, filename)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(digest, f, ensure_ascii=False, indent=2)
                
                logger.info(f"Saved digest to {filepath}")
                return filepath
            else:
                logger.error("Failed to generate digest")
                return None
        except Exception as e:
            logger.error(f"Error generating digest for {city_name}: {str(e)}")
            return None
    
    def attempt_recover_failed_articles(self, articles, max_attempts=10):
        """Try to recover content from failed URLs using web scraping"""
        # Create a list of URLs that might have been referenced but failed
        article_urls = set(article.get("url", "") for article in articles)
        directory = "."
        
        # Try to find failed_urls.json files
        failed_urls_files = glob.glob(os.path.join(directory, "*failed_urls.json"))
        
        all_failed_urls = []
        for file_path in failed_urls_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    urls = json.load(f)
                    if isinstance(urls, list):
                        all_failed_urls.extend(urls)
            except Exception as e:
                logger.error(f"Error loading failed URLs from {file_path}: {str(e)}")
        
        # Remove URLs that we already have articles for
        failed_urls = [url for url in all_failed_urls if url not in article_urls]
        
        # Limit attempts
        failed_urls = failed_urls[:max_attempts]
        if not failed_urls:
            return []
        
        recovered_articles = []
        logger.info(f"Attempting to recover content from {len(failed_urls)} failed URLs")
        
        for url in failed_urls:
            try:
                # Extract slug for reference
                domain = urlparse(url).netloc
                source = domain.replace('www.', '')
                
                # Try to get the page content
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
                response = self.session.get(url, headers=headers, timeout=10)
                response.raise_for_status()
                
                # Parse the HTML
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract title
                title = None
                title_tag = soup.find('h1') or soup.find('title')
                if title_tag:
                    title = title_tag.text.strip()
                
                # Extract content
                content = ""
                
                # Try common content selectors
                content_selectors = [
                    'article', '.article-body', '.story-body', '.entry-content',
                    '.content', '.post-content', '.story', '.article'
                ]
                
                for selector in content_selectors:
                    content_element = soup.select_one(selector)
                    if content_element:
                        paragraphs = content_element.find_all('p')
                        if paragraphs:
                            content = "\n\n".join([p.text.strip() for p in paragraphs if p.text.strip()])
                            break
                
                # If no content found, try all paragraphs
                if not content:
                    paragraphs = soup.find_all('p')
                    if paragraphs:
                        content_paragraphs = [p.text.strip() for p in paragraphs if len(p.text.strip()) > 50]
                        content = "\n\n".join(content_paragraphs)
                
                # Create recovered article if we have title or content
                if title or content:
                    recovered_article = {
                        "url": url,
                        "title": title or f"Article from {source}",
                        "content": content or "Content could not be recovered",
                        "source": source,
                        "recovered": True
                    }
                    
                    recovered_articles.append(recovered_article)
                    logger.info(f"Recovered article from {url}")
                    
            except Exception as e:
                logger.error(f"Failed to recover article from {url}: {str(e)}")
        
        logger.info(f"Successfully recovered {len(recovered_articles)} articles from failed URLs")
        return recovered_articles
    
    def select_images_for_digest(self, articles, max_images=5):
        """Select images for the digest - simplified to avoid unpacking error"""
        logger.info(f"Selecting images for digest - simplified version")
        
        # Return empty values to avoid unpacking error
        featured_image = None
        image_gallery = []
        return featured_image, image_gallery

    def generate(self, articles, city_config):
        """Generate a news digest for the given articles and city
        
        This method interfaces with the LLM to create the actual digest content.
        """
        city_name = city_config["name"]
        region = city_config["region"]
        
        logger.info(f"Generating digest for {city_name}, {region} from {len(articles)} articles")
        
        # Create prompt for the LLM
        prompt = self.create_prompt(articles, city_name, region)
        
        # Call language model
        response = self.call_language_model(prompt)
        
        if not response:
            logger.error("Failed to get response from language model")
            return None
        
        return response

    def prepare_articles(self, articles):
        """Prepare articles for digest generation by converting to standard format"""
        article_dicts = []
        
        for article in articles:
            # Handle Article class instances
            if hasattr(article, 'asdict'):
                article_dict = article.asdict()
            # Handle dictionary articles
            elif isinstance(article, dict):
                article_dict = article.copy()
            # Handle other article objects
            else:
                article_dict = vars(article)
            
            # Ensure all required fields are present
            required_fields = ['url', 'title', 'content', 'source']
            for field in required_fields:
                if field not in article_dict or not article_dict[field]:
                    if field == 'source':
                        article_dict[field] = 'Unknown Source'
                    elif field == 'content':
                        article_dict[field] = 'No content available'
                    elif field == 'title':
                        article_dict[field] = 'Untitled Article'
            
            # Clean up and trim fields
            if 'content' in article_dict and article_dict['content']:
                article_dict['content'] = article_dict['content'].strip()
            
            if 'title' in article_dict and article_dict['title']:
                article_dict['title'] = article_dict['title'].strip()
            
            article_dicts.append(article_dict)
        
        # Log the prepared articles count
        logger.info(f"Prepared {len(article_dicts)} articles for digest generation")
        
        return article_dicts

    def call_language_model(self, prompt):
        """Call the language model API to generate text"""
        try:
            logger.info(f"Calling {self.provider} API for text generation")
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            if self.provider == "openai":
                # OpenAI API payload
                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant that creates local news digests."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2500
                }
            elif self.provider == "mixtral":
                # Mixtral API payload
                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant that creates local news digests."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2500
                }
            else:
                logger.error(f"Unknown provider: {self.provider}")
                return None
            
            # Make the API request
            response = self.session.post(
                self.api_endpoint,
                headers=headers,
                json=payload,
                timeout=120  # Allow up to 2 minutes for response
            )
            
            # Check for successful response
            if response.status_code == 200:
                response_json = response.json()
                
                # Extract content based on provider's response structure
                if self.provider == "openai":
                    return response_json["choices"][0]["message"]["content"]
                elif self.provider == "mixtral":
                    return response_json["choices"][0]["message"]["content"]
            else:
                logger.error(f"API Error: {response.status_code} - {response.text}")
                return None
            
        except Exception as e:
            logger.error(f"Error calling language model: {str(e)}")
            return None

    def get_weather_data(self, city_config):
        """Get current weather and 5-day forecast for a city using WeatherAPI.com"""
        try:
            api_key = os.getenv("WEATHER_API_KEY")
            if not api_key:
                logger.warning("No weather API key found in environment variables")
                return None
            
            # Get coordinates from city config
            lat = city_config.get("latitude")
            lon = city_config.get("longitude")
            
            if not lat or not lon:
                logger.warning(f"No coordinates found for {city_config['name']}")
                return None
            
            # Get current weather and forecast in one call
            url = f"http://api.weatherapi.com/v1/forecast.json?key={api_key}&q={lat},{lon}&days=5&aqi=no&alerts=no"
            
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Process and format the weather data
            weather = {
                "current": {
                    "temp": round(data["current"]["temp_f"]),
                    "feels_like": round(data["current"]["feelslike_f"]),
                    "description": data["current"]["condition"]["text"],
                    "icon": data["current"]["condition"]["icon"],
                    "humidity": data["current"]["humidity"],
                    "wind_speed": round(data["current"]["wind_mph"]),
                    "wind_dir": data["current"]["wind_dir"],
                    "uv": data["current"]["uv"]
                },
                "forecast": []
            }
            
            # Process forecast
            for day in data["forecast"]["forecastday"]:
                weather["forecast"].append({
                    "date": datetime.strptime(day["date"], "%Y-%m-%d").strftime("%A, %b %d"),
                    "temp_high": round(day["day"]["maxtemp_f"]),
                    "temp_low": round(day["day"]["mintemp_f"]),
                    "description": day["day"]["condition"]["text"],
                    "icon": day["day"]["condition"]["icon"],
                    "chance_of_rain": day["day"]["daily_chance_of_rain"],
                    "sunrise": day["astro"]["sunrise"],
                    "sunset": day["astro"]["sunset"]
                })
            
            return weather
            
        except Exception as e:
            logger.error(f"Error fetching weather data: {str(e)}")
            return None

    def format_weather_for_prompt(self, weather_data):
        """Format weather data for inclusion in the prompt"""
        if not weather_data:
            return ""
        
        current = weather_data["current"]
        forecast = weather_data["forecast"]
        
        weather_text = f"""
CURRENT WEATHER:
Temperature: {current['temp']}°F (feels like {current['feels_like']}°F)
Conditions: {current['description']}
Humidity: {current['humidity']}%
Wind: {current['wind_speed']} mph {current['wind_dir']}
UV Index: {current['uv']}

5-DAY FORECAST:
"""
        
        for day in forecast[:5]:  # Limit to 5 days
            weather_text += f"{day['date']}: {day['temp_high']}°F / {day['temp_low']}°F, {day['description']}, {day['chance_of_rain']}% chance of rain\n"
            weather_text += f"Sunrise: {day['sunrise']} | Sunset: {day['sunset']}\n"
        
        return weather_text
    
    def verify_digest_quality(self, digest_content, city_name, temperature_f=None):
        """Verify the quality of the generated digest and flag potential issues"""
        issues = []
        
        # Check for attribution/source mentions
        source_patterns = [
            r"according to [a-zA-Z\s]+",
            r"reported by [a-zA-Z\s]+", 
            r"said [a-zA-Z\s]+ reporter",
            r"[a-zA-Z\s]+ reports",
            r"courtesy of",
            r"www\.",
            r"\.com",
            r"http",
            r"source:"
        ]
        
        for pattern in source_patterns:
            if re.search(pattern, digest_content, re.IGNORECASE):
                issues.append(f"Contains attribution: {pattern}")
        
        # Check for weather recommendation consistency if temperature provided
        if temperature_f is not None:
            if temperature_f > 80:
                if re.search(r"jacket|coat|sweater|long sleeve", digest_content, re.IGNORECASE):
                    issues.append(f"Suggests warm clothing for {temperature_f}°F weather")
            elif temperature_f < 50:
                if re.search(r"t-shirt|shorts|light clothing", digest_content, re.IGNORECASE):
                    issues.append(f"Suggests light clothing for {temperature_f}°F weather")
        
        # Check for local focus - city name should appear multiple times
        city_name_lower = city_name.lower()
        city_name_count = len(re.findall(rf"\b{city_name_lower}\b", digest_content.lower()))
        if city_name_count < 5:
            issues.append(f"Low local focus: {city_name} only mentioned {city_name_count} times")
        
        # If issues found, log them
        if issues:
            logger.warning(f"Digest quality issues found: {', '.join(issues)}")
        
        return issues

    def get_articles_for_city(self, city_code, date_str=None, days_lookback=1):
        """Get articles for a city from Supabase instead of file system"""
        from ..db.supabase_integration import SupabaseIntegration
        import datetime
        
        # Initialize Supabase client
        supabase = SupabaseIntegration()
        
        # Calculate date range
        if date_str:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d")
        else:
            target_date = datetime.datetime.now()
        
        # Calculate the date range (target date minus lookback days)
        start_date = (target_date - datetime.timedelta(days=days_lookback)).strftime("%Y-%m-%d")
        end_date = target_date.strftime("%Y-%m-%d") + "T23:59:59"
        
        self.logger.info(f"Fetching articles for {city_code} from {start_date} to {end_date}")
        
        # Query Supabase for articles
        try:
            response = supabase.client.table('scraped_articles').select('*').eq('city_code', city_code).gte('scraped_at', start_date).lte('scraped_at', end_date).execute()
            
            articles = response.data
            self.logger.info(f"Found {len(articles)} articles in Supabase for {city_code}")
            return articles
        except Exception as e:
            self.logger.error(f"Error fetching articles from Supabase: {e}")
            return []

    def load_articles_from_dir(self, input_dir, filter_recent=True, days_lookback=3):
        """Load articles from Supabase for a specific city code"""
        from ..models.article import Article
        import datetime
        from ..db.supabase_integration import SupabaseIntegration
        
        # Extract city code - simplified approach
        city_code = input_dir
        
        # Handle path-style input for backward compatibility
        if isinstance(input_dir, str) and ('/' in input_dir or '\\' in input_dir):
            # Extract last part of path
            city_code = os.path.basename(input_dir.rstrip('/\\')).split('_')[0]
        
        # Get the city name from city configuration
        from ..config.cities import get_city_config
        city_config = get_city_config(city_code)
        if not city_config:
            logger.warning(f"No configuration found for city code: {city_code}")
            return []
        
        city_name = city_config.get("name")
        logger.info(f"Loading articles for city: {city_name} (code: {city_code})")
        
        # Initialize Supabase client
        try:
            from ..db.supabase_integration import SupabaseIntegration
            supabase = SupabaseIntegration()
        except Exception as e:
            logger.error(f"Failed to initialize Supabase: {e}")
            return []
        
        # Calculate date range
        end_date = datetime.datetime.now()
        start_date = end_date - datetime.timedelta(days=days_lookback)
        
        # Format dates for Supabase query
        start_date_str = start_date.strftime("%Y-%m-%d")
        end_date_str = end_date.strftime("%Y-%m-%d") + "T23:59:59"
        
        # Query Supabase for recent articles matching the city
        try:
            logger.info(f"Querying Supabase for {city_name} articles from {start_date_str} to {end_date_str}")
            
            # Query by city name
            response = supabase.client.table('scraped_articles')\
                .select('*')\
                .eq('city', city_name)\
                .gte('scraped_at', start_date_str)\
                .lte('scraped_at', end_date_str)\
                .execute()
            
            articles_data = response.data
            logger.info(f"Found {len(articles_data)} articles in Supabase for {city_name}")
            
            # Convert to Article objects
            articles = []
            failed_urls = []
            
            for article_data in articles_data:
                try:
                    # Check for required fields
                    if not article_data.get('url') or not article_data.get('title'):
                        logger.warning(f"Skipping article with missing required fields: {article_data.get('url', 'UNKNOWN URL')}")
                        failed_urls.append(article_data.get('url', 'UNKNOWN URL'))
                        continue
                        
                    article = Article(
                        url=article_data.get('url', ''),
                        title=article_data.get('title', ''),
                        content=article_data.get('content', ''),
                        author=article_data.get('author', ''),
                        published_date=article_data.get('published_date', ''),
                        source=article_data.get('source', ''),
                        category=article_data.get('category', 'news'),
                        city=article_data.get('city', ''),
                        region=article_data.get('region', ''),
                        scraped_at=article_data.get('scraped_at'),
                        description=article_data.get('description'),
                        image_urls=article_data.get('image_urls', []),
                        slug=article_data.get('slug', '')
                    )
                    articles.append(article)
                except Exception as e:
                    logger.error(f"Error converting article {article_data.get('url', 'UNKNOWN URL')}: {e}")
                    failed_urls.append(article_data.get('url', 'UNKNOWN URL'))
            
            if failed_urls:
                logger.warning(f"Failed to process {len(failed_urls)} articles: {', '.join(failed_urls[:5])}{'...' if len(failed_urls) > 5 else ''}")
            
            return articles
            
        except Exception as e:
            logger.error(f"Error querying Supabase for {city_name} articles: {e}")
            return []
