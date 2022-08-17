import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "../../../lib/session";
import { createAppliedVacancy } from "../../../prisma/appliedVacancy";

async function vagaRoute(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session.user || !req.session.user.isLoggedIn) {
    return res.redirect("/login");
  }

  try {
    const subscription = await createAppliedVacancy({
      userId: req.session.user.id,
      vagaId: req.body.vagaId
    });
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}

export default withIronSessionApiRoute(vagaRoute, sessionOptions);
