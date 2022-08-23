import { Box, Button, Flex, FormControl, FormLabel, Heading, Input, Stack, useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { ReactElement, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ErrorMessagesToast } from '../utils/constants/ErrorMessagesToast'
import { NextPageWithLayout } from './_app'

const Login: NextPageWithLayout = () => {
  const router = useRouter()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const handleFormEvent = useCallback(async (values: any) => {
    setIsLoading(true)
    await axios.post('/api/users/sign-in', values)
    .then((resp) => {
      router.push(resp.data.role === 'user' ? '/jornadas' : '/admin')
    })
    .catch(() => {
      setIsLoading(false);
      toast({
        description: ErrorMessagesToast.login,
        position: "top-right",
        status: "error"
      })
    })
  }, [router]);

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={'gray.brand'}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Faça login na conta</Heading>
        </Stack>
        <Box
          as="form"
          rounded={'lg'}
          bg={'gray.700'}
          boxShadow={'lg'}
          p={8}
          onSubmit={handleSubmit(handleFormEvent)}
          >
          <Stack spacing={4}>
            <FormControl id="email">
              <FormLabel>Email address</FormLabel>
              <Input type="email" {...register('email')} />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input type="password" {...register('password')} />
            </FormControl>
            <Stack spacing={10}>
              <Button
                type="submit"
                bg={'yellow.brand'}
                color={'gray.brand'}
                isLoading={isLoading}
                >
                Entrar
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  )
}

Login.getLayout = function getLayout(page: ReactElement) {
  return <>
    {page}
  </>
};

export default Login
