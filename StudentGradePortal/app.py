import os
import sqlite3
import tempfile
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, flash, g, session, send_file
from werkzeug.security import check_password_hash, generate_password_hash

# Initialize the Flask application
app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev_key_for_student_grade_portal'
app.config['DATABASE'] = os.path.join(app.root_path, 'student_portal.db')

# Add current time function to Jinja context
@app.context_processor
def inject_now():
    return {'now': datetime.now}

# Database connection helpers
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    with app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf8'))

@app.cli.command('init-db')
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    print('Initialized the database.')

# Register database close function with the application
app.teardown_appcontext(close_db)

# Authentication helpers
def login_required(view):
    def wrapped_view(**kwargs):
        if not session.get('user_id'):
            flash('Please log in to access this page')
            return redirect(url_for('login'))
        return view(**kwargs)
    wrapped_view.__name__ = view.__name__
    return wrapped_view

# Routes
@app.route('/')
def index():
    if session.get('user_id'):
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        error = None
        user = db.execute(
            'SELECT * FROM users WHERE username = ?', (username,)
        ).fetchone()

        if user is None:
            error = 'Incorrect username.'
        elif user['password'] != password:  # Intentionally using plain text comparison
            error = 'Incorrect password.'

        if error is None:
            session.clear()
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['role'] = user['role']
            return redirect(url_for('dashboard'))

        flash(error)

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    db = get_db()
    user_id = session.get('user_id')
    
    # Get user info
    user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    
    # Get grades if user is a student
    grades = []
    unread_messages_count = 0
    
    if user['role'] == 'student':
        grades = db.execute(
            'SELECT g.id, c.code, c.name, g.grade, g.comments '
            'FROM grades g JOIN courses c ON g.course_id = c.id '
            'WHERE g.user_id = ?', (user_id,)
        ).fetchall()
        
    # Get unread messages count
    unread_messages_count = db.execute(
        'SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND is_read = 0',
        (user_id,)
    ).fetchone()['count']
    
    return render_template('dashboard.html', user=user, grades=grades, unread_messages_count=unread_messages_count)

@app.route('/profile')
@login_required
def profile():
    db = get_db()
    user_id = session.get('user_id')
    user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    return render_template('profile.html', user=user)

# Profile update endpoints
@app.route('/update_email', methods=['GET', 'POST'])
@login_required
def update_email():
    # Handle email updates for the user
    user_id = session.get('user_id')
    
    if request.method == 'POST':
        email = request.form['email']
        db = get_db()
        db.execute('UPDATE users SET email = ? WHERE id = ?', (email, user_id))
        db.commit()
        flash('Email updated successfully!')
        return redirect(url_for('profile'))
    
    return render_template('update_email.html')

@app.route('/update_phone', methods=['GET', 'POST'])
@login_required
def update_phone():
    # Handle phone number updates for the user
    user_id = session.get('user_id')
    
    if request.method == 'POST':
        phone = request.form['phone']
        db = get_db()
        db.execute('UPDATE users SET phone = ? WHERE id = ?', (phone, user_id))
        db.commit()
        flash('Phone number updated successfully!')
        return redirect(url_for('profile'))
    
    return render_template('update_phone.html')

@app.route('/change_password', methods=['GET', 'POST'])
@login_required
def change_password():
    if request.method == 'POST':
        current_password = request.form['current_password']
        new_password = request.form['new_password']
        confirm_password = request.form['confirm_password']
        
        db = get_db()
        user = db.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],)).fetchone()
        
        if user['password'] != current_password:
            flash('Current password is incorrect')
        elif new_password != confirm_password:
            flash('New passwords do not match')
        else:
            db.execute('UPDATE users SET password = ? WHERE id = ?', 
                       (new_password, session['user_id']))
            db.commit()
            flash('Password has been updated')
            return redirect(url_for('profile'))
            
    return render_template('change_password.html')

@app.route('/grades')
@login_required
def grades():
    if session.get('role') != 'student':
        flash('Only students can access grades')
        return redirect(url_for('dashboard'))
        
    db = get_db()
    user_id = session.get('user_id')
    
    grades = db.execute(
        'SELECT g.id, c.code, c.name, c.instructor, g.grade, g.comments '
        'FROM grades g JOIN courses c ON g.course_id = c.id '
        'WHERE g.user_id = ?', (user_id,)
    ).fetchall()
    
    return render_template('grades.html', grades=grades)

@app.route('/download_report/<int:grade_id>')
@login_required
def download_report(grade_id):
    db = get_db()
    user_id = session.get('user_id')
    
    # Verify that the grade belongs to the current user
    grade = db.execute(
        'SELECT g.*, c.code, c.name, c.instructor, u.username '
        'FROM grades g '
        'JOIN courses c ON g.course_id = c.id '
        'JOIN users u ON g.user_id = u.id '
        'WHERE g.id = ? AND g.user_id = ?', 
        (grade_id, user_id)
    ).fetchone()
    
    if grade is None:
        flash('Grade not found or access denied')
        return redirect(url_for('grades'))
    
    # Create a simple text report
    report_content = f"""
    GRADE REPORT
    ------------
    
    Student: {grade['username']}
    Course: {grade['code']} - {grade['name']}
    Instructor: {grade['instructor']}
    
    Grade: {grade['grade']}
    
    Comments:
    {grade['comments']}
    
    Report generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    """
    
    # Create a temporary file
    temp = tempfile.NamedTemporaryFile(delete=False, suffix='.txt')
    temp.write(report_content.encode())
    temp.close()
    
    return send_file(temp.name, as_attachment=True, 
                    download_name=f"grade_report_{grade['code']}_{datetime.now().strftime('%Y%m%d')}.txt")

@app.route('/messages')
@login_required
def messages():
    db = get_db()
    user_id = session.get('user_id')
    
    inbox = db.execute(
        'SELECT m.*, u.username as sender_name '
        'FROM messages m JOIN users u ON m.sender_id = u.id '
        'WHERE m.recipient_id = ? '
        'ORDER BY m.timestamp DESC', 
        (user_id,)
    ).fetchall()
    
    sent = db.execute(
        'SELECT m.*, u.username as recipient_name '
        'FROM messages m JOIN users u ON m.recipient_id = u.id '
        'WHERE m.sender_id = ? '
        'ORDER BY m.timestamp DESC', 
        (user_id,)
    ).fetchall()
    
    return render_template('messages.html', inbox=inbox, sent=sent)

@app.route('/view_message/<int:message_id>')
@login_required
def view_message(message_id):
    db = get_db()
    user_id = session.get('user_id')
    
    message = db.execute(
        'SELECT m.*, '
        'sender.username as sender_name, '
        'recipient.username as recipient_name '
        'FROM messages m '
        'JOIN users sender ON m.sender_id = sender.id '
        'JOIN users recipient ON m.recipient_id = recipient.id '
        'WHERE m.id = ? AND (m.sender_id = ? OR m.recipient_id = ?)', 
        (message_id, user_id, user_id)
    ).fetchone()
    
    if message is None:
        flash('Message not found or access denied')
        return redirect(url_for('messages'))
    
    # Mark as read if current user is the recipient
    if message['recipient_id'] == user_id and not message['is_read']:
        db.execute('UPDATE messages SET is_read = 1 WHERE id = ?', (message_id,))
        db.commit()
    
    return render_template('view_message.html', message=message)

@app.route('/new_message', methods=['GET', 'POST'])
@login_required
def new_message():
    if request.method == 'POST':
        recipient_username = request.form['recipient']
        subject = request.form['subject']
        body = request.form['body']
        
        db = get_db()
        recipient = db.execute('SELECT id FROM users WHERE username = ?', (recipient_username,)).fetchone()
        
        if recipient is None:
            flash('Recipient not found')
        else:
            db.execute(
                'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
                (session['user_id'], recipient['id'], subject, body)
            )
            db.commit()
            flash('Message sent successfully')
            return redirect(url_for('messages'))
    
    # Get list of users for recipient selection
    db = get_db()
    users = db.execute('SELECT username FROM users WHERE id != ?', (session['user_id'],)).fetchall()
    
    return render_template('new_message.html', users=users)

if __name__ == '__main__':
    # Check if the database exists, if not initialize it
    if not os.path.exists(app.config['DATABASE']):
        with app.app_context():
            init_db()
    app.run(debug=True)
