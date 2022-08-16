import { Box, Center, Flex, Heading, Image, Link } from "@chakra-ui/react";
import { JornadaSubscription } from "@prisma/client";
import { withIronSessionSsr } from "iron-session/next";
import { mediaUrl } from "../../config";
import { sessionOptions } from "../../lib/session";
import { getJornadaSubscription } from "../../prisma/jornadasSubscription";
import cmsClient from "../../services/cmsClient";
import { IJornadaFindOne, IJornadasAll } from "../../types/Jornada";
import { ITrilhasAll } from "../../types/Trilha";

export const getServerSideProps = withIronSessionSsr(async ({
  req,
  res,
  params,
}) => {
  if (!req.session.user || !req.session.user.isLoggedIn){
    return {
      redirect: {
        statusCode: 302,
        destination: '/login'
      }
    }
  }
  const id = params?.jornadaId;
  const [responseJornadas, responseTrilhas, subscription] = await Promise.all([
    cmsClient.get<IJornadaFindOne>(`jornadas/${id}`, {
      params: {
        populate: 'image'
      }
    }),
    cmsClient.get<ITrilhasAll>(`trilhas`, {
      params: {
        'filters[jornadas][id][$eq]': id
      }
    }),
    getJornadaSubscription({
      jornadaId: Number(id),
      userId: req.session.user.id,
    })
  ])
  return {
    props: {
      jornada: responseJornadas.data,
      trilhas: responseTrilhas.data,
      subscription,
    },
  };
}, sessionOptions)

export default function StartPage({
  jornada,
  trilhas,
  subscription,
}: {
  jornada: IJornadaFindOne,
  trilhas: ITrilhasAll,
  subscription: JornadaSubscription
}) {
  return <Flex
    direction="column"
    h="100vh"
  >
    <Flex
      h={24}
      p={8}
      alignItems='center'
    >
      <Heading color="white">minhaEntrada EY</Heading>
    </Flex>
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
      <Heading>Suas trilhas para desenvolvimento</Heading>
      <Flex
        gap={4}
        wrap={"wrap"}
        justifyContent="flex-start"
      >
        {
          trilhas.data.map(trilha => {
            return <Center
              key={trilha.id.toString().concat('-trilha')}
              bg={trilha.attributes.color || 'yellow.brand'}
              borderRadius="md"
              color="gray.brand"
              p={8}
            >
              <Link href={`/jornadas/s/${subscription.id}/trilhas/${trilha.id}`}>
                <Heading mt={2} fontSize="xl">{trilha.attributes.name}</Heading>
              </Link>
            </Center>
          })
        }
      </Flex>
    </Flex>
  </Flex>
}