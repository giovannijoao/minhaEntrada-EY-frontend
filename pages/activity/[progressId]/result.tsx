import { ArrowForwardIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, Button, Center, Checkbox, CheckboxGroup, Flex, Heading, IconButton, Link, Radio, RadioGroup, Stack, Text, useToast } from "@chakra-ui/react";
import { AulaProgress } from "@prisma/client";
import axios from "axios";
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { sessionOptions } from "../../../lib/session";
import { getAllProgresses, getAulaProgress } from "../../../prisma/aulaProgress";
import cmsClient from "../../../services/cmsClient";
import { Question } from "../../../types/CMS/Atividade";
import { IAulaFindOne, IAulasAll } from "../../../types/CMS/Aula";

type IProps = {
  aula: IAulaFindOne
  progress: AulaProgress
  nextClasses: IAulasAll | null
}

export const getServerSideProps = withIronSessionSsr(async ({
  req,
  res,
  params
}) => {

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

  if (!progress) {
    return {
      redirect: {
        destination: '/jornadas',
        statusCode: 302
      }
    }
  }
  const {created_at, updated_at, ...progressRest} = progress;

  const progresses = await getAllProgresses({
    jornadaSubscriptionId: progress.jornadaSubscriptionId,
    trilhaId: progress.trilhaId,
    userId: req.session.user.id,
    isFinished: true,
  })

  const completedClasses = progresses.map(x => x.aulaId);

  const [responseAula, responseNextAula] = await Promise.all([
    cmsClient.get<IAulaFindOne>(`aulas/${progress.aulaId}`).then(res => res.data),
    cmsClient.get<IAulasAll>(`aulas`, {
      params: {
        populate: 'trilha',
        'filters[trilha][id][$eq]': progress.trilhaId,
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
    },
  };
}, sessionOptions)

export default function Page({
  aula,
  progress,
  nextClasses
}: IProps) {
  const router = useRouter();
  const toast = useToast();

  const nextAula = nextClasses?.data[0];

  const createProgress = useCallback(async ({
    aulaId,
  }: {
    aulaId: number;
  }) => {
    const response = await axios.post('/api/progress/create', {
      aulaId,
      isFinished: false,
      jornadaSubscriptionId: progress.jornadaSubscriptionId,
      trilhaId: progress.trilhaId,
    })
    router.push(`/aula/${response.data.id}`)
  }, [progress.jornadaSubscriptionId, progress.trilhaId, router])

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
      <IconButton onClick={() => router.replace(`/jornadas/s/${progress.jornadaSubscriptionId}/trilhas/${progress.trilhaId}`)} icon={<ChevronLeftIcon />} aria-label="Voltar" />
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
        >{Math.round((progress.totalQuestions as number) / (progress.totalCorrect as number)) * 10}</Heading>
      </Center>
    </Center>
    <Center
      flexDirection="column"
      gap={2}
    >
      <Heading fontSize="md">Total de questões: {progress.totalQuestions}</Heading>
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
      <Heading fontSize="lg">Próxima aula</Heading>
      <Text fontSize="md">{nextAula.attributes.name}</Text>
      <Button colorScheme="orange" rightIcon={<ArrowForwardIcon />} onClick={() => createProgress({
        aulaId: nextAula.id
      })}>Ir para próxima aula</Button>
    </Center>}


  </Flex>
}