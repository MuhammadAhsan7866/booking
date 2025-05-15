import mysql from 'mysql'

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'feedbackDB'
})

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Simple token verification
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  db.query('SELECT * FROM feedbacks ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('Error fetching feedbacks:', err)
      return res.status(500).json({ message: 'Database error' })
    }
    res.status(200).json(results)
  })
} 