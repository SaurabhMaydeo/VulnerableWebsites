const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const { marked } = require('marked');
const bcrypt = require('bcryptjs');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Configure EJS Layouts
app.use(expressLayouts);
app.set('layout', 'layout');

// Vulnerable: No input sanitization for markdown
marked.setOptions({
  sanitize: false
});

// Database setup
const db = new sqlite3.Database(':memory:');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'vulnerable-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Vulnerable: Insecure cookie
}));

// File upload configuration - Vulnerable: No file type validation
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Database initialization
db.serialize(() => {
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    profile TEXT,
    custom_css TEXT
  )`);
  
  db.run(`CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create a test user
  const testPassword = 'test123';
  bcrypt.hash(testPassword, 10, (err, hash) => {
    if (err) console.error(err);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['testuser', hash], function(err) {
      if (err) console.error(err);
      const userId = this.lastID;
      
      // Add a welcome post
      db.run('INSERT INTO posts (user_id, content) VALUES (?, ?)', 
        [userId, 'Welcome to ConnectHub! Try posting some content.']);
    });
  });
});

// Search endpoint - Vulnerable to XSS
app.get('/search', (req, res) => {
  const query = req.query.q;
  // Vulnerable: Direct query parameter reflection
  db.all('SELECT * FROM posts WHERE content LIKE ?', [`%${query}%`], (err, posts) => {
    if (err) return res.status(500).json({ error: err.message });
    res.render('search', { query: query, posts: posts });
  });
});

// Profile customization - Vulnerable to CSS injection
app.post('/profile/customize', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { custom_css } = req.body;
  // Vulnerable: No CSS sanitization
  db.run('UPDATE users SET custom_css = ? WHERE id = ?', 
    [custom_css, req.session.user.id]);
  res.redirect('/profile');
});

// Profile page with custom CSS - Vulnerable
app.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  db.get('SELECT * FROM users WHERE id = ?', [req.session.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    res.render('profile', { user: user });
  });
});

// Routes
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid password' });
    
    req.session.user = { id: user.id, username: user.username };
    res.redirect('/feed');
  });
});

// Vulnerable search route - reflects user input without sanitization
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`<h2>Search Results for: ${query}</h2>`); // Vulnerable: Direct reflection of user input
});

app.post('/comment', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  
  const { post_id, content } = req.body;
  
  // Vulnerable: No input sanitization for comments
  db.run('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
    [post_id, req.session.user.id, content],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Return the comment with username for display
      res.json({
        id: this.lastID,
        username: req.session.user.username,
        content: content
      });
    }
  );
});

app.get('/feed', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  
  // Get posts with comments
  db.all(`
    SELECT 
      p.*, 
      u.username,
      json_group_array(
        json_object(
          'id', c.id,
          'content', c.content,
          'username', cu.username
        )
      ) as comments
    FROM posts p 
    JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON c.post_id = p.id
    LEFT JOIN users cu ON c.user_id = cu.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `, (err, posts) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Parse comments JSON
    posts.forEach(post => {
      post.comments = JSON.parse(post.comments).filter(c => c.id !== null);
    });
    
    res.render('feed', { user: req.session.user, posts: posts });
    }
  );
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// Vulnerable: No input sanitization
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run('INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    (err) => {
      if (err) return res.status(400).json({ error: err.message });
      res.redirect('/login');
    }
  );
});

// Vulnerable: SQL Injection possible
app.get('/search', (req, res) => {
  const query = req.query.q;
  db.all(`SELECT * FROM users WHERE username LIKE '%${query}%'`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Vulnerable: XSS in profile customization
app.post('/profile/customize', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  
  const { custom_css, profile } = req.body;
  db.run('UPDATE users SET custom_css = ?, profile = ? WHERE id = ?',
    [custom_css, profile, req.session.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.redirect('/profile');
    }
  );
});

// Vulnerable: XSS in blog posts
app.post('/post', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  
  // Only allow script tags through, escape other HTML
  let content = req.body.content;
  if (content.includes('<script>')) {
    // If it contains a script tag, leave it as is to allow XSS
    content = content;
  } else {
    // For other content, escape HTML but preserve newlines
    content = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  }

  db.run('INSERT INTO posts (user_id, content) VALUES (?, ?)',
    [req.session.user.id, content],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.redirect('/feed');
    }
  );
});

// Vulnerable: XSS in comments
app.post('/comment', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  
  const { post_id, content: rawContent } = req.body;
  
  // Only allow script tags through, escape other HTML
  let content = rawContent;
  if (content.includes('<script>')) {
    // If it contains a script tag, leave it as is to allow XSS
    content = content;
  } else {
    // For other content, escape HTML but preserve newlines
    content = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  }

  db.run('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
    [post_id, req.session.user.id, content],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.redirect('/post/' + post_id);
    }
  );
});

// Vulnerable: XSS in messages
io.on('connection', (socket) => {
  socket.on('private message', (data) => {
    if (!data.sender_id || !data.receiver_id) return;
    
    db.run('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [data.sender_id, data.receiver_id, data.content],
      (err) => {
        if (err) return;
        io.to(data.receiver_id).emit('new message', {
          sender_id: data.sender_id,
          content: data.content // Vulnerable: No sanitization
        });
      }
    );
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
