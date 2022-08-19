import { ChevronLeftIcon, SearchIcon } from "@chakra-ui/icons"
import { Avatar, Box, Button, Center, Flex, Heading, IconButton, Image, Input, InputGroup, InputLeftElement, Link, Select, Stack, Text } from "@chakra-ui/react"
import { User } from "@prisma/client"
import axios from "axios"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import { useCallback, useReducer, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { withAuthSsr } from "../../../lib/withAuth"
import cmsClient from "../../../services/cmsClient"
import { IVagaFindOne, IVagasAll } from "../../../types/CMS/Vaga"

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
      search: '',
      vaga: '',
    }
  });

  const [data, setData] = useState<{
    users: User[],
    stats: {
      trilhasStats: {
        userId: string,
        _count: {
          hasEmblema: number
        }
      }[],
      jornadasStats: {
        userId: string,
        _count: {
          _all: number
        }
      }[]
    }
  }>({
    users: [],
    stats: {
      trilhasStats: [],
      jornadasStats: []
    }
  });

  const handleSubmit = useCallback(
    async (values: any) => {
      const response = await axios.get('/api/admin/pessoas', {
        params: values,
      })
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
          w="xl"
          gap={2}
          alignItems='center'
        >
          <InputGroup>
            <InputLeftElement
              pointerEvents='none'
            >
              <SearchIcon color="white" />
            </InputLeftElement>
            <Input type='text' placeholder='Nome ou e-mail' {...searchFormMethods.register('search')} _placeholder={{
              color: 'white'
            }} />
          </InputGroup>
          <Select placeholder="Buscar por vaga de interesse" {...searchFormMethods.register('vaga')}>
            {vagas.data.map(vaga => {
              return <option key={vaga.id.toString().concat('-vaga')} value={vaga.id}>{vaga.attributes.name}</option>
            })}
          </Select>
          <IconButton aria-label="Pesquisar" type="submit" icon={<SearchIcon />} bg="yellow.brand" color="gray.brand" />
        </Flex>
      </Flex>
    </FormProvider>
    <Flex
      p={8}
    >
      {data.users.map(user => {
        const trilhaStat = data.stats.trilhasStats.find(x => x.userId === user.id);
        const jornadaStat = data.stats.jornadasStats.find(x => x.userId === user.id);
        return <Center
          key={user.id}
        >
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
                name={`${user.firstName} ${user.lastName}`}
                css={{
                  border: '2px solid white',
                }}
              />
            </Flex>

            <Box p={6}>
              <Stack spacing={0} align={'center'} mb={5}>
                <Heading fontSize={'2xl'} fontWeight={500} fontFamily={'body'} textAlign="center">
                  {user.firstName} {user.lastName}
                </Heading>
                {/* <Text color={'gray.500'}>Frontend Developer</Text> */}
              </Stack>

              <Stack direction={'row'} justify={'center'} spacing={6}>
                <Stack spacing={0} align={'center'}>
                  <Text fontWeight={600}>{trilhaStat?._count.hasEmblema || 0}</Text>
                  <Text fontSize={'sm'} color={'whiteAlpha.800'}>
                    Emblema{(trilhaStat?._count.hasEmblema || 0) > 1 && 's'}
                  </Text>
                </Stack>
                <Stack spacing={0} align={'center'}>
                  <Text fontWeight={600}>{jornadaStat?._count._all || 0}</Text>
                  <Text fontSize={'sm'} color={'whiteAlpha.800'}>
                    Jornada{(jornadaStat?._count._all || 0) > 1 && 's'}
                  </Text>
                </Stack>
              </Stack>

              <Link href={`mailto:${user.email}`} target="_blank">
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
                  E-mail
                </Button>
              </Link>
            </Box>
          </Box>
        </Center>
      })}
    </Flex>
  </>
}