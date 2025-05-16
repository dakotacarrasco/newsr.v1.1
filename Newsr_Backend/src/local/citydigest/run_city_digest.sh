#!/bin/bash

# CityDigest Automation Script
# This script runs the CityDigest system for automated news scraping and digest generation

# Configuration (edit these variables as needed)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
VENV_PATH="${PROJECT_ROOT}/newsr"  # Updated to use your specific venv path
LOG_DIR="${PROJECT_ROOT}/logs"
LOG_FILE="${LOG_DIR}/citydigest_cron.log"
CITY_CODE=""  # Leave empty for all cities, or set to specific city code like "chicago"
USE_SUPABASE=true  # Set to false to disable Supabase integration

# Create log directory if it doesn't exist
mkdir -p "${LOG_DIR}"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# Function to handle errors
handle_error() {
    log "ERROR: $1"
    exit 1
}

# Activate virtual environment if it exists
if [ -f "${VENV_PATH}/bin/activate" ]; then
    source "${VENV_PATH}/bin/activate" || handle_error "Failed to activate virtual environment"
    log "Activated virtual environment at ${VENV_PATH}"
elif [ -f "${VENV_PATH}/Scripts/activate" ]; then
    # Windows style path for Git Bash
    source "${VENV_PATH}/Scripts/activate" || handle_error "Failed to activate virtual environment"
    log "Activated virtual environment at ${VENV_PATH} (Windows)"
else
    log "No virtual environment found at ${VENV_PATH}, using system Python"
fi

# Navigate to project root
cd "${PROJECT_ROOT}" || handle_error "Failed to navigate to project root at ${PROJECT_ROOT}"
log "Changed directory to ${PROJECT_ROOT}"

# Set PYTHONPATH to include project root
export PYTHONPATH="${PROJECT_ROOT}:${PYTHONPATH}"

# Build the command based on configuration
CMD="python -c \"import sys; sys.path.insert(0, '${PROJECT_ROOT}'); from src.local.citydigest.scheduler.scheduler import main; main()\" --run-now"

# Add city argument if specified
if [ -n "${CITY_CODE}" ]; then
    CMD="${CMD} --city ${CITY_CODE}"
    log "Running for specific city: ${CITY_CODE}"
else
    log "Running for all active cities"
fi

# Add Supabase flag if disabled
if [ "${USE_SUPABASE}" = false ]; then
    CMD="${CMD} --no-supabase"
    log "Supabase integration disabled"
fi

# Run the command
log "Executing command: ${CMD}"
eval "${CMD}" >> "${LOG_FILE}" 2>&1
EXIT_CODE=$?

if [ ${EXIT_CODE} -eq 0 ]; then
    log "CityDigest completed successfully"
else
    log "CityDigest failed with exit code ${EXIT_CODE}"
    # Print last 20 lines of the log file to help with debugging
    log "Last 20 lines of log file:"
    tail -n 20 "${LOG_FILE}" | while read -r line; do
        log "LOG: $line"
    done
fi

# Deactivate virtual environment if it was activated
if [ -n "${VIRTUAL_ENV}" ]; then
    deactivate
    log "Deactivated virtual environment"
fi

exit ${EXIT_CODE}
