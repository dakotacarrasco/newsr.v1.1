"""Main entry point for the digest service."""
import uvicorn
import os
from fastapi import FastAPI

from shared.config.settings import DIGEST_PORT, API_HOST
from shared.utils.logging import setup_logging

# Set up logging
logger = setup_logging("digest")

# Create FastAPI app
app = FastAPI(
    title="CityDigest Digest Service",
    description="Service for generating city news digests",
    version="1.0.0"
)

# Import API routes
from services.digest.api.routes import router as api_router

# Include API routes
app.include_router(api_router)

@app.get("/")
async def root():
    """Root endpoint for the digest service."""
    return {
        "service": "CityDigest Digest Generator",
        "status": "running"
    }

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    # Run the API server
    logger.info(f"Starting digest service on {API_HOST}:{DIGEST_PORT}")
    uvicorn.run("services.digest.main:app", host=API_HOST, port=DIGEST_PORT, reload=True) 