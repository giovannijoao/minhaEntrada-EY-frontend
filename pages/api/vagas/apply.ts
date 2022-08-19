import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../lib/withAuth";
import { createAppliedVacancy } from "../../../prisma/appliedVacancy";
import cmsClient from "../../../services/cmsClient";
import { IVagaFindOne } from "../../../types/CMS/Vaga";

async function vagaRoute(req: NextApiRequest, res: NextApiResponse) {
  try {
    const vaga = await cmsClient.get<IVagaFindOne>(`/vagas/${req.body.vagaId}`);
    const subscription = await createAppliedVacancy({
      userId: req.session.user.id,
      vagaId: req.body.vagaId,
      vaga: vaga.data.data,
    });
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}

export default withSessionRoute(vagaRoute);
