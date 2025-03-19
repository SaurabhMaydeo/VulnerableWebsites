# VulnLibrary - Vulnerable Library Management System

A deliberately vulnerable library management system for security research and education.

## Vulnerabilities

1. SQL Injection
   - Login form is vulnerable to SQL injection
   - Search functionality is vulnerable to SQL injection
   - User profile updates are vulnerable to SQL injection

2. XSS (Cross-Site Scripting)
   - Search results display is vulnerable to XSS
   - Profile information display is vulnerable to XSS
   - Book details page is vulnerable to stored XSS

3. Authentication Bypass
   - Admin panel access can be bypassed through SQL injection
   - User role checks are vulnerable to manipulation

## Test Users

The system comes with 8 pre-configured users:
- Admin accounts (role: admin)
  - admin1@library.local / admin123
  - admin2@library.local / admin123
  - admin3@library.local / admin123
  - admin4@library.local / admin123
  - admin5@library.local / admin123
  - admin@library.local / admin123
- User accounts (role: user)
  - user1@test.com / secret123
  - user2@test.com / password456

## Setup

1. Make sure you have PHP and SQLite3 installed
2. Clone the repository
3. Start the PHP development server:
   ```bash
   php -S localhost:8000 -t public
   ```
4. Visit http://localhost:8000 in your browser

## Warning

This application contains intentional security vulnerabilities. DO NOT deploy in a production environment or expose to the public internet.
