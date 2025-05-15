import pool from '../../../utils/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;

      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const [result] = await pool.execute(
        'UPDATE appointments SET status = ? WHERE id = ?',
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      return res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
      console.error('Error updating booking status:', error);
      return res.status(500).json({ error: 'Failed to update booking status' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 