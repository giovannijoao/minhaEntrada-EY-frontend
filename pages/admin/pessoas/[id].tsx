import { ChevronLeftIcon } from "@chakra-ui/icons"
import { Avatar, Badge, Box, Center, Flex, Heading, IconButton, SimpleGrid, StackDivider, Stat, StatGroup, StatLabel, StatNumber, Text, VStack } from "@chakra-ui/react"
import { JornadaSubscription, TrilhaSubscription, User } from "@prisma/client"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import { mediaUrl } from "../../../config"
import { withAuthSsr } from "../../../lib/withAuth"
import { getAllJornadaSubscriptionsForUser } from "../../../prisma/jornadasSubscription"
import { getTrilhaSubscriptionsForUser } from "../../../prisma/trilhasSubscription"
import { getUser } from "../../../prisma/user"
import { IEmblema } from "../../../types/CMS/Emblema"
import { IJornada } from "../../../types/CMS/Jornada"

export const getServerSideProps = withAuthSsr(async (context: GetServerSidePropsContext) => {
  const id = context.params?.id as string;
  const [user, trilhasSubscription, jornadasSubscription] = await Promise.all([
    getUser(id),
    getTrilhaSubscriptionsForUser({
      userId: id
    }).then(res => res.map(x => {
      return {
        ...x,
        created_at: null,
        updated_at: null,
      }
    })),
    getAllJornadaSubscriptionsForUser({
      userId: id,
    }).then(res => res.map(x => {
      return {
        ...x,
        created_at: null,
        updated_at: null,
      }
    })),
  ])

  return {
    props: {
      trilhasSubscription,
      jornadasSubscription,
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
  jornadasSubscription: JornadaSubscription[]
}

export default function AdminPage({
  user,
  trilhasSubscription,
  jornadasSubscription
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
    <SimpleGrid p={8} gap={4} columns={{
      base: 1,
      md: 3
    }}
    alignItems="self-start"
    >
      <Box bg="whiteAlpha.300" borderRadius="lg" boxShadow='lg'>
        <Center px={8} py={2} bg="yellow.brand" borderTopRadius="lg">
          <Heading fontSize={"xl"} color='gray.brand'>Emblemas conquistados</Heading>
        </Center>
        <Flex p={4}>
          {trilhasSubscription.filter(x => x.hasEmblema).length === 0 && <Center w="full" p={4}>
            <Text>Sem emblemas</Text>
          </Center>}
          { trilhasSubscription.filter(x => x.hasEmblema).length > 0 && <VStack
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
          </VStack>}
        </Flex>
      </Box>
      <Box bg="whiteAlpha.300" borderRadius="lg" boxShadow='lg'>
        <Center px={8} py={2} bg="yellow.brand" borderTopRadius="lg">
          <Heading fontSize={"xl"} color='gray.brand'>Jornadas</Heading>
        </Center>
        <Flex p={2}>
          {jornadasSubscription.length === 0 && <Center w="full" p={4}>
            <Text>Sem jornadas</Text>
          </Center>}
          {jornadasSubscription.length > 0 && <VStack
            w='full'
            divider={<StackDivider borderColor='whiteAlpha.500' />}
          >
            {jornadasSubscription.map(sub => {
              const jornada = sub.jornada as IJornada;
              return <Flex w="full"
                key={sub.id.toString().concat('-jornada')}
                gap={2}
                p={2}
                border="1px"
                borderColor="whiteAlpha.100"
                borderRadius="md"
                direction={'column'}
              >
                <Heading fontSize="lg" textAlign="center">{jornada.attributes.name}</Heading>
                <StatGroup>
                  <Stat>
                    <StatLabel>Trilhas</StatLabel>
                    <StatNumber>{sub.availableTrilhas.length}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Finalizadas</StatLabel>
                    <StatNumber>{sub.finishedTrilhas.length}</StatNumber>
                  </Stat>
                </StatGroup>
              </Flex>
            })}
          </VStack>}
        </Flex>
      </Box>
    </SimpleGrid>

  </>
}