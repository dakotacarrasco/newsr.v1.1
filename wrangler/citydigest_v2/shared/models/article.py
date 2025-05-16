"""Article data model for CityDigest."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, HttpUrl

class Article(BaseModel):
    """Article data model."""
    
    id: Optional[str] = None
    title: str
    url: HttpUrl
    source_name: str
    city_code: str
    published_at: Optional[datetime] = None
    content: str
    summary: Optional[str] = None
    category: Optional[str] = None
    author: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    date: str = Field(default_factory=lambda: datetime.now().strftime('%Y-%m-%d'))
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        """Pydantic configuration."""
        
        arbitrary_types_allowed = True
        
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model to dictionary.
        
        Returns:
            Dict[str, Any]: Dictionary representation of the article
        """
        return self.dict(exclude_none=True)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Article':
        """
        Create model from dictionary.
        
        Args:
            data (Dict[str, Any]): Dictionary data
            
        Returns:
            Article: Article instance
        """
        return cls(**data) 