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
  return <></>
}