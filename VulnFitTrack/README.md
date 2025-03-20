# VulnFitTrack - Fitness Tracker Website

VulnFitTrack is a professional fitness tracking web application built for educational purposes.

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Activities Page
![Activities](screenshots/activities.png) 

## Warning

**This application is for educational purposes only**. It is designed to help security researchers, students, and developers understand web application security concepts.

**DO NOT** use this application in a production environment or with real user data.

## Features

- **User Authentication & Profile Management**
  - Sign up, login, and profile management
  - Password handling and authentication
  - User profile customization

- **Dashboard & Overview**
  - Summary view of fitness metrics
  - Interactive charts and statistics
  - Activity overview and recent workouts

- **Activity & Workout Tracking**
  - Support for various workout types (running, cycling, yoga, etc.)
  - Record duration, distance, calories burned
  - Historical view of workouts
  - Search and filter capabilities

- **Admin Features**
  - User management panel
  - System statistics
  - User search functionality

## Tech Stack

- **Backend**: Flask (Python)
- **Database**: SQLite
- **Frontend**: HTML, CSS, JavaScript
- **CSS Framework**: Bootstrap 5
- **Charts**: Chart.js
- **Icons**: Font Awesome

## Security Notice

This application is for educational purposes only and is not intended for production use with real user data. The application uses simplified authentication and data handling that would need to be enhanced for production environments.

## Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/VulnFitTrack.git
   cd VulnFitTrack
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the application:
   ```
   python app.py
   ```

4. Access the application at `http://localhost:5000`

## Default Accounts

- **Admin User**:
  - Username: admin
  - Password: admin123

- **Regular User**:
  - Username: john
  - Password: password123

## Educational Resources

To learn about SQL injection and how to prevent it, check out:

- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [PortSwigger Web Security Academy - SQL Injection](https://portswigger.net/web-security/sql-injection)

## Disclaimer

This application is for educational purposes only. The creators and contributors are not responsible for any misuse or damage caused by this application. Use at your own risk.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
