#!/usr/bin/env python3
"""
Script to capture screenshots of the VulnFitTrack application.
Requires selenium and webdriver_manager to be installed.

Install dependencies with:
pip install selenium webdriver-manager pillow
"""

import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Setup Chrome options
chrome_options = Options()
chrome_options.add_argument("--window-size=1920,1080")
chrome_options.add_argument("--headless")  # Run Chrome in headless mode

# Setup the Chrome driver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

try:
    # Capture dashboard screenshot
    print("Capturing dashboard screenshot...")
    driver.get("http://127.0.0.1:5000/dashboard")
    
    # Login if needed
    if "login" in driver.current_url:
        print("Logging in...")
        username_field = driver.find_element(By.ID, "username")
        password_field = driver.find_element(By.ID, "password")
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        
        username_field.send_keys("admin")
        password_field.send_keys("admin123")
        submit_button.click()
        
        # Wait for dashboard to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Dashboard')]"))
        )
    
    # Give time for charts to render
    time.sleep(2)
    
    # Save dashboard screenshot
    driver.save_screenshot("screenshots/dashboard.png")
    print("Dashboard screenshot saved!")
    
    # Capture activities screenshot
    print("Capturing activities screenshot...")
    driver.get("http://127.0.0.1:5000/activities")
    
    # Wait for activities page to load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'My Activities')]"))
    )
    
    # Save activities screenshot
    driver.save_screenshot("screenshots/activities.png")
    print("Activities screenshot saved!")
    
    print("All screenshots captured successfully!")

except Exception as e:
    print(f"Error capturing screenshots: {e}")

finally:
    # Close the browser
    driver.quit()
