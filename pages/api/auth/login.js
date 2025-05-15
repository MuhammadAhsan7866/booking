export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { password } = req.body
  const ADMIN_PASSWORD = 'admin123' // Static password for admin

  if (password === ADMIN_PASSWORD) {
    // In a real application, you would use a proper JWT token
    const token = 'dummy-token-' + Date.now()
    res.status(200).json({ success: true, token })
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' })
  }
} 