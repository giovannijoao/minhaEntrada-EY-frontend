import { ArrowForwardIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import { Button, Center, Flex, Heading, IconButton, Link, Text, useToast } from "@chakra-ui/react";
import { AulaProgress, TrilhaSubscription } from "@prisma/client";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { withAuthSsr } from "../../../lib/withAuth";
import { getAllProgresses, getAulaProgress } from "../../../prisma/aulaProgress";
import { getTrilhaSubscriptionById } from "../../../prisma/trilhasSubscription";
import cmsClient from "../../../services/cmsClient";
import { IAulaFindOne, IAulasAll } from "../../../types/CMS/Aula";
import { ErrorMessagesToast } from "../../../utils/constants/ErrorMessagesToast";

type IProps = {
  aula: IAulaFindOne
  progress: AulaProgress
  nextClasses: IAulasAll | null
  trilhaSubscription: TrilhaSubscription
}

export const getServerSideProps = withAuthSsr(async ({
  req,
  res,
  params
}: GetServerSidePropsContext) => {

  if (!req.session.user || !req.session.user.isLoggedIn) {
    return {
      redirect: {
        statusCode: 302,
        destination: '/login'
      }
    }
  }

  const {
    progressId,
  } = params as any;

  const progress = await getAulaProgress({
    userId: req.session.user.id,
    progressId
  });

  if (!progress || !progress.trilhaSubscriptionId) {
    return {
      redirect: {
        destination: '/jornadas',
        statusCode: 302
      }
    }
  }
  const trilhaSubscription = await getTrilhaSubscriptionById({
    trilhaSubscriptionId: progress.trilhaSubscriptionId
  });

  if (!trilhaSubscription) {
    return {
      redirect: {
        destination: '/jornadas',
        statusCode: 302
      }
    }
  }

  const {created_at, updated_at, ...progressRest} = progress;
  const { created_at: created_at2, updated_at: updated_at2, ...trilhaSubscriptionRest } = trilhaSubscription;

  const progresses = await getAllProgresses({
    trilhaSubscriptionId: progress.trilhaSubscriptionId,
    userId: req.session.user.id,
    isFinished: true,
  })

  const completedClasses = progresses.map(x => x.aulaId);

  const [responseAula, responseNextAula] = await Promise.all([
    cmsClient.get<IAulaFindOne>(`aulas/${progress.aulaId}`).then(res => res.data),
    cmsClient.get<IAulasAll>(`aulas`, {
      params: {
        populate: 'trilha',
        'filters[trilha][id][$eq]': trilhaSubscription.trilhaId,
        'filters[id][$notIn]': completedClasses,
        'pagination[limit]': '1'
      }
    }).then(res => res.data)
  ])

  return {
    props: {
      aula: responseAula,
      nextClasses: responseNextAula,
      progress: progressRest,
      trilhaSubscription: trilhaSubscriptionRest,
    },
  };
})

export default function Page({
  aula,
  progress,
  nextClasses,
  trilhaSubscription,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter();
  const toast = useToast();

  const nextAula = nextClasses?.data[0];

  const createProgress = useCallback(async ({
    aulaId,
  }: {
    aulaId: number;
  }) => {
    setIsLoading(true)
    await axios.post('/api/progress/create', {
      aulaId,
      isFinished: false,
      trilhaSubscriptionId: trilhaSubscription.id
    }).then(resp => {
      router.push(`/aula/${resp.data.id}`)
    }).catch(error => {
      setIsLoading(false)
      toast({
        description: ErrorMessagesToast.proximaAtividade,
        position: "top-right",
        status: "error"
      })
    })
  }, [router, trilhaSubscription.id, toast])

  return <Flex
    direction="column"
    h="100vh"
  >

    <Flex
      h={36}
      p={8}
      alignItems="center"
      backgroundColor="yellow.brand"
      direction="row"
      gap={6}
      color={"gray.brand"}
    >
      <IconButton onClick={() => router.replace(`/jornadas/s/${trilhaSubscription.jornadaSubscriptionId}/trilhas/${trilhaSubscription.trilhaId}`)} icon={<ChevronLeftIcon />} aria-label="Voltar" />
      <Flex direction="column">
        <Heading fontSize="3xl" fontWeight={"bold"}>
          {aula.data.attributes.name}
        </Heading>
        <Heading fontSize={"xl"}>
          Resultados
        </Heading>
      </Flex>
    </Flex>
    <Center flexDirection="row" p={8} gap={4}>
      <Heading fontSize="2xl">Nota</Heading>
      <Center
        h={16}
        w={16}
        rounded="full"
        color="gray.brand"
        bg="yellow.brand"
      >
        <Heading
          fontSize="4xl"
        >{progress.finalGrade}</Heading>
      </Center>
    </Center>
    <Center
      flexDirection="column"
      gap={2}
    >
      <Heading fontSize="md">Total de quest??es: {progress.totalQuestions}</Heading>
      <Heading fontSize="md">Total de acertos: {progress.totalCorrect}</Heading>
    </Center>
    {nextAula && <Center
      m="auto"
      mt={8}
      w="xs"
      flexDirection="column"
      gap={4}
      p={8}
      bgColor="yellow.brand"
      color="gray.brand"
      borderRadius="md"
      textAlign="center"
    >
      <Heading fontSize="lg">Pr??xima aula</Heading>
      <Text fontSize="md">{nextAula.attributes.name}</Text>
      <Button colorScheme="orange" isLoading={isLoading} rightIcon={<ArrowForwardIcon />} onClick={() => createProgress({
        aulaId: nextAula.id
      })}>Ir para pr??xima aula</Button>
    </Center>}
    {!nextAula && <Center
      m="auto"
      mt={8}
      w="xs"
      flexDirection="column"
      gap={4}
      p={8}
      bgColor="yellow.brand"
      color="gray.brand"
      borderRadius="md"
      textAlign="center"
    >
        <Heading fontSize="lg">Pr??xima aula</Heading>
        <Link href="/jornadas">
          <Button colorScheme="orange" isLoading={isLoading} rightIcon={<ArrowForwardIcon />}>Ir para jornadas</Button>
        </Link>
      </Center>
    }


  </Flex>
}