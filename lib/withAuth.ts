import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import { GetServerSidePropsContext, GetServerSidePropsResult, NextApiHandler } from "next";
import { sessionOptions } from "./session";

const withAuth = (gssp: any, role: string) => {
  return async (
    context: GetServerSidePropsContext
  ) => {
    if (!context.req.session.user || !context.req.session.user.isLoggedIn || context.req.session.role !== role) {
      context.req.session.destroy();
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

export const withAuthSsr = (handler: any, role = 'user') => withSessionSsr(withAuth(handler, role));

export function withSessionRoute(handler: NextApiHandler, role = 'user') {
  return withIronSessionApiRoute((req, res) => {
    if (
      !req.session.user ||
      !req.session.user.isLoggedIn ||
      req.session.role !== role
    ) {
      req.session.destroy();
      return res.redirect('/login');
    }
    return handler(req, res)
  }, sessionOptions);
}
