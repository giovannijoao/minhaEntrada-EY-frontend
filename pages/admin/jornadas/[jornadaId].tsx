import { Center, Flex, Heading, Stat, StatArrow, StatGroup, StatHelpText, StatLabel, StatNumber } from "@chakra-ui/react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { withAuthSsr } from "../../../lib/withAuth";
import prisma from "../../../prisma/prisma";
import cmsClient from "../../../services/cmsClient";
import { IJornadaFindOne } from "../../../types/CMS/Jornada";
import { ITrilhasAll } from "../../../types/CMS/Trilha";


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

  return {
    props: {
      jornada: responseJornadas.data,
      trilhas: responseTrilhas.data,
    },
  };
}, 'admin');

type IProps = {
  jornada: IJornadaFindOne,
  trilhas: ITrilhasAll,
}


export default function StartPage({
  jornada,
  trilhas,
}: IProps) {

  const router = useRouter();

  return <Flex
    direction="column"
    h="100vh"
  >

    <Flex
      h={36}
      p={8}
      justifyContent="center"
      backgroundColor="yellow.brand"
      direction="column"
    >
      <Heading fontSize="2xl" fontWeight={"light"} color="gray.brand">Jornada de</Heading>
      <Heading fontSize="3xl" fontWeight={"bold"} color="gray.brand">
        {jornada.data.attributes.name}
      </Heading>
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
                  <StatNumber>1</StatNumber>
                </Stat>

                <Stat>
                  <StatLabel>Concluído</StatLabel>
                  <StatNumber>45</StatNumber>
                </Stat>
              </StatGroup>
            </Flex>
          })
        }
      </Flex>
    </Flex>
  </Flex>
}