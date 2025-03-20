# ToyVerse - Online Toy Store

ToyVerse is an online toy store platform built using Node.js, Express, and SQLite.

## Description

ToyVerse is a demonstration e-commerce website for toys, featuring:
- User registration and authentication
- Product browsing and filtering
- Admin dashboard for user management
- Simple and intuitive UI

## Project Structure

```
ToyVerse
│
├── public
│   ├── css
│   │   └── style.css
│   ├── js
│   │   └── main.js
│   └── images
│       └── placeholder.jpg
│
├── views
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── dashboard.html
│   └── products.html
│
├── database
│   └── toyverse.db
│
├── server.js
└── package.json
```

## Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Start the server

```bash
npm start
```

4. Visit `http://localhost:3000` in your browser

## Default Accounts

For demonstration purposes, the following accounts are pre-configured:

- Admin: username: `admin`, password: `admin123`
- User: username: `john`, password: `pass123`
- User: username: `sarah`, password: `toy2023`

## Features

- Browse toy products
- Filter by category and price
- User registration and login
- User dashboard
- Admin panel for user management

## Technologies Used

- Node.js with Express
- SQLite for database
- Vanilla JavaScript
- HTML5 & CSS3
