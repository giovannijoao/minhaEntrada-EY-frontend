import { Button, Flex, Heading, IconButton, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Stat, StatGroup, StatLabel, StatNumber, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useDisclosure } from "@chakra-ui/react";
import { TrilhaSubscription } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { withAuthSsr } from "../../../lib/withAuth";
import { getTrilhasStaticsIsFinished } from "../../../prisma/trilhasSubscription";
import cmsClient from "../../../services/cmsClient";
import { IJornadaFindOne } from "../../../types/CMS/Jornada";
import { ITrilha, ITrilhasAll } from "../../../types/CMS/Trilha";
import { IoIosPeople } from 'react-icons/io'
import axios from "axios";
import { ChevronLeftIcon, SearchIcon } from "@chakra-ui/icons";
import { getJornadasStaticsIsFinished } from "../../../prisma/jornadasSubscription";

export const getServerSideProps = withAuthSsr(async ({
  req,
  res,
  params,
}: GetServerSidePropsContext) => {
  const id = params?.jornadaId;
  const [responseJornadas, responseTrilhas] = await Promise.all([
    cmsClient.get<IJornadaFindOne>(`jornadas/${id}`, {
      params: {
        populate: 'image'
      }
    }),
    cmsClient.get<ITrilhasAll>(`trilhas`, {
      params: {
        'filters[jornadas][id][$eq]': id
      }
    })
  ])

  const [trilhaStatics, jornadaStatics] = await Promise.all([
    getTrilhasStaticsIsFinished(),
    getJornadasStaticsIsFinished()
  ]);

  return {
    props: {
      role: req.session.role,
      jornada: responseJornadas.data,
      trilhas: responseTrilhas.data,
      trilhaStatics,
      jornadaStatics,
    } as IProps,
  };
}, 'admin');

type IProps = {
  jornada: IJornadaFindOne,
  trilhas: ITrilhasAll,
  trilhaStatics: {
    isFinished: boolean;
    trilhaId: number;
    _avg: {
      finalGrade: number | null;
    };
    _count: {
      _all: number;
    };
  }[]
  jornadaStatics: {
    isFinished: boolean;
    jornadaId: number;
    _count: {
      _all: number;
    };
  }[]
}


export default function StartPage({
  jornada,
  trilhas,
  trilhaStatics,
  jornadaStatics,
}: IProps) {
  const router = useRouter();
  const [selectedTrilhaId, setSelectedTrilhaId] = useState<number>();
  const { isOpen, onOpen, onClose } = useDisclosure()

  const trilha = useMemo(() => trilhas.data.find(x => x.id === selectedTrilhaId), [selectedTrilhaId, trilhas.data]);

  return <>
    <Flex
      direction="column"
      h="100vh"
    >
      <Flex
        h={36}
        p={8}
        gap={6}
        alignItems="center"
        backgroundColor="yellow.brand"
        direction="row"
      >
        <IconButton fontSize="2xl" color={"gray.brand"} onClick={router.back} icon={<ChevronLeftIcon />} aria-label="Voltar" />
        <Flex direction="column">
          <Heading fontSize="2xl" fontWeight={"light"} color="gray.brand">Jornada de</Heading>
          <Heading fontSize="3xl" fontWeight={"bold"} color="gray.brand">
            {jornada.data.attributes.name}
          </Heading>
        </Flex>
      </Flex>
      <Flex
        direction="column"
        my={4}
        mx={8}
        p={8}
        gap={4}
        w="sm"
        border="2px"
        borderColor={"yellow.brand"}
        boxShadow="md"
        borderRadius="md"
      >
        <Heading mt={2} fontSize="xl">Jornada</Heading>
        <StatGroup gap={6}>
          <Stat>
            <StatLabel>Cursando</StatLabel>
            <StatNumber>
              {jornadaStatics.find(x => !x.isFinished && x.jornadaId === jornada.data.id)?._count._all || 0}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Concluído</StatLabel>
            <StatNumber>{jornadaStatics.find(x => x.isFinished && x.jornadaId === jornada.data.id)?._count._all || 0}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Abandono</StatLabel>
            <StatNumber>0</StatNumber>
          </Stat>
        </StatGroup>
      </Flex>
      <Flex
        direction="column"
        p={8}
        gap={4}
      >
        <Flex
          gap={4}
          wrap={"wrap"}
          justifyContent="flex-start"
        >
          {
            trilhas.data.map(trilha => {
              return <Flex
                direction="column"
                key={trilha.id.toString().concat('-trilha')}
                bg={trilha.attributes.color || 'yellow.brand'}
                borderRadius="md"
                color="gray.brand"
                alignItems="flex-start"
                p={8}
                gap={4}
              >
                <Heading mt={2} fontSize="xl">{trilha.attributes.name}</Heading>
                <StatGroup gap={6}>
                  <Stat>
                    <StatLabel>Cursando</StatLabel>
                    <StatNumber>
                      {trilhaStatics.find(x => !x.isFinished && x.trilhaId === trilha.id)?._count._all || 0}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Concluído</StatLabel>
                    <StatNumber>{trilhaStatics.find(x => x.isFinished && x.trilhaId === trilha.id)?._count._all || 0}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Abandono</StatLabel>
                    <StatNumber>0</StatNumber>
                  </Stat>
                </StatGroup>
                <Flex w={'100%'} justifyContent={"end"}>
                  <IconButton variant="default" color={'gray.brand'} icon={<IoIosPeople />} aria-label="Ver pessoas" size="lg" onClick={() => {
                    setSelectedTrilhaId(trilha.id)
                    onOpen()
                  }}  />
                </Flex>      
              </Flex>
            })
          }
        </Flex>
      </Flex>
    </Flex>
    <ModalTable isOpen={isOpen} onClose={onClose} trilha={trilha} />
  </>
}

export const ModalTable = ({
  isOpen,
  onClose,
  trilha,
}: {
  isOpen: boolean;
  onClose: () => void;
  trilha?: ITrilha
}) => {

  const [search, setSearch] = useState('');

  const [subscriptions, setSubscriptions] = useState<{
    id: string;
    finalGrade: number;
    isFinished: boolean;
    jornadaSubscription: {
      user: {
        id: string,
        email: string,
        firstName: string,
        lastName: string,
      }
    }
  }[]>([]);

  useEffect(() => {
    async function exec() {
      const response = await axios.get('/api/admin/trilhas-info', {
        params: {
          trilhaId: trilha?.id,
          search,
        }
      });
      console.log(response.data)
      setSubscriptions(response.data)
    }
    let timeout: any;
    if (isOpen && trilha?.id) {
      timeout = setTimeout(exec, 500);
    }
    return () => clearTimeout(timeout);
  }, [isOpen, search, trilha?.id])


    if (!trilha) return <></>;
  return <Modal isOpen={isOpen} onClose={onClose} size={'4xl'}>
    <ModalOverlay />
    <ModalContent bg="gray.brand" >
      <ModalHeader>Pessoas na trilha {trilha.attributes.name}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <InputGroup w="xs">
          <InputLeftElement
            pointerEvents='none'
          >
            <SearchIcon color="white" />
          </InputLeftElement>
          <Input type='text' placeholder='Nome ou e-mail' onChange={e => setSearch(e.target.value)} value={search} />
        </InputGroup>
        <TableContainer>
          <Table variant='simple'>
            <Thead >
              <Tr>
                <Th color="yellow.brand">Nome</Th>
                <Th color="yellow.brand">Email</Th>
                <Th color="yellow.brand">Finalizado</Th>
                <Th color="yellow.brand" isNumeric>Nota</Th>
              </Tr>
            </Thead>
            <Tbody>
              {subscriptions.map(subscription => {
                return <Tr
                  key={subscription.id}
                >
                  <Td>{subscription.jornadaSubscription.user.firstName} {subscription.jornadaSubscription.user.lastName}</Td>
                  <Td>{subscription.jornadaSubscription.user.email}</Td>
                  <Td>{subscription.isFinished ? 'Sim' : 'Não'}</Td>
                  <Td isNumeric>{subscription.finalGrade}</Td>
                </Tr>
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </ModalBody>
    </ModalContent>
  </Modal>
}