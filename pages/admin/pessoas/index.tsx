import { ChevronLeftIcon } from "@chakra-ui/icons"
import { Center, Flex, Heading, IconButton } from "@chakra-ui/react"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import { withAuthSsr } from "../../../lib/withAuth"

export const getServerSideProps = withAuthSsr(async (context: GetServerSidePropsContext) => {
  return {
    props: {
      role: context.req.session.role
    }
  }
}, 'admin')

export default function AdminPage() {
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
        <Heading fontSize="3xl" fontWeight={"bold"}>
          Gestão de pessoas
        </Heading>
      </Flex>
    </Flex>
  </>
}