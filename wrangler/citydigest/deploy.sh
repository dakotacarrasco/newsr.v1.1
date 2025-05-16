#!/bin/bash

# Build Docker image
docker build -t citydigest .

# Run the container, adjust environment variables as needed
docker run -d \
  --name citydigest-service \
  --restart unless-stopped \
  -v /var/www/docker-data/data:/app/data \
  -v /var/www/docker-data/logs:/app/logs \
  -v /var/www/docker-data/config:/app/config \
  -v /var/www/docker-data/cache:/app/cache \
  -e SUPABASE_URL=${SUPABASE_URL:-https://ckywgfnaaiapiyrztgdp.supabase.co} \
  -e SUPABASE_KEY=${SUPABASE_KEY} \
  citydigest

echo "CityDigest service deployed. Check logs with: docker logs citydigest-service" 