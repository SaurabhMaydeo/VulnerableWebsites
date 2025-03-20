DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS messages;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'student'
);

CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    instructor TEXT NOT NULL
);

CREATE TABLE grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT NOT NULL,
    comments TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (course_id) REFERENCES courses (id)
);

CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT 0,
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (recipient_id) REFERENCES users (id)
);

-- Insert sample data for demo
INSERT INTO users (username, password, email, phone, role) VALUES
('admin', 'password123', 'admin@university.edu', '555-1234', 'admin'),
('professor', 'faculty123', 'professor@university.edu', '555-5678', 'professor'),
('smith_j', 'student123', 'john.smith@student.edu', '555-9012', 'student'),
('doe_j', 'student456', 'jane.doe@student.edu', '555-3456', 'student'),
('williams_b', 'student789', 'bob.williams@student.edu', '555-7890', 'student');

INSERT INTO courses (code, name, instructor) VALUES
('CS101', 'Introduction to Computer Science', 'Dr. Johnson'),
('CS201', 'Data Structures', 'Dr. Peterson'),
('MATH101', 'Calculus I', 'Dr. Williams'),
('ENG101', 'English Composition', 'Dr. Smith');

INSERT INTO grades (user_id, course_id, grade, comments) VALUES
(3, 1, 'A', 'Excellent work!'),
(3, 2, 'B+', 'Good understanding of concepts'),
(4, 1, 'B', 'Good effort'),
(4, 3, 'A-', 'Very good work'),
(5, 2, 'C+', 'Needs improvement'),
(5, 4, 'A', 'Outstanding writing skills');

INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES
(2, 3, 'CS101 Project Feedback', 'Your final project was excellent. I was particularly impressed with your algorithm implementation.'),
(2, 4, 'Office Hours', 'Can you stop by during my office hours tomorrow to discuss your last assignment?'),
(3, 2, 'Question about Assignment', 'I have a question about problem #3 on the recent homework. Could you clarify what is being asked?');
