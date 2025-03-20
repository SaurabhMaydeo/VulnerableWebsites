# TechHive

TechHive is a professional tech community website designed for educational purposes to demonstrate common web security vulnerabilities. This site allows users to share knowledge, access tutorials, and connect with other tech enthusiasts, while subtly incorporating various authentication vulnerabilities for security training and awareness.

## Website Structure

```
TechHive/
├── index.html        # Homepage
├── login.html        # Login and registration page
├── dashboard.html    # User dashboard (authenticated access)
├── settings.html     # User settings page (role/ID modification)
├── users.html        # User management (admin only)
├── style.css         # Styling
├── script.js         # Client-side JavaScript
└── README.md         # This file
```

## Features

- Professional user interface
- User authentication system
- Member dashboard
- Course tracking
- Event management
- Community activity feed

## Getting Started

1. Clone or download this project
2. Open `index.html` in your browser to view the homepage
3. Navigate to the login page to access the authentication system
4. Use the following demo credentials:
   - Username: admin / Password: admin123
   - Username: john / Password: john2023
   - Username: sarah / Password: sarah123

## Testing Environment

This is a demonstration website for educational purposes. It uses client-side authentication with JavaScript and localStorage/sessionStorage for user management.

## Security Vulnerabilities (Intentional)

This website intentionally contains the following security vulnerabilities for educational purposes:

1. **Broken Authentication**
   - Passwords stored in plaintext in localStorage
   - Predictable session tokens using Base64 encoding (username + id + timestamp)
   - No protection against privilege escalation
   - No secure flags on cookies
   - Direct URL access vulnerability (can access dashboard via parameters)

2. **User Privilege Vulnerabilities**
   - User roles and IDs can be modified directly in browser storage
   - User can escalate to admin privileges via settings page
   - No server-side validation of user permissions
   
3. **Data Exposure**
   - Sensitive information visible in client-side code
   - User credentials accessible through browser storage
   - User management available to anyone who can obtain admin role

## Security Testing Scenarios

### Privilege Escalation
1. Log in as a regular user (e.g., john/john2023)
2. Navigate to Settings → Account Settings
3. Change your role from "Member" to "Admin"
4. Change your ID to "1" (admin ID)
5. Observe that you now have access to admin features

### Cookie Manipulation
1. Log in as a regular user
2. Use browser dev tools to examine cookies
3. Modify the "role" cookie to "Admin"
4. Refresh the page to see admin features

### URL Parameter Exploitation
1. Log out of the system
2. Navigate directly to: `dashboard.html?directAccess=true`
3. Observe that you can access the dashboard without authentication

**IMPORTANT**: This application is for **educational purposes only** and should never be deployed in a production environment. All vulnerabilities are intentional for learning about web security.

## Notes

- For a real-world application, server-side authentication would be implemented
- This project is designed for demonstration purposes only
