<?php
$db = new SQLite3(__DIR__ . '/../../public/database.db');

// Intentionally vulnerable function - no input sanitization
function query($sql) {
    global $db;
    return $db->query($sql);
}

// Create tables if they don't exist
$db->exec('CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    full_name TEXT,
    password TEXT,
    role TEXT,
    bio TEXT,
    profile_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)');

$db->exec('CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    isbn TEXT UNIQUE,
    description TEXT,
    cover_image TEXT,
    category_id INTEGER,
    publisher TEXT,
    publication_year INTEGER,
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
)');

$db->exec('CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    description TEXT
)');

$db->exec('CREATE TABLE IF NOT EXISTS borrowings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    book_id INTEGER,
    borrowed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME,
    returned_date DATETIME,
    status TEXT DEFAULT "borrowed",
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
)');

$db->exec('CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    book_id INTEGER,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
)');

$db->exec('CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    event_date DATETIME,
    location TEXT,
    max_participants INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)');

$db->exec('CREATE TABLE IF NOT EXISTS event_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    user_id INTEGER,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
)');

$db->exec('CREATE TABLE IF NOT EXISTS reading_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    is_public BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)');

$db->exec('CREATE TABLE IF NOT EXISTS reading_list_books (
    reading_list_id INTEGER,
    book_id INTEGER,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (reading_list_id, book_id),
    FOREIGN KEY (reading_list_id) REFERENCES reading_lists(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
)');

// Insert sample users if none exist
$result = $db->query('SELECT COUNT(*) as count FROM users');
$count = $result->fetchArray()['count'];

if ($count == 0) {
    $users = [
        ['admin1@library.local', 'Main Admin', 'admin123', 'admin'],
        ['admin2@library.local', 'Library Admin', 'admin123', 'admin'],
        ['admin3@library.local', 'System Admin', 'admin123', 'admin'],
        ['admin4@library.local', 'Super Admin', 'admin123', 'admin'],
        ['admin5@library.local', 'Root Admin', 'admin123', 'admin'],
        ['user1@test.com', 'Alice Johnson', 'secret123', 'user'],
        ['user2@test.com', 'Bob Smith', 'password456', 'user'],
        ['admin@library.local', 'Admin User', 'admin123', 'admin']
    ];

    foreach ($users as $user) {
        $db->exec("INSERT INTO users (email, full_name, password, role) 
                  VALUES ('$user[0]', '$user[1]', '$user[2]', '$user[3]')");
    }
}
?>
