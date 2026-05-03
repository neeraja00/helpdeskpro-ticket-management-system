-- Create Database
CREATE DATABASE IF NOT EXISTS helpdeskpro;
USE helpdeskpro;

-- 1. roles table
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- Seed roles
INSERT INTO roles (role_name) VALUES ('customer'), ('agent'), ('admin');

-- 2. users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. priorities table
CREATE TABLE priorities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    priority_name VARCHAR(50) NOT NULL UNIQUE,
    sla_hours INT NOT NULL
);

-- Seed priorities
INSERT INTO priorities (priority_name, sla_hours) VALUES 
('Low', 48), 
('Medium', 24), 
('High', 8), 
('Urgent', 4);

-- 4. statuses table
CREATE TABLE statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE
);

-- Seed statuses
INSERT INTO statuses (status_name) VALUES 
('Open'), 
('In Progress'), 
('On Hold'), 
('Resolved'), 
('Closed');

-- 5. tickets table
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    customer_id INT NOT NULL,
    agent_id INT DEFAULT NULL,
    priority_id INT NOT NULL,
    status_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (agent_id) REFERENCES users(id),
    FOREIGN KEY (priority_id) REFERENCES priorities(id),
    FOREIGN KEY (status_id) REFERENCES statuses(id)
);

-- 6. comments table
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 7. sla_tracking table
CREATE TABLE sla_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    due_time DATETIME NOT NULL,
    resolution_time DATETIME DEFAULT NULL,
    sla_status ENUM('Hit', 'Breached', 'Pending') DEFAULT 'Pending',
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Indices for performance
CREATE INDEX idx_ticket_status ON tickets(status_id);
CREATE INDEX idx_ticket_priority ON tickets(priority_id);
CREATE INDEX idx_ticket_customer ON tickets(customer_id);
CREATE INDEX idx_ticket_agent ON tickets(agent_id);
