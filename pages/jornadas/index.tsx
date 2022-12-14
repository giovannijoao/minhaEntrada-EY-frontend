import { Box, Button, Flex, Heading, HStack, Image, Link, Text, useToast, VStack } from "@chakra-ui/react";
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
import { IVaga } from "../../types/CMS/Vaga";
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

  const subscriptions = await getAllJornadaSubscriptionsForUser({
    userId: req.session.user.id
  })

  const perfil = await cmsClient.get<IPerfilUsuarioFindOne>(`/perfil-usuarios/${selectedProfile}`, {
    params: {
      populate: 'jornadas'
    }
  })

  const jornadasSubscription = subscriptions.map(x => x.jornadaId);
  const [responseJornadasPerfil, responseJornadasOthersPerfil] = await Promise.all([
    cmsClient.get<IJornadasAll>('jornadas', {
      params: {
        populate: ['image', 'trilhas', 'vagas'],
        "filters[id][$in]": Array.from(new Set([...perfil.data.data.attributes.jornadas.data.map(jornada => jornada.id), ...jornadasSubscription])),
      }
    }),
    cmsClient.get<IJornadasAll>('jornadas', {
      params: {
        populate: ['image', 'trilhas', 'vagas', 'perfil_usuarios'],
        "filters[id][$notIn]": Array.from(new Set([...perfil.data.data.attributes.jornadas.data.map(jornada => jornada.id), ...jornadasSubscription])),
      }
    }),
  ])


  const parsedSubscription = subscriptions.map(subscription => {
    const { created_at, updated_at, ...restSub } = subscription;
    const jornada = responseJornadasPerfil.data.data.find(x => x.id === subscription.jornadaId) as IJornada;
    return {
      ...restSub,
      jornada,
    }
  })

  responseJornadasPerfil.data.data = responseJornadasPerfil.data.data.filter(x =>
    !jornadasSubscription.includes(x.id) &&
    x.attributes.trilhas && x.attributes.trilhas.data.length > 0
  )

  return {
    props: {
      jornadasPerfil: responseJornadasPerfil.data,
      othersJornadas: responseJornadasOthersPerfil.data,
      subscriptions: parsedSubscription,
      perfil: perfil.data,
    },
  };
})

export default function StartPage({
  jornadasPerfil,
  othersJornadas,
  subscriptions,
  perfil,
}: {
  jornadasPerfil: IJornadasAll,
  othersJornadas: IJornadasAll,
  subscriptions: ISubscriptionWithJornada[]
  perfil: IPerfilUsuarioFindOne
}) {
  const [jornadasState, setJornadasState] = useState<IJornadasAll>(jornadasPerfil);
  const [otherJornadasState, setOtherJornadasState] = useState<IJornadasAll>(othersJornadas);
  const toast = useToast();
  const router = useRouter()

  const changeSubmitting = useCallback(async (jornada: IJornada) => {
    jornada.isSubmitting = !jornada.isSubmitting
    setJornadasState({ ...jornadasState })
  }, [jornadasState])

  const handleIngressar = useCallback(async (jornadaId: number) => {
    const jornada = jornadasPerfil.data.filter(jornada => jornada.id == jornadaId)[0];
    changeSubmitting(jornada)
    await axios.post('/api/jornadas/ingress', {
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
  }, [changeSubmitting, jornadasPerfil.data, router, toast])

  const vagasIds = Array.from(new Set(jornadasPerfil.data
    .filter(jornada => jornada.attributes.vagas && jornada.attributes.vagas?.data.length > 0)
    .flatMap(jornada => jornada.attributes.vagas?.data.map(vaga => vaga.id))))

  const vagas = vagasIds.map(vagaId => jornadasPerfil.data.flatMap(jornada => jornada.attributes.vagas?.data).find(v => v?.id === vagaId));

  return <Flex
    direction="column"
    h="100vh"
  >
    <Flex
      p={8}
      justifyContent="center"
      backgroundColor="yellow.brand"
      direction="row"
    >
      <HStack w="full">
        <VStack w="full" alignItems={"flex-start"}>
          <Heading fontSize="2xl" fontWeight={"light"} color="gray.brand">Bem vindo!</Heading>
          <Heading fontSize="3xl" fontWeight={"bold"} color="gray.brand">Vamos estudar?</Heading>
          {perfil && <Flex
            direction="row"
            alignItems="center"
            gap={2}
            p={4}
            bg="gray.brand"
            w="fit-content"
            borderRadius="lg"
            mt={2}
          >
            <Heading fontSize="md" fontWeight={"light"} color="yellow.brand">Seu Perfil:</Heading>
            <Heading fontSize="lg" color="yellow.brand">{perfil.data.attributes.name}</Heading>
          </Flex>}
        </VStack>
        <Image
          aria-label="??rea de jornadas"
          src="undraw_projections_re_ulc6.svg"
          h={36}
        />
      </HStack>
    </Flex>
    {vagas.length > 0 && <Flex
      direction="row"
      mx={8}
      mt={4}
      gap={4}
      alignItems="center"
      border="1px"
      borderColor="yellow.brand"
      p={4}
      borderRadius="md"
    >
      <Heading fontSize={"xl"}>Vagas recomendas</Heading>
      <Flex
        gap={4}
        wrap={"wrap"}
        direction={{
          base: 'column',
          md: 'row'
        }}
      >
        {vagas
          .map((x) => {
            const vaga = x as unknown as IVaga;
            return <Link
              variant='card-hover'
              key={vaga.id}
              bg="yellow.brand"
              color="gray.brand"
              p={4}
              borderRadius="md"
              _hover={{
                transition: "0.2s",
                filter: "opacity(95%)",
                boxShadow: "1px 3px 5px 2px black"
              }}
              href={`/vagas/${vaga.id}`}
            >
              {vaga.attributes.name}
            </Link>
          })
        }
      </Flex>
    </Flex>}
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
            return <Link
              href={`/jornadas/${subscription.jornada.id}`}
              variant='card-hover'
              style={{ textDecoration: 'none' }}
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
              <Heading mt={2} fontSize="xl">{subscription.jornada.attributes.name}</Heading>
            </Link>
          })
        }
      </Flex>
    </Flex>}
    {jornadasState.data.length === 0 && subscriptions.length === 0 && <>
      <Flex
        direction="column"
        p={8}
        gap={4}
        w="lg"
        border="1px"
        borderColor="yellow.brand"
        m={8}
      >
        <Heading>Parece que n??o h?? nenhuma jornada dispon??vel no momento...</Heading>
        <Text>Vamos avis??-lo quando uma nova jornada estiver dispon??vel</Text>
      </Flex>
    </>}
    {jornadasState.data.length > 0 && <Flex
      direction="column"
      p={8}
      gap={4}
    >
      <VStack alignItems="flex-start" spacing={0.1}>
        <Heading>Jornadas recomendadas</Heading>
        <Text fontWeight={"light"} fontStyle="italic">Com base em seu perfil</Text>
      </VStack>

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
              {jornada.attributes.image?.data?.attributes.formats.small.url && <Image
                w={"100%"}
                h={36}
                src={mediaUrl?.concat(jornada.attributes.image.data.attributes.formats.small.url)}
                fit={"cover"}
                borderRadius="md"
                aria-label={jornada.attributes.image?.data.attributes.caption} />}
              <Flex direction={"column"} gap={2}>
                <Link
                  href={`/jornadas/${jornada.id}`}
                  _hover={{
                    filter: "opacity(80%)",
                    boxShadow: 'lg'
                  }}
                ><Heading mt={2} fontSize="xl">{jornada.attributes.name}</Heading></Link>
                <Button
                  size="xs"
                  bg="yellow.brand"
                  color='gray.brand'
                  isLoading={jornada.isSubmitting}
                  onClick={() => handleIngressar(jornada.id)}
                  _hover={{
                    filter: "opacity(80%)",
                    boxShadow: 'lg'
                  }}
                >Ingressar</Button>
              </Flex>
            </Box>
          })
        }
      </Flex>
    </Flex>}
    {otherJornadasState.data.length > 0 && <Flex
      direction="column"
      p={8}
      gap={4}
    >
      <VStack alignItems="flex-start" spacing={0.1}>
        <Heading>Jornadas de outros perfis</Heading>
        <Text fontWeight={"light"} fontStyle="italic">Entre nas jornadas para conhecer mais sobre</Text>
      </VStack>

      <Flex
        gap={4}
        wrap={"wrap"}
        direction={{
          base: 'column',
          md: 'row'
        }}
      >
        {
          otherJornadasState.data.map(jornada => {
            return <Box
              w="2xs"
              key={jornada.id.toString().concat('-jornada')}
              borderRadius="md"
              bgColor="whiteAlpha.300"
              boxShadow={"md"}
              color="white"
              p={4}
            >
              {jornada.attributes.image?.data?.attributes.formats.small.url && <Image
                w={"100%"}
                h={36}
                src={mediaUrl?.concat(jornada.attributes.image.data.attributes.formats.small.url)}
                fit={"cover"}
                borderRadius="md"
                aria-label={jornada.attributes.image?.data.attributes.caption} />}
              <Flex direction={"column"} gap={2}>
                <Link
                  href={`/jornadas/${jornada.id}`}
                  _hover={{
                    filter: "opacity(80%)",
                    boxShadow: 'lg'
                  }}
                ><Heading mt={2} fontSize="xl">{jornada.attributes.name}</Heading></Link>
              </Flex>
            </Box>
          })
        }
      </Flex>
    </Flex>}
  </Flex>
}