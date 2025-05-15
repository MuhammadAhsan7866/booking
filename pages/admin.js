'use client';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  HStack,
  Text,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      console.log('Fetched bookings:', data); // Debug log
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error fetching bookings',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Refresh the bookings list
      await fetchBookings();
      
      toast({
        title: 'Status updated',
        description: `Booking status changed to ${newStatus}`,
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error updating status',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box p={4} bg="gray.50" minH="100vh">
      <Heading textAlign="center" color="blue.800" mb={6}>
        📊 Admin Panel - Booking Management
      </Heading>

      <Box bg="white" p={6} borderRadius="xl" boxShadow="lg">
        <HStack mb={4} justify="space-between">
          <Text fontWeight="bold">Filter by Status:</Text>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            w="200px"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
        </HStack>

        {bookings.length === 0 ? (
          <Center p={8}>
            <Text color="gray.500">No bookings found</Text>
          </Center>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Time Slot</Th>
                <Th>Type</Th>
                <Th>Name</Th>
                <Th>Contact</Th>
                <Th>Area</Th>
                <Th>Purpose</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bookings
                .filter(booking => statusFilter === 'all' || booking.status === statusFilter)
                .map((booking) => (
                  <Tr key={booking.id}>
                    <Td>{new Date(booking.date).toLocaleDateString()}</Td>
                    <Td>{booking.time_slot}</Td>
                    <Td>{booking.appointment_type}</Td>
                    <Td>{booking.full_name}</Td>
                    <Td>
                      <Text>{booking.phone}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {booking.gmail}
                      </Text>
                    </Td>
                    <Td>{booking.area}</Td>
                    <Td>{booking.meeting_purpose}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        size="sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approve</option>
                        <option value="rejected">Reject</option>
                      </Select>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
} 