import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Button, Flex, Heading, IconButton, Link, SimpleGrid, Text, useToast } from "@chakra-ui/react";
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import { useState } from "react";
import { sessionOptions } from "../../lib/session";
import cmsClient from "../../services/cmsClient";
import { IVagasAll } from "../../types/CMS/Vaga";

type IProps = {
  vagas: IVagasAll
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
  const [responseVagas] = await Promise.all([
    cmsClient.get<IVagasAll>(`vagas`, {
      params: {
        populate: ['jornadas', 'jornadas.image'],
      }
    })
  ])

  return {
    props: {
      vagas: responseVagas.data,
    },
  };
}, sessionOptions)

export default function StartPage({
  vagas,
}: IProps) {

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast()
  const router = useRouter()

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
      <IconButton onClick={router.back} fontSize="2xl" color={"gray.brand"} icon={<ChevronLeftIcon />} aria-label="Voltar" />
      <Heading fontSize="3xl" color="gray.brand">Vagas</Heading>
    </Flex>
    <SimpleGrid
      m={8}
      gap={6}
      columns={{
        base: 1,
        md: 2
      }}
    >
      {vagas.data.map(vaga => {
        return <Flex key={vaga.id}
          direction="row"
          minH={36}
          border="1px"
          borderColor="yellow.brand"
          borderRadius="md"
          gap={4}
        >
          <Flex
            w="2xs"
            bg="yellow.brand"
            color="gray.brand"
            justifyContent="center"
            alignItems="center"
            boxShadow="md"
            m={-1}
            borderRadius="md"
            flex={1}
          >
            <Heading textAlign="center" fontSize="xl">{vaga.attributes.name}</Heading>
          </Flex>
          <Flex
            m={2}
            flex={3}
            direction="column"
            gap={4}
          >
            <Text>
              {vaga.attributes.shortDescription}
            </Text>
            <Link
              m={"auto"}
              href={`/vagas/${vaga.id}`}
            >
              <Button
                colorScheme="yellow"
                variant="outline"
              >
                Ver mais
              </Button>
            </Link>
          </Flex>
          {/* {
            vaga.attributes.jornadas?.data.map(jornada => {
              return <Box
                w="2xs"
                m={2}
                key={`${vaga.id}-${jornada.id}`}
                borderRadius="md"
                bgColor="whiteAlpha.300"
                boxShadow={"md"}
                color="white"
                position="relative"
                bgImage={mediaUrl?.concat(jornada.attributes.image?.data?.attributes.formats.small.url as string)}
                backgroundSize={"cover"}
              >
                <Flex
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg={"blackAlpha.700"}
                  borderRadius="md"
                  display="flex"
                  justifyContent={"flex-end"}
                  py={4}
                  px={4}
                  direction="column"
                >
                  <Text>Jornada de</Text>
                  <Link href={`/jornadas/${jornada.id}`}>
                    <Heading fontSize="xl">{jornada.attributes.name}</Heading>
                  </Link>
                </Flex>
              </Box>
            })
          } */}
        </Flex>
      })}
    </SimpleGrid>
  </Flex>
}