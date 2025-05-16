"""Supabase integration for CityDigest."""
from supabase import create_client, Client
from shared.config.settings import SUPABASE_URL, SUPABASE_KEY

class SupabaseClient:
    """Client for interacting with Supabase."""
    
    _instance = None
    
    def __new__(cls):
        """Singleton pattern implementation."""
        if cls._instance is None:
            cls._instance = super(SupabaseClient, cls).__new__(cls)
            cls._instance._client = None
        return cls._instance
    
    def __init__(self):
        """Initialize Supabase client."""
        if not self._client:
            self._client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    @property
    def client(self) -> Client:
        """
        Get the Supabase client instance.
        
        Returns:
            Client: Supabase client
        """
        return self._client
    
    def insert_article(self, article_data):
        """
        Insert an article into the articles table.
        
        Args:
            article_data (dict): Article data
            
        Returns:
            dict: Response from Supabase
        """
        return self.client.table('articles').insert(article_data).execute()
    
    def insert_digest(self, digest_data):
        """
        Insert a digest into the digests table.
        
        Args:
            digest_data (dict): Digest data
            
        Returns:
            dict: Response from Supabase
        """
        return self.client.table('digests').insert(digest_data).execute()
    
    def get_articles_for_city(self, city_code, date=None, limit=100):
        """
        Get articles for a specific city.
        
        Args:
            city_code (str): City code
            date (str, optional): Date in YYYY-MM-DD format
            limit (int, optional): Maximum number of articles to retrieve
            
        Returns:
            list: List of articles
        """
        query = self.client.table('articles').select('*').eq('city_code', city_code).order('published_at', desc=True).limit(limit)
        
        if date:
            query = query.eq('date', date)
            
        response = query.execute()
        return response.data
    
    def get_digest_for_city(self, city_code, date):
        """
        Get digest for a specific city and date.
        
        Args:
            city_code (str): City code
            date (str): Date in YYYY-MM-DD format
            
        Returns:
            dict: Digest data or None if not found
        """
        response = self.client.table('digests').select('*').eq('city_code', city_code).eq('date', date).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None 