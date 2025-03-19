<?php
require_once 'database.php';

// Create tables
$queries = [
    // Users table
    "CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        bio TEXT,
        role TEXT DEFAULT 'user'
    )",
    
    // Categories table
    "CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )",
    
    // Books table
    "CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        isbn TEXT UNIQUE,
        description TEXT,
        cover_image TEXT,
        category_id INTEGER,
        FOREIGN KEY (category_id) REFERENCES categories (id)
    )",
    
    // Borrowings table
    "CREATE TABLE IF NOT EXISTS borrowings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        book_id INTEGER,
        borrow_date TEXT NOT NULL,
        return_date TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (book_id) REFERENCES books (id)
    )",
    
    // Insert test users
    "INSERT OR IGNORE INTO users (email, password, full_name, role) VALUES 
    ('admin@library.com', 'admin123', 'Admin User', 'admin'),
    ('john@example.com', 'password123', 'John Doe', 'user'),
    ('jane@example.com', 'password456', 'Jane Smith', 'user'),
    ('alice@example.com', 'secret789', 'Alice Johnson', 'admin'),
    ('bob@example.com', 'bobpass', 'Bob Wilson', 'user'),
    ('carol@example.com', 'carol123', 'Carol Brown', 'admin'),
    ('dave@example.com', 'dave456', 'Dave Miller', 'user'),
    ('eve@example.com', 'evepass', 'Eve Anderson', 'admin')",
    
    // Insert categories
    "INSERT OR IGNORE INTO categories (name) VALUES 
    ('Fiction'),
    ('Non-Fiction'),
    ('Science'),
    ('Technology'),
    ('History'),
    ('Biography')",
    
    // Insert sample books
    "INSERT OR IGNORE INTO books (title, author, isbn, description, category_id) VALUES 
    ('The Art of Programming', 'John Smith', '1234567890', 'A comprehensive guide to programming', 4),
    ('World History', 'Jane Doe', '0987654321', 'A journey through time', 5),
    ('Science Today', 'Bob Johnson', '1111222233', 'Modern scientific discoveries', 3),
    ('Great Expectations', 'Charles Dickens', '4444555566', 'A classic novel', 1),
    ('The Biography of Einstein', 'Alice Brown', '7777888899', 'Life of a genius', 6)"
];

foreach ($queries as $sql) {
    try {
        query($sql);
    } catch (Exception $e) {
        echo "Error executing query: " . $e->getMessage() . "\n";
    }
}

echo "Database initialized successfully!\n";
