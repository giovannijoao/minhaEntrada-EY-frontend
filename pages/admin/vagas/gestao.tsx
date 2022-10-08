import { ChevronLeftIcon, SearchIcon } from "@chakra-ui/icons"
import { Avatar, Box, Button, Center, Fade, Flex, FormControl, FormLabel, Heading, IconButton, Image, Input, InputGroup, InputLeftElement, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Select, Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useDisclosure, useId } from "@chakra-ui/react"
import { User } from "@prisma/client"
import axios from "axios"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import { useCallback, useReducer, useState, useEffect, useMemo, Fragment } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { withAuthSsr } from "../../../lib/withAuth"
import cmsClient from "../../../services/cmsClient"
import { IVagaFindOne, IVagasAll } from "../../../types/CMS/Vaga"
import { themeCustomColors } from "../../../contexts/themes/theme";
import { mediaUrl } from "../../../config"

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

const initialData = {
  metadata: {},
  data: {
    parsedUsersWithDeclaredKnowledge: [],
    parsedUsersThatFinishedJornadas: [],
    parsedJornadasStatics: []
  }
}

type IData = {
  metadata: {
    parsedUsersWithDeclaredKnowledgeCount?: number;
    parsedUsersThatFinishedJornadasCount?: number;
  }
  data: {
    parsedUsersWithDeclaredKnowledge: {
      id: string;
      name: string;
      email: string;
      knowledgeCount: number;
      percJornadasFinished: number;
    }[]
    parsedUsersThatFinishedJornadas: {
      id: string;
      name: string;
      email: string;
      percJornadasFinished: number;
    }[]
    parsedJornadasStatics: {
      id: number;
      name: string;
      image: string;
    }[]
  }
}

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export default function AdminPage({
  vagas,
}: Props) {
  const router = useRouter();
  const searchFormMethods = useForm({
    defaultValues: {
      vaga: '',
    }
  });
  const vagaId = searchFormMethods.watch('vaga');
  const { isOpen: isOpenDeclaredKnowledge, onOpen: onOpenDeclaredKnowledge, onClose: onCloseDeclaredKnowledge } = useDisclosure()
  const { isOpen: isOpenJourneyMore, onOpen: onOpenJourneyMore, onClose: onCloseJourneyMore } = useDisclosure()

  const [data, setData] = useState<IData>(initialData);

  const fetchData = useCallback(async (values: {
    vaga: string
    withoutLimits?: boolean;
  }) => {
    const response = await axios.get('/api/admin/vagas/summary', {
      params: values,
    })
    return response.data as IData;
  }, []);

  const handleSubmit = useCallback(
    async (values: any) => {
      setData(initialData)
      const response = await fetchData(values);
      setData(response)
    },
    [fetchData],
  )

  const fetchDataAndSelect = useCallback(async ({
    property
  }: {
    property: keyof PropType<IData, 'data'>
  }) => {
    const response = await fetchData({
      vaga: vagaId,
      withoutLimits: true,
    });
    type Property = typeof property;
    return response.data[property] as IData["data"][Property];
  }, [fetchData, vagaId])

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
          Gestão de vagas
        </Heading>
      </Flex>
    </Flex>
    <Flex gap={4} px={8} pt={8}
      direction={{
        base: 'column',
        md: 'row'
      }}
    >
      <Flex
        minW="xs"
        direction="column"
        p={8}
        boxShadow="lg"
        alignItems="flex-start"
        borderRadius="md"
        bgColor="whiteAlpha.300"
        justifyContent={"space-evenly"}
        gap={4}
      >
        <FormProvider {...searchFormMethods}>
          <Flex as="form"
            onSubmit={searchFormMethods.handleSubmit(handleSubmit)}
          >
            <Flex
              gap={2}
              alignItems='end'
            >
              <FormControl>
                <FormLabel>Selecionar vaga</FormLabel>
                <Select {...searchFormMethods.register('vaga')}>
                  {vagas.data.map(vaga => {
                    return <option style={{
                      backgroundColor: themeCustomColors.gray.brand,
                      color: 'white'
                    }} key={vaga.id.toString().concat('-vaga')} value={vaga.id}>{vaga.attributes.name}</option>
                  })}
                </Select>
              </FormControl>
              <IconButton aria-label="Pesquisar" type="submit" icon={<SearchIcon />} bg="yellow.brand" color="gray.brand" />
            </Flex>
          </Flex>
        </FormProvider>
        <Flex
          p={2}
          bg="blackAlpha.500"
          w="full"
          borderRadius="lg"
          pl={4}
        >
          <Heading fontSize="lg">{vagas.data.length} vagas criadas</Heading>
        </Flex>
      </Flex>
      <Fade in={data.data.parsedJornadasStatics.length > 0}>
        <Flex
          bg="whiteAlpha.300"
          pt={8}
          px={4}
          gap={1}
          direction="column"
          w="full"
          borderRadius="md"
        >
          <Flex ml={2} alignItems="center" gap={4}>
            <Heading color="yellow.brand">{data.data.parsedJornadasStatics.length.toString().padStart(2, '0')}</Heading>
            <Heading fontSize="lg">Jornadas atreladas a vaga</Heading>
          </Flex>
          <Flex wrap="wrap" overflowX={"auto"}>
            {
              data.data.parsedJornadasStatics.map(jornada => {
                return <Box
                  h={32}
                  w="3xs"
                  m={2}
                  key={`${jornada.id}`}
                  borderRadius="md"
                  bgColor="whiteAlpha.300"
                  boxShadow={"md"}
                  color="white"
                  position="relative"
                  bgImage={mediaUrl?.concat(jornada.image)}
                  backgroundSize={"cover"}
                >
                  <Flex
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg={"blackAlpha.700"}
                    borderRadius="md"
                    display="flex"
                    justifyContent={"flex-end"}
                    py={4}
                    px={4}
                    direction="column"
                  >
                    <Text>Jornada de</Text>
                    <Heading fontSize="xl">{jornada.name}</Heading>
                  </Flex>
                </Box>
              })
            }
          </Flex>
        </Flex>
      </Fade>
    </Flex>
    <Fade in={data.data.parsedUsersWithDeclaredKnowledge.length > 0}>
      <Flex
        w="full"
        p={8}
        my={4}
        bg="blackAlpha.500"
        alignItems={"center"}
        justifyContent="space-between"
      >
        <Heading fontSize="lg">Principais candidatos com perfil declarado adequado</Heading>
        <Flex
          bg="blackAlpha.600"
          gap={6}
          alignItems="center"
          p={3}
          borderRadius="lg"
        >
          Mostrando até {data.metadata.parsedUsersWithDeclaredKnowledgeCount} resultados
          <Button bg="gray.brand" color="yellow.brand" _hover={{
            bg: 'whiteAlpha.200'
          }} onClick={onOpenDeclaredKnowledge}>Ver todos</Button>
        </Flex>
      </Flex>
      <Flex
        px={8}
        direction="row"
        gap={4}
      >
        {data.data.parsedUsersWithDeclaredKnowledge.map(user => {
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
    </Fade>
    <Fade in={data.data.parsedUsersThatFinishedJornadas.length > 0}>
      <Flex
        w="full"
        p={8}
        my={4}
        bg="blackAlpha.500"
        alignItems={"center"}
        justifyContent="space-between"
      >
        <Heading fontSize="lg">Principais candidatos que trilharam as jornadas da vaga</Heading>
        <Flex
          bg="blackAlpha.600"
          gap={6}
          alignItems="center"
          p={3}
          borderRadius="lg"
        >
          Mostrando até {data.metadata.parsedUsersThatFinishedJornadasCount} resultados
          <Button bg="gray.brand" color="yellow.brand" _hover={{
            bg: 'whiteAlpha.200'
          }} onClick={onOpenJourneyMore}>Ver todos</Button>
        </Flex>
      </Flex>
      <Flex
        px={8}
        direction="row"
        gap={4}
        wrap="wrap"
      >
        {data.data.parsedUsersThatFinishedJornadas.map(user => {
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
    </Fade>
    <ModalMore
      isOpen={isOpenDeclaredKnowledge}
      onClose={onCloseDeclaredKnowledge}
      title={"Candidatos com perfil declarado adequado"}
      fetchData={() => fetchDataAndSelect({
        property: "parsedUsersWithDeclaredKnowledge"
      })}
      renderRow={(d: IData["data"]["parsedUsersWithDeclaredKnowledge"][number]) => {
        return <Tr>
          <Td>{d.name}</Td>
          <Td>{d.email}</Td>
          <Td>{d.knowledgeCount}</Td>
          <Td>{d.percJornadasFinished}%</Td>
        </Tr>
      }}
      columns={[
        {
          title: 'Nome'
        },
        {
          title: 'Email'
        },
        {
          title: 'Conhecimentos'
        },
        {
          title: 'P.J.C'
        }
      ]}
    />
    <ModalMore
      isOpen={isOpenJourneyMore}
      onClose={onCloseJourneyMore}
      title={"Candidatos que trilharam as jornadas da vaga"}
      fetchData={() => fetchDataAndSelect({
        property: "parsedUsersThatFinishedJornadas"
      })}
      renderRow={(d: IData["data"]["parsedUsersThatFinishedJornadas"][number]) => {
        return <Tr>
          <Td>{d.name}</Td>
          <Td>{d.email}</Td>
          <Td>{d.percJornadasFinished}%</Td>
        </Tr>
      }}
      columns={[
        {
          title: 'Nome'
        },
        {
          title: 'Email'
        },
        {
          title: 'P.J.C'
        }
      ]}
    />
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
      alignSelf="stretch"
      w="3xs"
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

function ModalMore({
  isOpen,
  onClose,
  title,
  columns,
  fetchData,
  renderRow,
}: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  columns: {
    title: string;
    isNumeric?: boolean;
  }[],
  fetchData: () => Promise<any[]>;
  renderRow: (d: any) => React.ReactElement
}) {

  const id = useId();

  const [data, setData] = useState<Awaited<ReturnType<typeof fetchData>>>([] as Awaited<ReturnType<typeof fetchData>>);

  useEffect(() => {
    async function exec() {
      const result = await fetchData();
      setData(result);
    }
    if (isOpen) {
      exec();
    }
  }, [isOpen, fetchData])

  const rows = useMemo(() => {
    return data.map((d, i) => <Fragment key={`${id}-${i}`}>
      {renderRow(d)}
    </Fragment>)
  }, [data, id, renderRow]);

  return <>
    <Modal isOpen={isOpen} onClose={onClose} size={'4xl'}>
      <ModalOverlay />
      <ModalContent bg="gray.brand" >
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TableContainer>
            <Table variant='simple'>
              <Thead>
                <Tr>
                  {columns.map(column => {
                    return <Th color="yellow.brand" key={column.title} isNumeric={column.isNumeric}>{column.title}</Th>
                  })}
                </Tr>
              </Thead>
              <Tbody>
                {rows}
              </Tbody>
            </Table>
          </TableContainer>
        </ModalBody>
      </ModalContent>
    </Modal>
  </>

}