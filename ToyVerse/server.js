const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Initialize express app
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const dbPath = path.join(__dirname, 'database', 'toyverse.db');
const dbExists = fs.existsSync(dbPath);
const db = new sqlite3.Database(dbPath);

// Initialize database
if (!dbExists) {
  db.serialize(() => {
    // Users table - notice we're using simple MD5 hashing for passwords
    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT, 
        email TEXT,
        is_admin INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    db.run(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        price REAL,
        image TEXT,
        category TEXT,
        inventory INTEGER
      )
    `);

    // Sample users (passwords are stored directly)
    db.run(`INSERT INTO users (username, password, email, is_admin) VALUES 
      ('admin', 'admin123', 'admin@toyverse.com', 1),
      ('john', 'pass123', 'john@example.com', 0),
      ('sarah', 'toy2023', 'sarah@example.com', 0)`
    );

    // Sample products
    db.run(`INSERT INTO products (name, description, price, image, category, inventory) VALUES
      ('Teddy Bear', 'Soft and cuddly teddy bear', 19.99, 'teddy.jpg', 'Plush Toys', 50),
      ('LEGO City Set', 'Build your own city with this LEGO set', 49.99, 'lego.jpg', 'Building Blocks', 30),
      ('Remote Control Car', 'Fast RC car with realistic sounds', 29.99, 'rc-car.jpg', 'Vehicles', 25),
      ('Barbie Doll', 'Classic Barbie doll with accessories', 15.99, 'barbie.jpg', 'Dolls', 40),
      ('Jigsaw Puzzle', '1000 piece jigsaw puzzle', 12.99, 'puzzle.jpg', 'Puzzles', 35)`
    );
  });
}

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
  // Check if user is logged in by looking at cookie
  // Vulnerable: No verification beyond checking if cookie exists
  if (req.cookies.user_id) {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
  } else {
    res.redirect('/login');
  }
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'products.html'));
});

// Authentication endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Vulnerable: Direct string comparison of passwords
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (user) {
      // Vulnerable: Sending user ID directly in cookie without encryption/signing
      res.cookie('user_id', user.id, { httpOnly: false });
      res.cookie('username', user.username, { httpOnly: false });
      res.cookie('is_admin', user.is_admin, { httpOnly: false });
      
      return res.json({ success: true, user: { id: user.id, username: user.username, is_admin: user.is_admin } });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.post('/api/signup', (req, res) => {
  const { username, password, email } = req.body;
  
  // Vulnerable: No password complexity requirements
  db.run(
    'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
    [username, password, email],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Username already exists' });
      }
      
      // Vulnerable: Same insecure cookie setting as login
      res.cookie('user_id', this.lastID, { httpOnly: false });
      res.cookie('username', username, { httpOnly: false });
      res.cookie('is_admin', 0, { httpOnly: false });
      
      res.json({ success: true, user: { id: this.lastID, username, is_admin: 0 } });
    }
  );
});

app.get('/api/logout', (req, res) => {
  res.clearCookie('user_id');
  res.clearCookie('username');
  res.clearCookie('is_admin');
  res.redirect('/');
});

// API for products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(products);
  });
});

// User profile API
app.get('/api/profile', (req, res) => {
  const userId = req.cookies.user_id;
  
  // Vulnerable: No validation that the cookie matches the actual user
  db.get('SELECT id, username, email, is_admin FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// Admin API - only accessible to admin users
app.get('/api/admin/users', (req, res) => {
  // Vulnerable: Trusting client-side cookie for admin status
  if (req.cookies.is_admin == 1) {
    db.all('SELECT id, username, email, is_admin FROM users', [], (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(users);
    });
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`ToyVerse server running on http://localhost:${PORT}`);
});
