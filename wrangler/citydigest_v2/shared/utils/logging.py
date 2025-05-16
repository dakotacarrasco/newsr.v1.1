"""Logging configuration for CityDigest."""
import os
import sys
from loguru import logger

from shared.config.settings import LOG_LEVEL, LOG_DIR

def setup_logging(service_name):
    """
    Set up logging for a service.
    
    Args:
        service_name (str): Name of the service (e.g., 'scraper', 'digest', 'scheduler')
    
    Returns:
        logger: Configured logger instance
    """
    # Create log directory if it doesn't exist
    service_log_dir = os.path.join(LOG_DIR, service_name)
    os.makedirs(service_log_dir, exist_ok=True)
    
    # Configure loguru logger
    log_file_path = os.path.join(service_log_dir, f"{service_name}.log")
    
    # Remove default handlers
    logger.remove()
    
    # Add console handler
    logger.add(
        sys.stderr,
        level=LOG_LEVEL,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
    )
    
    # Add file handler
    logger.add(
        log_file_path,
        rotation="1 day",
        retention="7 days",
        level=LOG_LEVEL,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}"
    )
    
    return logger 