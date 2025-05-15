import pool from '../../utils/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const {
        date,
        time_slot,
        appointment_type,
        full_name,
        street_address,
        area,
        phone,
        gmail,
        meeting_purpose
      } = req.body;

      // Validate required fields
      if (!date || !time_slot || !appointment_type || !full_name || !street_address || 
          !area || !phone || !gmail || !meeting_purpose) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Insert booking into database
      const [result] = await pool.execute(
        `INSERT INTO appointments 
        (date, time_slot, appointment_type, full_name, street_address, area, phone, gmail, meeting_purpose) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [date, time_slot, appointment_type, full_name, street_address, area, phone, gmail, meeting_purpose]
      );

      return res.status(200).json({ 
        success: true, 
        message: 'Booking submitted successfully',
        bookingId: result.insertId 
      });

    } catch (error) {
      console.error('Booking submission error:', error);
      return res.status(500).json({ error: 'Failed to submit booking' });
    }
  } else if (req.method === 'GET') {
    try {
      // Fetch all bookings
      const [bookings] = await pool.execute(
        'SELECT * FROM appointments ORDER BY date DESC, time_slot ASC'
      );
      
      return res.status(200).json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 