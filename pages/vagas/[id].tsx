import { Box, Flex, Heading, Image, Link } from "@chakra-ui/react";
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import { sessionOptions } from "../../lib/session";
import cmsClient from "../../services/cmsClient";
import { IJornadasAll } from "../../types/CMS/Jornada";
import { IVagaFindOne } from "../../types/CMS/Vaga";
import ReactMarkdown from 'react-markdown'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import { mediaUrl } from "../../config";

type IProps = {
  vaga: IVagaFindOne
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
  const vagaId = params?.id as string;
  const [responseVaga] = await Promise.all([
    cmsClient.get<IVagaFindOne>(`vagas/${vagaId}`, {
      params: {
        populate: ['jornadas', 'jornadas.image'],
      }
    })
  ])

  return {
    props: {
      vaga: responseVaga.data,
    },
  };
}, sessionOptions)

export default function StartPage({
  vaga,
}: IProps) {

  const router = useRouter()


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
    <Flex direction="column"
      bgColor="whiteAlpha.300"
      flex={1}
      p={24}
      boxShadow="sm"
    >
      <ReactMarkdown components={ChakraUIRenderer()}>{vaga.data.attributes.description}</ReactMarkdown>
    </Flex>
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