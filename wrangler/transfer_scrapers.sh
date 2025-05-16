#!/bin/bash

# This script transfers the scrapers to the server
# Replace SERVER_IP with your actual server IP

SERVER_IP="your_server_ip"
SERVER_USER="root"
SERVER_PATH="/var/www/citydigest_v2/services/scraper/scrapers/states"

# Compress the states directory
tar -czf scrapers_states.tar.gz -C citydigest_v2/services/scraper/scrapers states

# Transfer to server
scp scrapers_states.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

# Extract on server
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${SERVER_PATH} && tar -xzf /tmp/scrapers_states.tar.gz -C /var/www/citydigest_v2/services/scraper/scrapers && rm /tmp/scrapers_states.tar.gz"

# Clean up local file
rm scrapers_states.tar.gz

echo "Scrapers transferred successfully!" 