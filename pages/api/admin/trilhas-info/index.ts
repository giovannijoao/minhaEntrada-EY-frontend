import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../lib/withAuth";
import { getUsersFromTrilha } from "../../../../prisma/trilhasSubscription";
import { getAllUsers } from "../../../../prisma/user";

async function trilhas(req: NextApiRequest, res: NextApiResponse) {
  try {
    const records = await getUsersFromTrilha({
      trilhaId: Number(req.query.trilhaId),
      search: req.query.search as string,
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}

export default withSessionRoute(trilhas, 'admin');
