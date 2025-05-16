#!/usr/bin/env python3
import os
import json
import logging
import re
import glob
from datetime import datetime
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import topic configuration system
from ..config.topics import get_topic_config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("topic_digest_generator")

class TopicDigestGenerator:
    """Generate topic-based news digests using a language model API"""
    
    def __init__(self, provider="mixtral", api_key=None):
        """Initialize the digest generator"""
        self.provider = provider
        
        # Set API key from environment variable if not provided
        if not api_key:
            if provider == "openai":
                api_key = os.environ.get("OPENAI_API_KEY")
            elif provider == "mixtral":
                api_key = os.environ.get("MIXTRAL_API_KEY")
                logger.info(f"Using Mixtral API Key: {api_key[:4]}...")
        
        self.api_key = api_key
        
        # Set API endpoint based on provider
        if provider == "openai":
            self.api_endpoint = "https://api.openai.com/v1/chat/completions"
            self.model = "gpt-4"
        elif provider == "mixtral":
            self.api_endpoint = os.environ.get("MIXTRAL_API_ENDPOINT", "https://api.mistral.ai/v1/chat/completions")
            self.model = "mistral-large-latest"
            logger.info(f"Using Mixtral API endpoint: {self.api_endpoint}")
        else:
            raise ValueError(f"Unsupported provider: {provider}")
        
        # Initialize session
        self.session = requests.Session()
    
    # ... rest of the class implementation stays the same ...
    
    def load_articles_from_directory(self, directory):
        """Load articles from JSON files in a directory"""
        articles = []
        
        # Check if directory exists
        if not os.path.exists(directory):
            logger.error(f"Directory does not exist: {directory}")
            return articles
        
        # Find all JSON files in directory
        json_files = glob.glob(os.path.join(directory, "*.json"))
        
        for file_path in json_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Handle both list and dict formats
                if isinstance(data, list):
                    articles.extend(data)
                elif isinstance(data, dict) and "articles" in data:
                    articles.extend(data["articles"])
                elif isinstance(data, dict):
                    # Add the single article
                    articles.append(data)
                
            except Exception as e:
                logger.error(f"Error loading {file_path}: {str(e)}")
        
        logger.info(f"Loaded {len(articles)} articles from {directory}")
        return articles
    
    def create_digest_prompt(self, articles, topic_name):
        """Create a prompt for the LLM to generate a topic-based digest"""
        
        # Get current date
        today = datetime.now().strftime("%A, %B %d, %Y")
        
        # Collect article information for the prompt
        article_texts = []
        sources = set()
        
        for i, article in enumerate(articles[:15]):  # Limit to 15 articles to avoid token limits
            title = article.get('title', 'Untitled')
            content = article.get('content', '')
            source = article.get('source', 'Unknown Source')
            
            # Truncate content to avoid token limits
            if len(content) > 1000:
                content = content[:1000] + "..."
            
            article_text = "ARTICLE " + str(i+1) + ":\nTitle: " + title + "\nSource: " + source + "\n\n" + content + "\n"
            article_texts.append(article_text)
            sources.add(source)
        
        # Join all article texts with newlines
        all_articles_text = "\n".join(article_texts)
        
        # Create the main prompt - avoiding backslashes in f-string expressions
        prompt = (
            f"You are a specialized news digest generator for {topic_name} news. Today is {today}.\n\n"
            f"Create a comprehensive and well-structured digest about {topic_name} using only the articles provided below.\n\n"
            f"Format the digest as follows:\n\n"
            f"1. Start with a headline: \"TODAY IN {topic_name.upper()}: [catchy headline summarizing the main story]\"\n\n"
            f"2. TOP STORY: A detailed summary (2-3 paragraphs) of the most significant {topic_name.lower()} news of the day.\n\n"
            f"3. KEY DEVELOPMENTS: 3-5 bullet points highlighting other important {topic_name.lower()} news items.\n\n"
            f"4. ANALYSIS: 1-2 paragraphs providing deeper context, connections between stories, or trend analysis.\n\n"
            f"5. LOOKING AHEAD: A brief paragraph on what to watch for in this topic in the coming days.\n\n"
            "Important guidelines:\n"
            "- Write in a clear, engaging, and objective style\n"
            "- Only include information from the provided articles\n"
            "- Be factual and avoid sensationalism or bias\n"
            "- Include specific names, numbers, and details from the articles\n"
            "- Do not add any disclaimers or mentions that you are an AI\n\n"
            f"ARTICLES TO SUMMARIZE:\n\n{all_articles_text}"
        )
        
        return prompt
    
    def call_language_model(self, prompt):
        """Call language model API to generate a response"""
        if not self.api_key:
            logger.warning("No API key provided for language model. Using mock response for testing.")
            # Generate a mock response for testing purposes
            return self.generate_mock_response(prompt)
        
        try:
            # Set up API request
            headers = {
                "Content-Type": "application/json"
            }
            
            if self.provider == "openai":
                headers["Authorization"] = f"Bearer {self.api_key}"
                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "You are a professional news digest writer."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.5,
                    "max_tokens": 1500
                }
            elif self.provider == "mixtral":
                headers["Authorization"] = f"Bearer {self.api_key}"
                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "You are a professional news digest writer."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.5,
                    "max_tokens": 1500
                }
            
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
    
    def generate_mock_response(self, prompt):
        """Generate a mock digest response for testing without an API key"""
        # Extract topic name from the prompt
        topic_match = re.search(r'news digest generator for (\w+) news', prompt)
        topic = topic_match.group(1) if topic_match else "Politics"
        
        # Current date
        today = datetime.now().strftime("%A, %B %d, %Y")
        
        # Generate a simple mock digest
        mock_digest = f"""TODAY IN {topic.upper()}: MOCK DIGEST FOR TESTING

TOP STORY:
This is a mock digest generated for testing purposes on {today}. In a real implementation, this would contain a summary of the most important {topic.lower()} news of the day based on the provided articles.

KEY DEVELOPMENTS:
- This is the first mock key development point
- This is the second mock key development point
- This is the third mock key development point

ANALYSIS:
This mock analysis would typically provide deeper context about the {topic.lower()} news landscape. Since this is a test digest created without an API key, this section is simplified.

LOOKING AHEAD:
In the coming days, watch for further developments in the {topic.lower()} space. This section would normally outline upcoming events or potential developments.
"""
        return mock_digest
    
    def generate_digest_for_topic(self, articles, topic_code, topic_config=None):
        """Generate a digest for a specific topic"""
        if not topic_config:
            topic_config = get_topic_config(topic_code)
            if not topic_config:
                logger.error(f"No configuration found for topic: {topic_code}")
                return None
        
        topic_name = topic_config["name"]
        
        logger.info(f"Generating digest for {topic_name} from {len(articles)} articles")
        
        # Create prompt for the LLM
        prompt = self.create_digest_prompt(articles, topic_name)
        
        # Call language model
        response = self.call_language_model(prompt)
        
        if not response:
            logger.error("Failed to get response from language model")
            return None
        
        # Create digest data structure
        digest = {
            "topic_code": topic_code,
            "topic_name": topic_name,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "content": response,
            "article_count": len(articles),
            "sources": list(set([article.get("source", "Unknown") for article in articles])),
            "created_at": datetime.now().isoformat()
        }
        
        return digest
    
    def generate_from_directory(self, input_dir, topic_code, output_dir=None):
        """Generate a digest from articles in a directory"""
        try:
            # Load articles from input directory
            articles = self.load_articles_from_directory(input_dir)
            
            if not articles:
                logger.warning(f"No articles found in {input_dir}")
                return None
            
            # Generate digest
            digest = self.generate_digest_for_topic(articles, topic_code)
            
            if not digest:
                logger.error("Failed to generate digest")
                return None
            
            # Set default output directory if not provided
            if not output_dir:
                output_dir = os.path.join("output", "digests")
            
            # Ensure output directory exists
            os.makedirs(output_dir, exist_ok=True)
            
            # Save digest to file
            date_str = digest["date"]
            filename = f"{topic_code}_digest_{date_str}.json"
            filepath = os.path.join(output_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(digest, f, ensure_ascii=False, indent=2)
            
            logger.info(f"Saved digest to {filepath}")
            
            return filepath
            
        except Exception as e:
            logger.error(f"Error generating digest from directory: {str(e)}")
            return None