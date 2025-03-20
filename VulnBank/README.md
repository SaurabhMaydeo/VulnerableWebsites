# VulnBank - MITM Vulnerable Web Application

VulnBank is a deliberately vulnerable web application designed to demonstrate Man-in-the-Middle (MITM) attack vulnerabilities. This application is created for educational purposes to show how sensitive data can be intercepted when proper security measures are not implemented.

## ⚠️ WARNING

This application is intentionally vulnerable and should NEVER be deployed in a production environment or exposed to the internet. It is designed solely for educational purposes to demonstrate security vulnerabilities.

## Features

- User authentication system
- Account dashboard
- Profile management
- Fund transfer functionality
- Payment processing with credit card input
- Transaction history

## Vulnerabilities

This application includes the following deliberate vulnerabilities:

1. **Unencrypted HTTP Communication**: All data is transmitted in plaintext over HTTP instead of HTTPS.
2. **No Transport Layer Security**: Lack of TLS/SSL encryption allows for easy interception of traffic.
3. **Insecure Cookie Settings**: Cookies lack secure and HttpOnly flags.
4. **Plaintext Credential Storage**: Passwords and sensitive data stored without proper encryption.
5. **Insecure Credit Card Processing**: Card details transmitted and stored without encryption.
6. **SQL Injection in Login**: Vulnerable to SQL injection through string concatenation.
7. **No Content Security Policy**: Missing headers that could help prevent some attacks.
8. **Sensitive Data in LocalStorage**: Credit card information stored in client-side localStorage.
9. **Unencrypted API Endpoints**: Sensitive data returned by API endpoints in plaintext JSON.
10. **No CSRF Protection**: Forms lack CSRF tokens, allowing cross-site request forgery.

## Installation

1. Make sure you have Python and Flask installed:
   ```
   pip install flask
   ```

2. Navigate to the VulnBank directory:
   ```
   cd /path/to/VulnBank
   ```

3. Run the application:
   ```
   python app.py
   ```

4. Access the application at http://localhost:5000

## Demo Accounts

- Admin: username `admin`, password `admin123`
- User: username `user1`, password `password1`

## MITM Attack Demonstration

To demonstrate a MITM attack on this application, you can use tools like:

1. **Wireshark**: To capture and analyze network traffic
2. **Burp Suite**: For intercepting and modifying HTTP requests
3. **Ettercap**: For ARP poisoning and traffic interception
4. **mitmproxy**: For intercepting and analyzing HTTP traffic

By monitoring the traffic between the client and server, you can observe:
- Login credentials in plaintext
- Session cookies without protection
- Credit card details during payment
- Sensitive account information in API responses

## Educational Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Transport Layer Protection Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)
- [MITM Attack Explanation](https://www.cloudflare.com/learning/security/threats/man-in-the-middle-attack/)

## Secure Implementation Guidelines

In a real application, you would mitigate these vulnerabilities by:

1. Enforcing HTTPS with proper TLS configuration
2. Implementing HSTS (HTTP Strict Transport Security)
3. Setting secure and HttpOnly flags on cookies
4. Using proper password hashing (bcrypt, Argon2)
5. Never storing sensitive card details (use a payment processor)
6. Implementing parameterized queries to prevent SQL injection
7. Adding proper Content Security Policy headers
8. Never storing sensitive data in client-side storage
9. Using secure API authentication (OAuth, JWT with proper settings)
10. Implementing CSRF protection on all forms

## License

This project is for educational purposes only.

## Author

Created for educational demonstration purposes.
