const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// JWT Secret
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'appointment_db'
});

// Handle database connection errors
db.connect(err => {
  if (err) {
    console.error('Database connection error:', err);
    setTimeout(() => {
      console.log('Attempting to reconnect to database...');
      db.connect();
    }, 2000);
  } else {
    console.log('Connected to MySQL');
  }
});

db.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Attempting to reconnect to database...');
    db.connect();
  } else {
    throw err;
  }
});

// Multer configuration for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = results[0];
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      res.json({ success: true, token });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointment counts for a date
app.get('/appointments/count', async (req, res) => {
  const { date } = req.query;

  try {
    const sql = `
      SELECT 
        SUM(CASE WHEN appointment_type = 'Online' THEN 1 ELSE 0 END) as zoomCount,
        SUM(CASE WHEN appointment_type = 'Physical' THEN 1 ELSE 0 END) as physicalCount
      FROM appointments 
      WHERE date = ?
    `;

    db.query(sql, [date], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        zoomCount: results[0].zoomCount || 0,
        physicalCount: results[0].physicalCount || 0
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit appointment with feedback
app.post('/submit', upload.single('video'), (req, res) => {
  try {
    const {
      date,
      type,
      fullName,
      streetAddress,
      area,
      phone,
      gmail,
      meetingPurpose,
      feedback,
      rating
    } = req.body;

    // Validate required fields
    if (!date || !type || !fullName || !streetAddress || !area || !phone || !gmail || !meetingPurpose) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const videoFile = req.file ? req.file.filename : null;

    // Start a transaction
    db.beginTransaction(err => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      // Insert appointment
      const appointmentSql = `
        INSERT INTO appointments (
          date, appointment_type, full_name, street_address, area, 
          phone, gmail, meeting_purpose, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `;

      const appointmentValues = [
        date, type, fullName, streetAddress, area, phone, gmail, meetingPurpose
      ];

      db.query(appointmentSql, appointmentValues, (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ message: 'Database error' });
          });
        }

        const appointmentId = result.insertId;

        // Insert feedback if provided
        if (feedback || rating || videoFile) {
          const feedbackSql = `
            INSERT INTO feedback (
              appointment_id, feedback_text, rating, video_path
            ) VALUES (?, ?, ?, ?)
          `;

          const feedbackValues = [appointmentId, feedback, rating, videoFile];

          db.query(feedbackSql, feedbackValues, (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: 'Database error' });
              });
            }

            db.commit(err => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ message: 'Database error' });
                });
              }

              res.json({ 
                success: true, 
                message: 'Appointment and feedback saved successfully!',
                id: appointmentId
              });
            });
          });
        } else {
          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: 'Database error' });
              });
            }

            res.json({ 
              success: true, 
              message: 'Appointment saved successfully!',
              id: appointmentId
            });
          });
        }
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get all appointments (admin only)
app.get('/appointments', authenticateToken, (req, res) => {
  const sql = `
    SELECT a.*, f.feedback_text, f.rating, f.video_path
    FROM appointments a
    LEFT JOIN feedback f ON a.id = f.appointment_id
    ORDER BY a.date DESC, a.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Update appointment status (admin only)
app.put('/appointments/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = 'UPDATE appointments SET status = ? WHERE id = ?';
  
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({ success: true, message: 'Status updated successfully' });
  });
});

// Add a test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
