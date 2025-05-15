import pool from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  try {
    // Count online bookings
    const [onlineResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM appointments WHERE date = ? AND appointment_type = ?',
      [date, 'Online (Zoom)']
    );

    // Count physical bookings
    const [physicalResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM appointments WHERE date = ? AND appointment_type = ?',
      [date, 'Physical']
    );

    return res.status(200).json({
      online: onlineResult[0].count,
      physical: physicalResult[0].count
    });
  } catch (error) {
    console.error('Error counting bookings:', error);
    return res.status(500).json({ error: 'Failed to count bookings' });
  }
} 