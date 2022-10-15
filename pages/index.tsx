import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Divider, Flex, Grid, Heading, HStack, Icon, Image, SimpleGrid, Stack, Text, useBreakpointValue, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { GetServerSidePropsResult } from "next";
import { IoMdPeople } from "react-icons/io";
import cmsClient from "../services/cmsClient";
import { IJornadasAll } from "../types/CMS/Jornada";
import { IPerfilUsuariosAll } from "../types/CMS/PerfilUsuario";

export const getServerSideProps = async () => {
  const [responseData] = await Promise.all([
    // cmsClient.get<IJornadasAll>('perfil-usuarios', {
    //   params: {
    //     populate: ['jornadas.image', 'jornadas.trilhas', 'jornadas.vagas'],
    //   }
    // }).then(res => res.data),
    cmsClient.get<IJornadasAll>('jornadas', {
      params: {
        populate: ['image', 'trilhas', 'vagas'],
      }
    }).then(res => res.data),
  ])
  return {
    props: {
      responseData,
    }
  }
}

export default function Home({
  responseData
}: {
  responseData: IJornadasAll
}) {
  const isTabletOrMobile = useBreakpointValue({ base: true, md: false });
  return <VStack
    w="full"
    h="full"
  >
    <Flex
      direction={{
        base: 'column',
        md: 'row'
      }}
      w="full"
      bg="yellow.brand"
      justifyContent={"center"}
      alignItems="center"
      p={8}
    >
      <Image
        src="/undraw_welcoming_re_x0qo.svg"
        w="xs"
        aria-label="Bem vindo!"
      />
      <VStack w={{
        base: 'full',
        md: 'md'
      }} textAlign={"center"}>
        <Heading color="gray.brand">Bem vindo a sua nova forma de se especializar e candidatar-se!</Heading>
      </VStack>
    </Flex>
    <Stack
      p={8}
      w="full"
      direction={{
        base: 'column',
        md: 'row'
      }}
      divider={<>
        <Icon as={isTabletOrMobile ? ChevronDownIcon : ChevronRightIcon} w={16} h={16} />
      </>}
      alignItems="center"
    >
      <VStack w={{
        base: "full",
        md: "md"
      }} textAlign="center">
        <Heading fontSize="xl">Onboarding</Heading>
      </VStack>
      <VStack w={{
        base: "full",
        md: "md"
       }} textAlign="center">
        <Heading fontSize="xl">Inscreva-se em uma jornada</Heading>
      </VStack>
      <VStack w={{
        base: "full",
        md: "md"
       }} textAlign="center">
        <Heading fontSize="xl">Aprenda com trilhas</Heading>
      </VStack>
      <VStack w={{
        base: "full",
        md: "md"
      }} textAlign="center">
        <Heading fontSize="xl">Entre em uma vaga</Heading>
      </VStack>
    </Stack>

    <VStack w="full" p={{
      base: 4,
      md: 8
    }}>
      <Heading textAlign={"center"}>Jornadas para crescimento profissional</Heading>
      <SimpleGrid
        w="full"
        minChildWidth={"200px"}
        spacing={8}
        p={8}
      >
        {
          responseData.data.map(jornada => {
            return <VStack
              key={jornada.id}
              bgImage={jornada.attributes.image.data?.attributes.formats.small.url}
              bgSize="cover"
              borderRadius="md"
              spacing={0}
            >
              <VStack w="full" h="full" bg="blackAlpha.600" p={6}>
                <Heading fontSize="2xl" textAlign={"center"}>{jornada.attributes.name}</Heading>
                <Divider />
                <Heading fontSize="sm">Trilhas para conhecer</Heading>
                <VStack w="full">
                  {jornada.attributes.trilhas?.data.map(trilha => {
                    return <HStack key={trilha.id} w="full" bg="yellow.brand" p={2} borderRadius="md">
                      <Text color="gray.brand" fontWeight={"medium"}>{trilha.attributes.name}</Text>
                    </HStack>
                  })}
                </VStack>
              </VStack>
              <HStack
                w="full"
                bg="blackAlpha.700"
                px={4}
                borderBottomRadius="md"
              >
                <Icon as={IoMdPeople} />
                {jornada.attributes.vagas?.data && jornada.attributes.vagas?.data.length > 0 && <>
                  <Text fontSize="xs">{jornada.attributes.vagas?.data.length} {jornada.attributes.vagas?.data.length === 1 ? 'vaga associada' : 'vagas associadas'} a essa jornada</Text>
                </>}
              </HStack>
            </VStack>
          })
        }
      </SimpleGrid>
    </VStack>
  </VStack>
}