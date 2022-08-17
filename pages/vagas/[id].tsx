import { Box, Button, Center, Flex, Heading, Image, Link, Text } from "@chakra-ui/react";
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import { sessionOptions } from "../../lib/session";
import cmsClient from "../../services/cmsClient";
import { IJornadasAll } from "../../types/CMS/Jornada";
import { IVagaFindOne } from "../../types/CMS/Vaga";
import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import { mediaUrl } from "../../config";
import { StarIcon } from "@chakra-ui/icons";
import { useCallback, useState } from "react";
import axios from "axios";
import { getAppliedVacancy } from "../../prisma/appliedVacancy";
import { AppliedVacancy } from "@prisma/client";

type IProps = {
  vaga: IVagaFindOne
  appliedVacancy: AppliedVacancy
}

export const getServerSideProps = withIronSessionSsr(async ({
  req,
  res,
  params
}) => {
  if (!req.session.user || !req.session.user.isLoggedIn) {
    return {
      redirect: {
        destination: '/login',
        statusCode: 302,
      }
    }
  }
  const vagaId = Number(params?.id as unknown as string);
  const [responseVaga, appliedVacancy] = await Promise.all([
    cmsClient.get<IVagaFindOne>(`vagas/${vagaId}`, {
      params: {
        populate: ['jornadas', 'jornadas.image'],
      }
    }),
    getAppliedVacancy({
      vagaId,
      userId: req.session.user.id
    })
  ])

  return {
    props: {
      vaga: responseVaga.data,
      appliedVacancy: {
        ...appliedVacancy,
        created_at: appliedVacancy?.created_at.toISOString() || null,
        updated_at: appliedVacancy?.updated_at.toISOString() || null,
      },
    },
  };
}, sessionOptions)

export default function StartPage({
  vaga,
  appliedVacancy,
}: IProps) {

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()

  const handleApply = useCallback(async () => {
    setIsLoading(true);
    await axios.post('/api/vagas/apply', {
      vagaId: vaga.data.id
    });
    router.reload()
    // TODO: Adicionar error treatment
  }, [router, vaga.data.id])

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
      <Heading fontSize="2xl" fontWeight={"light"} color="gray.brand">Vaga</Heading>
      <Heading fontSize="3xl" fontWeight={"bold"} color="gray.brand">{vaga.data.attributes.name}</Heading>
    </Flex>
    <Flex
      direction="column"
      bgColor="whiteAlpha.300"
      flex={1}
      p={24}
      boxShadow="sm"
    >
      <ReactMarkdown components={ChakraUIRenderer()}>{vaga.data.attributes.description}</ReactMarkdown>
    </Flex>
    <Center
      p={8}
    >
      {appliedVacancy.id && <Center
        w={{
          base: 'full',
          md: 'sm'
        }}
        bg="whiteAlpha.300"
        boxShadow={"md"}
        borderRadius="md"
        textAlign="center"
        p={16}
      >
        <Text>Você demonstrou interesse nessa vaga em {new Date(appliedVacancy.created_at).toLocaleString()}</Text>
      </Center>}
      {!appliedVacancy.id && <Button
        leftIcon={<StarIcon />}
        bg="yellow.brand"
        color="gray.brand"
        size="lg"
        isLoading={isLoading}
        onClick={handleApply}
      >Demonstrar interesse</Button>}
    </Center>
    {vaga.data.attributes.jornadas && vaga.data.attributes.jornadas?.data?.length > 0 && <Flex>
      <Flex
        direction="column"
        p={8}
        gap={4}
      >
        <Heading>Jornadas associadas a vaga</Heading>
        <Flex
          gap={4}
          wrap={"wrap"}
          direction={{
            base: 'column',
            md: 'row'
          }}
        >
          {
            vaga.data.attributes.jornadas.data.map(jornada => {
              return <Box
                w="2xs"
                key={jornada.id.toString().concat('-jornada')}
                borderRadius="md"
                bgColor="whiteAlpha.300"
                boxShadow={"md"}
                color="white"
                p={4}
              >
                <Image
                  w={"100%"}
                  h={36}
                  src={mediaUrl?.concat(jornada.attributes.image?.data.attributes.formats.small.url as string)}
                  borderRadius="md"
                  fit={"cover"}
                  aria-label={jornada.attributes.image?.data.attributes.caption} />
                <Flex direction={"column"} gap={2}>
                  <Link href={`/jornadas/${jornada.id}`}><Heading mt={2} fontSize="xl">{jornada.attributes.name}</Heading></Link>
                  {/* <Button size="xs" bg="yellow.brand" color='gray.brand' onClick={() => handleIngressar(jornada.id)}>Ingressar</Button> */}
                </Flex>
              </Box>
            })
          }
        </Flex>
      </Flex>
    </Flex>}
  </Flex>
}