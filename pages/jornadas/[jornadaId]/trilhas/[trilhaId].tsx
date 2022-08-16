import { ArrowForwardIcon, CheckCircleIcon, ChevronLeftIcon, TimeIcon } from "@chakra-ui/icons";
import { Flex, Heading, IconButton, Text } from "@chakra-ui/react";
import { AulaProgress } from "@prisma/client";
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import { sessionOptions } from "../../../../lib/session";
import { getAllProgresses } from "../../../../prisma/aulaProgress";
import cmsClient from "../../../../services/cmsClient";
import { ITrilhaFindOne } from "../../../../types/Trilha";

type IProps = {
  trilha: ITrilhaFindOne,
  progress: AulaProgress[]
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
    jornadaId,
    trilhaId,
  } = params as any;

  const [responseTrilha, progress] = await Promise.all([
    cmsClient.get<ITrilhaFindOne>(`trilhas/${trilhaId}`, {
      params: {
        populate: 'aulas'
      }
    }),
    getAllProgresses({
      userId: req.session.user.id,
      jornadaSubcriptionId: jornadaId,
      trilhaId,
    })
  ])
  return {
    props: {
      trilha: responseTrilha.data,
      progress,
    },
  };
}, sessionOptions)

export default function TrilhaPage({
  trilha,
  progress,
}: IProps) {
  const router = useRouter();

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
        {trilha.data.attributes.name}
      </Heading>
    </Flex>
    <Flex
      direction="row"
      p={8}
      gap={16}
      alignItems="flex-start"
    >
      <Flex
        w="xs"
        p={8}
        alignItems="center"
        direction="column"
        gap={2}
        bg={"linear-gradient(90deg, #C84E89 0%, #F15F79 100%);"}
        borderRadius="lg"
        flex={1}
      >
        <Heading fontSize="xl">Meu progresso</Heading>
        <Heading fontSize="4xl">{`${progress?.filter(p => p.isFinished).length || 0} / ${trilha.data.attributes.aulas?.data.length}`}</Heading>
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
              const isFinished = progress?.find(p => p.aulaId === aula.id)?.isFinished;
              const Icon = isFinished ? CheckCircleIcon : TimeIcon;
              return <Flex
                key={aula.id.toString().concat('-aula')}
                bg="whiteAlpha.300"
                p={4}
                borderRadius="lg"
                alignItems="center"
                gap={4}
              >
                <Icon />
                <Text flex={1}>{aula.attributes.name}</Text>
                <Text>{aula.attributes.duration}</Text>
                <IconButton
                  aria-label="Prosseguir para a aula"
                  icon={<ArrowForwardIcon />}
                  variant="outline"
                  _hover={{
                    bg: 'gray.400',
                    color: 'gray.brand'
                  }}
                 />
              </Flex>
            })
          }
        </Flex>
      </Flex>
    </Flex>
  </Flex>
}