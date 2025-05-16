"""API routes for the scheduler service."""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime

from shared.config.cities import CITIES, CITY_CODES
from shared.utils.logging import setup_logging
from services.scheduler.tasks import get_jobs, add_job, remove_job, run_job_now

# Set up logging
logger = setup_logging("scheduler")

# Create router
router = APIRouter(prefix="/api/scheduler", tags=["scheduler"])

@router.get("/jobs")
async def get_scheduled_jobs():
    """Get all scheduled jobs."""
    jobs = get_jobs()
    return {"jobs": jobs}

@router.post("/jobs")
async def schedule_job(
    job_type: str = Query(..., description="Type of job (scrape or digest)"),
    city_code: str = Query(..., description="City code"),
    cron_expression: str = Query(..., description="Cron expression for scheduling (e.g., '0 5 * * *')")
):
    """
    Schedule a new job.
    
    Args:
        job_type (str): Type of job (scrape or digest)
        city_code (str): City code
        cron_expression (str): Cron expression for scheduling
        
    Returns:
        dict: Scheduling result
    """
    # Validate job type
    if job_type not in ["scrape", "digest"]:
        raise HTTPException(status_code=400, detail=f"Invalid job type: {job_type}")
    
    # Validate city code
    if city_code not in CITY_CODES:
        raise HTTPException(status_code=404, detail=f"City '{city_code}' not found")
    
    try:
        job_id = add_job(job_type, city_code, cron_expression)
        
        return {
            "status": "success",
            "message": f"{job_type} job scheduled for {city_code}",
            "job_id": job_id,
            "city": CITIES[city_code],
            "cron_expression": cron_expression
        }
    except Exception as e:
        logger.error(f"Error scheduling {job_type} job for {city_code}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    """
    Delete a scheduled job.
    
    Args:
        job_id (str): Job ID
        
    Returns:
        dict: Deletion result
    """
    try:
        removed = remove_job(job_id)
        
        if not removed:
            raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")
        
        return {
            "status": "success",
            "message": f"Job {job_id} deleted",
            "job_id": job_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting job {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/run/{job_type}/{city_code}")
async def run_job(
    job_type: str,
    city_code: str
):
    """
    Run a job immediately.
    
    Args:
        job_type (str): Type of job (scrape or digest)
        city_code (str): City code
        
    Returns:
        dict: Run result
    """
    # Validate job type
    if job_type not in ["scrape", "digest"]:
        raise HTTPException(status_code=400, detail=f"Invalid job type: {job_type}")
    
    # Validate city code
    if city_code not in CITY_CODES:
        raise HTTPException(status_code=404, detail=f"City '{city_code}' not found")
    
    try:
        run_job_now(job_type, city_code)
        
        return {
            "status": "success",
            "message": f"{job_type} job triggered for {city_code}",
            "city": CITIES[city_code],
            "timestamp": datetime.now()
        }
    except Exception as e:
        logger.error(f"Error running {job_type} job for {city_code}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 