#!/usr/bin/env python3
import os
import json
import logging
import time
from typing import List, Dict, Any, Optional
import random
from datetime import datetime
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("article_rewriter")

class ArticleRewriter:
    """Rewrite news articles in multiple styles using Mixtral"""
    
    def __init__(self, min_content_length: int = 1000):
        """Initialize the article rewriter"""
        self.min_content_length = min_content_length
        
        # Setup Mixtral API
        self.api_key = os.environ.get("MIXTRAL_API_KEY")
        self.api_endpoint = os.environ.get("MIXTRAL_API_ENDPOINT", "https://api.mistral.ai/v1/chat/completions")
        self.model = "mistral-large-latest"
        
        if not self.api_key:
            logger.error("No Mixtral API key found in environment variables")
        
        # Initialize session
        self.session = requests.Session()
        
        # Define writing styles
        self.writing_styles = {
            "explanatory": {
                "name": "Explanatory",
                "description": "Clear, informative, and educational. Focuses on explaining complex concepts in simple terms.",
                "tone": "Objective, instructive, and straightforward"
            },
            "narrative": {
                "name": "Narrative",
                "description": "Story-driven with a compelling flow. Uses narrative elements like characters, plot, and scenes.",
                "tone": "Engaging, descriptive, and immersive"
            },
            "analytical": {
                "name": "Analytical",
                "description": "In-depth examination with critical analysis. Presents multiple perspectives and evaluates evidence.",
                "tone": "Thoughtful, nuanced, and logically structured"
            },
            "conversational": {
                "name": "Conversational",
                "description": "Casual and reader-friendly. Uses direct address and conversational language.",
                "tone": "Friendly, accessible, and relatable"
            },
            "investigative": {
                "name": "Investigative",
                "description": "Fact-based deep dive. Reveals connections and implications that aren't immediately obvious.",
                "tone": "Probing, detailed, and revealing"
            }
        }
    
    def filter_articles_by_length(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filter articles to only include those with substantial content"""
        filtered_articles = []
        
        for article in articles:
            content = article.get('content', '')
            if len(content) >= self.min_content_length:
                filtered_articles.append(article)
                logger.info(f"Selected article for rewriting: {article.get('title', 'Untitled')} ({len(content)} chars)")
            else:
                logger.info(f"Skipping short article: {article.get('title', 'Untitled')} ({len(content)} chars)")
        
        return filtered_articles
    
    def create_rewrite_prompt(self, article: Dict[str, Any], style_key: str) -> str:
        """Create a prompt for rewriting an article in a specific style"""
        title = article.get('title', 'Untitled')
        content = article.get('content', '')
        
        style = self.writing_styles[style_key]
        style_name = style["name"]
        style_desc = style["description"]
        style_tone = style["tone"]
        
        prompt = f"""
TASK: Completely rewrite this news article in a {style_name.upper()} style.

WRITING STYLE DETAILS:
- Style: {style_name}
- Description: {style_desc}
- Tone: {style_tone}

REQUIREMENTS:
1. Create a NEW, COMPELLING HEADLINE that captures the essence of the story
2. Completely rewrite the entire article in the specified style
3. Preserve ALL facts, figures, quotes, and key information from the original
4. Do not add fictional elements or invent new facts
5. Keep the rewritten article approximately the same length as the original
6. Do not mention that this is a rewritten article or reference the original
7. Write in a natural, journalistic style appropriate for publication

ORIGINAL ARTICLE TITLE: 
{title}

ORIGINAL ARTICLE CONTENT:
{content}

OUTPUT FORMAT:
Provide your response in JSON format with two fields:
1. "headline": The new headline
2. "content": The rewritten article content

JSON ONLY - NO INTRODUCTION, EXPLANATION OR COMMENTS
"""
        return prompt
    
    def call_mixtral_api(self, prompt: str) -> Optional[str]:
        """Call Mixtral API to rewrite article"""
        if not self.api_key:
            logger.error("Cannot call Mixtral API without an API key")
            return None
        
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are a professional news journalist who rewrites articles in different styles."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 4000
            }
            
            response = self.session.post(
                self.api_endpoint,
                headers=headers,
                json=payload,
                timeout=120
            )
            
            if response.status_code == 200:
                response_json = response.json()
                content = response_json["choices"][0]["message"]["content"]
                return content
            else:
                logger.error(f"API Error: {response.status_code} - {response.text}")
                return None
            
        except Exception as e:
            logger.error(f"Error calling Mixtral API: {str(e)}")
            return None
    
    def parse_rewritten_content(self, response: str) -> Dict[str, str]:
        """Parse the JSON response from Mixtral"""
        try:
            # Find JSON content (might be wrapped in ```json blocks)
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].strip()
            else:
                json_str = response.strip()
            
            # Parse JSON
            result = json.loads(json_str)
            
            # Ensure expected fields exist
            if "headline" not in result or "content" not in result:
                logger.warning("Unexpected response format missing headline or content")
                if "headline" not in result:
                    result["headline"] = "Headline Missing"
                if "content" not in result:
                    result["content"] = "Content Missing"
            
            return result
            
        except Exception as e:
            logger.error(f"Error parsing rewritten content: {str(e)}")
            return {
                "headline": "Error: Could not parse rewritten content",
                "content": "An error occurred while parsing the rewritten content."
            }
    
    def rewrite_article(self, article: Dict[str, Any], style_key: str) -> Optional[Dict[str, Any]]:
        """Rewrite a single article in the specified style"""
        try:
            # Create prompt for rewriting
            prompt = self.create_rewrite_prompt(article, style_key)
            
            # Call Mixtral API
            response = self.call_mixtral_api(prompt)
            if not response:
                return None
            
            # Parse the response
            rewritten = self.parse_rewritten_content(response)
            
            # Create rewritten article object
            rewritten_article = article.copy()  # Copy original metadata
            
            # Update with rewritten content
            rewritten_article["original_title"] = article.get("title", "")
            rewritten_article["title"] = rewritten["headline"]
            rewritten_article["original_content"] = article.get("content", "")
            rewritten_article["content"] = rewritten["content"]
            rewritten_article["is_rewritten"] = True
            rewritten_article["rewrite_style"] = self.writing_styles[style_key]["name"]
            rewritten_article["rewritten_at"] = datetime.now().isoformat()
            
            return rewritten_article
            
        except Exception as e:
            logger.error(f"Error rewriting article: {str(e)}")
            return None
    
    def rewrite_articles(self, articles: List[Dict[str, Any]], styles: List[str] = None) -> List[Dict[str, Any]]:
        """Rewrite a batch of articles in various styles"""
        # Filter articles by content length
        filtered_articles = self.filter_articles_by_length(articles)
        
        if not filtered_articles:
            logger.warning("No articles with sufficient content length to rewrite")
            return []
        
        # Use all styles if none specified
        if not styles:
            styles = list(self.writing_styles.keys())
        
        rewritten_articles = []
        
        # Process each article
        for article in filtered_articles:
            # Select a random style for variety if multiple styles requested
            style_key = random.choice(styles)
            
            logger.info(f"Rewriting article '{article.get('title', 'Untitled')}' in {self.writing_styles[style_key]['name']} style")
            
            # Rewrite the article
            rewritten = self.rewrite_article(article, style_key)
            
            if rewritten:
                rewritten_articles.append(rewritten)
                logger.info(f"Successfully rewrote article: '{rewritten['title']}'")
            
            # Avoid rate limiting
            time.sleep(1)
        
        logger.info(f"Rewrote {len(rewritten_articles)} articles in total")
        return rewritten_articles
    
    def rewrite_and_upload(self, articles: List[Dict[str, Any]], supabase_integration=None) -> List[Dict[str, Any]]:
        """Rewrite articles and upload them to Supabase"""
        # Rewrite the articles
        rewritten_articles = self.rewrite_articles(articles)
        
        if not rewritten_articles:
            return []
        
        # Upload to Supabase if integration provided
        if supabase_integration:
            for article in rewritten_articles:
                try:
                    # Format data for Supabase
                    article_data = {
                        "title": article.get("title", ""),
                        "content": article.get("content", ""),
                        "source": article.get("source", ""),
                        "topic": article.get("topic", ""),
                        "url": article.get("url", ""),
                        "topic_code": article.get("topic", ""),
                        "is_rewritten": True,
                        "rewrite_style": article.get("rewrite_style", ""),
                        "original_title": article.get("original_title", ""),
                        "published_at": datetime.now().isoformat(),
                        "created_at": datetime.now().isoformat()
                    }
                    
                    # Upload to Supabase
                    success = supabase_integration.upload_article(article_data)
                    
                    if success:
                        logger.info(f"Uploaded rewritten article to Supabase: {article.get('title', 'Untitled')}")
                    else:
                        logger.error(f"Failed to upload rewritten article: {article.get('title', 'Untitled')}")
                        
                except Exception as e:
                    logger.error(f"Error uploading article to Supabase: {str(e)}")
        
        return rewritten_articles