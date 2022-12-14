import { SearchIcon } from "@chakra-ui/icons"
import { Avatar, Box, Button, Center, Flex, FormControl, FormLabel, Heading, HStack, IconButton, Input, InputGroup, InputLeftElement, Link, Select, Stack, Text } from "@chakra-ui/react"
import { User } from "@prisma/client"
import axios from "axios"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { withAuthSsr } from "../../../lib/withAuth"
import cmsClient from "../../../services/cmsClient"
import { IConhecimentosAll } from "../../../types/CMS/Conhecimento"
import { IVagasAll } from "../../../types/CMS/Vaga"
import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteItem,
  AutoCompleteList,
  AutoCompleteTag,
} from "@choc-ui/chakra-autocomplete";

export const getServerSideProps = withAuthSsr(async (context: GetServerSidePropsContext) => {
  const [responseVaga, conhecimentos] = await Promise.all([
    cmsClient.get<IVagasAll>(`vagas`, {
      params: {}
    }),
    cmsClient.get<IConhecimentosAll>(`conhecimentos`),
  ])
  return {
    props: {
      vagas: responseVaga.data,
      role: context.req.session.role,
      conhecimentos: conhecimentos.data,
    }
  }
}, 'admin')

type Props = {
  vagas: IVagasAll
  conhecimentos: IConhecimentosAll
}

export default function AdminPage({
  vagas,
  conhecimentos,
}: Props) {
  const router = useRouter();
  const searchFormMethods = useForm({
    defaultValues: {
      search: '',
      vaga: '',
      gender: '',
      knowledgeItems: []
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
      const response = await axios.get('/api/admin/pessoas/search', {
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
      <Heading fontSize="3xl" fontWeight={"bold"}>
        Buscar pessoas
      </Heading>
    </Flex>
    <FormProvider {...searchFormMethods}>
      <Flex as="form"
        onSubmit={searchFormMethods.handleSubmit(handleSubmit)}
        p={8}
        bg="whiteAlpha.300"
        boxShadow="md"
        alignItems="flex-start"
        direction="column"
        gap={4}
      >
        <Stack
          direction={{
            base: 'column',
            md: 'row'
          }}
          gap={2}
          alignItems='center'
        >
          <FormControl flex={1}>
            <FormLabel>Nome ou e-mail</FormLabel>
            <InputGroup>
              <InputLeftElement
                pointerEvents='none'
              >
                <SearchIcon color="white" />
              </InputLeftElement>
              <Input type='text'{...searchFormMethods.register('search')} _placeholder={{
                color: 'white'
              }} />
            </InputGroup>
          </FormControl>
          <FormControl flex={1}>
            <FormLabel>Buscar por vaga</FormLabel>
            <Select {...searchFormMethods.register('vaga')}>
              {vagas.data.map(vaga => {
                return <option key={vaga.id.toString().concat('-vaga')} value={vaga.id}>{vaga.attributes.name}</option>
              })}
            </Select>
          </FormControl>
          <FormControl flex={1}>
            <FormLabel>G??nero</FormLabel>
            <Select {...searchFormMethods.register('gender')}>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
              <option value="not-informed">N??o informado</option>
            </Select>
          </FormControl>
          <FormControl flex={2}>
            <FormLabel color="white">Conhecimentos</FormLabel>
            <Controller
              control={searchFormMethods.control}
              name="knowledgeItems"
              render={({
                field: { value, onChange }
              }) => {
                return <AutoComplete openOnFocus multiple onChange={onChange}>
                  <AutoCompleteInput color="white">
                    {({ tags }) =>
                      tags.map((tag, tid) => (
                        <AutoCompleteTag
                          key={tid}
                          label={tag.label}
                          onRemove={tag.onRemove}
                        />
                      ))
                    }
                  </AutoCompleteInput>
                  <AutoCompleteList>
                    {conhecimentos.data.map((conhecimento, cid) => (
                      <AutoCompleteItem
                        color="white"
                        key={`option-${cid}`}
                        value={conhecimento.attributes.name}
                        textTransform="capitalize"
                      >
                        {conhecimento.attributes.name}
                      </AutoCompleteItem>
                    ))}
                  </AutoCompleteList>
                </AutoComplete>
              }}
            />
          </FormControl>
        </Stack>
        <Button variant={'default'} aria-label="Pesquisar" type="submit" leftIcon={<SearchIcon />} bg="yellow.brand" color="gray.brand">Pesquisar</Button>
      </Flex>
    </FormProvider>
    <Flex
      p={8}
      wrap="wrap"
      gap={2}
      justifyContent="space-around"
      alignItems="stretch"
    >
      {data.users.map(user => {
        const trilhaStat = data.stats.trilhasStats.find(x => x.userId === user.id);
        const jornadaStat = data.stats.jornadasStats.find(x => x.userId === user.id);
        return <Center
          key={user.id}
          h="full"
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

              <Link style={{ textDecoration: 'none' }} href={`/admin/pessoas/${user.id}`}>
                <Button
                  w={'full'}
                  mt={8}
                  bg={'gray.900'}
                  color={'white'}
                  rounded={'md'}
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: 'lg',
                  }}>
                  Perfil
                </Button>
              </Link>
            </Box>
          </Box>
        </Center>
      })}
    </Flex>
  </>
}