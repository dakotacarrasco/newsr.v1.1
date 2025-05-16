"""Main entry point for the scheduler service."""
import uvicorn
import os
from fastapi import FastAPI

from shared.config.settings import SCHEDULER_PORT, API_HOST
from shared.utils.logging import setup_logging
from services.scheduler.tasks import start_scheduler

# Set up logging
logger = setup_logging("scheduler")

# Create FastAPI app
app = FastAPI(
    title="CityDigest Scheduler Service",
    description="Service for scheduling scraping and digest generation tasks",
    version="1.0.0"
)

# Import API routes
from services.scheduler.api.routes import router as api_router

# Include API routes
app.include_router(api_router)

@app.get("/")
async def root():
    """Root endpoint for the scheduler service."""
    return {
        "service": "CityDigest Scheduler",
        "status": "running"
    }

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    """Start the scheduler on application startup."""
    await start_scheduler()
    logger.info("Scheduler started")

if __name__ == "__main__":
    # Run the API server
    logger.info(f"Starting scheduler service on {API_HOST}:{SCHEDULER_PORT}")
    uvicorn.run("services.scheduler.main:app", host=API_HOST, port=SCHEDULER_PORT, reload=True) 