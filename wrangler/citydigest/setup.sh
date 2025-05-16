#!/bin/bash
# setup.sh - Set up CityDigest on a Digital Ocean droplet

# Exit on error
set -e

echo "Setting up CityDigest on this server..."

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install dependencies
echo "Installing dependencies..."
sudo apt install -y python3-pip python3-venv git chromium-browser xvfb python3-psutil

# Create citydigest user if it doesn't exist
if ! id "citydigest" &>/dev/null; then
    echo "Creating citydigest user..."
    sudo adduser --disabled-password --gecos "" citydigest
fi

# Clone the main repository
echo "Cloning main CityDigest repository..."
if [ ! -d "/home/citydigest/citydigest" ]; then
    sudo -u citydigest git clone https://github.com/your-username/citydigest.git /home/citydigest/citydigest
else
    echo "Repository already exists, updating..."
    cd /home/citydigest/citydigest
    sudo -u citydigest git pull
fi

# Set up Python virtual environment
echo "Setting up Python virtual environment..."
if [ ! -d "/home/citydigest/venv" ]; then
    sudo -u citydigest python3 -m venv /home/citydigest/venv
fi

# Install requirements
echo "Installing Python dependencies..."
sudo -u citydigest /home/citydigest/venv/bin/pip install -r /home/citydigest/citydigest/requirements.txt
sudo -u citydigest /home/citydigest/venv/bin/pip install psutil

# Copy configuration files
echo "Copying configuration files..."
sudo cp citydigest.service /etc/systemd/system/
sudo cp notification.py /home/citydigest/citydigest/
sudo cp test_email_sender.py /home/citydigest/citydigest/
sudo cp health_check.py /home/citydigest/citydigest/
sudo cp backup.sh /home/citydigest/citydigest/
sudo chmod +x /home/citydigest/citydigest/backup.sh

# Set permissions
echo "Setting permissions..."
sudo chown -R citydigest:citydigest /home/citydigest/citydigest

# Set up systemd service
echo "Setting up systemd service..."
sudo systemctl daemon-reload
sudo systemctl enable citydigest.service
sudo systemctl start citydigest.service

# Set up cron jobs
echo "Setting up cron jobs..."
(crontab -l 2>/dev/null || echo "") | grep -v "health_check\|backup" | sudo -u citydigest tee /tmp/crontab
echo "0 * * * * cd /home/citydigest/citydigest && /home/citydigest/venv/bin/python health_check.py" | sudo -u citydigest tee -a /tmp/crontab
echo "0 4 * * * /home/citydigest/citydigest/backup.sh" | sudo -u citydigest tee -a /tmp/crontab
sudo -u citydigest crontab /tmp/crontab
rm /tmp/crontab

# Set up log rotation
echo "Setting up log rotation..."
sudo tee /etc/logrotate.d/citydigest << EOF
/home/citydigest/citydigest/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 citydigest citydigest
}
EOF

echo "Setup complete! Running test email..."
sudo -u citydigest /home/citydigest/venv/bin/python /home/citydigest/citydigest/test_email_sender.py

echo "CityDigest has been set up and started. Check the status with: sudo systemctl status citydigest.service"
echo "View logs with: sudo journalctl -u citydigest.service -f" 