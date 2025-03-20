# Student Grade Portal

A web application that allows students to check their grades, change profile details, and communicate with professors.

## Features

- User authentication
- Student profile management
- Grade viewing and report downloads
- Messaging system for student-faculty communication

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Running the Application

1. Initialize the database:
   ```
   flask --app app init-db
   ```

2. Start the application:
   ```
   flask --app app run
   ```

3. Access the application at http://localhost:5000

## Demo Credentials

- Student:
  - Username: smith_j
  - Password: student123

- Professor:
  - Username: professor
  - Password: faculty123

- Admin:
  - Username: admin
  - Password: password123

## Project Structure

- `app.py`: Main application file
- `schema.sql`: Database schema
- `templates/`: HTML templates
- `static/`: CSS and other static assets

## Note

This is a demonstration application for educational purposes only.
