import { Center, Flex, Heading, Link, Stack } from "@chakra-ui/react"
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
      h="full"
      p={36}
      bg="whiteAlpha.300"
      boxShadow={"md"}
    >
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
          return <Center
            p={8}
            key={link.href}
            bgColor="yellow.brand"
            borderRadius="md"
            color="gray.brand"
            boxShadow={"3xl"}
          >
            <Link href={link.href}><Heading fontSize="lg" textAlign="center">{link.title}</Heading></Link>
          </Center>
        })}
      </Stack>
    </Center>
  </>
}