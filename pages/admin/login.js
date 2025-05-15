import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Container,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const router = useRouter()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/auth/login', { password })
      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token)
        router.push('/admin/dashboard')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8}>
        <Heading>Admin Login</Heading>
        <Box w="100%" p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <Button type="submit" colorScheme="blue" width="100%">
                Login
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  )
} 