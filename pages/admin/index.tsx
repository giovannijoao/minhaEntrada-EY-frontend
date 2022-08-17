import { Center, Flex, Heading } from "@chakra-ui/react"
import { GetServerSidePropsContext } from "next"
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
      p={36}
      bg="whiteAlpha.300"
      boxShadow={"md"}
    >
      <Heading>Bem vindo(a) a página de administração</Heading>
    </Center>
  </>
}