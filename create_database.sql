-- Create Database
CREATE DATABASE IF NOT EXISTS spgs_db;
USE spgs_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(100) NOT NULL,
    role ENUM('Employee', 'Manager', 'BackupManager', 'Administrator') NOT NULL,
    manager_id INT,
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- System Config Table (for SLA settings)
CREATE TABLE IF NOT EXISTS system_config (
    `key` VARCHAR(50) PRIMARY KEY,
    value VARCHAR(255)
);

-- Requests Table
CREATE TABLE IF NOT EXISTS requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    description TEXT,
    submitter_id INT,
    current_handler_id INT,
    status ENUM('Pending', 'Approved', 'Rejected', 'Escalated') DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    sla_deadline DATETIME,
    rejection_reason TEXT,
    CONSTRAINT fk_submitter FOREIGN KEY (submitter_id) REFERENCES users(id),
    CONSTRAINT fk_handler FOREIGN KEY (current_handler_id) REFERENCES users(id)
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT,
    action VARCHAR(50),
    actor_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    CONSTRAINT fk_audit_request FOREIGN KEY (request_id) REFERENCES requests(id),
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id)
);

-- Insert Default Admin (Password: admin123)
-- Note: 'admin123' hash generally depends on the bcrypt rounds, so this is just a placeholder. 
-- It is recommended to use the python script to create users to ensure password hashing matches the backend.
