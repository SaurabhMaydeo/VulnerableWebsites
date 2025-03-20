#!/bin/bash

# Install required packages if needed
echo "Installing required packages..."
pip3 install selenium webdriver-manager pillow

# Make the Python script executable
chmod +x capture_screenshots.py

# Run the screenshot capture script
echo "Running screenshot capture script..."
python3 capture_screenshots.py

echo "Remember to add these screenshots to git:"
echo "git add screenshots/*.png"
echo "git commit -m \"Add application screenshots\""
echo "git push origin main"
