import { Box, Center, Flex, Heading, Image, Link } from "@chakra-ui/react";
import { mediaUrl } from "../../config";
import cmsClient from "../../services/cmsClient";
import { IJornadaFindOne, IJornadasAll } from "../../types/Jornada";
import { ITrilhasAll } from "../../types/Trilha";

export async function getServerSideProps({
  params: {
    id,
  }
}: any) {
  const [responseJornadas, responseTrilhas] = await Promise.all([
    cmsClient.get<IJornadaFindOne>(`jornadas/${id}`, {
      params: {
        populate: 'image'
      }
    }),
    cmsClient.get<ITrilhasAll>(`trilhas`, {
      params: {
        'filters[jornadas][id][$eq]': id
      }
    })
  ])
  return {
    props: {
      jornada: responseJornadas.data,
      trilhas: responseTrilhas.data
    },
  };
}

export default function StartPage({
  jornada,
  trilhas,
}: {
  jornada: IJornadaFindOne,
  trilhas: ITrilhasAll
}) {
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
      justifyContent="center"
      backgroundColor="yellow.brand"
      direction="column"
    >
      <Heading fontSize="2xl" fontWeight={"light"} color="gray.brand">Jornada de</Heading>
      <Heading fontSize="3xl" fontWeight={"bold"} color="gray.brand">
        {jornada.data.attributes.name}
      </Heading>
    </Flex>
    <Flex
      direction="column"
      p={8}
      gap={4}
    >
      <Heading>Todas as trilhas</Heading>
      <Flex
        gap={4}
        wrap={"wrap"}
        justifyContent="flex-start"
      >
        {
          trilhas.data.map(trilha => {
            return <Center
              key={trilha.id.toString().concat('-trilha')}
              bg={trilha.attributes.color || 'yellow.brand'}
              borderRadius="md"
              color="gray.brand"
              p={8}
            >
              <Link href={`/trilhas/${trilha.id}`}>
                <Heading mt={2} fontSize="xl">{trilha.attributes.name}</Heading>
              </Link>
            </Center>
          })
        }
      </Flex>
    </Flex>
  </Flex>
}