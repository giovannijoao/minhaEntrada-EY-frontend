import { Box, Flex, Heading, Image, Link } from "@chakra-ui/react";
import { mediaUrl } from "../../config";
import cmsClient from "../../services/cmsClient";
import { IJornadasAll } from "../../types/Jornada";

export async function getStaticProps() {
  const response = await cmsClient.get<IJornadasAll>('jornadas', {
    params: {
      populate: 'image'
    }
  })
  return {
    props: {
      data: response.data,
    },
  };
}

export default function StartPage({
  data,
}: {
  data: IJornadasAll
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
      <Heading fontSize="2xl" fontWeight={"light"} color="gray.brand">Bem vindo!</Heading>
      <Heading fontSize="3xl" fontWeight={"bold"} color="gray.brand">Vamos estudar?</Heading>
    </Flex>
    <Flex
      direction="column"
      p={8}
      gap={4}
    >
      <Heading>Todas as jornadas</Heading>
      <Flex
        gap={4}
        wrap={"wrap"}
        justifyContent="space-evenly"
      >
        {
          data.data.map(jornada => {
            return <Box
                w="2xs"
                key={jornada.id.toString().concat('-jornada')}
                borderRadius="md"
                bgColor="gray.300"
                p={4}
                color="gray.brand"
              >
                <Image
                  w={"100%"}
                  h={36}
                  src={mediaUrl?.concat(jornada.attributes.image.data.attributes.formats.small.url)}
                  fit={"cover"}
                  borderRadius="md"
                  aria-label={jornada.attributes.image.data.attributes.caption} />
                <Link href={`/jornadas/${jornada.id}`}><Heading mt={2} fontSize="xl">{jornada.attributes.name}</Heading></Link>
              </Box>
          })
        }
      </Flex>
    </Flex>
  </Flex>
}