import { Button, Divider, Flex, Heading, Text } from "@chakra-ui/react";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { withAuthSsr } from "../../lib/withAuth";
import prisma from "../../prisma/prisma";
import cmsClient from "../../services/cmsClient";
import { IPerfilUsuariosAll } from "../../types/CMS/PerfilUsuario";
import { useCallback } from "react"
import { useRouter } from "next/router";

export const getServerSideProps = withAuthSsr(async ({
  req,
}: GetServerSidePropsContext) => {
  const userId = req.session.user.id;
  const userScore = await prisma.userScore.findFirst({
    where: {
      userId,
    },
  })

  if (!userScore) return {
    redirect: {
      destination: '/jornadas',
      statusCode: 302
    }
  }

  const scoreResult = userScore.result as {
    [key: number]: number
  }

  const questionarioPerfil = await cmsClient.get<IPerfilUsuariosAll>(`perfil-usuarios`, {
    params: {
      'filters[id][$in]': Object.keys(scoreResult)
    }
  })

  const [
    firstPerfil,
    secondPerfil
  ] = Object.entries(scoreResult).sort((a, b) => a[1] < b[1] ? 1 : -1).map(score => {
    const idPerfil = score[0]
    const perfil = questionarioPerfil.data.data.find(perfil => perfil.id === Number(idPerfil));
    return {
      id: idPerfil,
      name: perfil?.attributes.name
    };
  })

  return {
    props: {
      firstPerfil,
      secondPerfil: secondPerfil || null,
    },
  }
});

type Perfil = {
  id: number;
  name: string;
}

export default function OnBoardingWelcome({
  firstPerfil,
  secondPerfil,
}: {
  firstPerfil: Perfil,
  secondPerfil: Perfil,
}) {

  const router = useRouter();

  const handleContinue = useCallback(
    async (perfilId: number) => {
      const result = await axios.post('/api/user/set-perfil', {
        perfilId,
      })
      // TODO: Add loading and error treatment
      return router.push(`/jornadas`)
    },
    [router],
  )


  return <>
    <Flex
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
        <Heading fontSize="2xl" fontWeight={"light"} color="gray.brand">Concluído!</Heading>
        <Heading fontSize="3xl" fontWeight={"bold"} color="gray.brand">Veja nossa recomendação</Heading>
      </Flex>
      <Flex direction="column" m="auto" w="md" h="sm" gap={4}>
        <Flex p={8} boxShadow="md" bg="blackAlpha.500" direction="column" gap={4}>
          <Flex justifyContent={"space-between"} w="full">
            <Heading fontSize="2xl">Meu Perfil</Heading>
          </Flex>
          <Divider />
          <Flex alignItems="center" mx={"30%"} direction="column" textAlign="center" gap={4}>
            <Text fontSize="xs">O perfil selecionado de acordo com suas respostas foi:</Text>
            <Flex direction="column" gap={4} border="1px" borderColor="yellow.brand" p={8} borderRadius="md">
              <Heading fontSize="2xl" color="yellow.brand">{firstPerfil.name}</Heading>
              <Button bg="yellow.brand" color="gray.brand" type="submit" onClick={() => {
                handleContinue(firstPerfil.id)
              }}>Continuar</Button>
            </Flex>
            {secondPerfil && <Flex direction="column">
              <Text fontSize="xs">ou uma segunda escolha seria</Text>
              <Heading fontSize="md">{secondPerfil.name}</Heading>
              <Button mt={2} size="xs" bg="gray.brand" color="yellow.300" type="submit" onClick={() => {
                handleContinue(secondPerfil.id)
              }}>Continuar como {secondPerfil.name}</Button>
            </Flex>}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  </>
}