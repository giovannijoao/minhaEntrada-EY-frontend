import { ChevronLeftIcon, SearchIcon } from "@chakra-ui/icons"
import { Avatar, Center, Flex, Heading, IconButton, Input, InputGroup, InputLeftElement, Text } from "@chakra-ui/react"
import { User } from "@prisma/client"
import axios from "axios"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import { useCallback, useReducer, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { withAuthSsr } from "../../../lib/withAuth"

export const getServerSideProps = withAuthSsr(async (context: GetServerSidePropsContext) => {
  return {
    props: {
      role: context.req.session.role
    }
  }
}, 'admin')

export default function AdminPage() {
  const router = useRouter();
  const searchFormMethods = useForm({
    defaultValues: {
      search: '',
    }
  });

  const [users, setUsers] = useState<User[]>([]);

  const handleSubmit = useCallback(
    async (values: any) => {
      const response = await axios.get('/api/admin/pessoas', {
        params: values,
      })
      setUsers(response.data)
    },
    [],
  )

  return <>
    <Flex
      h={36}
      p={8}
      alignItems="center"
      backgroundColor="yellow.brand"
      direction="row"
      gap={6}
      color={"gray.brand"}
    >
      <IconButton onClick={router.back} icon={<ChevronLeftIcon />} aria-label="Voltar" />
      <Flex direction="column">
        <Heading fontSize="3xl" fontWeight={"bold"}>
          Gestão de pessoas
        </Heading>
      </Flex>
    </Flex>
    <FormProvider {...searchFormMethods}>
      <Flex as="form"
        onSubmit={searchFormMethods.handleSubmit(handleSubmit)}
        p={8}
        bg="whiteAlpha.300"
        boxShadow="md"
        alignItems="flex-start"
        >
        <Flex
          w="md"
          gap={2}
          alignItems='center'
        >
          <InputGroup>
            <InputLeftElement
              pointerEvents='none'
            >
              <SearchIcon color="white" />
            </InputLeftElement>
            <Input type='text' placeholder='Nome ou e-mail' {...searchFormMethods.register('search')} />
          </InputGroup>
          <IconButton aria-label="Pesquisar" type="submit" icon={<SearchIcon />} bg="yellow.brand" color="gray.brand" />
        </Flex>
      </Flex>
    </FormProvider>
    <Flex
      p={8}
    >
      {users.map(user => {
        return <Center
          key={user.id}
          flexDirection="column"
          w="xs"
          textAlign="center"
          p={4}
          border="1px"
          borderColor={"yellow.brand"}
          borderRadius="lg"
        >
          <Avatar name={`${user.firstName} ${user.lastName}`} />
          <Heading fontSize="xl">{user.firstName} {user.lastName}</Heading>
          <Text>{user.email}</Text>
        </Center>
      })}
    </Flex>
  </>
}