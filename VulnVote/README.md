# VulnVote - Vulnerable Polling Application

**WARNING: This application contains intentional security vulnerabilities. It is designed for educational purposes only.**

## Overview

VulnVote is a deliberately vulnerable web application that demonstrates Man-in-the-Middle (MITM) attack vulnerabilities in a polling/voting system. It is designed for security education, allowing students and security professionals to understand the risks associated with insecure data transmission.

## Key Vulnerabilities

1. **Man-in-the-Middle (MITM) Attack Vulnerability**: 
   - Data is transmitted over HTTP (not HTTPS)
   - Vote information can be intercepted and modified by attackers

2. **No Vote Validation**: 
   - Users can vote multiple times by intercepting and replaying HTTP requests
   - No session or IP-based protections

3. **No CSRF Protection**: 
   - Cross-Site Request Forgery attacks are possible on voting endpoints

4. **API Endpoint Without Authentication**: 
   - Anyone can submit votes programmatically
   - No rate limiting or API keys

5. **SQL Injection**: 
   - Several endpoints are vulnerable to SQL injection attacks

## Setup Instructions

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the application:
   ```
   python app.py
   ```

3. Access the application at: http://localhost:5000

## Educational Use Cases

### Man-in-the-Middle Attack Demonstration

Students can use tools like Wireshark or MITM Proxy to:
- Capture network traffic between the browser and server
- View unencrypted vote data
- Modify votes before they reach the server
- Create scripts to automate vote manipulation

### Attack Mitigation Study

This application can be used to demonstrate how to fix these vulnerabilities:
- Implementing HTTPS
- Adding CSRF protection tokens
- Implementing proper session management
- Adding vote validation
- Using prepared SQL statements

## Disclaimer

This application is for educational purposes only. Do not deploy it in a production environment or use it for actual polling. The vulnerabilities are intentional and designed to demonstrate common security flaws.
