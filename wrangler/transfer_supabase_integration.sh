#!/bin/bash

# This script transfers the updated Supabase integration files to the server
# Replace SERVER_IP with your actual server IP

SERVER_IP="your_server_ip"
SERVER_USER="root"
SERVER_PATH="/var/www/citydigest_v2"

echo "Packaging Supabase integration files..."

# Create a temporary directory for packaging
mkdir -p tmp_transfer/services/digest/generator
mkdir -p tmp_transfer/services/scraper/scrapers

# Copy updated Supabase integration files
cp citydigest_v2/services/scraper/scrapers/base_scraper.py tmp_transfer/services/scraper/scrapers/
cp citydigest_v2/services/digest/generator/digest_generator.py tmp_transfer/services/digest/generator/

# Compress the transfer package
tar -czf supabase_integration.tar.gz -C tmp_transfer .

# Transfer to server
echo "Transferring files to server..."
scp supabase_integration.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

# Extract on server and place files in the right locations
echo "Deploying files on server..."
ssh ${SERVER_USER}@${SERVER_IP} "
    cd ${SERVER_PATH} && 
    # Extract and copy files
    tar -xzf /tmp/supabase_integration.tar.gz -C /tmp &&
    cp -f /tmp/services/scraper/scrapers/base_scraper.py services/scraper/scrapers/ &&
    cp -f /tmp/services/digest/generator/digest_generator.py services/digest/generator/ &&
    # Clean up
    rm -rf /tmp/services /tmp/supabase_integration.tar.gz &&
    # Restart containers to apply changes
    docker-compose restart
"

# Clean up local temporary files
rm -rf tmp_transfer supabase_integration.tar.gz

echo "Transfer complete! Supabase integration has been updated on the server."
echo "The Docker containers have been restarted to apply the changes." 