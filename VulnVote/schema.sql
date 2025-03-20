DROP TABLE IF EXISTS polls;
DROP TABLE IF EXISTS options;

CREATE TABLE polls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poll_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    FOREIGN KEY (poll_id) REFERENCES polls (id)
);

-- Add some sample polls
INSERT INTO polls (title, description, is_active) 
VALUES ('Best Programming Language', 'Vote for your favorite programming language', 1);

INSERT INTO options (poll_id, text, votes) VALUES 
(1, 'Python', 15),
(1, 'JavaScript', 12),
(1, 'Java', 8),
(1, 'C++', 5);

INSERT INTO polls (title, description, is_active) 
VALUES ('Favorite Frontend Framework', 'Which frontend framework do you prefer?', 1);

INSERT INTO options (poll_id, text, votes) VALUES 
(2, 'React', 20),
(2, 'Vue', 15),
(2, 'Angular', 10),
(2, 'Svelte', 8);
