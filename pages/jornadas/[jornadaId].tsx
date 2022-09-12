import { CheckCircleIcon } from "@chakra-ui/icons";
import { Button, Center, Flex, Heading, Link, Text, Toast, useToast } from "@chakra-ui/react";
import { JornadaSubscription } from "@prisma/client";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { withAuthSsr } from "../../lib/withAuth";
import { getJornadaSubscription } from "../../prisma/jornadasSubscription";
import { getTrilhasSubscriptionForJornada } from "../../prisma/trilhasSubscription";
import cmsClient from "../../services/cmsClient";
import { IJornadaFindOne } from "../../types/CMS/Jornada";
import { ITrilhasAll } from "../../types/CMS/Trilha";
import { IVagasAll } from "../../types/CMS/Vaga";
import { ErrorMessagesToast } from "../../utils/constants/ErrorMessagesToast";

type IProps = {
  jornada: IJornadaFindOne,
  trilhas: ITrilhasAll,
  subscription: JornadaSubscription
  vagas: IVagasAll
  finishedTrilhas: number[]
}

export const getServerSideProps = withAuthSsr(async ({
  req,
  res,
  params,
}: GetServerSidePropsContext) => {
  const id = params?.jornadaId;
  const subscription = await getJornadaSubscription({
    jornadaId: Number(id),
    userId: req.session.user.id,
  });

  let trilhasIds = [];
  let finishedTrilhas = []
  if (subscription) {
    const trilhasSubscription = await getTrilhasSubscriptionForJornada({
      jornadaSubscriptionId: subscription.id
    });
    trilhasIds.push(...trilhasSubscription.map(x => x.trilhaId));
    finishedTrilhas.push(...trilhasSubscription.filter(x => x.isFinished).map(x => x.trilhaId));
  }

  const [responseJornadas, responseTrilhas, vagas] = await Promise.all([
    cmsClient.get<IJornadaFindOne>(`jornadas/${id}`, {
      params: {
        populate: 'image'
      }
    }),
    cmsClient.get<ITrilhasAll>(`trilhas`, {
      params: {
        'filters[jornadas][id][$eq]': id,
        ...trilhasIds.length > 0 ? { 'filters[id][$in]': trilhasIds } : {}
      }
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
      vagas: vagas.data,
      finishedTrilhas,
    },
  };
});

export default function StartPage({
  jornada,
  trilhas,
  subscription,
  vagas,
  finishedTrilhas,
}: IProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleIngressar = useCallback(async () => {
    setIsLoading(true)
    await axios.post('/api/jornadas/ingress', {
      jornadaId: jornada.data.id
    }).then(resp => {
      router.reload()
    }).catch(error => {
      setIsLoading(false)
      toast({
        description: ErrorMessagesToast.ingressarJornada,
        status: "error",
        position: "top-right",
      })
    });
  }, [jornada.data.id, router, toast])

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
            <Button bg="yellow.brand" color="gray.brand" isLoading={isLoading} onClick={handleIngressar}>Ingressar</Button>
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
            const isFinished = finishedTrilhas.find(x => x === trilha.id);
            return <Center
              minW={32}
              h={32}
              key={trilha.id.toString().concat('-trilha')}
              bg={trilha.attributes.color || 'yellow.brand'}
              borderRadius="md"
              color="gray.brand"
              p={8}
              position="relative"

            >
              {
                isFinished && <CheckCircleIcon
                  position="absolute"
                  top={1}
                  right={1}
                  h={8}
                  w={8}
                />
              }
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