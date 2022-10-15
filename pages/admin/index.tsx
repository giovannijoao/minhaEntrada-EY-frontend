import { Box, Center, Flex, Heading, Image, Link, Stack, VStack } from "@chakra-ui/react"
import { GetServerSidePropsContext } from "next"
import { headerLinks } from "../../components/Header"
import { withAuthSsr } from "../../lib/withAuth"

export const getServerSideProps = withAuthSsr(async (context: GetServerSidePropsContext) => {
  return {
    props: {
      role: context.req.session.role
    }
  }
}, 'admin')

export default function AdminPage() {
  return <>
    <Center
      w="full"
      h="full"
      bg="whiteAlpha.300"
      boxShadow={"md"}
      position="relative"
    >
      <Image
        aria-label="Painel de gestão"
        src={'undraw_team_re_0bfe.svg'}
        position="absolute"
        h="full"
        top={0}
        bottom={0}
        left={0}
        opacity="0.3"
        p={12}
      />
      <Center zIndex={2} bgColor="blackAlpha.800" w="full" h="full">
        <VStack spacing={8}>
          <Heading textAlign="center">Bem vindo(a) a página de administração</Heading>
          <Stack
            direction={{
              base: 'column',
              md: 'row'
            }}
            gap={4}
            justifyContent="center"
          >
            {headerLinks.filter(l => l.role === 'admin').map(link => {
              return <Link
                p={8}
                key={link.href}
                bgColor="yellow.brand"
                borderRadius="md"
                color="gray.brand"
                boxShadow={"3xl"}
                href={link.href}
                _hover={{
                  transition: '0.3s',
                  filter: "opacity(95%)",
                  boxShadow: "1px 3px 5px 2px black"
                }}
              >
                <Heading fontSize="lg" textAlign="center">{link.title}</Heading>
              </Link>
            })}
          </Stack>
        </VStack>
      </Center>
    </Center>
  </>
}