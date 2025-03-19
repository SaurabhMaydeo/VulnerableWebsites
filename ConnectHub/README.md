# ConnectHub - Vulnerable Social Media Platform

ConnectHub is an intentionally vulnerable social media platform designed for educational purposes to demonstrate common web security vulnerabilities, particularly XSS (Cross-Site Scripting).

## Security Vulnerabilities

The platform includes the following intentional vulnerabilities:

1. **XSS (Cross-Site Scripting)**
   - Posts and comments are vulnerable to script injection
   - No sanitization of user input when script tags are present
   - Demonstrates persistent XSS attacks

## Features

- User authentication (login/register)
- Post creation and viewing
- Comment system
- Modern UI with Bootstrap
- Real-time updates using Socket.io

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
node server.js
```

3. Access the application at `http://localhost:3000`

## Test Account

- Username: testuser
- Password: test123

## Dependencies

- Express.js
- Socket.io
- SQLite3
- EJS
- Marked
- Bootstrap
- Remix Icons

## Educational Purpose

This application is designed for educational purposes only. Do not use in production or deploy on public servers. The vulnerabilities are intentional for learning about web security.
