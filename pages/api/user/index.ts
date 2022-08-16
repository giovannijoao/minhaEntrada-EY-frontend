import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "../../../lib/session";

export type User =
  | {
      isLoggedIn: false;
    }
  | {
      isLoggedIn: true;
      id: string;
      firstName: string;
      lastName?: string;
      email: string;
    };

async function userRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  if (req.session.user) {
    // in a real world application you might read the user id from the session and then do a database request
    // to get more information on the user if needed
    res.json(req.session.user);
  } else {
    res.json({
      isLoggedIn: false,
    });
  }
}

export default withIronSessionApiRoute(userRoute, sessionOptions);
