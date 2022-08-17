import { withIronSessionSsr } from "iron-session/next";
import { GetServerSidePropsContext, GetServerSidePropsResult, NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "./session";

const withAuth = (gssp: any) => {
  return async (
    context: GetServerSidePropsContext
  ) => {
    if (!context.req.session.user || !context.req.session.user.isLoggedIn) {
      return {
        redirect: {
          destination: "/login",
          statusCode: 302,
        },
      };
    }

    return await gssp(context);
  };
};

function withSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown }
>(
  handler: (
    context: GetServerSidePropsContext
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>
) {
  return withIronSessionSsr(handler, sessionOptions);
}

export const withAuthSsr = (handler: any) => withSessionSsr(withAuth(handler));