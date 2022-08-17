import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../lib/withAuth";
import { updateAulaProgressFinished } from "../../../prisma/aulaProgress";

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
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

export default withSessionRoute(loginRoute);
