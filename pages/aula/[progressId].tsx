import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Button, Center, Flex, Heading, IconButton, Link, Text, useToast } from "@chakra-ui/react";
import { AulaProgress } from "@prisma/client";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { mediaUrl } from "../../config";
import { withAuthSsr } from "../../lib/withAuth";
import { getAulaProgress } from "../../prisma/aulaProgress";
import cmsClient from "../../services/cmsClient";
import { IAulaFindOne } from "../../types/CMS/Aula";
import { ErrorMessagesToast } from "../../utils/constants/ErrorMessagesToast";

type IProps = {
  aula: IAulaFindOne
  progress: AulaProgress
  progressId: string
}

export const getServerSideProps = withAuthSsr(async ({
  req,
  res,
  params
}: GetServerSidePropsContext) => {
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

  const { created_at, updated_at, ...restProgres } = progress;

  const [responseAula] = await Promise.all([
    cmsClient.get<IAulaFindOne>(`aulas/${progress?.aulaId}`, {
      params: {
        populate: ['atividade', 'video']
      }
    }),
  ])
  if (responseAula.data.data.attributes.video?.data) {
    responseAula.data.data.attributes.video.data.attributes.url = mediaUrl.concat(responseAula.data.data.attributes.video.data.attributes.url)
  }
  return {
    props: {
      aula: responseAula.data,
      progress: restProgres,
      progressId
    },
  };
})

export default function TrilhaPage({
  aula,
  progress,
  progressId
}: IProps) {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [ready, setIsReady] = useState(false);
  const [isEnded, setEnded] = useState(false);

  const onFinished = useCallback(async () => {
    setEnded(true);
    await axios.post('/api/progress/update', {
      progressId: progressId,
      isClassFinished: true,
      hasActivity: !!aula.data.attributes.atividade?.data,
    })
    if (aula.data.attributes.atividade?.data)
      toast({
        title: 'Aula finalizada',
        description: 'Hora de fazer as atividades'
      })
  }, [aula.data.attributes.atividade?.data, progressId, toast])

  useEffect(() => {
    if (window) {
      setIsReady(true);
    }
  }, [])

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
        {aula.data.attributes.name}
      </Heading>
    </Flex>
    { !progress.isClassFinished && <Flex
      flexFlow={{
        base: 'column-reverse',
        md: 'row'
      }}
      p={8}
    >
      <Flex m="auto" direction="column">
        {ready && !isEnded && <ReactPlayer
          controls={true}
          url={aula.data.attributes.url ? aula.data.attributes.url : aula.data.attributes.video?.data.attributes.url as string}
          onEnded={onFinished}

          width="100% important"
        />
        }
        {isEnded && <Center bg="green.500" p={{
          base: 8,
          md: 36,
        }} borderRadius="lg" flexDirection="column" gap={4} m="auto">
          <Heading>Aula finalizada</Heading>
          {
            aula.data.attributes.atividade?.data &&
            <Link href={`/activity/${progressId}`}><Button onClick={() => setIsLoading(true) } isLoading={isLoading} colorScheme={"yellow"}>Ir para atividades</Button></Link>
          }
        </Center>}
        {!isEnded && aula.data.attributes.atividade?.data && <Text textAlign="center">Finalize a aula para realizar as atividades</Text>}
      </Flex>
    </Flex>}
    {progress.isClassFinished && <Center p={8} flexDirection="column" gap={4}>
      <Heading>Voc?? j?? finalizou essa aula.</Heading>
      {!progress.isActivityFinished && aula.data.attributes.atividade?.data && <Link href={`/activity/${progressId}`}><Button colorScheme="yellow">Realizar as atividades</Button></Link>}
      {/* <Link href={`/jornadas/s/${progress.jornadaSubscriptionId}/trilhas/${progress.trilhaId}`}><Button colorScheme="yellow" variant="outline">Ver outras aulas</Button></Link> */}
    </Center>}
  </Flex>
}