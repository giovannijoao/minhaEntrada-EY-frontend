import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, FormControl, FormLabel, Heading, HStack, Input, InputGroup, InputRightElement, Link, Stack, Text } from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { ReactElement, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { NextPageWithLayout } from './_app';

const SignUp: NextPageWithLayout = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    }
  });

  const handleFormEvent = useCallback(async (values: any) => {
    try {
      setIsLoading(true)
      const response = await axios.post('/api/users/sign-up', values);
      router.push('/jornadas')
    } catch (error) {
      //TODO: Missing error treatment
    }

  }, [router]);

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={'gray.800'}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'}>
            Criar uma conta
          </Heading>
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
            <HStack>
              <Box>
                <FormControl id="firstName" isRequired>
                  <FormLabel>Primeiro Nome</FormLabel>
                  <Input type="text"  {...register('firstName')}/>
                </FormControl>
              </Box>
              <Box>
                <FormControl id="lastName">
                  <FormLabel>Segundo Nome</FormLabel>
                  <Input type="text"  {...register('lastName')}/>
                </FormControl>
              </Box>
            </HStack>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email"  {...register('email')}/>
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Senha</FormLabel>
              <InputGroup>
                <Input type={showPassword ? 'text' : 'password'} {...register('password')} />
                <InputRightElement h={'full'}>
                  <Button
                    variant={'ghost'}
                    onClick={() =>
                      setShowPassword((showPassword) => !showPassword)
                    }>
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Stack spacing={10} pt={2}>
              <Button
                type="submit"
                loadingText="Entrando"
                size="lg"
                bg={'yellow.brand'}
                color={'gray.brand'}
              >
                Criar conta
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={'center'}>
                Já está cadastrado? <Link color={'yellow.brand'}>Entrar</Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  )
}

SignUp.getLayout = function getLayout(page: ReactElement) {
  return <>
    {page}
  </>
};

export default SignUp
