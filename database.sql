-- Appointments table for meeting scheduling
CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  appointment_type VARCHAR(20) NOT NULL, -- 'Online' or 'Physical'
  full_name VARCHAR(100) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  area VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  gmail VARCHAR(100) NOT NULL,
  meeting_purpose TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table for admin login
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table for storing feedback and video
CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT,
  feedback_text TEXT,
  rating VARCHAR(20),
  video_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Indexes for performance
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_gmail ON appointments(gmail);
CREATE INDEX idx_users_username ON users(username); 