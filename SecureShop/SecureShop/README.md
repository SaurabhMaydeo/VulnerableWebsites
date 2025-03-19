# SecureShop

A deliberately vulnerable e-commerce website demonstrating XSS vulnerabilities.

⚠️ **WARNING: This application contains intentional security vulnerabilities. DO NOT use in production.**

## Vulnerabilities

### Cross-Site Scripting (XSS)
The application contains multiple XSS vulnerabilities in its search functionality:

1. Categories Page Search
2. About Page Search
3. Contact Page Search

To test XSS, enter the following in any search box:
```html
<script>alert('XSS')</script>
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
node server.js
```

3. Visit http://localhost:3000 in your browser

## Tech Stack

- Node.js
- Express.js
- HTML/CSS/JavaScript
- Bootstrap

## Structure

- `/public` - Static files (HTML, CSS, client-side JS)
- `server.js` - Express server and API endpoints
- `package.json` - Project dependencies

## Disclaimer

This application is for educational purposes only. It contains intentional security vulnerabilities to demonstrate common web security issues.
