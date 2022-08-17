import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../lib/withAuth";
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

export default withSessionRoute(vagaRoute);
