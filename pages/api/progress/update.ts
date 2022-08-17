import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../lib/withAuth";
import {
  createAulaProgress,
  updateAulaProgress,
} from "../../../prisma/aulaProgress";

async function progressCreate(req: NextApiRequest, res: NextApiResponse) {
  try {
    const progress = await updateAulaProgress({
      id: req.body.progressId,
      data: {
        isClassFinished: req.body.isClassFinished,
        isActivityFinished: req.body.isActivityFinished || false,
        hasActivity: req.body.hasActivity ?? null
      },
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}

export default withSessionRoute(progressCreate);
