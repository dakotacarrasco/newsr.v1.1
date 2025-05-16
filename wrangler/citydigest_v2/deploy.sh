#!/bin/bash

# Ensure script execution stops on first error
set -e

echo "Building and starting CityDigest containers..."

# Build and start all containers in detached mode
docker-compose up --build -d

echo "Checking container status..."
docker-compose ps

echo "Viewing logs (press Ctrl+C to exit)..."
docker-compose logs -f
