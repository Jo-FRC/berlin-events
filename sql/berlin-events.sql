DROP TABLE IF EXISTS links;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS comments;

CREATE TABLE links(
    id SERIAL PRIMARY KEY,
    link VARCHAR(300) NOT NULL,
    title VARCHAR(255) NOT NULL,
    username VARCHAR(300) NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(300) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    link_id INTEGER NOT NULL,
    username VARCHAR(300) NOT NULL,
    user_id INTEGER NOT NULL,
    comment_text VARCHAR(255) NOT NULL,
    parent_id INTEGER, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO comments (comment_text, username, link_id) VALUES ('Che bel link', 'Shirin', 1);
INSERT INTO comments (comment_text, username, link_id) VALUES ('Fa cagare', 'Johanna', 1);
INSERT INTO comments (comment_text, username, link_id) VALUES ('Non sono d accordo', 'david', 1);
