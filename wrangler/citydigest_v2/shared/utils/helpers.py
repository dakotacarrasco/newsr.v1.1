"""Helper functions for CityDigest application."""
import os
import json
import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

def ensure_directory(directory_path: str) -> None:
    """
    Ensure a directory exists, creating it if necessary.
    
    Args:
        directory_path (str): Path to the directory
    """
    os.makedirs(directory_path, exist_ok=True)

def save_json(data: Any, file_path: str) -> None:
    """
    Save data as a JSON file.
    
    Args:
        data (Any): Data to save
        file_path (str): Path to save the file
    """
    # Ensure directory exists
    directory = os.path.dirname(file_path)
    ensure_directory(directory)
    
    # Save data
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)

def load_json(file_path: str, default: Optional[Any] = None) -> Any:
    """
    Load data from a JSON file.
    
    Args:
        file_path (str): Path to the JSON file
        default (Any, optional): Default value if file doesn't exist
        
    Returns:
        Any: Loaded data or default value
    """
    if not os.path.exists(file_path):
        return default
    
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_date_str(date: Optional[datetime.datetime] = None) -> str:
    """
    Get a formatted date string (YYYY-MM-DD).
    
    Args:
        date (datetime.datetime, optional): Date to format, defaults to today
        
    Returns:
        str: Formatted date string
    """
    if date is None:
        date = datetime.datetime.now()
    
    return date.strftime('%Y-%m-%d')

def get_datetime_str(date: Optional[datetime.datetime] = None) -> str:
    """
    Get a formatted datetime string (YYYY-MM-DD-HHMMSS).
    
    Args:
        date (datetime.datetime, optional): Datetime to format, defaults to now
        
    Returns:
        str: Formatted datetime string
    """
    if date is None:
        date = datetime.datetime.now()
    
    return date.strftime('%Y-%m-%d-%H%M%S') 