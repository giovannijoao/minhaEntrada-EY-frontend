import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../lib/withAuth";
import prisma from "../../../prisma/prisma";

const setPerfil = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.session.user.id;

  const { perfilId } = req.body;
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      selectedProfile: Number(perfilId),
    }
  });
  return res.json({
    success: true,
    selectedProfile: perfilId,
  })


};


export default withSessionRoute(setPerfil);