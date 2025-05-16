# CityDigest

CityDigest is a containerized application for scraping news from various cities and generating daily news digests.

## Architecture

The application is divided into three main services, each running in its own container:

1. **Scraper Service**: Responsible for scraping news articles from various sources.
2. **Digest Service**: Processes scraped articles and generates daily news digests.
3. **Scheduler Service**: Manages the scheduling of scraping and digest generation tasks.

## Services

### Scraper Service

- Scrapes news articles from configured sources for each city
- Provides API endpoints for triggering scraping manually
- Stores scraped articles in a structured format

### Digest Service

- Processes articles scraped by the Scraper Service
- Categorizes articles using NLP techniques
- Generates comprehensive news digests
- Provides API endpoints for generating and retrieving digests

### Scheduler Service

- Schedules regular scraping and digest generation jobs
- Provides API endpoints for managing scheduled jobs
- Triggers jobs on configurable schedules

## Containerization

Each service is containerized using Docker, with:
- Separate Dockerfiles for each service
- A shared docker-compose.yml for orchestration
- Shared volumes for data and logs

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.10+ (for development)

### Installation

1. Clone the repository
2. Configure environment variables in `.env` file
3. Run the deploy script:

```bash
./deploy.sh
```

This will build and start all containers.

### Configuration

Configure cities and sources in `shared/config/cities.py`.

Environment variables are set in the `.env` file:
- Database credentials (Supabase)
- API keys (OpenAI)
- Other application settings

## API Endpoints

### Scraper Service (port 8002)

- `GET /api/scraper/cities` - List all supported cities
- `GET /api/scraper/scrape/{city_code}` - Trigger scraping for a city
- `GET /api/scraper/status/{city_code}` - Get scraping status

### Digest Service (port 8003)

- `GET /api/digest/cities` - List all supported cities
- `GET /api/digest/generate/{city_code}` - Generate digest for a city
- `GET /api/digest/{city_code}/{date}` - Get digest for a specific date

### Scheduler Service (port 8001)

- `GET /api/scheduler/jobs` - List all scheduled jobs
- `POST /api/scheduler/jobs` - Create a new scheduled job
- `DELETE /api/scheduler/jobs/{job_id}` - Delete a scheduled job
- `POST /api/scheduler/run/{job_type}/{city_code}` - Run a job immediately

## Directory Structure

```
citydigest_v2/
├── docker-compose.yml           # Main docker-compose file for all services
├── .env                         # Environment variables for all services
├── Dockerfile.scheduler         # Dockerfile for scheduler service
├── Dockerfile.scraper           # Dockerfile for scraper service
├── Dockerfile.digest            # Dockerfile for digest service
├── requirements.common.txt      # Common requirements for all services
├── requirements.scheduler.txt   # Scheduler-specific requirements
├── requirements.scraper.txt     # Scraper-specific requirements
├── requirements.digest.txt      # Digest-specific requirements
├── deploy.sh                    # Main deployment script
├── shared/                      # Shared code used by all services
├── services/                    # Service-specific code
├── data/                        # Mounted data directory (shared between services)
└── logs/                        # Log files
```

## Development

To develop locally without containers:

1. Install requirements:
```bash
pip install -r requirements.common.txt
pip install -r requirements.scraper.txt  # or other service as needed
```

2. Run a service:
```bash
python -m services.scraper.main  # or other service as needed
```
