import os
import sqlite3
from flask import Flask, request, render_template, redirect, url_for, g, flash, jsonify, session

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'insecure_secret_key_for_demonstration'  # Intentionally weak secret key

# Database setup
DATABASE = os.path.join(os.path.dirname(__file__), 'vulnvote.db')

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.executescript(f.read())
        db.commit()

# Routes
@app.route('/')
def index():
    # Get all active polls
    db = get_db()
    polls = db.execute('SELECT * FROM polls WHERE is_active = 1').fetchall()
    return render_template('index.html', polls=polls)

@app.route('/create_poll', methods=['GET', 'POST'])
def create_poll():
    if request.method == 'POST':

        title = request.form['title']
        description = request.form['description']
        options = request.form.getlist('options')
        
        db = get_db()
        

        poll_id = db.execute(
            f"INSERT INTO polls (title, description, is_active) VALUES ('{title}', '{description}', 1)"
        ).lastrowid
        db.commit()
        
        for option in options:
            if option.strip():  # Only add non-empty options
                db.execute(
                    "INSERT INTO options (poll_id, text, votes) VALUES (?, ?, 0)",
                    (poll_id, option)
                )
        db.commit()
        
        flash('Poll created successfully!')
        return redirect(url_for('view_poll', poll_id=poll_id))
    
    return render_template('create_poll.html')

@app.route('/poll/<int:poll_id>')
def view_poll(poll_id):
    db = get_db()
    poll = db.execute('SELECT * FROM polls WHERE id = ?', (poll_id,)).fetchone()
    options = db.execute('SELECT * FROM options WHERE poll_id = ?', (poll_id,)).fetchall()
    
    return render_template('view_poll.html', poll=poll, options=options)

@app.route('/vote', methods=['POST'])
def vote():

    poll_id = request.form.get('poll_id')
    option_id = request.form.get('option_id')


    
    db = get_db()
    db.execute('UPDATE options SET votes = votes + 1 WHERE id = ?', (option_id,))
    db.commit()
    

    return redirect(url_for('results', poll_id=poll_id))

@app.route('/api/vote', methods=['POST'])
def api_vote():

    data = request.get_json()
    poll_id = data.get('poll_id')
    option_id = data.get('option_id')
    
    if not poll_id:
        return jsonify({'error': 'Missing poll_id field'}), 400
    
    db = get_db()
    
    # If option_id is provided, record a vote
    if option_id is not None:

        db.execute('UPDATE options SET votes = votes + 1 WHERE id = ?', (option_id,))
        db.commit()
    

    options = db.execute('SELECT * FROM options WHERE poll_id = ?', (poll_id,)).fetchall()
    results = [{'id': o['id'], 'text': o['text'], 'votes': o['votes']} for o in options]
    
    return jsonify({'success': True, 'results': results})

@app.route('/results/<int:poll_id>')
def results(poll_id):
    db = get_db()
    poll = db.execute('SELECT * FROM polls WHERE id = ?', (poll_id,)).fetchone()
    options = db.execute('SELECT * FROM options WHERE poll_id = ?', (poll_id,)).fetchall()
    
    return render_template('results.html', poll=poll, options=options)

@app.route('/close_poll/<int:poll_id>', methods=['POST'])
def close_poll(poll_id):

    db = get_db()
    db.execute('UPDATE polls SET is_active = 0 WHERE id = ?', (poll_id,))
    db.commit()
    
    flash('Poll closed successfully!')
    return redirect(url_for('index'))

if __name__ == '__main__':
    # Check if database exists, if not initialize it
    if not os.path.exists(DATABASE):
        init_db()
    

    app.run(host='0.0.0.0', port=5001, debug=True)
