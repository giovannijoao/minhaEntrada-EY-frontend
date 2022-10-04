import { Box, Button, Flex, Heading, Image, Link, useToast } from "@chakra-ui/react";
import { JornadaSubscription } from "@prisma/client";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { mediaUrl } from "../../config";
import { withAuthSsr } from "../../lib/withAuth";
import { getAllJornadaSubscriptionsForUser } from "../../prisma/jornadasSubscription";
import prisma from "../../prisma/prisma";
import cmsClient from "../../services/cmsClient";
import { IJornada, IJornadasAll } from "../../types/CMS/Jornada";
import { IPerfilUsuarioFindOne } from "../../types/CMS/PerfilUsuario";
import { ErrorMessagesToast } from "../../utils/constants/ErrorMessagesToast";

type ISubscriptionWithJornada = JornadaSubscription & {
  jornada: IJornada;
}

export const getServerSideProps = withAuthSsr(async (context: GetServerSidePropsContext) => {
  const { req } = context;
  const user = await prisma.user.findUnique({
    where: {
      id: req.session.user.id
    }
  })

  const selectedProfile = user?.selectedProfile;

  const perfil = await cmsClient.get<IPerfilUsuarioFindOne>(`/perfil-usuarios/${selectedProfile}`, {
    params: {
      populate: 'jornadas'
    }
  })

  const [responseJornadas, subscriptions] = await Promise.all([
    cmsClient.get<IJornadasAll>('jornadas', {
      params: {
        populate: 'image',
        "filters[id][$in]": perfil.data.data.attributes.jornadas.data.map(jornada => jornada.id)
      }
    }),
    getAllJornadaSubscriptionsForUser({
      userId: req.session.user.id
    }),
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
      perfil: perfil.data,
    },
  };
})

export default function StartPage({
  jornadas,
  subscriptions,
  perfil,
}: {
  jornadas: IJornadasAll,
  subscriptions: ISubscriptionWithJornada[]
  perfil: IPerfilUsuarioFindOne
}) {
  const [jornadasState, setJornadasState] = useState<IJornadasAll>(jornadas);
  const toast = useToast();
  const router = useRouter()

  const changeSubmitting = useCallback(async (jornada: IJornada) => {
    jornada.isSubmitting = !jornada.isSubmitting
    setJornadasState({ ...jornadasState })
  }, [jornadasState])

  const handleIngressar = useCallback(async (jornadaId: number) => {
    const jornada = jornadas.data.filter(jornada => jornada.id==jornadaId)[0];
    changeSubmitting(jornada)
    await axios.post('/api/jornadas/ingress',{
      jornadaId
    }).then(resp => {
      router.reload()
    }).catch(error => {
      changeSubmitting(jornada)
      toast({
        description: `${ErrorMessagesToast.jornada} ${jornada.attributes.name}`,
        position: "top-right",
        status: "error"
      })
    })
  }, [changeSubmitting, jornadas.data, router, toast])

  return <Flex
    direction="column"
    h="100vh"
  >
    <Flex
      h={36}
      p={8}
      justifyContent="center"
      backgroundColor="yellow.brand"
      direction="row"
    >
      <Flex direction="column" grow={2}>
        <Heading fontSize="2xl" fontWeight={"light"} color="gray.brand">Bem vindo!</Heading>
        <Heading fontSize="3xl" fontWeight={"bold"} color="gray.brand">Vamos estudar?</Heading>
      </Flex>
      { perfil && <Flex direction="column" grow={1} alignItems="flex-end">
        <Heading fontSize="2xl" fontWeight={"light"} color="gray.brand">Seu Perfil:</Heading>
        <Heading fontSize="3xl" fontWeight={"bold"} color="gray.brand">{perfil.data.attributes.name}</Heading>
      </Flex>}
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
              {subscription.jornada.attributes.image?.data?.attributes.formats.small.url && <Image
                w={"100%"}
                h={36}
                src={mediaUrl?.concat(subscription.jornada.attributes.image.data.attributes.formats.small.url)}
                fit={"cover"}
                borderRadius="md"
                aria-label={subscription.jornada.attributes.image.data.attributes.caption} />}
              <Link href={`/jornadas/${subscription.jornada.id}`}><Heading mt={2} fontSize="xl">{subscription.jornada.attributes.name}</Heading></Link>
            </Box>
          })
        }
      </Flex>
    </Flex>}
    {jornadasState.data.length > 0 && <Flex
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
          jornadasState.data.map(jornada => {
            return <Box
              w="2xs"
              key={jornada.id.toString().concat('-jornada')}
              borderRadius="md"
              bgColor="whiteAlpha.300"
              boxShadow={"md"}
              color="white"
              p={4}
            >
              {jornada.attributes.image?.data?.attributes.formats.small.url  && <Image
                w={"100%"}
                h={36}
                src={mediaUrl?.concat(jornada.attributes.image.data.attributes.formats.small.url)}
                fit={"cover"}
                borderRadius="md"
                aria-label={jornada.attributes.image?.data.attributes.caption} />}
              <Flex direction={"column"} gap={2}>
                <Link href={`/jornadas/${jornada.id}`}><Heading mt={2} fontSize="xl">{jornada.attributes.name}</Heading></Link>
                <Button size="xs" bg="yellow.brand" color='gray.brand' isLoading={jornada.isSubmitting} onClick={() => handleIngressar(jornada.id)}>Ingressar</Button>
              </Flex>
            </Box>
          })
        }
      </Flex>
    </Flex>}
  </Flex>
}