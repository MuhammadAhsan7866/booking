'use client';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  useToast,
  SimpleGrid,
  Select,
  Textarea,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

const slotOptions = [
  {
    label: '3:00 PM - 3:30 PM',
    type: 'Online (Zoom)',
    limit: 5,
  },
  {
    label: '3:30 PM - 4:30 PM',
    type: 'Physical',
    limit: 20,
  },
];

const areaOptions = [
  'DHA Phase-I to VIII',
  'Clifton Block 8',
  'Clifton Block 9',
  'Dehli Colony',
  'Madniabad',
  'Railway Colony',
  'Punjab Colony',
  'Chandio Village',
  'Bukhshan Village',
  'Pak Jamouria Colony',
  'Nelum Colony',
  'Hazar Colony',
  'New Basti',
];

const bookings = {}; // In-memory mock (use DB/backend for real use)

export default function Home() {
  const [selectedDate, setSelectedDate] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [zoomCount, setZoomCount] = useState(0);
  const [physicalCount, setPhysicalCount] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    streetAddress: '',
    area: '',
    phone: '',
    gmail: '',
    meetingPurpose: '',
    feedback: '',
    rating: '',
  });
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);

  useEffect(() => {
    if (selectedDate) {
      // Fetch appointment counts for the selected date
      fetchAppointmentCounts();
    }
  }, [selectedDate]);

  const fetchAppointmentCounts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/appointments/count?date=${selectedDate}`);
      const data = await response.json();
      setZoomCount(data.zoomCount);
      setPhysicalCount(data.physicalCount);
    } catch (error) {
      console.error('Error fetching appointment counts:', error);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(blob);
        setRecordedVideo(videoURL);
        localStorage.setItem('recordedVideo', videoURL);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (appointmentType === 'Online' && zoomCount >= 5) {
      alert('Zoom appointments limit reached for this date');
      return;
    }
    
    if (appointmentType === 'Physical' && physicalCount >= 20) {
      alert('Physical appointments limit reached for this date');
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    formDataToSend.append('date', selectedDate);
    formDataToSend.append('type', appointmentType);
    
    if (recordedVideo) {
      const response = await fetch(recordedVideo);
      const blob = await response.blob();
      formDataToSend.append('video', blob, 'feedback.webm');
    }

    try {
      const response = await fetch('http://localhost:5000/submit', {
        method: 'POST',
        body: formDataToSend,
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Appointment booked successfully!');
        // Reset form
        setFormData({
          fullName: '',
          streetAddress: '',
          area: '',
          phone: '',
          gmail: '',
          meetingPurpose: '',
          feedback: '',
          rating: '',
        });
        setSelectedDate('');
        setRecordedVideo(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Book an Appointment</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.dateSection}>
          <label htmlFor="date">Select Date:</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={handleDateChange}
            required
          />
          {selectedDate && (
            <div className={styles.appointmentCounts}>
              <p>Zoom Appointments: {zoomCount}/5</p>
              <p>Physical Appointments: {physicalCount}/20</p>
            </div>
          )}
        </div>

        {selectedDate && (
          <>
            <div className={styles.inputGroup}>
              <label>Appointment Type:</label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                required
              >
                <option value="">Select Type</option>
                <option value="Online" disabled={zoomCount >= 5}>Zoom</option>
                <option value="Physical" disabled={physicalCount >= 20}>Physical</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="fullName">Full Name:</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="streetAddress">Street Address:</label>
              <input
                type="text"
                id="streetAddress"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="area">Area:</label>
              <input
                type="text"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phone">Phone:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="gmail">Gmail:</label>
              <input
                type="email"
                id="gmail"
                name="gmail"
                value={formData.gmail}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="meetingPurpose">Meeting Purpose:</label>
              <textarea
                id="meetingPurpose"
                name="meetingPurpose"
                value={formData.meetingPurpose}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="feedback">Feedback:</label>
              <textarea
                id="feedback"
                name="feedback"
                value={formData.feedback}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.ratingSection}>
              <label>Rating:</label>
              <div className={styles.emojis}>
                <span onClick={() => setFormData(prev => ({ ...prev, rating: 'Good' }))}>😊</span>
                <span onClick={() => setFormData(prev => ({ ...prev, rating: 'Neutral' }))}>😐</span>
                <span onClick={() => setFormData(prev => ({ ...prev, rating: 'Bad' }))}>😞</span>
              </div>
            </div>

            <div className={styles.videoSection}>
              <h3>Video Feedback</h3>
              {recordedVideo && (
                <video
                  src={recordedVideo}
                  controls
                  className={styles.recordedVideo}
                />
              )}
              <div className={styles.videoControls}>
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isRecording}
                  className={styles.recordButton}
                >
                  Start Recording
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className={styles.stopButton}
                >
                  Stop Recording
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitButton}>
              Submit Appointment
            </button>
          </>
        )}
      </form>
    </div>
  );
}
