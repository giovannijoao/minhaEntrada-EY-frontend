import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Flex, Heading, IconButton, useToast } from "@chakra-ui/react";
import axios from "axios";
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import { useCallback } from "react";
import ReactPlayer from "react-player";
import { sessionOptions } from "../../lib/session";
import { getAulaProgress } from "../../prisma/aulaProgress";
import cmsClient from "../../services/cmsClient";
import { IAulaFindOne } from "../../types/Aula";

type IProps = {
  aula: IAulaFindOne
  progressId: string
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

  const [responseAula] = await Promise.all([
    cmsClient.get<IAulaFindOne>(`aulas/${progress?.aulaId}`, {
      params: {}
    }),
  ])
  return {
    props: {
      aula: responseAula.data,
      progressId
    },
  };
}, sessionOptions)

export default function TrilhaPage({
  aula,
  progressId
}: IProps) {
  const router = useRouter();
  const toast = useToast();

  const onFinished = useCallback(async () => {
    const response = await axios.post('/api/progress/update', {
      isFinished: true,
      progressId,
    })
    toast({
      title: 'Aula finalizada',
      description: 'Hora de fazer as atividades'
    })
  }, [progressId, toast])

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
      alignItems="center"
      backgroundColor="yellow.brand"
      direction="row"
      gap={6}
    >
      <IconButton onClick={router.back} color={"gray.brand"} icon={<ChevronLeftIcon />} aria-label="Voltar" />
      <Heading fontSize="3xl" fontWeight={"bold"} color="gray.brand">
        {aula.data.attributes.name}
      </Heading>
    </Flex>
    <Flex
      direction="row"
      p={8}
      gap={16}
      alignItems="flex-start"
    >
      <Flex flex={1}>

      </Flex>
      <Flex>
        {typeof window !== 'undefined' && <ReactPlayer url={aula.data.attributes.url} onEnded={onFinished} />}
      </Flex>
    </Flex>
  </Flex>
}