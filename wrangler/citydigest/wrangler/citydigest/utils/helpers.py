#!/usr/bin/env python3
"""
Utility functions for the CityDigest system
"""
import os
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def ensure_directory(directory_path):
    """Ensure a directory exists, creating it if necessary"""
    os.makedirs(directory_path, exist_ok=True)
    return os.path.exists(directory_path)

def safe_json_dump(data, file_path):
    """Safely write JSON data to a file"""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error writing JSON to {file_path}: {str(e)}")
        return False

def format_date(date_obj=None, format_str="%Y-%m-%d"):
    """Format a date object as a string"""
    if date_obj is None:
        date_obj = datetime.now()
    return date_obj.strftime(format_str)

def parse_date(date_str, format_str="%Y-%m-%d"):
    """Parse a date string into a datetime object"""
    try:
        return datetime.strptime(date_str, format_str)
    except ValueError:
        logger.error(f"Invalid date format: {date_str}")
        return None