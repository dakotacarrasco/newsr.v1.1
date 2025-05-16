"""Digest data model for CityDigest."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class Digest(BaseModel):
    """Digest data model."""
    
    id: Optional[str] = None
    city_code: str
    date: str = Field(default_factory=lambda: datetime.now().strftime('%Y-%m-%d'))
    title: str
    content: str
    summary: str
    categories: Dict[str, List[Dict[str, Any]]] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        """Pydantic configuration."""
        
        arbitrary_types_allowed = True
        
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model to dictionary.
        
        Returns:
            Dict[str, Any]: Dictionary representation of the digest
        """
        return self.dict(exclude_none=True)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Digest':
        """
        Create model from dictionary.
        
        Args:
            data (Dict[str, Any]): Dictionary data
            
        Returns:
            Digest: Digest instance
        """
        return cls(**data) 