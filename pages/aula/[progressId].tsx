import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Button, Center, Flex, Heading, IconButton, Link, Textarea, useToast } from "@chakra-ui/react";
import axios from "axios";
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
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
      params: {
        populate: 'atividade'
      }
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
  const [ready, setIsReady] = useState(false);
  const [isEnded, setEnded] = useState(false);

  const onFinished = useCallback(async () => {
    setEnded(true);
    const response = await axios.post('/api/progress/update', {
      isFinished: true,
      progressId,
    })
    if (aula.data.attributes.atividade?.data) toast({
      title: 'Aula finalizada',
      description: 'Hora de fazer as atividades'
    })
  }, [aula.data.attributes.atividade?.data, progressId, toast])

  useEffect(() => {
    if (window) {
      setIsReady(true);
    }
  }, [])

  const isWindowAvailable = typeof window !== 'undefined';
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
      flexFlow={{
        base: 'column-reverse',
        md: 'row'
      }}
      p={8}
      gap={16}
    >
      <Flex flex={1} direction="column" gap={4}>
        <Heading fontSize="lg">Minhas anotações</Heading>
        <Textarea flex={1} />
      </Flex>
      <Flex>
        {ready && !isEnded && <ReactPlayer controls={true} url={aula.data.attributes.url} onEnded={onFinished} />}
        {isEnded && <Center bg="green.500" p={36} borderRadius="lg" flexDirection="column" gap={4} m="auto">
          <Heading>Aula finalizada</Heading>
          {
            aula.data.attributes.atividade?.data &&
            <Link href={`/activity/${progressId}`}><Button colorScheme={"yellow"}>Ir para atividades</Button></Link>
          }
        </Center>}
      </Flex>
    </Flex>
  </Flex>
}