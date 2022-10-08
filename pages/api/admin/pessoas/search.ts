import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../lib/withAuth";
import { getAllUsers, getUsersStats } from "../../../../prisma/user";

async function pessoas(req: NextApiRequest, res: NextApiResponse) {
  try {
    let filters: Prisma.UserWhereInput = {};
    if (req.query.search) {
      filters.OR = [
        {
          firstName: {
            contains: req.query.search as string,
          },
        },
        {
          lastName: {
            contains: req.query.search as string,
          },
        },
        {
          email: {
            contains: req.query.search as string,
          },
        },
      ];
    }
    if (req.query.vaga) {
      filters.AppliedVacancy = {
        some: {
          vagaId: Number(req.query.vaga),
        }
      }
    }
    const [users, stats] = await Promise.all([
      getAllUsers({
        filters,
      }),
      getUsersStats({
        filters,
      })
    ]);
    res.json({
      users,
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}

export default withSessionRoute(pessoas, 'admin');