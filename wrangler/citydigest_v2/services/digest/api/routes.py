
"""API routes for the digest service."""
from fastapi import APIRouter, HTTPException, Query, Path
from typing import List, Dict, Any, Optional
from datetime import datetime

from shared.config.cities import CITIES, CITY_CODES
from shared.utils.logging import setup_logging
from shared.utils.helpers import get_date_str
from services.digest.generator.digest_generator import DigestGenerator

# Set up logging
logger = setup_logging("digest")

# Create router
router = APIRouter(prefix="/api/digest", tags=["digest"])

@router.get("/cities")
async def get_cities():
    """Get all supported cities."""
    return {"cities": CITIES}

@router.get("/generate/{city_code}")
async def generate_digest(
    city_code: str,
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format, defaults to today"),
    force: bool = Query(False, description="Force generation even if digest already exists")
):
    """
    Generate a digest for a specific city.
    
    Args:
        city_code (str): City code
        date (str, optional): Date in YYYY-MM-DD format, defaults to today
        force (bool, optional): Force generation even if digest already exists
        
    Returns:
        dict: Generation result
    """
    # Validate city code
    if city_code not in CITY_CODES:
        raise HTTPException(status_code=404, detail=f"City '{city_code}' not found")
    
    # Use today's date if not specified
    if not date:
        date = get_date_str()
    
    # Generate digest
    generator = DigestGenerator(city_code)
    
    try:
        digest = generator.generate(date, force)
        return {
            "status": "success",
            "message": f"Digest generated for {city_code} on {date}",
            "city": CITIES[city_code],
            "date": date,
            "digest": {
                "id": digest.id,
                "title": digest.title,
                "summary": digest.summary
            }
        }
    except Exception as e:
        logger.error(f"Error generating digest for {city_code} on {date}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{city_code}/{date}")
async def get_digest(
    city_code: str,
    date: str = Path(..., description="Date in YYYY-MM-DD format")
):
    """
    Get a digest for a specific city and date.
    
    Args:
        city_code (str): City code
        date (str): Date in YYYY-MM-DD format
        
    Returns:
        dict: Digest data
    """
    # Validate city code
    if city_code not in CITY_CODES:
        raise HTTPException(status_code=404, detail=f"City '{city_code}' not found")
    
    # Get digest
    generator = DigestGenerator(city_code)
    digest = generator.get(date)
    
    if not digest:
        raise HTTPException(status_code=404, detail=f"Digest not found for {city_code} on {date}")
    
    return digest.to_dict()



