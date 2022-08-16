import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "../../../lib/session";
import { updateAulaProgressFinished } from "../../../prisma/aulaProgress";

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session.user || !req.session.user.isLoggedIn) {
    return res.redirect("/login");
  }

  try {
    const progress = await updateAulaProgressFinished({
      id: req.body.progressId,
      isFinished: req.body.isFinished
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}

export default withIronSessionApiRoute(loginRoute, sessionOptions);
