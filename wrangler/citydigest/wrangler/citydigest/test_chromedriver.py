#!/usr/bin/env python3

import os
import sys
import subprocess
import glob
import zipfile
import requests
import shutil
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger('chromedriver_test')

def check_file_type(path):
    """Check if file is likely an executable based on its first few bytes"""
    try:
        with open(path, 'rb') as f:
            header = f.read(4)
            # ELF header for Linux executables
            if header.startswith(b'\x7fELF'):
                return "ELF executable"
            return "Unknown binary file"
    except:
        return "Could not determine file type"

def find_chromedriver():
    """Search for chromedriver in various locations and return all instances found"""
    found_drivers = []
    
    # Standard locations
    standard_paths = [
        '/var/www/citydigest/chromedriver-linux64/chromedriver',
        '/app/chromedriver-linux64/chromedriver',
        '/usr/local/bin/chromedriver',
        '/usr/bin/chromedriver'
    ]
    
    # Check standard paths
    for path in standard_paths:
        if os.path.exists(path):
            is_executable = os.access(path, os.X_OK)
            file_type = check_file_type(path) if is_executable else "Not executable"
            found_drivers.append({
                'path': path,
                'executable': is_executable,
                'file_info': file_type
            })
    
    # Check temp directories and webdriver manager cache
    search_dirs = [
        '/tmp',
        '/root/.wdm/drivers/chromedriver',
        '/root/.cache/selenium',
        '/app'
    ]
    
    for search_dir in search_dirs:
        if os.path.exists(search_dir):
            logger.info(f"Searching in {search_dir}")
            for root, dirs, files in os.walk(search_dir):
                for name in files:
                    if 'chromedriver' in name.lower() and not name.endswith('.py') and 'NOTICES' not in name:
                        path = os.path.join(root, name)
                        is_executable = os.access(path, os.X_OK)
                        file_type = check_file_type(path) if is_executable else "Not executable"
                        found_drivers.append({
                            'path': path,
                            'executable': is_executable,
                            'file_info': file_type
                        })
    
    return found_drivers

def download_chromedriver(version="latest"):
    """Manually download the correct chromedriver version"""
    chrome_version = "135.0.7049.114"  # Default to the version we know we need
    
    # Get Chrome version if not specified
    try:
        result = subprocess.run(["google-chrome", "--version"], capture_output=True, text=True)
        chrome_version_output = result.stdout.strip()
        # Extract version number (e.g., "Google Chrome 135.0.7049.114" -> "135.0.7049.114")
        chrome_version = chrome_version_output.split()[-1]
        logger.info(f"Detected Chrome version: {chrome_version}")
    except:
        logger.warning(f"Could not determine Chrome version, using default: {chrome_version}")
    
    # Extract major version (e.g., "135.0.7049.114" -> "135")
    major_version = chrome_version.split('.')[0]
    
    # Construct download URL for Chrome-for-Testing
    logger.info(f"Using Chrome version: {chrome_version}")
    download_url = f"https://storage.googleapis.com/chrome-for-testing-public/{chrome_version}/linux64/chromedriver-linux64.zip"
    
    download_path = "/tmp/chromedriver.zip"
    extract_path = "/tmp/chromedriver_extract"
    
    # Create extract directory if it doesn't exist
    if not os.path.exists(extract_path):
        os.makedirs(extract_path)
    
    logger.info(f"Downloading from: {download_url}")
    
    try:
        # Download the file
        response = requests.get(download_url, stream=True)
        if response.status_code == 200:
            with open(download_path, 'wb') as f:
                response.raw.decode_content = True
                shutil.copyfileobj(response.raw, f)
            
            # Extract the zip file
            with zipfile.ZipFile(download_path, 'r') as zip_ref:
                zip_ref.extractall(extract_path)
            
            logger.info(f"Extracted files to {extract_path}")
            
            # Find the chromedriver executable in the extracted files
            driver_path = None
            for root, dirs, files in os.walk(extract_path):
                for file in files:
                    if file == "chromedriver":
                        potential_path = os.path.join(root, file)
                        if os.access(potential_path, os.X_OK) or os.path.exists(potential_path):
                            # Make it executable if it's not already
                            if not os.access(potential_path, os.X_OK):
                                os.chmod(potential_path, 0o755)
                            driver_path = potential_path
                            break
                if driver_path:
                    break
            
            if driver_path:
                logger.info(f"Found chromedriver at: {driver_path}")
                return driver_path
            else:
                logger.error("Could not find chromedriver in extracted files")
                return None
        else:
            logger.error(f"Failed to download: HTTP {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Error downloading chromedriver: {str(e)}")
        return None

def test_driver(driver_path):
    """Test if the given chromedriver works with Chrome"""
    logger.info(f"Testing driver: {driver_path}")
    
    try:
        # Set up Chrome options for headless browsing
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        # Create ChromeService with the given driver path
        service = ChromeService(executable_path=driver_path)
        
        # Initialize Chrome WebDriver
        driver = webdriver.Chrome(service=service, options=options)
        
        # Navigate to a simple website
        driver.get("https://www.example.com")
        
        # Wait for the page to load
        time.sleep(2)
        
        # Get page title to verify it works
        title = driver.title
        logger.info(f"Page title: {title}")
        
        # Close the driver
        driver.quit()
        
        return True
    except Exception as e:
        logger.error(f"Driver test failed: {str(e)}")
        return False

def main():
    logger.info("Starting chromedriver test")
    
    # Get Chrome version
    try:
        result = subprocess.run(["google-chrome", "--version"], capture_output=True, text=True)
        chrome_version = result.stdout.strip()
        logger.info(f"Installed Chrome: {chrome_version}")
    except:
        logger.warning("Could not determine Chrome version")
    
    # Find all chromedriver executables
    drivers = find_chromedriver()
    
    if not drivers:
        logger.info("No chromedriver executables found initially")
    else:
        logger.info(f"Found {len(drivers)} potential chromedriver executables")
        
        for i, driver in enumerate(drivers):
            logger.info(f"Driver #{i+1}: {driver['path']}")
            logger.info(f"  Executable: {driver['executable']}")
            logger.info(f"  File info: {driver['file_info']}")
        
        # Test each executable driver found
        success = False
        for driver in drivers:
            if driver['executable'] and driver['path'].endswith('chromedriver'):
                if test_driver(driver['path']):
                    logger.info(f"Success! Working chromedriver: {driver['path']}")
                    success = True
                    return
        
        if not success:
            logger.warning("None of the found drivers work with the current Chrome version")
    
    # Try our manual download approach
    logger.info("Attempting to manually download the correct chromedriver version")
    driver_path = download_chromedriver()
    
    if driver_path and test_driver(driver_path):
        logger.info(f"Success! Downloaded working chromedriver: {driver_path}")
        logger.info(f"CHROMEDRIVER PATH FOR CONFIG: {driver_path}")
        
        # Copy to a more permanent location if needed
        perm_path = "/app/chromedriver-linux64/chromedriver"
        os.makedirs(os.path.dirname(perm_path), exist_ok=True)
        shutil.copy2(driver_path, perm_path)
        os.chmod(perm_path, 0o755)
        logger.info(f"Copied working driver to: {perm_path}")
    else:
        logger.error("Could not find or download a working chromedriver")

if __name__ == "__main__":
    main()

