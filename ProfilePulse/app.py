from flask import Flask, render_template, request, redirect, url_for, flash, session, g
import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
from datetime import datetime

# Initialize the Flask application
app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

# Database setup
DATABASE = 'profilepulse.db'

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    if not os.path.exists(DATABASE):
        with app.app_context():
            db = get_db()
            with app.open_resource('schema.sql', mode='r') as f:
                db.executescript(f.read())
            # Create sample users
            db.execute('INSERT INTO users (username, password, full_name, email, bio, join_date) VALUES (?, ?, ?, ?, ?, ?)',
                      ('admin', generate_password_hash('admin123'), 'Admin User', 'admin@profilepulse.com', 'Site administrator', datetime.now().strftime('%Y-%m-%d')))
            db.execute('INSERT INTO users (username, password, full_name, email, bio, join_date) VALUES (?, ?, ?, ?, ?, ?)',
                      ('johndoe', generate_password_hash('password123'), 'John Doe', 'john@example.com', 'Software Engineer with 5+ years of experience', datetime.now().strftime('%Y-%m-%d')))
            db.execute('INSERT INTO users (username, password, full_name, email, bio, join_date) VALUES (?, ?, ?, ?, ?, ?)',
                      ('janedoe', generate_password_hash('password123'), 'Jane Doe', 'jane@example.com', 'UX Designer passionate about creating intuitive interfaces', datetime.now().strftime('%Y-%m-%d')))
            db.commit()

# User session management
@app.before_request
def load_logged_in_user():
    user_id = session.get('user_id')
    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        error = None
        user = db.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()

        if user is None:
            error = 'Incorrect username.'
        elif not check_password_hash(user['password'], password):
            error = 'Incorrect password.'

        if error is None:
            session.clear()
            session['user_id'] = user['id']
            session['username'] = user['username']
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))

        flash(error, 'danger')

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        full_name = request.form['full_name']
        email = request.form['email']
        bio = request.form.get('bio', '')
        db = get_db()
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'
        elif not email:
            error = 'Email is required.'
        elif db.execute('SELECT id FROM users WHERE username = ?', (username,)).fetchone() is not None:
            error = f'User {username} is already registered.'
        elif db.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone() is not None:
            error = f'Email {email} is already registered.'

        if error is None:
            db.execute(
                'INSERT INTO users (username, password, full_name, email, bio, join_date) VALUES (?, ?, ?, ?, ?, ?)',
                (username, generate_password_hash(password), full_name, email, bio, datetime.now().strftime('%Y-%m-%d'))
            )
            db.commit()
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('login'))

        flash(error, 'danger')

    return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if g.user is None:
        flash('Please log in to access your dashboard.', 'warning')
        return redirect(url_for('login'))
    
    # Get connection requests
    db = get_db()
    connections = db.execute(
        'SELECT u.* FROM users u JOIN connections c ON u.id = c.from_user_id WHERE c.to_user_id = ? AND c.status = "pending"',
        (g.user['id'],)
    ).fetchall()
    
    # Get user's posts
    posts = db.execute(
        'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC',
        (g.user['id'],)
    ).fetchall()
    
    return render_template('dashboard.html', connections=connections, posts=posts)

@app.route('/profile')
def profile():
    if g.user is None:
        flash('Please log in to view your profile.', 'warning')
        return redirect(url_for('login'))
    return render_template('profile.html')

@app.route('/update_profile', methods=['POST'])
def update_profile():
    if g.user is None:
        flash('Please log in to update your profile.', 'warning')
        return redirect(url_for('login'))
    
    # Get form data
    full_name = request.form['full_name']
    email = request.form['email']
    bio = request.form.get('bio', '')
    
    # Update user profile
    db = get_db()
    db.execute(
        'UPDATE users SET full_name = ?, email = ?, bio = ? WHERE id = ?',
        (full_name, email, bio, g.user['id'])
    )
    db.commit()
    
    flash('Profile updated successfully!', 'success')
    return redirect(url_for('profile'))

@app.route('/users')
def users():
    if g.user is None:
        flash('Please log in to view users.', 'warning')
        return redirect(url_for('login'))
    
    db = get_db()
    all_users = db.execute('SELECT id, username, full_name, email, bio FROM users WHERE id != ?', (g.user['id'],)).fetchall()
    
    return render_template('users.html', users=all_users)

@app.route('/send_connection', methods=['POST'])
def send_connection():
    if g.user is None:
        flash('Please log in to send connection requests.', 'warning')
        return redirect(url_for('login'))
    
    to_user_id = request.form['user_id']
    db = get_db()
    
    # Check if connection already exists
    existing = db.execute(
        'SELECT * FROM connections WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)',
        (g.user['id'], to_user_id, to_user_id, g.user['id'])
    ).fetchone()
    
    if existing:
        flash('Connection request already exists.', 'info')
    else:
        db.execute(
            'INSERT INTO connections (from_user_id, to_user_id, status, created_at) VALUES (?, ?, ?, ?)',
            (g.user['id'], to_user_id, 'pending', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        )
        db.commit()
        flash('Connection request sent!', 'success')
    
    return redirect(url_for('users'))

@app.route('/handle_connection', methods=['POST'])
def handle_connection():
    if g.user is None:
        flash('Please log in to manage connections.', 'warning')
        return redirect(url_for('login'))
    
    connection_id = request.form['connection_id']
    action = request.form['action']
    
    db = get_db()
    if action == 'accept':
        db.execute('UPDATE connections SET status = "accepted" WHERE id = ?', (connection_id,))
        flash('Connection accepted!', 'success')
    else:
        db.execute('DELETE FROM connections WHERE id = ?', (connection_id,))
        flash('Connection request rejected.', 'info')
    
    db.commit()
    return redirect(url_for('dashboard'))

@app.route('/create_post', methods=['POST'])
def create_post():
    if g.user is None:
        flash('Please log in to create posts.', 'warning')
        return redirect(url_for('login'))
    
    content = request.form['content']
    
    if content:
        db = get_db()
        db.execute(
            'INSERT INTO posts (user_id, content, created_at) VALUES (?, ?, ?)',
            (g.user['id'], content, datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        )
        db.commit()
        flash('Post created successfully!', 'success')
    else:
        flash('Post content cannot be empty.', 'danger')
    
    return redirect(url_for('dashboard'))

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
