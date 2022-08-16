import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "../../../lib/session";
import { getUserByEmail } from "../../../prisma/user";
import bcrypt from "bcryptjs";
import { User } from "../user";
import { createJornadaSubscription } from "../../../prisma/jornadasSubscription";
import { createAulaProgress } from "../../../prisma/aulaProgress";

async function progressCreate(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session.user || !req.session.user.isLoggedIn) {
    return res.redirect("/login");
  }

  try {
    const progress = await createAulaProgress({
      aulaId: req.body.aulaId,
      isFinished: req.body.isFinished,
      jornadaSubscriptionId: req.body.jornadaSubscriptionId,
      trilhaId: req.body.trilhaId,
      userId: req.session.user.id,
      activityId: null,
      totalCorrect: null,
      totalQuestions: null
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}

export default withIronSessionApiRoute(progressCreate, sessionOptions);
