"""Main entry point for the scraper service."""
import uvicorn
import os
from fastapi import FastAPI

from shared.config.settings import SCRAPER_PORT, API_HOST
from shared.utils.logging import setup_logging

# Set up logging
logger = setup_logging("scraper")

# Create FastAPI app
app = FastAPI(
    title="CityDigest Scraper Service",
    description="Service for scraping news articles from various sources",
    version="1.0.0"
)

# Import API routes
from services.scraper.api.routes import router as api_router

# Include API routes
app.include_router(api_router)

@app.get("/")
async def root():
    """Root endpoint for the scraper service."""
    return {
        "service": "CityDigest Scraper",
        "status": "running"
    }

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    # Run the API server
    logger.info(f"Starting scraper service on {API_HOST}:{SCRAPER_PORT}")
    uvicorn.run("services.scraper.main:app", host=API_HOST, port=SCRAPER_PORT, reload=True) 