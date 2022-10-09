import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../lib/withAuth";
import prisma from "../../../prisma/prisma";

const updateKnowledge = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.session.user.id;

  const { knowledgeItems } = req.body;
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      knowledgeItems: knowledgeItems,
    },
  });
  return res.json({
    success: true,
  });
};

export default withSessionRoute(updateKnowledge);
