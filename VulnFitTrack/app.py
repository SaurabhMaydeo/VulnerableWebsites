from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
import sqlite3
import os
import hashlib
import random
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = "fitness_tracker_secret_key"  # In production, use a proper secret key management
app.permanent_session_lifetime = timedelta(days=5)

# Database setup
DB_PATH = 'fitness_tracker.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        height FLOAT,
        weight FLOAT,
        dob TEXT,
        fitness_goal TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Activities Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        activity_type TEXT NOT NULL,
        duration INTEGER NOT NULL,
        distance FLOAT,
        calories INTEGER,
        date TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Workout Plans Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS workout_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Insert test users
    # INSECURE: Storing plaintext passwords
    test_users = [
        ('admin', 'admin123', 'admin@vulnfittrack.com', 'Admin User', 180, 75, '1985-01-01', 'Maintain fitness', 'admin'),
        ('john', 'password123', 'john@example.com', 'John Doe', 175, 70, '1990-05-15', 'Lose weight', 'user'),
        ('jane', 'fitnessfan', 'jane@example.com', 'Jane Smith', 165, 60, '1992-08-20', 'Build muscle', 'user'),
        ('mike', 'workout2023', 'mike@example.com', 'Mike Johnson', 185, 85, '1988-03-10', 'Improve endurance', 'user'),
        ('sarah', 'running4life', 'sarah@example.com', 'Sarah Williams', 170, 65, '1995-11-05', 'Run a marathon', 'user')
    ]
    
    for user in test_users:
        try:
            cursor.execute(
                "INSERT OR IGNORE INTO users (username, password, email, full_name, height, weight, dob, fitness_goal, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                user
            )
        except sqlite3.Error:
            pass
    
    # Generate sample activity data
    activity_types = ['Running', 'Cycling', 'Swimming', 'Yoga', 'Weightlifting', 'HIIT', 'Walking']
    
    for user_id in range(1, 6):
        for _ in range(20):  # 20 activities per user
            days_ago = random.randint(0, 30)
            activity_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
            activity_type = random.choice(activity_types)
            duration = random.randint(15, 120)  # 15-120 minutes
            distance = round(random.uniform(1, 15), 2) if activity_type in ['Running', 'Cycling', 'Swimming', 'Walking'] else None
            calories = random.randint(50, 800)
            
            cursor.execute(
                "INSERT INTO activities (user_id, activity_type, duration, distance, calories, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (user_id, activity_type, duration, distance, calories, activity_date, f"Sample {activity_type} activity")
            )
    
    conn.commit()
    conn.close()

# Check if the database exists, if not, create it
if not os.path.exists(DB_PATH):
    init_db()

# User authentication functions
def get_user_by_username_unsafe(username):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Get user by username
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)
    user = cursor.fetchone()
    conn.close()
    return user

# Routes

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']
        full_name = request.form['full_name']
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO users (username, password, email, full_name) VALUES (?, ?, ?, ?)",
                (username, password, email, full_name)
            )
            conn.commit()
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash('Username or email already exists!', 'danger')
        finally:
            conn.close()
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Get user information
        user = get_user_by_username_unsafe(username)
        
        if user and user[2] == password:  # index 2 is the password field
            session['user_id'] = user[0]  # index 0 is the id
            session['username'] = user[1]  # index 1 is the username
            session['role'] = user[9]     # index 9 is the role
            flash(f'Welcome back, {user[1]}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid credentials. Please try again.', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash('Please log in to access your dashboard.', 'warning')
        return redirect(url_for('login'))
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get user info
    cursor.execute("SELECT * FROM users WHERE id = ?", (session['user_id'],))
    user = cursor.fetchone()
    
    # Get recent activities
    cursor.execute(
        "SELECT * FROM activities WHERE user_id = ? ORDER BY date DESC LIMIT 5",
        (session['user_id'],)
    )
    recent_activities = cursor.fetchall()
    
    # Calculate summary stats
    cursor.execute(
        "SELECT SUM(duration) as total_duration, SUM(calories) as total_calories FROM activities WHERE user_id = ? AND date >= date('now', '-7 days')",
        (session['user_id'],)
    )
    weekly_stats = cursor.fetchone()
    
    # Get activity counts by type
    cursor.execute(
        "SELECT activity_type, COUNT(*) as count FROM activities WHERE user_id = ? GROUP BY activity_type",
        (session['user_id'],)
    )
    activity_breakdown = cursor.fetchall()
    
    conn.close()
    
    return render_template(
        'dashboard.html',
        user=user,
        recent_activities=recent_activities,
        weekly_stats=weekly_stats,
        activity_breakdown=activity_breakdown
    )

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'user_id' not in session:
        flash('Please log in to access your profile.', 'warning')
        return redirect(url_for('login'))
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    if request.method == 'POST':
        email = request.form['email']
        full_name = request.form['full_name']
        height = request.form['height']
        weight = request.form['weight']
        dob = request.form['dob']
        fitness_goal = request.form['fitness_goal']
        
        cursor.execute(
            "UPDATE users SET email = ?, full_name = ?, height = ?, weight = ?, dob = ?, fitness_goal = ? WHERE id = ?",
            (email, full_name, height, weight, dob, fitness_goal, session['user_id'])
        )
        conn.commit()
        flash('Profile updated successfully!', 'success')
    
    cursor.execute("SELECT * FROM users WHERE id = ?", (session['user_id'],))
    user = cursor.fetchone()
    conn.close()
    
    return render_template('profile.html', user=user)

@app.route('/activities')
def activities():
    if 'user_id' not in session:
        flash('Please log in to view your activities.', 'warning')
        return redirect(url_for('login'))
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get search parameter from request
    search = request.args.get('search', '')
    if search:
        # Search in activity_type field
        query = f"SELECT * FROM activities WHERE user_id = {session['user_id']} AND activity_type LIKE '%{search}%' ORDER BY date DESC"
        cursor.execute(query)
    else:
        cursor.execute(
            "SELECT * FROM activities WHERE user_id = ? ORDER BY date DESC",
            (session['user_id'],)
        )
    
    activities = cursor.fetchall()
    conn.close()
    
    return render_template('activities.html', activities=activities, search=search)

@app.route('/add_activity', methods=['GET', 'POST'])
def add_activity():
    if 'user_id' not in session:
        flash('Please log in to add activities.', 'warning')
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        activity_type = request.form['activity_type']
        duration = request.form['duration']
        distance = request.form.get('distance', None)
        calories = request.form['calories']
        date = request.form['date']
        notes = request.form.get('notes', '')
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO activities (user_id, activity_type, duration, distance, calories, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (session['user_id'], activity_type, duration, distance, calories, date, notes)
        )
        conn.commit()
        conn.close()
        
        flash('Activity added successfully!', 'success')
        return redirect(url_for('activities'))
    
    return render_template('add_activity.html')

@app.route('/admin')
def admin():
    if 'user_id' not in session or session['role'] != 'admin':
        flash('Unauthorized access.', 'danger')
        return redirect(url_for('dashboard'))
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    
    cursor.execute("SELECT COUNT(*) as count FROM activities")
    activity_count = cursor.fetchone()['count']
    
    conn.close()
    
    return render_template('admin.html', users=users, activity_count=activity_count)

@app.route('/user_search', methods=['GET'])
def user_search():
    if 'user_id' not in session or session['role'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    search_term = request.args.get('q', '')
    
    if not search_term:
        return jsonify([])
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Search for users matching the search term
    query = f"SELECT id, username, email, full_name FROM users WHERE username LIKE '%{search_term}%' OR email LIKE '%{search_term}%' OR full_name LIKE '%{search_term}%'"
    cursor.execute(query)
    users = [dict(user) for user in cursor.fetchall()]
    
    conn.close()
    
    return jsonify(users)

if __name__ == '__main__':
    app.run(debug=True)
