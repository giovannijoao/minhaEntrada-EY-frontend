import { Box, Button, Flex, Heading, Image, Link } from "@chakra-ui/react";
import { JornadaSubscription } from "@prisma/client";
import axios from "axios";
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { mediaUrl } from "../../config";
import { sessionOptions } from "../../lib/session";
import { getAllJornadaSubscriptionsForUser } from "../../prisma/jornadasSubscription";
import cmsClient from "../../services/cmsClient";
import { IJornada, IJornadasAll } from "../../types/CMS/Jornada";

type ISubscriptionWithJornada = JornadaSubscription & {
  jornada: IJornada;
}

export const getServerSideProps = withIronSessionSsr(async ({
  req,
  res,
}) => {
  if (!req.session.user || !req.session.user.isLoggedIn) {
    return {
      redirect: {
        destination: '/login',
        statusCode: 302,
      }
    }
  }
  const [responseJornadas, subscriptions] = await Promise.all([
    cmsClient.get<IJornadasAll>('jornadas', {
      params: {
        populate: 'image'
      }
    }),
    getAllJornadaSubscriptionsForUser({
      userId: req.session.user.id
    })
  ])

  const jornadasSubscription = subscriptions.map(x => x.jornadaId);

  const parsedSubscription = subscriptions.map(subscription => {
    const { created_at, updated_at, ...restSub } = subscription;
    const jornada = responseJornadas.data.data.find(x => x.id === subscription.jornadaId) as IJornada;
    return {
      ...restSub,
      jornada,
    }
  })

  responseJornadas.data.data = responseJornadas.data.data.filter(x => !jornadasSubscription.includes(x.id))

  return {
    props: {
      jornadas: responseJornadas.data,
      subscriptions: parsedSubscription,
    },
  };
}, sessionOptions)

export default function StartPage({
  jornadas,
  subscriptions,
}: {
  jornadas: IJornadasAll,
  subscriptions: ISubscriptionWithJornada[]
}) {

  const router = useRouter()

  const handleIngressar = useCallback(async (jornadaId: number) => {
    await axios.post('/api/jornadas/ingress',{
      jornadaId
    });
    router.reload()
  }, [router])

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
      <Heading fontSize="2xl" fontWeight={"light"} color="gray.brand">Bem vindo!</Heading>
      <Heading fontSize="3xl" fontWeight={"bold"} color="gray.brand">Vamos estudar?</Heading>
    </Flex>
    {subscriptions.length > 0 && <Flex
      direction="column"
      p={8}
      gap={4}
    >
      <Heading>Jornadas em Desenvolvimento</Heading>
      <Flex
        gap={4}
        wrap={"wrap"}
        direction={{
          base: 'column',
          md: 'row'
        }}
      >
        {
          subscriptions.map(subscription => {
            return <Box
              w="2xs"
              key={subscription.id.toString().concat('-sub')}
              borderRadius="md"
              bgColor="whiteAlpha.300"
              boxShadow={"md"}
              color="white"
              p={4}
            >
              <Image
                w={"100%"}
                h={36}
                src={mediaUrl?.concat(subscription.jornada.attributes.image.data.attributes.formats.small.url)}
                fit={"cover"}
                borderRadius="md"
                aria-label={subscription.jornada.attributes.image.data.attributes.caption} />
              <Link href={`/jornadas/${subscription.jornada.id}`}><Heading mt={2} fontSize="xl">{subscription.jornada.attributes.name}</Heading></Link>
            </Box>
          })
        }
      </Flex>
    </Flex>}
    {jornadas.data.length > 0 && <Flex
      direction="column"
      p={8}
      gap={4}
    >
      <Heading>Todas as jornadas</Heading>
      <Flex
        gap={4}
        wrap={"wrap"}
        direction={{
          base: 'column',
          md: 'row'
        }}
      >
        {
          jornadas.data.map(jornada => {
            return <Box
              w="2xs"
              key={jornada.id.toString().concat('-jornada')}
              borderRadius="md"
              bgColor="whiteAlpha.300"
              boxShadow={"md"}
              color="white"
              p={4}
            >
              <Image
                w={"100%"}
                h={36}
                src={mediaUrl?.concat(jornada.attributes.image.data.attributes.formats.small.url)}
                fit={"cover"}
                borderRadius="md"
                aria-label={jornada.attributes.image.data.attributes.caption} />
              <Flex direction={"column"} gap={2}>
                <Link href={`/jornadas/${jornada.id}`}><Heading mt={2} fontSize="xl">{jornada.attributes.name}</Heading></Link>
                <Button size="xs" bg="yellow.brand" color='gray.brand' onClick={() => handleIngressar(jornada.id)}>Ingressar</Button>
              </Flex>
            </Box>
          })
        }
      </Flex>
    </Flex>}
  </Flex>
}