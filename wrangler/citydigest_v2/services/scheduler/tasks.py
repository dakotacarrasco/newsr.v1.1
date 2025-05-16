"""Task scheduling and execution for the scheduler service."""
import os
import uuid
import asyncio
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.jobstores.memory import MemoryJobStore

from shared.config.cities import CITY_CODES
from shared.config.settings import SCRAPER_PORT, DIGEST_PORT, API_HOST
from shared.utils.logging import setup_logging
from shared.utils.helpers import get_date_str

# Set up logging
logger = setup_logging("scheduler")

# Initialize scheduler
scheduler = AsyncIOScheduler(
    jobstores={"default": MemoryJobStore()},
    timezone="UTC"
)

# API endpoints
SCRAPER_API_URL = f"http://{API_HOST}:{SCRAPER_PORT}/api/scraper"
DIGEST_API_URL = f"http://{API_HOST}:{DIGEST_PORT}/api/digest"

async def start_scheduler():
    """Start the scheduler if it's not already running."""
    if not scheduler.running:
        scheduler.start()
        logger.info("Scheduler started")
        
        # Add default jobs
        await add_default_jobs()
    else:
        logger.info("Scheduler already running")

async def add_default_jobs():
    """Add default jobs for all cities."""
    logger.info("Adding default jobs")
    
    for city_code in CITY_CODES:
        # Add default scrape job at 5:00 AM UTC
        add_job("scrape", city_code, "0 5 * * *")
        
        # Add default digest job at 7:00 AM UTC
        add_job("digest", city_code, "0 7 * * *")
    
    logger.info("Default jobs added")

def get_jobs() -> List[Dict[str, Any]]:
    """
    Get all scheduled jobs.
    
    Returns:
        List[Dict[str, Any]]: List of jobs
    """
    jobs = []
    
    for job in scheduler.get_jobs():
        job_data = {
            "id": job.id,
            "name": job.name,
            "trigger": str(job.trigger),
            "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None
        }
        jobs.append(job_data)
    
    return jobs

def add_job(job_type: str, city_code: str, cron_expression: str) -> str:
    """
    Add a job to the scheduler.
    
    Args:
        job_type (str): Type of job (scrape or digest)
        city_code (str): City code
        cron_expression (str): Cron expression for scheduling
        
    Returns:
        str: Job ID
    """
    # Generate a unique job ID
    job_id = f"{job_type}_{city_code}_{uuid.uuid4().hex[:8]}"
    
    # Create job
    trigger = CronTrigger.from_crontab(cron_expression)
    
    if job_type == "scrape":
        scheduler.add_job(
            run_scrape_job,
            trigger=trigger,
            args=[city_code],
            id=job_id,
            name=f"Scrape {city_code}",
            replace_existing=True
        )
    elif job_type == "digest":
        scheduler.add_job(
            run_digest_job,
            trigger=trigger,
            args=[city_code],
            id=job_id,
            name=f"Digest {city_code}",
            replace_existing=True
        )
    else:
        raise ValueError(f"Invalid job type: {job_type}")
    
    logger.info(f"Added {job_type} job for {city_code} with cron expression {cron_expression}")
    return job_id

def remove_job(job_id: str) -> bool:
    """
    Remove a job from the scheduler.
    
    Args:
        job_id (str): Job ID
        
    Returns:
        bool: True if job was removed, False otherwise
    """
    try:
        scheduler.remove_job(job_id)
        logger.info(f"Removed job {job_id}")
        return True
    except Exception as e:
        logger.error(f"Error removing job {job_id}: {str(e)}")
        return False

def run_job_now(job_type: str, city_code: str):
    """
    Run a job immediately.
    
    Args:
        job_type (str): Type of job (scrape or digest)
        city_code (str): City code
    """
    if job_type == "scrape":
        asyncio.create_task(run_scrape_job(city_code))
    elif job_type == "digest":
        asyncio.create_task(run_digest_job(city_code))
    else:
        raise ValueError(f"Invalid job type: {job_type}")
    
    logger.info(f"Triggered immediate execution of {job_type} job for {city_code}")

async def run_scrape_job(city_code: str):
    """
    Run a scrape job.
    
    Args:
        city_code (str): City code
    """
    logger.info(f"Running scrape job for {city_code}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{SCRAPER_API_URL}/scrape/{city_code}")
            response.raise_for_status()
            logger.info(f"Scrape job for {city_code} completed successfully")
    except Exception as e:
        logger.error(f"Error running scrape job for {city_code}: {str(e)}")

async def run_digest_job(city_code: str):
    """
    Run a digest job.
    
    Args:
        city_code (str): City code
    """
    logger.info(f"Running digest job for {city_code}")
    
    try:
        # Use today's date
        date = get_date_str()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{DIGEST_API_URL}/generate/{city_code}?date={date}")
            response.raise_for_status()
            logger.info(f"Digest job for {city_code} completed successfully")
    except Exception as e:
        logger.error(f"Error running digest job for {city_code}: {str(e)}")

# Helper function to get all jobs for a city
def get_city_jobs(city_code: str) -> List[Dict[str, Any]]:
    """
    Get all jobs for a specific city.
    
    Args:
        city_code (str): City code
        
    Returns:
        List[Dict[str, Any]]: List of jobs
    """
    jobs = []
    
    for job in scheduler.get_jobs():
        if city_code in job.id:
            job_data = {
                "id": job.id,
                "name": job.name,
                "trigger": str(job.trigger),
                "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None
            }
            jobs.append(job_data)
    
    return jobs 