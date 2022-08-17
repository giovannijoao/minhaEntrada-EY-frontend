import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../lib/withAuth";
import { createAulaProgress } from "../../../prisma/aulaProgress";

async function progressCreate(req: NextApiRequest, res: NextApiResponse) {
  try {
    const progress = await createAulaProgress({
      aulaId: req.body.aulaId,
      isClassFinished: req.body.isClassFinished,
      hasActivity: req.body.hasActivity || null,
      isActivityFinished: req.body.isActivityFinished || false,
      jornadaSubscriptionId: req.body.jornadaSubscriptionId,
      trilhaId: req.body.trilhaId,
      userId: req.session.user.id,
      activityId: null,
      totalCorrect: null,
      totalQuestions: null,
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}

export default withSessionRoute(progressCreate);
