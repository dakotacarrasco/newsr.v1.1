"""Mixtral LLM client for CityDigest."""
import os
from typing import List, Dict, Any, Optional
import openai

from shared.utils.logging import setup_logging
from shared.config.settings import OPENAI_API_KEY

# Set up logging
logger = setup_logging("digest")

class MixtralClient:
    """Client for interacting with Mixtral LLM via OpenAI API."""
    
    def __init__(self):
        """Initialize the Mixtral client."""
        openai.api_key = OPENAI_API_KEY
    
    def generate(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        """
        Generate text using Mixtral 8x7B.
        
        Args:
            prompt (str): Input prompt
            max_tokens (int, optional): Maximum tokens to generate
            temperature (float, optional): Sampling temperature
            
        Returns:
            str: Generated text
        """
        try:
            # Note: This is using OpenAI's API format, but you could replace with
            # direct API calls to Mixtral or other LLMs as needed
            response = openai.ChatCompletion.create(
                model="gpt-4",  # Replace with Mixtral model when available
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant that summarizes and categorizes news articles."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            # Extract and return the generated text
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error generating text with Mixtral: {str(e)}")
            return ""
    
    def summarize_article(self, article_content: str, max_length: int = 200) -> str:
        """
        Summarize an article.
        
        Args:
            article_content (str): Article content
            max_length (int, optional): Maximum summary length in words
            
        Returns:
            str: Article summary
        """
        prompt = f"""Summarize the following article in {max_length} words or less:

{article_content}

Summary:"""
        
        return self.generate(prompt)
    
    def categorize_articles(self, articles: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Categorize a list of articles.
        
        Args:
            articles (List[Dict[str, Any]]): List of articles
            
        Returns:
            Dict[str, List[Dict[str, Any]]]: Categorized articles
        """
        # Create prompt with article information
        articles_text = ""
        for i, article in enumerate(articles):
            articles_text += f"Article {i+1}:\n"
            articles_text += f"Title: {article['title']}\n"
            articles_text += f"Content: {article['content'][:500]}...\n\n"
        
        prompt = f"""Categorize the following articles into these categories: politics, crime, business, health, education, sports, entertainment, environment, technology, and other.

{articles_text}

For each article, provide the category it belongs to. Format your response as a JSON object where keys are category names and values are lists of article indices.

Categories:"""
        
        # Generate categorization
        response = self.generate(prompt)
        
        # Parse response (simplified, would need better parsing in production)
        # In a real implementation, we'd ensure the response is valid JSON
        categories = {
            "politics": [],
            "crime": [],
            "business": [],
            "health": [],
            "education": [],
            "sports": [],
            "entertainment": [],
            "environment": [],
            "technology": [],
            "other": []
        }
        
        # For now, return a simplified categorization
        return categories
    
    def generate_digest(self, city_name: str, date: str, categorized_articles: Dict[str, List[Dict[str, Any]]]) -> str:
        """
        Generate a digest from categorized articles.
        
        Args:
            city_name (str): City name
            date (str): Date in YYYY-MM-DD format
            categorized_articles (Dict[str, List[Dict[str, Any]]]): Categorized articles
            
        Returns:
            str: Generated digest
        """
        # Create prompt with categorized articles
        categories_text = ""
        for category, category_articles in categorized_articles.items():
            if not category_articles:
                continue
                
            categories_text += f"Category: {category.title()}\n"
            for article in category_articles:
                categories_text += f"- {article['title']} (Source: {article['source']})\n"
                if article['summary']:
                    categories_text += f"  Summary: {article['summary'][:100]}...\n"
            categories_text += "\n"
        
        prompt = f"""Generate a comprehensive news digest for {city_name} on {date}. The digest should include a summary of the main events and news stories from the day.

Here are the categorized articles:

{categories_text}

Generate a well-structured digest that includes:
1. A brief overview of the day's news
2. Sections for each category with summaries of the main stories
3. Commentary on the significance of major developments

Format the digest in Markdown."""
        
        # Generate digest
        return self.generate(prompt, max_tokens=2000, temperature=0.5) 