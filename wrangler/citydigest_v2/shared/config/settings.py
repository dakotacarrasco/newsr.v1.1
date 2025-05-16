"""Global application settings for CityDigest."""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Application environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"
IS_DEVELOPMENT = ENVIRONMENT == "development"

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs")

# API settings
API_HOST = "0.0.0.0"
SCHEDULER_PORT = int(os.getenv("SCHEDULER_PORT", 8001))
SCRAPER_PORT = int(os.getenv("SCRAPER_PORT", 8002))
DIGEST_PORT = int(os.getenv("DIGEST_PORT", 8003))

# Database
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Paths
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
CITIES_DATA_DIR = os.path.join(DATA_DIR, "cities")
CONTINUOUS_DATA_DIR = os.path.join(DATA_DIR, "continuous") 