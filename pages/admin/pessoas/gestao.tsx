import { ChevronLeftIcon, SearchIcon } from "@chakra-ui/icons"
import { Avatar, Box, Button, Center, Flex, FormControl, FormLabel, Heading, IconButton, Image, Input, InputGroup, InputLeftElement, Link, Select, Stack, Text } from "@chakra-ui/react"
import { User } from "@prisma/client"
import axios from "axios"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import { useCallback, useReducer, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { withAuthSsr } from "../../../lib/withAuth"
import cmsClient from "../../../services/cmsClient"
import { IVagaFindOne, IVagasAll } from "../../../types/CMS/Vaga"
import { themeCustomColors } from "../../../contexts/themes/theme";

export const getServerSideProps = withAuthSsr(async (context: GetServerSidePropsContext) => {
  const [responseVaga] = await Promise.all([
    cmsClient.get<IVagasAll>(`vagas`, {
      params: {}
    })
  ])
  return {
    props: {
      vagas: responseVaga.data,
      role: context.req.session.role
    }
  }
}, 'admin')

type Props = {
  vagas: IVagasAll
}

export default function AdminPage({
  vagas,
}: Props) {
  const router = useRouter();
  const searchFormMethods = useForm({
    defaultValues: {
      vaga: '',
    }
  });

  const [data, setData] = useState<{
    usersWithDeclaredKnowledge: {
      id: string;
      name: string;
      email: string;
      knowledgeCount: number;
      percJornadasFinished: number;
    }[]
    usersThatFinishedJornadas: {
      id: string;
      name: string;
      email: string;
      percJornadasFinished: number;
    }[]
  }>({
    usersWithDeclaredKnowledge: [],
    usersThatFinishedJornadas: []
  });

  const handleSubmit = useCallback(
    async (values: any) => {
      const response = await axios.get('/api/admin/pessoas/summary', {
        params: values,
      })
      console.log(response.data)
      setData(response.data)
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
          w="xs"
          gap={2}
          alignItems='end'
        >
          <FormControl>
            <FormLabel>Selecionar vaga</FormLabel>
            <Select {...searchFormMethods.register('vaga')}>
              {vagas.data.map(vaga => {
                return <option style={{
                  color: themeCustomColors.gray.brand
                }} key={vaga.id.toString().concat('-vaga')} value={vaga.id}>{vaga.attributes.name}</option>
              })}
            </Select>
          </FormControl>
          <IconButton aria-label="Pesquisar" type="submit" icon={<SearchIcon />} bg="yellow.brand" color="gray.brand" />
        </Flex>
      </Flex>
    </FormProvider>
    {data.usersWithDeclaredKnowledge.length > 0 && <Flex
      p={8}
      gap={4}
      direction="column"
    >
      <Heading fontSize="lg">Principais candidatos com perfil declarado adequado</Heading>
      <Flex>
        {data.usersWithDeclaredKnowledge.map(user => {
          return <UserBox
            key={`usersWithDeclaredKnowledge-${user.id}`}
            user={user}
            infoItems={[
              {
                value: user.knowledgeCount,
                label: 'conhecimentos'
              },
              {
                value: user.percJornadasFinished.toString().concat('%'),
                label: 'jornadas concluídas'
              }
            ]}
          />
        })}
      </Flex>
    </Flex>}
    {data.usersThatFinishedJornadas.length > 0 && <Flex
      p={8}
      gap={4}
      direction="column"
    >
      <Heading fontSize="lg">Principais candidatos que trilharam as jornadas da vaga</Heading>
      <Flex>
        {data.usersThatFinishedJornadas.map(user => {
          return <UserBox
            key={`usersThatFinishedJornadas-${user.id}`}
            user={user}
            infoItems={[
              {
                value: user.percJornadasFinished.toString().concat('%'),
                label: 'jornadas concluídas'
              }
            ]}
          />
        })}
      </Flex>
    </Flex>}
  </>
}

type IUser = {
  id: string;
  name: string;
}

type IInfoItems = {
  value: any;
  label: string;
}

function UserBox({
  user,
  infoItems
}: {
  user: IUser,
  infoItems: IInfoItems[]
}) {
  return <Center>
    <Box
      maxW={'270px'}
      w={'full'}
      bg={'whiteAlpha.300'}
      boxShadow={'2xl'}
      rounded={'md'}
      overflow={'hidden'}>
      <Box
        h={'60px'}
        w={'full'}
        bg="whiteAlpha.400"
      />
      <Flex justify={'center'} mt={-12}>
        <Avatar
          size={'xl'}
          name={user.name}
          css={{
            border: '2px solid white',
          }}
        />
      </Flex>

      <Box p={6}>
        <Stack spacing={0} align={'center'} mb={5}>
          <Heading fontSize={'2xl'} fontWeight={500} fontFamily={'body'} textAlign="center">
            {user.name}
          </Heading>
        </Stack>

        <Stack direction={'row'} justify={'center'} spacing={6}>
          {infoItems.map(infoItem => {
            return <Stack key={infoItem.label} spacing={0} align={'center'}>
              <Text fontWeight={600}>{infoItem.value}</Text>
              <Text fontSize={'sm'} color={'whiteAlpha.800'} textAlign="center">
                {infoItem.label}
              </Text>
            </Stack>
          })}
        </Stack>

        <Link href={`/admin/pessoas/${user.id}`}>
          <Button
            w={'full'}
            mt={8}
            bg={'gray.900'}
            color={'white'}
            rounded={'md'}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}>
            Perfil
          </Button>
        </Link>
      </Box>
    </Box>
  </Center>
}