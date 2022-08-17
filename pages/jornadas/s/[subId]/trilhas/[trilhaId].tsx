import { ArrowForwardIcon, CheckCircleIcon, ChevronLeftIcon, TimeIcon } from "@chakra-ui/icons";
import { Badge, Box, Flex, Heading, IconButton, Link, Text } from "@chakra-ui/react";
import { AulaProgress } from "@prisma/client";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { withAuthSsr } from "../../../../../lib/withAuth";
import { getAllProgresses } from "../../../../../prisma/aulaProgress";
import { getTrilhaSubscriptionByJornada } from "../../../../../prisma/trilhas";
import cmsClient from "../../../../../services/cmsClient";
import { ITrilhaFindOne } from "../../../../../types/CMS/Trilha";


const FINAL_GRADE_GTE = 7;

export const getServerSideProps = withAuthSsr(async ({
  req,
  res,
  params
}: GetServerSidePropsContext) => {

  const {
    subId: jornadaSubscriptionId,
    trilhaId,
  } = params as any;

  const trilhaSubscription = await getTrilhaSubscriptionByJornada({
    jornadaSubscriptionId,
    trilhaId: Number(trilhaId)
  });

  if (!trilhaSubscription) {
    return {
      redirect: {
        destination: '/jornadas',
        statusCode: 302,
      }
    }
  }

  const [responseTrilha, progress] = await Promise.all([
    cmsClient.get<ITrilhaFindOne>(`trilhas/${trilhaId}`, {
      params: {
        populate: 'aulas.atividade',
        'filters[aulas][id][$in]': trilhaSubscription?.classesIds
      }
    }),
    getAllProgresses({
      userId: req.session.user.id,
      trilhaSubscriptionId: trilhaSubscription?.id,
    }).then(res => {
      return res.map(x => {
        return {
          ...x,
          created_at: null,
          updated_at: null
        }
      })
    }),
    // getGrade({
    //   userId: req.session.user.id,
    //   jornadaSubscriptionId,
    //   trilhaId: Number(trilhaId),
    // })
  ])
  const finishedClasses = trilhaSubscription.finishedClasses;
  const hasFinishedClasses = trilhaSubscription.classesIds.length === trilhaSubscription.finishedClasses.length;
  const hasFinishedCourse = hasFinishedClasses && (trilhaSubscription.finalGrade || 0) >= FINAL_GRADE_GTE;
  return {
    props: {
      trilha: responseTrilha.data,
      progress,
      jornadaSubscriptionId,
      trilhaSubscriptionId: trilhaSubscription.id,
      finishedClasses: trilhaSubscription.finishedClasses,
      hasFinishedCourse: hasFinishedCourse,
      hasFinishedClasses: hasFinishedClasses,
      finalGrade: trilhaSubscription.finalGrade || 0
    },
  };
})


type IProps = {
  trilha: ITrilhaFindOne,
  progress: AulaProgress[],
  jornadaSubscriptionId: string,
  trilhaSubscriptionId: string,
  finishedClasses: number[]
  hasFinishedCourse: boolean
  hasFinishedClasses: boolean
  finalGrade: number
}

export default function TrilhaPage({
  trilha,
  progress,
  trilhaSubscriptionId,
  finishedClasses,
  hasFinishedCourse,
  hasFinishedClasses,
  finalGrade,
}: IProps) {
  const router = useRouter();

  const createProgress = useCallback(async ({
    aulaId,
  }: {
    aulaId: number;
  }) => {
    const response = await axios.post('/api/progress/create', {
      aulaId,
      isClassFinished: false,
      trilhaSubscriptionId,
      trilhaId: trilha.data.id,
    })
    router.push(`/aula/${response.data.id}`)
    // TODO: Adicionar error treatment
    // TODO: Adicionar isLoading no botão de ingressar
  }, [router, trilha.data.id, trilhaSubscriptionId])

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
    >
      <IconButton onClick={router.back} color={"gray.brand"} icon={<ChevronLeftIcon />} aria-label="Voltar" />
      <Heading fontSize="3xl" fontWeight={"bold"} color="gray.brand">
        {trilha.data.attributes.name}
      </Heading>
    </Flex>
    <Flex
      direction="row"
      p={8}
      gap={16}
      alignItems="flex-start"
    >
      <Flex direction="column" gap={4} flex={1}>
        <Flex
          p={8}
          alignItems="center"
          direction="column"
          gap={2}
          bg={"linear-gradient(90deg, #C84E89 0%, #F15F79 100%);"}
          borderRadius="lg"
          flex={1}
        >
          <Heading fontSize="xl">Meu progresso</Heading>
          <Heading fontSize="4xl">{`${finishedClasses.length || 0} / ${trilha.data.attributes.aulas?.data.length}`}</Heading>
        </Flex>
        {(hasFinishedCourse || hasFinishedClasses) && <Box
          bg='yellow.brand'
          borderRadius="md"
          p={4}
          boxShadow="md"
          flex={1}
          textAlign="center"
          color='gray.brand'
        >
          {hasFinishedCourse && <>
            <Text fontSize="lg" fontWeight="bold">Parabéns!</Text>
            <Text>Você finalizou o curso</Text>
            <Badge>Nota: {finalGrade}</Badge>
          </>}
          {hasFinishedClasses && !hasFinishedCourse && <>
            <Text fontSize="lg" fontWeight="bold">Quase lá!</Text>
            <Text>Sua nota geral atualmente é de {finalGrade} e você precisa de {FINAL_GRADE_GTE} para finalizar o curso. Refaça as atividades.</Text>
          </>}
        </Box>}
      </Flex>
      <Flex direction="column" flex={2}>
        <Heading>Aulas</Heading>
        <Flex
          direction="column"
          gap={2}
          flex={1}
        >
          {
            trilha.data.attributes.aulas?.data.map(aula => {
              const p = progress?.find(p => p.aulaId === aula.id);
              const Icon = (p?.hasActivity ? p.isActivityFinished : p?.isClassFinished) ? CheckCircleIcon : TimeIcon;
              return <Flex
                key={aula.id.toString().concat('-aula')}
                bg="whiteAlpha.300"
                p={4}
                borderRadius="lg"
                alignItems="center"
                gap={4}
              >
                <Icon />
                <Flex direction="column" gap={2} flex={1} alignItems="flex-start">
                  <Text flex={1}>{aula.attributes.name}</Text>
                  {p?.hasActivity && !p.isActivityFinished && <Badge bgColor="yellow.brand">Atividade pendente</Badge>}
                  {p?.finalGrade && <Badge bgColor="yellow.brand">Nota: {p.finalGrade}</Badge>}
                  {!aula.attributes.atividade?.data && <Badge>Atividade não disponível</Badge>}
                  {!!aula.attributes.atividade?.data && p?.isClassFinished && !p?.isActivityFinished && <Badge bgColor="yellow.brand">Atividade pendente</Badge>}
                </Flex>
                <Text>{aula.attributes.duration}</Text>
                <IconButton
                  aria-label="Prosseguir para a aula"
                  icon={<ArrowForwardIcon />}
                  variant="outline"
                  _hover={{
                    bg: 'gray.400',
                    color: 'gray.brand'
                  }}
                  onClick={() => p ? router.push(`/aula/${p.id}`) : createProgress({
                    aulaId: aula.id
                  })}
                />
              </Flex>
            })
          }
        </Flex>
      </Flex>
    </Flex>
  </Flex>
}