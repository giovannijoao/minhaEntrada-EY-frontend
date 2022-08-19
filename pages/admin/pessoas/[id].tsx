import { ChevronLeftIcon, SearchIcon } from "@chakra-ui/icons"
import { Avatar, Badge, Box, Button, Center, Flex, Heading, IconButton, Image, Input, InputGroup, InputLeftElement, Link, Select, Stack, StackDivider, Text, VStack } from "@chakra-ui/react"
import { TrilhaSubscription, User } from "@prisma/client"
import axios from "axios"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import { useCallback, useReducer, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { mediaUrl } from "../../../config"
import { withAuthSsr } from "../../../lib/withAuth"
import { getTrilhaSubscriptionsForUser } from "../../../prisma/trilhasSubscription"
import { getUser } from "../../../prisma/user"
import cmsClient from "../../../services/cmsClient"
import { IEmblema, IEmblemasAll } from "../../../types/CMS/Emblema"
import { ITrilha } from "../../../types/CMS/Trilha"
import { IVagaFindOne, IVagasAll } from "../../../types/CMS/Vaga"

export const getServerSideProps = withAuthSsr(async (context: GetServerSidePropsContext) => {
  const id = context.params?.id as string;
  const [user, trilhasSubscription] = await Promise.all([
    getUser(id),
    getTrilhaSubscriptionsForUser({
      userId: id
    }).then(res => res.map(x => {
      return {
        ...x,
        created_at: null,
        updated_at: null,
      }
    }))
  ])

  return {
    props: {
      trilhasSubscription,
      user: {
        ...user,
        created_at: null,
        updated_at: null,
      },
      role: context.req.session.role
    }
  }
}, 'admin')

type Props = {
  user: User
  trilhasSubscription: TrilhaSubscription[]
}

export default function AdminPage({
  user,
  trilhasSubscription
}: Props) {
  const router = useRouter();

  return <>
    <Flex
      h={36}
      p={8}
      alignItems="center"
      backgroundColor="yellow.brand"
      direction="row"
      gap={6}
      color={"gray.brand"}
    >
      <IconButton onClick={router.back} icon={<ChevronLeftIcon />} aria-label="Voltar" />
      <Flex direction="column">
        <Heading fontSize="2xl" fontWeight={"light"}>
          Gestão de pessoas
        </Heading>
        <Heading fontSize="3xl" fontWeight={"bold"}>
          {user.firstName} {user.lastName}
        </Heading>
      </Flex>
    </Flex>
    <Flex p={8} gap={4}>
      <Box bg="whiteAlpha.300" borderRadius="lg" boxShadow='lg'>
        <Center px={8} py={2} bg="yellow.brand" borderTopRadius="lg">
          <Heading fontSize={"xl"} color='gray.brand'>Emblemas conquistados</Heading>
        </Center>
        <Flex p={4}>
          <VStack
            w='full'
            divider={<StackDivider borderColor='whiteAlpha.500' />}
          >
            {trilhasSubscription.filter(x => x.hasEmblema).map(sub => {
              const emblema = sub.emblema as IEmblema;
              return <Flex w="full" key={sub.id.toString().concat('-emblema')} gap={2} alignItems="center">
                <Avatar
                  src={mediaUrl.concat(emblema.attributes.image.data?.attributes.formats.thumbnail.url as string)}
                />
                <Text flex={1}>{emblema.attributes.name}</Text>
                <Badge>{sub.finalGrade}</Badge>
              </Flex>
            })}
          </VStack>
        </Flex>
      </Box>
      <Box bg="whiteAlpha.300" borderRadius="lg" boxShadow='lg'>
        <Center px={8} py={2} bg="yellow.brand" borderTopRadius="lg">
          <Heading fontSize={"xl"} color='gray.brand'>Jornadas</Heading>
        </Center>
        <Flex p={4}>
          <VStack
            divider={<StackDivider borderColor='whiteAlpha.500' />}
          >

          </VStack>
        </Flex>
      </Box>
    </Flex>

  </>
}