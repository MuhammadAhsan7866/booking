import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',     // Your MySQL username
  password: '',     // Your MySQL password
  database: 'appointment_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Test the connection
async function testConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Successfully connected to MySQL database');
    await connection.end();
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
    throw error;
  }
}

// Create the pool
const pool = mysql.createPool(dbConfig);

// Test the connection when the module loads
testConnection().catch(console.error);

export default pool; 