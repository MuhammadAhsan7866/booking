import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Dashboard.module.css';

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/appointments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      setAppointments(data);
      setLoading(false);
    } catch (error) {
      setError('Error loading appointments');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Feedback</th>
              <th>Rating</th>
              <th>Video</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{new Date(appointment.date).toLocaleDateString()}</td>
                <td>{appointment.type}</td>
                <td>{appointment.full_name}</td>
                <td>
                  <div>Phone: {appointment.phone}</div>
                  <div>Email: {appointment.gmail}</div>
                </td>
                <td>{appointment.meeting_purpose}</td>
                <td>
                  <select
                    value={appointment.status}
                    onChange={async (e) => {
                      try {
                        await fetch(`http://localhost:5000/appointments/${appointment.id}/status`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          },
                          body: JSON.stringify({ status: e.target.value })
                        });
                        fetchAppointments();
                      } catch (error) {
                        console.error('Error updating status:', error);
                      }
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td>{appointment.feedback}</td>
                <td>{appointment.rating}</td>
                <td>
                  {appointment.video_path && (
                    <video
                      src={`http://localhost:5000/uploads/${appointment.video_path}`}
                      controls
                      className={styles.videoPreview}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 