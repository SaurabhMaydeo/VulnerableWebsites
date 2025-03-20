import os
import sqlite3
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, g, flash, jsonify

app = Flask(__name__)
app.secret_key = "very_insecure_secret_key"  # Deliberately insecure
app.config['DATABASE'] = os.path.join(app.root_path, 'vulnbank.db')
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
app.config['REMEMBER_COOKIE_SECURE'] = False  # Insecure cookies
app.config['SESSION_COOKIE_SECURE'] = False  # Insecure session cookies

# Database initialization
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(app.config['DATABASE'])
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql') as f:
            db.executescript(f.read().decode('utf8'))
        
        # Create test users
        db.execute('INSERT INTO users (username, password, email, full_name, is_admin) VALUES (?, ?, ?, ?, ?)',
                  ('admin', 'admin123', 'admin@vulnbank.com', 'Admin User', 1))
        
        for i in range(1, 6):
            db.execute('INSERT INTO users (username, password, email, full_name, is_admin) VALUES (?, ?, ?, ?, ?)',
                      (f'user{i}', f'password{i}', f'user{i}@example.com', f'User {i}', 0))
            
            # Create account for each user
            db.execute('INSERT INTO accounts (user_id, account_number, account_type, balance) VALUES (?, ?, ?, ?)',
                      (i, f'1000000{i}', 'Checking', 5000.00))
        
        # Add some transaction history
        db.execute('INSERT INTO transactions (account_id, transaction_type, amount, description, date) VALUES (?, ?, ?, ?, ?)',
                  (1, 'deposit', 1000.00, 'Initial deposit', datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        
        db.commit()

app.teardown_appcontext(close_db)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Vulnerable to SQL injection
        db = get_db()
        query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
        user = db.execute(query).fetchone()
        
        if user:
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['is_admin'] = user['is_admin']
            return redirect(url_for('dashboard'))
        else:
            error = 'Invalid username or password'
    
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    db = get_db()
    
    # Get user details
    user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    
    # Get accounts
    accounts = db.execute('SELECT * FROM accounts WHERE user_id = ?', (user_id,)).fetchone()
    
    # Get recent transactions (limited to 5)
    transactions = db.execute('''
        SELECT t.* FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        WHERE a.user_id = ?
        ORDER BY t.date DESC LIMIT 5
    ''', (user_id,)).fetchall()
    
    return render_template('dashboard.html', user=user, accounts=accounts, transactions=transactions)

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    db = get_db()
    
    if request.method == 'POST':
        email = request.form['email']
        full_name = request.form['full_name']
        
        # Update user profile (insecure direct object reference)
        db.execute('UPDATE users SET email = ?, full_name = ? WHERE id = ?', 
                  (email, full_name, user_id))
        db.commit()
        flash('Profile updated successfully')
        return redirect(url_for('profile'))
    
    # Get user details
    user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    return render_template('profile.html', user=user)

@app.route('/payment', methods=['GET', 'POST'])
def payment():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    db = get_db()
    
    # Get accounts
    accounts = db.execute('SELECT * FROM accounts WHERE user_id = ?', (user_id,)).fetchone()
    
    if request.method == 'POST':
        # Process payment (store credit card details insecurely)
        card_number = request.form['card_number']
        card_holder = request.form['card_holder']
        expiry_date = request.form['expiry_date']
        cvv = request.form['cvv']
        amount = float(request.form['amount'])
        account_id = accounts['id']
        
        # Add payment to database (insecurely storing card details)
        db.execute('''
            INSERT INTO payments 
            (account_id, card_number, card_holder, expiry_date, cvv, amount, date) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (account_id, card_number, card_holder, expiry_date, cvv, amount, datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        
        # Update account balance (example of data manipulation that could be intercepted)
        db.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', (amount, account_id))
        
        # Add transaction record
        db.execute('''
            INSERT INTO transactions 
            (account_id, transaction_type, amount, description, date) 
            VALUES (?, ?, ?, ?, ?)
        ''', (account_id, 'deposit', amount, 'Card payment', datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        
        db.commit()
        flash('Payment processed successfully')
        return redirect(url_for('dashboard'))
    
    return render_template('payment.html', accounts=accounts)

@app.route('/api/account-details')
def account_details():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user_id = session['user_id']
    db = get_db()
    
    # Get accounts
    accounts = db.execute('SELECT * FROM accounts WHERE user_id = ?', (user_id,)).fetchone()
    
    # Convert Row to dictionary
    account_data = dict(accounts)
    
    # Send sensitive data over plaintext
    return jsonify(account_data)

@app.route('/transfer', methods=['GET', 'POST'])
def transfer():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    db = get_db()
    
    # Get accounts
    accounts = db.execute('SELECT * FROM accounts WHERE user_id = ?', (user_id,)).fetchone()
    
    if request.method == 'POST':
        recipient_account = request.form['recipient_account']
        amount = float(request.form['amount'])
        account_id = accounts['id']
        
        # Check if funds are sufficient
        if accounts['balance'] < amount:
            flash('Insufficient funds')
            return redirect(url_for('transfer'))
        
        # Check if recipient account exists
        recipient = db.execute('SELECT * FROM accounts WHERE account_number = ?', (recipient_account,)).fetchone()
        if not recipient:
            flash('Recipient account not found')
            return redirect(url_for('transfer'))
        
        # Update balances
        db.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', (amount, account_id))
        db.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', (amount, recipient['id']))
        
        # Add transaction records
        db.execute('''
            INSERT INTO transactions 
            (account_id, transaction_type, amount, description, date) 
            VALUES (?, ?, ?, ?, ?)
        ''', (account_id, 'transfer_out', amount, f'Transfer to {recipient_account}', datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        
        db.execute('''
            INSERT INTO transactions 
            (account_id, transaction_type, amount, description, date) 
            VALUES (?, ?, ?, ?, ?)
        ''', (recipient['id'], 'transfer_in', amount, f'Transfer from {accounts["account_number"]}', datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        
        db.commit()
        flash('Transfer completed successfully')
        return redirect(url_for('dashboard'))
    
    return render_template('transfer.html', accounts=accounts)

if __name__ == '__main__':
    if not os.path.exists(app.config['DATABASE']):
        init_db()
    app.run(host='0.0.0.0', port=5002, debug=True)  # Deliberately running on HTTP
