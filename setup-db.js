import mysql from 'mysql2/promise';

async function setupDatabase() {
  try {
    // Create connection without database selected
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS meeting_scheduler');
    console.log('Database created or already exists');

    // Use the database
    await connection.query('USE meeting_scheduler');

    // Create appointments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        time_slot VARCHAR(50) NOT NULL,
        appointment_type VARCHAR(20) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        street_address VARCHAR(255) NOT NULL,
        area VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        gmail VARCHAR(100) NOT NULL,
        meeting_purpose TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Appointments table created or already exists');

    // Create indexes
    await connection.query('CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_appointments_gmail ON appointments(gmail)');
    console.log('Indexes created or already exist');

    await connection.end();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 