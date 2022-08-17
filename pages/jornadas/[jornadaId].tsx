import { Box, Button, Center, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { JornadaSubscription } from "@prisma/client";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "../../lib/session";
import { getJornadaSubscription } from "../../prisma/jornadasSubscription";
import cmsClient from "../../services/cmsClient";
import { IVagasAll } from "../../types/CMS/Vaga";
import { IJornadaFindOne } from "../../types/CMS/Jornada";
import { ITrilhasAll } from "../../types/CMS/Trilha";
import { useRouter } from "next/router";
import axios from "axios";
import { useCallback } from "react";

type IProps = {
  jornada: IJornadaFindOne,
  trilhas: ITrilhasAll,
  subscription: JornadaSubscription
  vagas: IVagasAll
}

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
  const [responseJornadas, responseTrilhas, subscription, vagas] = await Promise.all([
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
    }),
    cmsClient.get<IVagasAll>(`vagas`, {
      params: {
        'filters[jornadas][id][$eq]': id
      }
    }),
  ])

  const { created_at, updated_at, ...restSubscription } = subscription || {};
  return {
    props: {
      jornada: responseJornadas.data,
      trilhas: responseTrilhas.data,
      subscription: restSubscription,
      vagas: vagas.data
    },
  };
}, sessionOptions)

export default function StartPage({
  jornada,
  trilhas,
  subscription,
  vagas,
}: IProps) {

  const router = useRouter();

  const handleIngressar = useCallback(async () => {
    await axios.post('/api/jornadas/ingress', {
      jornadaId: jornada.data.id
    });
    router.reload()
    // TODO: Adicionar error treatment
    // TODO: Adicionar isLoading no botão de ingressar
  }, [jornada.data.id, router])

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
      <Heading>Suas trilhas para desenvolvimento</Heading>
      {
        !subscription.id && <>
          <Flex
            direction="column"
            p={8}
            bg="whiteAlpha.300"
            gap={2}
            alignItems="self-start"
            borderRadius={"md"}
            boxShadow="lg"
          >
            <Text fontWeight={"bold"}>Ingresse na jornada para entrar nas trilhas</Text>
            <Button bg="yellow.brand" color="gray.brand" onClick={handleIngressar}>Ingressar</Button>
          </Flex>
        </>
      }
      <Flex
        gap={4}
        wrap={"wrap"}
        justifyContent="flex-start"
      >
        {
          trilhas.data.map(trilha => {
            return <Center
              minW={32}
              h={32}
              key={trilha.id.toString().concat('-trilha')}
              bg={trilha.attributes.color || 'yellow.brand'}
              borderRadius="md"
              color="gray.brand"
              p={8}
            >
              {subscription.id && <Link href={`/jornadas/s/${subscription.id}/trilhas/${trilha.id}`}>
                <Heading mt={2} fontSize="xl">{trilha.attributes.name}</Heading>
              </Link>}
              {!subscription.id && <>
                <Heading mt={2} fontSize="xl">{trilha.attributes.name}</Heading>
              </>}
            </Center>
          })
        }
      </Flex>
    </Flex>
    {vagas.data.length > 0 && <Flex
      direction="column"
      p={8}
      gap={4}
    >
      <Heading>Vagas Disponíveis</Heading>
      <Flex
        gap={4}
        wrap={"wrap"}
        justifyContent="flex-start"
      >
        {vagas.data.map(vaga => {
          return <Link
            key={vaga.id.toString().concat('-vaga')}
            href={`/vagas/${vaga.id}`}
          >
            <Button
              p={4}
              bgColor='yellow.brand'
              color="gray.brand"
            >
              {vaga.attributes.name}
            </Button>
          </Link>
        })}
      </Flex>
    </Flex>}
  </Flex>
}