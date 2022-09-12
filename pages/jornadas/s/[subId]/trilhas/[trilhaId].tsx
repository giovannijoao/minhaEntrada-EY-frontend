import { ArrowForwardIcon, CheckCircleIcon, ChevronLeftIcon, TimeIcon } from "@chakra-ui/icons";
import { Badge, Box, Flex, Heading, IconButton, Image, Link, Text, useToast } from "@chakra-ui/react";
import { AulaProgress } from "@prisma/client";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { mediaUrl } from "../../../../../config";
import { withAuthSsr } from "../../../../../lib/withAuth";
import { getAllProgresses } from "../../../../../prisma/aulaProgress";
import { getTrilhaSubscriptionByJornada } from "../../../../../prisma/trilhasSubscription";
import cmsClient from "../../../../../services/cmsClient";
import { IAula } from "../../../../../types/CMS/Aula";
import { IEmblema, IEmblemasAll } from "../../../../../types/CMS/Emblema";
import { ITrilhaFindOne } from "../../../../../types/CMS/Trilha";
import { ErrorMessagesToast } from "../../../../../utils/constants/ErrorMessagesToast";


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

  const finishedClasses = trilhaSubscription.finishedClasses;
  const hasFinishedClasses = trilhaSubscription.classesIds.length === trilhaSubscription.finishedClasses.length;
  const hasFinishedCourse = hasFinishedClasses && (trilhaSubscription.finalGrade || 0) >= FINAL_GRADE_GTE;

  const [responseTrilha, progress, emblema] = await Promise.all([
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
    hasFinishedCourse && trilhaSubscription.hasEmblema ? cmsClient.get<IEmblemasAll>("emblemas", {
      params: {
        "filters[trilha][id][$eq]": trilhaSubscription.trilhaId,
        populate: 'image'
      },
    }).then(res => res.data.data[0]) : null
  ])

  return {
    props: {
      trilha: responseTrilha.data,
      progress,
      jornadaSubscriptionId,
      trilhaSubscriptionId: trilhaSubscription.id,
      finishedClasses: trilhaSubscription.finishedClasses,
      hasFinishedCourse: hasFinishedCourse,
      hasFinishedClasses: hasFinishedClasses,
      finalGrade: trilhaSubscription.finalGrade || 0,
      emblema,
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
  emblema?: IEmblema
}

export default function TrilhaPage({
  trilha,
  progress,
  trilhaSubscriptionId,
  finishedClasses,
  hasFinishedCourse,
  hasFinishedClasses,
  finalGrade,
  emblema,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>()
  const toast = useToast()
  const router = useRouter();

  const initializeActivity = useCallback(async (p: AulaProgress) => {
    setIsLoading(true);
    router.push(`/aula/${p.id}`)
  }, [router]);

  const createProgress = useCallback(async ({
    aulaId,
  }: {
    aulaId: number;
  }) => {
    await axios.post('/api/progress/create', {
      aulaId,
      isClassFinished: false,
      trilhaSubscriptionId,
      trilhaId: trilha.data.id,
    }).then(resp => {
      router.push(`/aula/${resp.data.id}`)
    }).catch(error => {
      toast({
        position: "top-right",
        description: ErrorMessagesToast.iniciarAtividade,
        status: "error"
      })
    })
  }, [router, trilha.data.id, trilhaSubscriptionId, toast])

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
    {emblema && emblema.attributes.image.data && <Flex
      p={4}
      mx={8}
      my={4}
      borderRadius={"lg"}
      boxShadow="md"
      bgColor="whiteAlpha.300"
      alignItems={"center"}
      gap={8}
      direction={{
        base: 'column',
        md: 'row'
      }}
    >
      <Image
        h={emblema.attributes.image.data.attributes.formats.thumbnail.height}
        w={emblema.attributes.image.data.attributes.formats.thumbnail.width}
        rounded='full'
        objectFit={"cover"}
        src={mediaUrl.concat(emblema.attributes.image.data.attributes.formats.thumbnail.url)}
        alt={emblema.attributes.image.data.attributes.caption}
        boxShadow="lg"
      />
      <Flex direction={"column"}>
        <Heading>Emblema conquistado!</Heading>
        <Text>Você finalizou o curso e conquistou um emblema. Ele será exibido em seu perfil.</Text>
      </Flex>
    </Flex>}
    <Flex
      direction={{
        base: 'column',
        md: 'row'
      }}
      p={8}
      gap={16}
      alignItems="flex-start"
    >
      <Flex direction="column" gap={4} flex={1} w='full'>
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
            <Badge bg="gray.brand" color="yellow.brand">Nota: {finalGrade}</Badge>
          </>}
          {hasFinishedClasses && !hasFinishedCourse && <>
            <Text fontSize="lg" fontWeight="bold">Quase lá!</Text>
            <Text>Sua nota geral atualmente é de {finalGrade} e você precisa de {FINAL_GRADE_GTE} para finalizar o curso. Refaça as atividades.</Text>
          </>}
        </Box>}
      </Flex>
      <Flex direction="column" flex={2} w='full'>
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
                  {p?.finalGrade && <Badge bg="gray.brand" color="yellow.brand">Nota: {p.finalGrade}</Badge>}
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
                  isLoading={isLoading}
                  onClick={() => p ? initializeActivity(p) : createProgress({
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